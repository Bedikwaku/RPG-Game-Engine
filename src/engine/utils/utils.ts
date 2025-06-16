import { Primitive } from "./types";

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
