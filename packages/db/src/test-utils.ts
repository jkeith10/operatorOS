import fs from "node:fs";

export async function rmRfWithRetries(
  dir: string,
  opts: { retries?: number; delayMs?: number } = {},
): Promise<void> {
  const retries = opts.retries ?? (process.platform === "win32" ? 8 : 2);
  const delayMs = opts.delayMs ?? (process.platform === "win32" ? 75 : 10);

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      return;
    } catch (err) {
      const code = err instanceof Error ? (err as any).code : undefined;
      if (
        attempt >= retries ||
        (code !== "EPERM" && code !== "EBUSY" && code !== "ENOTEMPTY")
      ) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
