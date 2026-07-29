import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Vitest project roots. Adapters without unit tests (or heavy native deps)
    // are intentionally omitted: claude-local, cursor-local, gemini-local,
    // openclaw-gateway, adapter-utils, most plugins.
    projects: [
      "packages/db",
      "packages/adapters/codex-local",
      "packages/adapters/opencode-local",
      "packages/adapters/pi-local",
      "server",
      "ui",
      "cli",
    ],
  },
});
