// Optional wrapper type
type Optional<T> = { _optional: true; _type: T };

// Helper function to create optional schema properties
export function optional<T>(type: T): Optional<T> {
  return { _optional: true, _type: type };
}

// Helper type to infer the data shape from a schema
type InferData<TSchema> = {
  [K in keyof TSchema as TSchema[K] extends Optional<unknown> ? never : K]: TSchema[K] extends StringConstructor ? string
    : TSchema[K] extends NumberConstructor ? number
    : TSchema[K] extends BooleanConstructor ? boolean
    : TSchema[K] extends DateConstructor ? Date
    : TSchema[K] extends new (...args: any[]) => infer T ? T
    : unknown;
} & {
  [K in keyof TSchema as TSchema[K] extends Optional<unknown> ? K : never]?: TSchema[K] extends Optional<infer U>
    ? U extends StringConstructor ? string
    : U extends NumberConstructor ? number
    : U extends BooleanConstructor ? boolean
    : U extends DateConstructor ? Date
    : U extends new (...args: any[]) => infer T ? T
    : unknown
    : never;
};

// Helper type for flexible input that allows conversion
type FlexibleInput<TSchema> = {
  [K in keyof TSchema as TSchema[K] extends Optional<unknown> ? never : K]: TSchema[K] extends StringConstructor
    ? string | number | boolean | null | undefined
    : TSchema[K] extends NumberConstructor
      ? number | string | boolean | null | undefined
    : TSchema[K] extends BooleanConstructor
      ? boolean | string | number | null | undefined
    : TSchema[K] extends DateConstructor
      ? Date | string | number | null | undefined
    : TSchema[K] extends new (...args: any[]) => any
      ? unknown  // Allow any input for custom constructors
    : unknown;
} & {
  [K in keyof TSchema as TSchema[K] extends Optional<unknown> ? K : never]?: TSchema[K] extends Optional<infer U>
    ? U extends StringConstructor ? string | number | boolean | null | undefined
    : U extends NumberConstructor ? number | string | boolean | null | undefined
    : U extends BooleanConstructor ? boolean | string | number | null | undefined
    : U extends DateConstructor ? Date | string | number | null | undefined
    : U extends new (...args: any[]) => any ? unknown
    : unknown
    : never;
};

/**
 * Creates a class constructor with strongly-typed properties and methods.
 *
 * @param schema An object defining the data properties using constructors (String, Number, Boolean, Date)
 * @param methods An object containing the methods and getters for the class
 * @returns A new class constructor
 *
 * @example
 * ```typescript
 * const Person = kind(
 *   { name: String, age: Number },
 *   {
 *     greet() {
 *       return `Hello, my name is ${this.name}`;
 *     },
 *     getAge() {
 *       return this.age;
 *     }
 *   }
 * );
 *
 * const john = new Person({ name: "John", age: 30 });
 * console.log(john.greet()); // Fully typed with autocomplete!
 * ```
 */
// Helper function to convert a value using its constructor
function convertValue(key: string, value: unknown, constructor: unknown): unknown {
  if (value === undefined || value === null) {
    return value; // Allow undefined/null values as-is
  }

  try {
    if (typeof constructor === "function") {
      // For built-in constructors, use them as functions (not with 'new')
      if (constructor === String) return String(value);
      if (constructor === Number) {
        const num = Number(value);
        if (isNaN(num)) throw new Error(`Cannot convert to number`);
        return num;
      }
      if (constructor === Boolean) return Boolean(value);
      if (constructor === Date) {
        const date = new Date(value as string | number | Date);
        if (isNaN(date.getTime())) throw new Error(`Cannot convert to Date`);
        return date;
      }
      
      // For other constructors, use 'new'
      return new (constructor as new (value: unknown) => unknown)(value);
    }
    
    return value; // Unknown constructor types pass through
  } catch (error) {
    const expectedTypeName = constructor === String ? "string"
      : constructor === Number ? "number"
      : constructor === Boolean ? "boolean" 
      : constructor === Date ? "Date"
      : "unknown";

    throw new TypeError(
      `Invalid value for property '${key}': cannot convert ${typeof value} (${value}) to ${expectedTypeName}. ${
        error instanceof Error ? error.message : ""
      }`
    );
  }
}

export function kind<
  TSchema extends Record<string, unknown>,
  TMethods extends Record<string, unknown>,
>(
  schema: TSchema,
  methods: TMethods & ThisType<InferData<TSchema>>,
): new (data: FlexibleInput<TSchema>) => InferData<TSchema> & TMethods {
  // 1. Create a base class dynamically.
  const DynamicClass = class {
    constructor(data: FlexibleInput<TSchema>) {
      // 2. Validate and potentially convert the data against the schema
      const validatedData: Record<string, unknown> = {};

      for (const [key, expectedType] of Object.entries(schema)) {
        const value = (data as Record<string, unknown>)[key];
        
        // Handle optional properties
        if (typeof expectedType === 'object' && expectedType !== null && '_optional' in expectedType) {
          const optionalType = expectedType as Optional<unknown>;
          if (value === undefined) {
            // Skip undefined optional properties
            continue;
          }
          validatedData[key] = convertValue(key, value, optionalType._type);
        } else {
          validatedData[key] = convertValue(key, value, expectedType);
        }
      }

      // 3. Assign all validated data properties to the instance.
      Object.assign(this, validatedData);

      // 4. Also assign any extra properties that weren't in the schema
      for (
        const [key, value] of Object.entries(data as Record<string, unknown>)
      ) {
        if (!(key in schema)) {
          (this as Record<string, unknown>)[key] = value;
        }
      }
    }
  };

  // 4. Add the methods and getters from the methods object to the class's prototype.
  // Use defineProperties to properly copy getters and setters
  const descriptors = Object.getOwnPropertyDescriptors(methods);
  Object.defineProperties(DynamicClass.prototype, descriptors);

  // 5. Return the constructor, casting it to the correct combined type.
  return DynamicClass as new (
    data: FlexibleInput<TSchema>,
  ) => InferData<TSchema> & TMethods;
}
