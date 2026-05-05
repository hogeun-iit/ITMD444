import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    env: {
      SESSION_SECRET: "ci-test-session-secret-min-32-characters",
    },
  },
});
