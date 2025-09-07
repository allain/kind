import { IsConstructor, ExtractSchema } from "./define.ts";

// Test types step by step
type Test1 = IsConstructor<StringConstructor>;         // Should be true
type Test2 = IsConstructor<NumberConstructor>;         // Should be true  
type Test3 = IsConstructor<() => string>;              // Should be false

class MyClass {
  constructor(x: string) {}
}

type Test4 = IsConstructor<typeof MyClass>;            // Should be true

// Test extraction
type Schema1 = ExtractSchema<{
  name: StringConstructor;
  greet(): string;
}>;

type Schema2 = ExtractSchema<{
  name: StringConstructor;  
  custom: typeof MyClass;
  greet(): string;
}>;

// Let's see what each resolves to
const t1: Test1 = true;
const t2: Test2 = true;
const t3: Test3 = false;
const t4: Test4 = true; // This might fail

// Test schema extraction  
const s1: Schema1 = { name: String };
const s2: Schema2 = { name: String, custom: MyClass };