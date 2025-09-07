import { kind, optional } from "./define.ts";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";

describe("kind function", () => {
  it("creates a Person class with methods", () => {
    const Person = kind({
      // Schema properties
      name: String,
      age: Number,

      // Methods
      greet(): string {
        return `Hello, my name is ${this.name}`;
      },

      getAge(): number {
        return this.age;
      },

      celebrateBirthday(): string {
        this.age++;
        return `Happy birthday! Now I'm ${this.age}`;
      },
    });

    const john = new Person({ name: "John", age: 30 });

    expect(john.greet()).toBe("Hello, my name is John");
    expect(john.getAge()).toBe(30);
    expect(john.celebrateBirthday()).toBe("Happy birthday! Now I'm 31");
    expect(john.age).toBe(31);
  });

  it("creates a Rectangle class with getters and methods", () => {
    const Rectangle = kind({
      // Schema properties
      width: Number,
      height: Number,

      // Methods and getters
      get area() {
        return this.width * this.height;
      },

      get perimeter() {
        return 2 * (this.width + this.height);
      },

      resize(widthFactor: number, heightFactor: number) {
        this.width *= widthFactor;
        this.height *= heightFactor;
      },
    });

    const rect = new Rectangle({ width: 10, height: 5 });

    expect(rect.area).toBe(50);
    expect(rect.perimeter).toBe(30);

    rect.resize(2, 1.5);
    expect(rect.width).toBe(20);
    expect(rect.height).toBe(7.5);
    expect(rect.area).toBe(150);
  });

  it("creates a Counter class with state management", () => {
    const Counter = kind({
      // Schema properties
      value: Number,
      initialValue: Number,

      // Methods
      increment() {
        this.value++;
        return this.value;
      },

      decrement() {
        this.value--;
        return this.value;
      },

      reset() {
        this.value = this.initialValue;
      },

      get isZero() {
        return this.value === 0;
      },
    });

    const counter = new Counter({ value: 0, initialValue: 0 });

    expect(counter.value).toBe(0);
    expect(counter.isZero).toBe(true);
    expect(counter.increment()).toBe(1);
    expect(counter.increment()).toBe(2);
    expect(counter.decrement()).toBe(1);
    expect(counter.isZero).toBe(false);

    counter.reset();
    expect(counter.value).toBe(0);
    expect(counter.isZero).toBe(true);
  });

  it("preserves data properties on instances", () => {
    const User = kind({
      // Schema properties
      firstName: String,
      lastName: String,
      id: Number,

      // Methods
      getFullName() {
        return `${this.firstName} ${this.lastName}`;
      },
    });

    const user = new User({ firstName: "Alice", lastName: "Smith", id: 123 });

    expect(user.firstName).toBe("Alice");
    expect(user.lastName).toBe("Smith");
    expect(user.id).toBe(123);
    expect(user.getFullName()).toBe("Alice Smith");
  });

  it("validates and converts data types", () => {
    const TestClass = kind({
      str: String,
      num: Number,
      bool: Boolean,
      date: Date,
    });

    // Valid types should pass through
    const instance1 = new TestClass({
      str: "hello",
      num: 42,
      bool: true,
      date: new Date("2023-01-01"),
    });

    expect(instance1.str).toBe("hello");
    expect(instance1.num).toBe(42);
    expect(instance1.bool).toBe(true);
    expect(instance1.date).toBeInstanceOf(Date);

    // Type conversion should work
    const instance2 = new TestClass({
      str: 123, // Should convert to "123"
      num: "456", // Should convert to 456
      bool: "truthy", // Should convert to true
      date: "2023-01-01", // Should convert to Date
    });

    expect(instance2.str).toBe("123");
    expect(instance2.num).toBe(456);
    expect(instance2.bool).toBe(true);
    expect(instance2.date).toBeInstanceOf(Date);
  });

  it("throws errors for invalid data", () => {
    const TestClass = kind({
      num: Number,
    });

    // Invalid number should throw
    expect(() => {
      new TestClass({ num: "not-a-number" });
    }).toThrow(TypeError);
    expect(() => {
      new TestClass({ num: "not-a-number" });
    }).toThrow(/Invalid value for property 'num'/);
  });

  it("allows undefined and null values", () => {
    const TestClass = kind({
      optional: String,
    });

    const instance1 = new TestClass({ optional: undefined });
    const instance2 = new TestClass({ optional: null });

    expect(instance1.optional).toBeUndefined();
    expect(instance2.optional).toBeNull();
  });

  it("supports optional properties", () => {
    const User = kind({
      // Schema properties
      name: String,
      email: optional(String),
      age: optional(Number),

      // Methods
      getInfo() {
        return `${this.name}${this.email ? ` (${this.email})` : ""}${
          this.age ? ` - ${this.age} years old` : ""
        }`;
      },
    });

    // With all properties
    const user1 = new User({
      name: "Alice",
      email: "alice@example.com",
      age: 25,
    });
    expect(user1.name).toBe("Alice");
    expect(user1.email).toBe("alice@example.com");
    expect(user1.age).toBe(25);
    expect(user1.getInfo()).toBe("Alice (alice@example.com) - 25 years old");

    // With only required properties
    const user2 = new User({ name: "Bob" });
    expect(user2.name).toBe("Bob");
    expect(user2.email).toBeUndefined();
    expect(user2.age).toBeUndefined();
    expect(user2.getInfo()).toBe("Bob");

    // With some optional properties
    const user3 = new User({
      name: "Charlie",
      email: "charlie@example.com",
    });
    expect(user3.name).toBe("Charlie");
    expect(user3.email).toBe("charlie@example.com");
    expect(user3.age).toBeUndefined();
    expect(user3.getInfo()).toBe("Charlie (charlie@example.com)");
  });

  it("supports custom property types", () => {
    // Custom Email class that extends String
    class Email extends String {
      constructor(email: string) {
        if (typeof email !== "string") {
          throw new Error("Email must be a string");
        }
        if (!email.includes("@")) {
          throw new Error("Invalid email format");
        }

        // Call parent constructor with normalized email
        super(email.toLowerCase());
      }

      get domain() {
        return this.split("@")[1];
      }

      get localPart() {
        return this.split("@")[0];
      }

      isValid() {
        return this.includes("@") && this.split("@").length === 2;
      }
    }

    const Profile = kind({
      // Schema properties
      name: String,
      email: Email,
      age: Number,

      // Methods
      getContact() {
        return `${this.name} <${this.email}>`;
      },

      getDomain() {
        return this.email.domain;
      },

      isValidEmail() {
        return this.email.isValid();
      },
    });

    // Test with valid email
    const profile1 = new Profile({
      name: "John Doe",
      email: "John.Doe@Example.COM",
      age: 30,
    });

    expect(profile1.name).toBe("John Doe");
    expect(profile1.email).toBeInstanceOf(Email);
    expect(profile1.email).toBeInstanceOf(String);
    expect(String(profile1.email)).toBe("john.doe@example.com");
    expect(profile1.email.domain).toBe("example.com");
    expect(profile1.email.localPart).toBe("john.doe");
    expect(profile1.email.isValid()).toBe(true);
    expect(profile1.age).toBe(30);
    expect(profile1.getContact()).toBe("John Doe <john.doe@example.com>");
    expect(profile1.getDomain()).toBe("example.com");
    expect(profile1.isValidEmail()).toBe(true);

    // Test that Email behaves like a string
    expect(profile1.email + " is valid").toBe("john.doe@example.com is valid");
    expect(profile1.email.length).toBe(20);
    expect(profile1.email.toUpperCase()).toBe("JOHN.DOE@EXAMPLE.COM");

    // Test error handling for invalid email
    expect(() => {
      new Profile({
        name: "Jane",
        email: "invalid-email",
        age: 25,
      });
    }).toThrow(/Invalid email format/);

    // Test error handling for non-string email
    expect(() => {
      new Profile({
        name: "Bob",
        email: 12345,
        age: 35,
      });
    }).toThrow(/Email must be a string/);
  });
});
