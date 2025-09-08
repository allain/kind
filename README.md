# @allain/kind

Create classes with automatic validation and type conversion in TypeScript/JavaScript.

**Note:** `kind` is designed for constructing data-centric classes with properties and simple methods. It may not be good fit if that doesn't sound like the kinds of classes you want to construct.

## Benefits

The key advantages of using `kind` over traditional class definitions:

- **Boilerplate reduction** - No more repetitive constructor code
- **Automatic validation** - Input data is validated and converted to correct types  
- **Type safety** - Full TypeScript support with proper type inference

## Basic Usage

A simple example showing how to create a class with properties and methods:

```typescript
import { kind } from "jsr:@allain/kind";

const Person = kind({
  name: String,
  age: Number,
  get greeting() {
    return `Hello, I'm ${this.name} and I'm ${this.age}`;
  }
  greet() {
    console.log(this.greeting)
  }
});

// Automatically validates and converts types
const john = new Person({ name: "John", age: 30 });
console.log(john.name); 
console.log(john.age);  
console.log(john.greeting)
john.greet()
```

## Advanced Features

Explore more sophisticated patterns and capabilities:

### Optional Properties
```typescript
import { kind, optional } from "jsr:@allain/kind";

const User = kind({
  name: String,
  email: optional(String),
});

const user = new User({ name: "John" }); // email is undefined
```

### Arrays
```typescript
import { kind, array } from "jsr:@allain/kind";

const TodoList = kind({
  items: array(String),
  completed: array(Boolean),
});

const todos = new TodoList({
  items: ["Task 1", 2, true],        // ["Task 1", "2", "true"]
  completed: ["true", 0, 1]          // [true, false, true]
});
```

### Custom Types
```typescript
class Email extends String {
  constructor(email: string) {
    if (!email.includes("@")) {
      throw new Error("Invalid email format");
    }
    super(email.toLowerCase());
  }
}

const User = kind({
  name: String,
  email: Email,
  extraEmails: array(Email),  // Arrays of custom types work too
});

const user = new User({
  name: "John",
  email: "John@Example.COM",  // Converted to "john@example.com"
  extraEmails: ["admin@site.com", "user@site.com"]
});
```

### Custom Base Class
```typescript
class BaseEntity {
  id = Math.random();
  createdAt = new Date();
  
  save() {
    console.log(`Saving entity ${this.id}`);
  }
}

const User = kind({
  name: String,
  email: String,
}, BaseEntity);

const user = new User({ name: "John", email: "john@example.com" });
user.save(); // Method from BaseEntity
console.log(user.id); // Property from BaseEntity
```

## Value Construction

How `kind` transforms input data using constructor functions:

- `String`: Converts any value to string
- `Number`: Converts strings/booleans to numbers (throws on invalid)
- `Boolean`: Converts strings ("false"/"0"/"" → false, others → true)
- `Date`: Converts strings/numbers to Date objects
- Custom constructors: Uses `new Constructor(value)`

## Installation

How to add `kind` to your project:

```bash
# Deno
import { kind, optional, array } from "jsr:@allain/kind";
```

## But Why?

See the difference between `kind` and traditional class construction:

Here's what the same `Person` class looks like without `kind`:

```typescript
class Person {
  name: string;
  age: number;

  constructor(data: { name: string | number; age: string | number }) {
    if (typeof data.name !== 'string') {
      this.name = String(data.name);
    } else {
      this.name = data.name;
    }
    
    if (typeof data.age === 'string') {
      this.age = Number(data.age);
      if (isNaN(this.age)) {
        throw new Error('Invalid age');
      }
    } else {
      this.age = data.age;
    }
  }

  greet() {
    return `Hello, I'm ${this.name} and I'm ${this.age} years old`;
  }
}
```

That's 20+ lines of boilerplate for what `kind` does in 8 lines, and `kind` handles edge cases you might forget.
