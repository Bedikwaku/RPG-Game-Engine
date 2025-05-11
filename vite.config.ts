import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";
import path from "path";
export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "dist/**"],
  },
  esbuild: {
    target: "esnext",
  },
  resolve: {
    alias: {
      "@state": path.resolve(__dirname, "src/state"),
      "@": path.resolve(__dirname, "src"),
    },
  },
});
