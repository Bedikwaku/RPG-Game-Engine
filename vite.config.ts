import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "dist/**"],
  },
});
