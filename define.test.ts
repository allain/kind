import { kind, optional } from "./define.ts";
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
});
