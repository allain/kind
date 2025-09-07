import { kind } from "./define.ts";

// Test the exact failing case but with explicit return types
const Counter = kind({
  // Schema properties
  value: Number,
  initialValue: Number,
  
  // Methods WITH explicit return types
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

const counter = new Counter({ value: 0, initialValue: 0 });

// This should work if explicit return types fix the issue
console.log(counter.value);
console.log(counter.increment());
console.log(counter.isZero);