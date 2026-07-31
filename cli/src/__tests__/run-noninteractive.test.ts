import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const tempRoots: string[] = [];

afterEach(() => {
  vi.restoreAllMocks();
  for (const root of tempRoots.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

describe("runCommand non-interactive bootstrap", () => {
  it("exits when config is missing without --yes", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "paperclip-run-no-yes-"));
    tempRoots.push(root);
    const configPath = path.join(root, "config.json");

    Object.defineProperty(process.stdin, "isTTY", { configurable: true, value: false });
    Object.defineProperty(process.stdout, "isTTY", { configurable: true, value: false });

    const exitSpy = vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
      throw new Error(`process.exit:${code ?? 0}`);
    }) as never);

    const { runCommand } = await import("../commands/run.js");

    await expect(runCommand({ config: configPath, yes: false })).rejects.toThrow(/process\.exit:1/);
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(fs.existsSync(configPath)).toBe(false);
  });
});
