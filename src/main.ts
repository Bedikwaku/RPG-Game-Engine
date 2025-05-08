import { createEmptyMap3D } from "./core/Map3D";

const canvas = document.getElementById("glCanvas") as HTMLCanvasElement;
const gl = canvas.getContext("webgl");

if (!gl) {
  throw new Error("WebGL not supported");
}

// Simple clear
gl.clearColor(0.2, 0.3, 0.3, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

const map = createEmptyMap3D(100, 100, 3, "grass");
console.log(map[0][0][0]);

/* File: test/main.test.ts */
import { describe, it, expect } from "vitest";

describe("Sample Test", () => {
  it("should pass", () => {
    expect(1 + 1).toBe(2);
  });
});
