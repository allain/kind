import { array, kind, optional } from "./define.ts";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";

describe("kind function", () => {
  it("creates prop only class", () => {
    const Person = kind({
      name: String,
      age: Number,
    });

    const john = new Person({ name: "John", age: 30 });
    expect(john.name).toBe("John");
    expect(john.age).toBe(30);
  });

  it("supports getter and setters on class", () => {
    const Rectangle = kind({
      width: Number,
      height: Number,
      get area() {
        return this.width * this.height;
      },
      set dimensions({ width, height }: { width: number; height: number }) {
        this.width = width;
        this.height = height;
      },
    });

    const rect = new Rectangle({ width: 5, height: 10 });
    expect(rect.area).toBe(50);
    rect.dimensions = { width: 3, height: 4 };
    expect(rect.area).toBe(12);
  });

  it("supports methods that can change state", () => {
    const Counter = kind({
      count: Number,
      inc() {
        this.count++;
      },
    });

    const c = new Counter({ count: 0 });
    expect(c.count).toEqual(0);
    c.inc();
    expect(c.count).toEqual(1);
  });

  it("converts types", () => {
    const TestClass = kind({
      str: String,
      num: Number,
      bool: Boolean,
    });

    const instance = new TestClass({
      str: 123,
      num: "456",
      bool: "truthy",
    });

    expect(instance.str).toBe("123");
    expect(instance.num).toBe(456);
    expect(instance.bool).toBe(true);
  });

  it("handles invalid data", () => {
    const TestClass = kind({ num: Number });
    expect(() => new TestClass({ num: "invalid" })).toThrow(TypeError);
  });

  it("supports optional properties", () => {
    const Counter = kind({
      count: optional(Number),
      name: String,
    });

    const counter1 = new Counter({ name: "test" });
    expect(counter1.name).toBe("test");
    expect(counter1.count).toBeUndefined();

    const counter2 = new Counter({ name: "test", count: 5 });
    expect(counter2.count).toBe(5);
  });

  it("supports custom types", () => {
    class Email extends String {
      constructor(email: string) {
        if (!email.includes("@")) throw new Error("Invalid email");
        super(email);
      }
    }

    const Profile = kind({
      name: String,
      email: Email,
    });

    const profile = new Profile({ name: "John", email: "John@Example.com" });
    expect(profile.email).toBeInstanceOf(Email);
    expect(profile.email).toEqual(new Email("John@Example.com"));

    expect(() => new Profile({ name: "Jane", email: "invalid" }))
      .toThrow("Invalid email");
  });

  it("supports array types", () => {
    const Test = kind({
      names: array(String),
      ages: array(Number),
      flags: array(Boolean),
    });

    const instance = new Test({
      names: ["John", "Jane", 123],
      ages: ["25", 30, "35"],
      flags: [true, "false", 1, 0],
    });

    expect(instance.names).toEqual(["John", "Jane", "123"]);
    expect(instance.ages).toEqual([25, 30, 35]);
    expect(instance.flags).toEqual([true, false, true, false]);
  });

  it("supports optional array types", () => {
    const Test = kind({
      names: optional(array(String)),
      requiredName: String,
    });

    const instance1 = new Test({ requiredName: "test" });
    expect(instance1.names).toBeUndefined();
    expect(instance1.requiredName).toBe("test");

    const instance2 = new Test({
      names: ["John", "Jane"],
      requiredName: "test",
    });
    expect(instance2.names).toEqual(["John", "Jane"]);
    expect(instance2.requiredName).toBe("test");
  });

  it("validates array inputs", () => {
    const Test = kind({
      names: array(String),
    });

    // @ts-ignore since we're testing types
    expect(() => new Test({ names: "not an array" }))
      .toThrow("Expected array but got string");
  });

  it("supports arrays of custom types", () => {
    class Email extends String {
      constructor(email: string) {
        if (!email.includes("@")) throw new Error("Invalid email");
        super(email);
      }
    }

    const ContactList = kind({
      emails: array(Email),
    });

    const contacts = new ContactList({
      emails: ["john@test.com", "jane@test.com"],
    });

    expect(contacts.emails).toHaveLength(2);
    expect(contacts.emails[0]).toBeInstanceOf(Email);
    expect(contacts.emails[1]).toBeInstanceOf(Email);

    expect(() => new ContactList({ emails: ["john@test.com", "invalid"] }))
      .toThrow("Invalid email");
  });

  it("supports empty arrays", () => {
    const Test = kind({
      names: array(String),
    });

    const instance = new Test({ names: [] });
    expect(instance.names).toEqual([]);
  });

  it("handles mixed type conversions in arrays", () => {
    const Test = kind({
      strings: array(String),
      numbers: array(Number),
      booleans: array(Boolean),
      dates: array(Date),
    });

    const instance = new Test({
      strings: ["text", 42, true, null, undefined],
      numbers: [1, "2", true, false, "3.14"],
      booleans: [true, false, "true", "false", 1, 0, "yes", ""],
      dates: ["2023-01-01", new Date("2023-01-02"), 1672531200000],
    });

    expect(instance.strings).toEqual(["text", "42", "true", null, undefined]);
    expect(instance.numbers).toEqual([1, 2, 1, 0, 3.14]);
    expect(instance.booleans).toEqual([
      true,
      false,
      true,
      false,
      true,
      false,
      true,
      false,
    ]);
    expect(instance.dates).toEqual([
      new Date("2023-01-01"),
      new Date("2023-01-02"),
      new Date(1672531200000),
    ]);
  });

  it("handles nested arrays with type conversion", () => {
    const Test = kind({
      mixedNumbers: array(Number),
      mixedStrings: array(String),
    });

    const instance = new Test({
      mixedNumbers: ["1", "2.5", 3, "4", true, false],
      mixedStrings: [1, 2.5, true, false, "hello"],
    });

    expect(instance.mixedNumbers).toEqual([1, 2.5, 3, 4, 1, 0]);
    expect(instance.mixedStrings).toEqual([
      "1",
      "2.5",
      "true",
      "false",
      "hello",
    ]);
  });

  it("validates array type requirements", () => {
    const Test = kind({
      numbers: array(Number),
    });

    // Should throw when non-array is provided
    // @ts-ignore since we're testing types
    expect(() => new Test({ numbers: "not an array" }))
      .toThrow("Expected array but got string");

    // @ts-ignore since we're testing types
    expect(() => new Test({ numbers: 123 }))
      .toThrow("Expected array but got number");

    // @ts-ignore since we're testing types
    expect(() => new Test({ numbers: { length: 3 } }))
      .toThrow("Expected array but got object");
  });

  it("handles invalid number conversions in arrays", () => {
    const Test = kind({
      numbers: array(Number),
    });

    expect(() => new Test({ numbers: ["1", "invalid", "3"] }))
      .toThrow("Cannot convert to number");
  });

  it("handles invalid date conversions in arrays", () => {
    const Test = kind({
      dates: array(Date),
    });

    expect(() =>
      new Test({ dates: ["2023-01-01", "invalid date", "2023-01-02"] })
    )
      .toThrow("Cannot convert to Date");
  });

  it("supports arrays with optional wrapper", () => {
    const Test = kind({
      optionalStrings: optional(array(String)),
      optionalNumbers: optional(array(Number)),
      requiredString: String,
    });

    // Test with optional arrays provided
    const instance1 = new Test({
      optionalStrings: ["hello", "world"],
      optionalNumbers: [1, 2, 3],
      requiredString: "test",
    });
    expect(instance1.optionalStrings).toEqual(["hello", "world"]);
    expect(instance1.optionalNumbers).toEqual([1, 2, 3]);
    expect(instance1.requiredString).toBe("test");

    // Test with optional arrays omitted
    const instance2 = new Test({
      requiredString: "test2",
    });
    expect(instance2.optionalStrings).toBeUndefined();
    expect(instance2.optionalNumbers).toBeUndefined();
    expect(instance2.requiredString).toBe("test2");

    // Test with empty optional arrays
    const instance3 = new Test({
      optionalStrings: [],
      optionalNumbers: [],
      requiredString: "test3",
    });
    expect(instance3.optionalStrings).toEqual([]);
    expect(instance3.optionalNumbers).toEqual([]);
    expect(instance3.requiredString).toBe("test3");
  });

  it("supports arrays of Date objects with various input formats", () => {
    const Test = kind({
      dates: array(Date),
    });

    const instance = new Test({
      dates: [
        "2023-01-01",
        "2023-01-01T10:30:00Z",
        new Date("2023-01-02"),
        1672531200000, // Unix timestamp
      ],
    });

    expect(instance.dates).toHaveLength(4);
    instance.dates.forEach((date: Date) => {
      expect(date).toBeInstanceOf(Date);
      expect(date.getTime()).not.toBeNaN();
    });
  });

  it("supports arrays with complex custom types", () => {
    class UserId extends Number {
      constructor(id: number | string) {
        const numId = Number(id);
        if (isNaN(numId) || numId <= 0) {
          throw new Error("UserId must be a positive number");
        }
        super(numId);
      }
    }

    class Username extends String {
      constructor(name: string) {
        if (typeof name !== "string" || name.length < 3) {
          throw new Error("Username must be at least 3 characters");
        }
        super(name.toLowerCase());
      }
    }

    const UserList = kind({
      userIds: array(UserId),
      usernames: array(Username),
    });

    const users = new UserList({
      userIds: [1, "2", 3, "4"],
      usernames: ["Alice", "Bob", "Charlie"],
    });

    expect(users.userIds).toHaveLength(4);
    users.userIds.forEach((id) => expect(id).toBeInstanceOf(UserId));

    expect(users.usernames).toHaveLength(3);
    users.usernames.forEach((name) => expect(name).toBeInstanceOf(Username));
    expect(users.usernames).toEqual([
      new Username("alice"),
      new Username("bob"),
      new Username("charlie"),
    ]);

    // Test validation errors
    expect(() =>
      new UserList({
        userIds: [1, -1, 3],
        usernames: ["valid"],
      })
    ).toThrow("UserId must be a positive number");

    expect(() =>
      new UserList({
        userIds: [1, 2, 3],
        usernames: ["valid", "xy"],
      })
    ).toThrow("Username must be at least 3 characters");
  });

  it("maintains proper array structure and methods", () => {
    const Test = kind({
      numbers: array(Number),
      strings: array(String),
    });

    const instance = new Test({
      numbers: ["1", "2", "3"],
      strings: [1, 2, 3],
    });

    expect(Array.isArray(instance.numbers)).toBe(true);
    expect(Array.isArray(instance.strings)).toBe(true);

    // Test array methods work
    expect(instance.numbers.map((n: number) => n * 2)).toEqual([2, 4, 6]);
    expect(instance.strings.join(", ")).toBe("1, 2, 3");
    expect(instance.numbers.length).toBe(3);
    expect(instance.strings.length).toBe(3);
  });

  it("supports method access on instances with arrays", () => {
    const TodoList = kind({
      items: array(String),
      completed: array(Boolean),
      addItem(item: string, done = false) {
        (this as any).items.push(String(item));
        (this as any).completed.push(Boolean(done));
      },
      getCompletedItems(): string[] {
        return (this as any).items.filter((_: any, index: number) =>
          (this as any).completed[index]
        );
      },
      get totalItems(): number {
        return (this as any).items.length;
      },
    });

    const todos = new TodoList({
      items: ["Task 1", "Task 2"],
      completed: [true, false],
    });

    expect(todos.items).toEqual(["Task 1", "Task 2"]);
    expect(todos.completed).toEqual([true, false]);
    expect(todos.totalItems).toBe(2);
    expect(todos.getCompletedItems()).toEqual(["Task 1"]);

    todos.addItem("Task 3", true);
    expect(todos.items).toEqual(["Task 1", "Task 2", "Task 3"]);
    expect(todos.completed).toEqual([true, false, true]);
    expect(todos.totalItems).toBe(3);
    expect(todos.getCompletedItems()).toEqual(["Task 1", "Task 3"]);
  });

  it("supports custom base class", () => {
    class BaseClass {
      baseProperty = "base";
      baseMethod() {
        return "base method called";
      }
    }

    const CustomKind = kind({
      name: String,
      age: Number,
    }, BaseClass);

    const instance = new CustomKind({ name: "John", age: 30 });
    expect(instance.name).toBe("John");
    expect(instance.age).toBe(30);
    expect(instance.baseProperty).toBe("base");
    expect(instance.baseMethod()).toBe("base method called");
    expect(instance instanceof BaseClass).toBe(true);
  });

  it("works without base class (backwards compatibility)", () => {
    const SimpleKind = kind({
      value: String,
    });

    const instance = new SimpleKind({ value: "test" });
    expect(instance.value).toBe("test");
  });

  it("supports base class with constructor arguments", () => {
    class BaseWithConstructor {
      public initialized: boolean;

      constructor() {
        this.initialized = true;
      }

      getStatus() {
        return this.initialized ? "ready" : "not ready";
      }
    }

    const ExtendedKind = kind({
      data: String,
    }, BaseWithConstructor);

    const instance = new ExtendedKind({ data: "test data" });
    expect(instance.data).toBe("test data");
    expect(instance.initialized).toBe(true);
    expect(instance.getStatus()).toBe("ready");
    expect(instance instanceof BaseWithConstructor).toBe(true);
  });

  it("supports base class with methods and kind methods", () => {
    class BaseClass {
      baseValue = 10;
      multiplyBase(factor: number) {
        return this.baseValue * factor;
      }
    }

    const MixedKind = kind({
      value: Number,
      getValue(): number {
        return this.value;
      },
      getCombined(): number {
        return this.value + this.baseValue;
      },
    }, BaseClass);

    const instance = new MixedKind({ value: 5 });
    expect(instance.value).toBe(5);
    expect(instance.baseValue).toBe(10);
    expect(instance.getValue()).toBe(5);
    expect(instance.multiplyBase(3)).toBe(30);
    expect(instance.getCombined()).toBe(15);
    expect(instance instanceof BaseClass).toBe(true);
  });
});
