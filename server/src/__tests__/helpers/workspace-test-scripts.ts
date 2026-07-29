import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const fixturesDir = fileURLToPath(new URL("../fixtures", import.meta.url));

function fixtureServiceCommand(fixtureName: string): string {
  const fixturePath = path.join(fixturesDir, fixtureName).replace(/\\/g, "/");
  return `node ${fixturePath}`;
}

export function runtimeHttpOkServiceCommand(): string {
  return fixtureServiceCommand("runtime-http-ok.cjs");
}

export function runtimePaperclipHomeServiceCommand(): string {
  return fixtureServiceCommand("runtime-http-paperclip-home.cjs");
}

export function runtimeHttpEnvCaptureServiceCommand(): string {
  return fixtureServiceCommand("runtime-http-env-capture.cjs");
}

export async function installSimpleProvisionScript(repoRoot: string): Promise<string> {
  const scriptsDir = path.join(repoRoot, "scripts");
  await fs.mkdir(scriptsDir, { recursive: true });
  await fs.writeFile(
    path.join(scriptsDir, "provision.cjs"),
    [
      "const fs = require('node:fs');",
      "fs.writeFileSync('.paperclip-provision-branch', `${process.env.PAPERCLIP_WORKSPACE_BRANCH ?? ''}\\n`);",
      "fs.writeFileSync('.paperclip-provision-base', `${process.env.PAPERCLIP_WORKSPACE_BASE_CWD ?? ''}\\n`);",
      "fs.writeFileSync('.paperclip-provision-created', `${process.env.PAPERCLIP_WORKSPACE_CREATED ?? ''}\\n`);",
      "",
    ].join("\n"),
    "utf8",
  );
  return "node ./scripts/provision.cjs";
}

export async function installRecorderProvisionScript(repoRoot: string): Promise<string> {
  const scriptsDir = path.join(repoRoot, "scripts");
  await fs.mkdir(scriptsDir, { recursive: true });
  await fs.writeFile(
    path.join(scriptsDir, "provision.cjs"),
    "const fs = require('node:fs');\nfs.writeFileSync('.paperclip-provisioned', 'provisioned\\n');\n",
    "utf8",
  );
  return "node ./scripts/provision.cjs";
}
