/**
 * Creates a class constructor with strongly-typed properties and methods.
 * @param definition An object containing the methods and getters for the class.
 * The `this` context inside this object is typed as `TData`.
 * @returns A new class constructor.
 */
export function kind<TData extends object>() {
  return function <TMethods extends Record<string, unknown>>(
    definition: TMethods & ThisType<TData>
  ): new (data: TData) => TData & TMethods {
    // 1. Create a base class dynamically.
    const DynamicClass = class {
      constructor(data: TData) {
        // 2. Assign all data properties from the constructor argument to the instance.
        Object.assign(this, data);
      }
    };

    // 3. Add the methods and getters from the definition to the class's prototype.
    Object.assign(DynamicClass.prototype, definition);

    // 4. Return the constructor, casting it to the correct combined type.
    // This tells TypeScript that an instance will have properties from both TData and TMethods.
    return DynamicClass as new (data: TData) => TData & TMethods;
  };
}
