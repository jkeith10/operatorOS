import path from "node:path";
import { defineConfig } from "@playwright/test";

const PORT = Number(process.env.PAPERCLIP_E2E_PORT ?? 3100);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const DATA_DIR = process.env.PAPERCLIP_E2E_DATA_DIR
  ? path.resolve(process.env.PAPERCLIP_E2E_DATA_DIR)
  : path.resolve("data", "e2e");

export default defineConfig({
  testDir: ".",
  testMatch: "**/*.spec.ts",
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: BASE_URL,
    headless: true,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  // Non-interactive CI has no TTY and no prior config — `run --yes` creates
  // quickstart defaults into an isolated data dir, then starts the server.
  webServer: {
    command: `pnpm paperclipai run --yes --data-dir "${DATA_DIR}"`,
    url: `${BASE_URL}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: String(PORT),
      PAPERCLIP_OPEN_ON_LISTEN: "false",
    },
  },
  outputDir: "./test-results",
  reporter: [["list"], ["html", { open: "never", outputFolder: "./playwright-report" }]],
});
