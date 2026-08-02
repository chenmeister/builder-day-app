import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules", ".next"],
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      // Scoped to unit-testable business logic (auth, server actions,
      // the proxy gate). Pages/components are UI-heavy and better suited
      // to integration/E2E coverage than unit tests.
      include: [
        "lib/auth.ts",
        "app/login/actions.ts",
        "app/fridge/actions.ts",
        "app/fridge/recipe-actions.ts",
        "proxy.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
