# Definer

A TypeScript utility for creating strongly-typed class constructors with dynamic methods and properties.

## Overview

The `kind` function allows you to define classes with:
- **Schema-based data properties** using constructor types (String, Number, Boolean, Date)
- **Methods and getters** with proper `this` typing
- **Full TypeScript inference** for autocomplete and type safety

## Installation

```typescript
import { kind, optional } from "./define.ts";
```

## Usage

### Basic Example

```typescript
const Person = kind(
  { name: String, age: Number },
  {
    greet() {
      return `Hello, my name is ${this.name}`;
    },
    
    getAge() {
      return this.age;
    },
    
    celebrateBirthday() {
      this.age++;
      return `Happy birthday! Now I'm ${this.age}`;
    }
  }
);

// Create an instance
const john = new Person({ name: "John", age: 30 });

// All methods are fully typed with autocomplete
console.log(john.greet()); // "Hello, my name is John"
console.log(john.getAge()); // 30
console.log(john.celebrateBirthday()); // "Happy birthday! Now I'm 31"
console.log(john.age); // 31 (data properties are accessible)
```

### With Getters

```typescript
const Rectangle = kind(
  { width: Number, height: Number },
  {
    get area() {
      return this.width * this.height;
    },
    
    get perimeter() {
      return 2 * (this.width + this.height);
    },
    
    resize(widthFactor: number, heightFactor: number) {
      this.width *= widthFactor;
      this.height *= heightFactor;
    }
  }
);

const rect = new Rectangle({ width: 10, height: 5 });
console.log(rect.area); // 50
console.log(rect.perimeter); // 30
rect.resize(2, 1.5);
console.log(rect.area); // 150
```

### State Management

```typescript
const Counter = kind(
  { value: Number, initialValue: Number },
  {
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
    }
  }
);

const counter = new Counter({ value: 0, initialValue: 0 });
counter.increment(); // 1
counter.increment(); // 2
counter.reset();
console.log(counter.isZero); // true
```

### Optional Properties

```typescript
const User = kind(
  { 
    name: String, 
    email: optional(String), 
    age: optional(Number) 
  },
  {
    getInfo() {
      return `${this.name}${this.email ? ` (${this.email})` : ''}`;
    }
  }
);

// All properties
const user1 = new User({ 
  name: "Alice", 
  email: "alice@example.com", 
  age: 25 
});

// Only required properties
const user2 = new User({ name: "Bob" });

// Mixed
const user3 = new User({ 
  name: "Charlie", 
  email: "charlie@example.com" 
});
```

### Type Conversion

The constructor automatically converts values to the correct types:

```typescript
const Person = kind({ name: String, age: Number }, {});

// These all work:
const p1 = new Person({ name: "John", age: 30 });     // Direct types
const p2 = new Person({ name: 123, age: "25" });      // Converts: 123 → "123", "25" → 25
const p3 = new Person({ name: true, age: "30" });     // Converts: true → "true", "30" → 30

// Throws error for invalid conversions:
const p4 = new Person({ name: "John", age: "invalid" }); // TypeError
```

## API

### `kind(schema, methods)`

- **schema**: Object defining data properties using constructors (String, Number, Boolean, Date)
- **methods**: Object containing methods and getters where `this` refers to the inferred data type
- **Returns**: A constructor function that creates instances with both data and methods

#### Parameters

- `schema: Record<string, Constructor>` - Maps property names to type constructors
- `methods: Record<string, Function> & ThisType<InferredDataType>` - Methods with proper `this` typing

#### Supported Schema Types

- `String` → `string`
- `Number` → `number` 
- `Boolean` → `boolean`
- `Date` → `Date`

### `optional(type)`

Creates an optional property in the schema:

```typescript
optional(String)  // Optional string property
optional(Number)  // Optional number property
```

#### Features

- ✅ Clean two-parameter API
- ✅ Full TypeScript inference from schema
- ✅ Autocomplete for all methods and properties
- ✅ Type-safe `this` context in methods
- ✅ Support for getters and setters
- ✅ Proper property descriptor copying
- ✅ **Runtime type validation and conversion**
- ✅ **Optional properties with `optional()` wrapper**
- ✅ **Flexible input types** (automatic conversion)
- ✅ **instanceof checks** and constructor fallbacks

## Running Tests

```bash
deno test define.test.ts
```

## License

MIT