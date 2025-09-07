import { kind } from "./define.ts";

const Rectangle = kind({
  width: Number,
  height: Number,
  
  get area() {
    return this.width * this.height;
  }
});

const rect = new Rectangle({ width: 10, height: 5 });
console.log("Rectangle instance:", rect);
console.log("Area:", rect.area);