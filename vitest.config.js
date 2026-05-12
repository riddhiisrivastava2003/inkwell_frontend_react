import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest-tests/setup/setupTests.js"],
    include: ["vitest-tests/**/*.test.{js,jsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      thresholds: {
        statements: 72,
        branches: 70,
        functions: 72,
        lines: 72,
      },
    },
  },
});
