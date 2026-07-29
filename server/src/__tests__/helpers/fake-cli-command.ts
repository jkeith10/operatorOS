import fs from "node:fs/promises";
import path from "node:path";

export type FakeCliCommand = {
  /** Full path to pass as `config.command` when using an absolute command. */
  commandPath: string;
  /** Bare command name for PATH-based lookup (e.g. `codex`). */
  commandName: string;
};

/**
 * Writes a cross-platform fake CLI executable for adapter tests.
 * On Unix: shebang + chmod. On Windows: `.js` + `.cmd` wrapper.
 */
export async function writeFakeCliCommand(
  dir: string,
  name: string,
  scriptBody: string,
): Promise<FakeCliCommand> {
  await fs.mkdir(dir, { recursive: true });

  if (process.platform === "win32") {
    const jsPath = path.join(dir, `${name}.js`);
    const cmdPath = path.join(dir, `${name}.cmd`);
    await fs.writeFile(jsPath, scriptBody, "utf8");
    const nodePath = process.execPath.replace(/"/g, '""');
    await fs.writeFile(cmdPath, `@echo off\r\n"${nodePath}" "%~dp0${name}.js" %*\r\n`, "utf8");
    return { commandPath: cmdPath, commandName: name };
  }

  const commandPath = path.join(dir, name);
  await fs.writeFile(commandPath, `#!/usr/bin/env node\n${scriptBody}`, "utf8");
  await fs.chmod(commandPath, 0o755);
  return { commandPath, commandName: name };
}
