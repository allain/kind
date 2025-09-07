import { kind, ExtractSchema, IsConstructor } from "./define.ts";

// Test the failing Counter case specifically
const Counter = kind({
  // Schema properties
  value: Number,
  initialValue: Number,
  
  // Methods
  increment(): number {
    this.value++;
    return this.value;
  },

  decrement(): number {
    this.value--;
    return this.value;
  },

  reset(): void {
    this.value = this.initialValue;
  },

  get isZero(): boolean {
    return this.value === 0;
  },
});

// Check the types
type CounterDef = {
  value: NumberConstructor;
  initialValue: NumberConstructor;
  increment(): number;
  decrement(): number;
  reset(): void;
  readonly isZero: boolean;
};

type TestExtraction = ExtractSchema<CounterDef>;

// Test individual IsConstructor calls
type Test1 = IsConstructor<NumberConstructor>;         // Should be true
type Test2 = IsConstructor<() => number>;              // Should be false
type Test3 = IsConstructor<() => void>;                // Should be false
type Test4 = IsConstructor<boolean>;                   // Should be false

// What should the extracted schema be?
const expectedSchema: TestExtraction = {
  value: Number,
  initialValue: Number,
};