import { kind, ExtractSchema, IsConstructor } from "./define.ts";

// Test getter specifically
const TestGetter = kind({
  value: Number,
  
  get computed(): number {
    return this.value * 2;
  },
  
  method(): string {
    return String(this.value);
  }
});

// Check the types for getter
type GetterDef = {
  value: NumberConstructor;
  readonly computed: number;
  method(): string;
};

type TestExtraction = ExtractSchema<GetterDef>;

// Test individual IsConstructor calls for getter patterns
type Test1 = IsConstructor<NumberConstructor>;         // Should be true
type Test2 = IsConstructor<number>;                    // Should be false (getter return type)
type Test3 = IsConstructor<() => string>;              // Should be false

// What should the extracted schema be?
const expectedSchema: TestExtraction = {
  value: Number,
};