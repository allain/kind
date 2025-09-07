// Optional wrapper type
type Optional<T> = { _optional: true; _type: T };

// Array wrapper type
type ArrayType<T> = { _array: true; _type: T };

// Helper function to create optional schema properties
export function optional<T>(type: T): Optional<T> {
  return { _optional: true, _type: type };
}

// Helper function to create array schema properties
export function array<T>(type: T): ArrayType<T> {
  return { _array: true, _type: type };
}

// Helper type to infer the data shape from a schema
type InferData<TSchema> =
  & {
    [K in keyof TSchema as TSchema[K] extends Optional<unknown> ? never : K]:
      TSchema[K] extends StringConstructor ? string
        : TSchema[K] extends NumberConstructor ? number
        : TSchema[K] extends BooleanConstructor ? boolean
        : TSchema[K] extends DateConstructor ? Date
        : TSchema[K] extends ArrayType<infer U>
          ? U extends StringConstructor ? string[]
          : U extends NumberConstructor ? number[]
          : U extends BooleanConstructor ? boolean[]
          : U extends DateConstructor ? Date[]
          : U extends new (...args: unknown[]) => infer T ? T[]
          : unknown[]
        : TSchema[K] extends new (...args: unknown[]) => infer T ? T
        : unknown;
  }
  & {
    [K in keyof TSchema as TSchema[K] extends Optional<unknown> ? K : never]?:
      TSchema[K] extends Optional<infer U>
        ? U extends StringConstructor ? string
        : U extends NumberConstructor ? number
        : U extends BooleanConstructor ? boolean
        : U extends DateConstructor ? Date
        : U extends ArrayType<infer V> ? V extends StringConstructor ? string[]
          : V extends NumberConstructor ? number[]
          : V extends BooleanConstructor ? boolean[]
          : V extends DateConstructor ? Date[]
          : V extends new (...args: unknown[]) => infer T ? T[]
          : unknown[]
        : U extends new (...args: unknown[]) => infer T ? T
        : unknown
        : never;
  };

// Helper to check if a value type is a constructor
export type IsConstructor<T> = T extends
  StringConstructor | NumberConstructor | BooleanConstructor | DateConstructor
  ? true
  : T extends ArrayType<unknown> ? true // Array wrapper
  : T extends Optional<unknown> ? true
  : T extends new (...args: any[]) => any ? true // Constructor function (class constructor)
  : false;

// Extract schema properties from definition
export type ExtractSchema<TDef> = {
  [K in keyof TDef as IsConstructor<TDef[K]> extends true ? K : never]: TDef[K];
};

// Extract method properties from definition
type ExtractMethods<TDef> = {
  [K in keyof TDef as IsConstructor<TDef[K]> extends true ? never : K]: TDef[K];
};

// Helper type for flexible input that allows conversion
type FlexibleInput<TSchema> =
  & {
    [K in keyof TSchema as TSchema[K] extends Optional<unknown> ? never : K]:
      TSchema[K] extends StringConstructor
        ? string | number | boolean | null | undefined
        : TSchema[K] extends NumberConstructor
          ? number | string | boolean | null | undefined
        : TSchema[K] extends BooleanConstructor
          ? boolean | string | number | null | undefined
        : TSchema[K] extends DateConstructor
          ? Date | string | number | null | undefined
        : TSchema[K] extends ArrayType<infer U>
          ? U extends StringConstructor
            ? (string | number | boolean | null | undefined)[]
          : U extends NumberConstructor
            ? (number | string | boolean | null | undefined)[]
          : U extends BooleanConstructor
            ? (boolean | string | number | null | undefined)[]
          : U extends DateConstructor
            ? (Date | string | number | null | undefined)[]
          : unknown[] // Allow any array input for custom constructors
        : TSchema[K] extends new (...args: unknown[]) => unknown ? unknown // Allow any input for custom constructors
        : unknown;
  }
  & {
    [K in keyof TSchema as TSchema[K] extends Optional<unknown> ? K : never]?:
      TSchema[K] extends Optional<infer U>
        ? U extends StringConstructor
          ? string | number | boolean | null | undefined
        : U extends NumberConstructor
          ? number | string | boolean | null | undefined
        : U extends BooleanConstructor
          ? boolean | string | number | null | undefined
        : U extends DateConstructor ? Date | string | number | null | undefined
        : U extends ArrayType<infer V>
          ? V extends StringConstructor
            ? (string | number | boolean | null | undefined)[]
          : V extends NumberConstructor
            ? (number | string | boolean | null | undefined)[]
          : V extends BooleanConstructor
            ? (boolean | string | number | null | undefined)[]
          : V extends DateConstructor
            ? (Date | string | number | null | undefined)[]
          : unknown[] // Allow any array input for custom constructors
        : U extends new (...args: unknown[]) => unknown ? unknown
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
function convertValue(
  key: string,
  value: unknown,
  constructor: unknown,
): unknown {
  if (value === undefined || value === null) {
    return value; // Allow undefined/null values as-is
  }

  try {
    // Handle ArrayType wrapper
    if (
      typeof constructor === "object" && constructor !== null &&
      "_array" in constructor
    ) {
      if (!Array.isArray(value)) {
        throw new Error(`Expected array but got ${typeof value}`);
      }
      const arrayType = constructor as ArrayType<unknown>;
      const elementConstructor = arrayType._type;
      return value.map((item, index) => {
        try {
          return convertValue(`${key}[${index}]`, item, elementConstructor);
        } catch (error) {
          throw new Error(
            `Array element at index ${index}: ${
              error instanceof Error ? error.message : error
            }`,
          );
        }
      });
    }

    if (typeof constructor === "function") {
      // For built-in constructors, use them as functions (not with 'new')
      if (constructor === String) return String(value);
      if (constructor === Number) {
        const num = Number(value);
        if (isNaN(num)) throw new Error(`Cannot convert to number`);
        return num;
      }
      if (constructor === Boolean) {
        if (typeof value === "string") {
          const lower = value.toLowerCase();
          if (lower === "false" || lower === "0" || lower === "") {
            return false;
          }
          return true; // Any other non-empty string is truthy
        }
        return Boolean(value);
      }
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
    const expectedTypeName =
      (typeof constructor === "object" && constructor !== null &&
          "_array" in constructor)
        ? `array of ${getTypeName((constructor as ArrayType<unknown>)._type)}`
        : getTypeName(constructor);

    throw new TypeError(
      `Invalid value for property '${key}': cannot convert ${typeof value} (${value}) to ${expectedTypeName}. ${
        error instanceof Error ? error.message : ""
      }`,
    );
  }
}

function getTypeName(constructor: unknown): string {
  if (constructor === String) return "string";
  if (constructor === Number) return "number";
  if (constructor === Boolean) return "boolean";
  if (constructor === Date) return "Date";
  return "unknown";
}

// Helper to check if a value is a constructor (class or built-in type)
function isConstructor(value: unknown): boolean {
  if (
    value === String || value === Number || value === Boolean || value === Date
  ) {
    return true;
  }
  // Check for ArrayType wrapper
  if (typeof value === "object" && value !== null && "_array" in value) {
    return true;
  }
  if (typeof value === "object" && value !== null && "_optional" in value) {
    return true; // Optional wrapper
  }
  if (typeof value === "function") {
    // Check if it's a class constructor (not a regular function/method)
    // Built-in constructors don't have prototype.constructor === value check
    if (
      value === String || value === Number || value === Boolean ||
      value === Date
    ) {
      return true;
    }
    // For custom classes, check if it has a prototype
    if (value.prototype && typeof value.prototype === "object") {
      return true;
    }
  }
  return false;
}

// Split definition into schema and methods
function splitDefinition(definition: Record<string, unknown>) {
  const schema: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(definition)) {
    if (isConstructor(value)) {
      schema[key] = value;
    }
  }

  return { schema };
}

export function kind<
  TDefinition extends Record<string, unknown>,
  TBase extends new (...args: any[]) => any = new () => {},
>(
  definition:
    & TDefinition
    & ThisType<InferData<ExtractSchema<TDefinition>> & InstanceType<TBase>>,
  baseClass?: TBase,
): new (
  data: FlexibleInput<ExtractSchema<TDefinition>>,
) =>
  & InferData<ExtractSchema<TDefinition>>
  & ExtractMethods<TDefinition>
  & InstanceType<TBase> {
  const { schema } = splitDefinition(definition);

  // 1. Create a base class dynamically.
  const BaseConstructor = baseClass || (class {} as any);
  const DynamicClass = class extends BaseConstructor {
    constructor(data: Record<string, unknown>) {
      super();
      // 2. Validate and potentially convert the data against the schema
      const validatedData: Record<string, unknown> = {};

      for (const [key, expectedType] of Object.entries(schema)) {
        const value = data[key];

        // Handle optional properties
        if (
          typeof expectedType === "object" && expectedType !== null &&
          "_optional" in expectedType
        ) {
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
      for (const [key, value] of Object.entries(data)) {
        if (!(key in schema)) {
          (this as Record<string, unknown>)[key] = value;
        }
      }
    }
  };

  // 4. Add the methods and getters from the original definition to the class's prototype.
  // Get descriptors from the original definition, not the split methods
  const originalDescriptors = Object.getOwnPropertyDescriptors(definition);
  const methodDescriptors: Record<string, PropertyDescriptor> = {};

  // Only copy descriptors for non-constructor properties
  for (const [key, descriptor] of Object.entries(originalDescriptors)) {
    if (!isConstructor(definition[key])) {
      methodDescriptors[key] = descriptor;
    }
  }

  Object.defineProperties(DynamicClass.prototype, methodDescriptors);

  // 5. Return the constructor, casting it to the correct combined type.
  return DynamicClass as new (
    data: FlexibleInput<ExtractSchema<TDefinition>>,
  ) =>
    & InferData<ExtractSchema<TDefinition>>
    & ExtractMethods<TDefinition>
    & InstanceType<TBase>;
}
