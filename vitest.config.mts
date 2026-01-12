import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",

    setupFiles: ["./vitest.setup.mts"],

    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],

    exclude: ["node_modules", ".next"],

    testTimeout: 10000,

    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/**/*.d.ts",
        "src/app/**/layout.tsx",
        "src/app/**/page.tsx",
      ],
    },

    env: {
      GEMINI_API_KEY: "test-gemini-api-key",
      VAPI_PRIVATE_KEY: "test-vapi-private-key",
      NEXT_PUBLIC_VAPI_PUBLIC_KEY: "test-vapi-public-key",
      WEBHOOK_SECRET: "test-webhook-secret",
      NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
