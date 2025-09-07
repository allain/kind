import { kind } from "./define.ts";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";

describe("kind function", () => {
  it("creates a Person class with methods", () => {
    const Person = kind<{ name: string; age: number }>()({
      greet() {
        return `Hello, my name is ${this.name}`;
      },

      getAge() {
        return this.age;
      },

      celebrateBirthday() {
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
    const Rectangle = kind<{ width: number; height: number }>()({
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
    const Counter = kind<{ value: number; initialValue: number }>()({
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
    const User = kind<{ firstName: string; lastName: string; id: number }>()({
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
});
