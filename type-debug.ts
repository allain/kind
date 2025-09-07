import { kind, IsConstructor, ExtractSchema } from "./define.ts";

class Email extends String {
  constructor(email: string) {
    super(email.toLowerCase());
  }
  get domain() {
    return this.split('@')[1];
  }
}

// Test simple case first
const Simple = kind({
  name: String,
  age: Number,
  
  greet(): string {
    return `Hello, ${this.name}`;
  }
});

// Test with custom class
const WithCustom = kind({
  name: String,
  email: Email,
  
  getInfo(): string {
    return `${this.name} <${this.email}>`;
  }
});

type SimpleSchema = typeof Simple;
type CustomSchema = typeof WithCustom;

// Check what ExtractSchema produces
type SimpleExtracted = ExtractSchema<{
  name: StringConstructor;
  age: NumberConstructor;
  greet(): string;
}>;

type CustomExtracted = ExtractSchema<{
  name: StringConstructor;
  email: typeof Email;
  getInfo(): string;
}>;

// Check individual IsConstructor results
type IsStringCtor = IsConstructor<StringConstructor>;
type IsEmailCtor = IsConstructor<typeof Email>;
type IsGreetMethod = IsConstructor<() => string>;