import { defineConfig } from "vitest/config";

const isWindows = process.platform === "win32";

export default defineConfig({
  test: {
    environment: "node",
    testTimeout: isWindows ? 30_000 : 5_000,
    hookTimeout: isWindows ? 120_000 : 10_000,
  },
});
