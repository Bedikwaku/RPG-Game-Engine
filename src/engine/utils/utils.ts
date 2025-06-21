import { Primitive } from "@src/engine/core/types";

export function primitiveToNumber(value: Primitive): number {
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "string") {
    if (value.length !== 1) {
      throw new Error("Only single-character strings supported.");
    }
    return value.charCodeAt(0);
  }
  throw new Error("Unsupported type");
}

export function createSeededPRNG(seed: number): () => number {
  let state = seed;
  const a = 16807; // Multiplier
  const m = 2147483647; // Modulus (2^31 - 1)

  return function () {
    state = (a * state) % m;
    return state / m; // Normalize to a value between 0 and 1
  };
}
