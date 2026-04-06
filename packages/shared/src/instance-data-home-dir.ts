import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";

function expandHomePrefix(value: string): string {
  if (value === "~") return os.homedir();
  if (value.startsWith("~/")) return path.resolve(os.homedir(), value.slice(2));
  return value;
}

/**
 * Resolves the per-user data root for OperatorOS (fork of Paperclip).
 *
 * Precedence:
 * 1. `OPERATOROS_HOME`
 * 2. `PAPERCLIP_HOME` (legacy, compatibility)
 * 3. If `~/.operatoros` exists → use it
 * 4. Else if `~/.paperclip` exists → use it (existing installs)
 * 5. Else `~/.operatoros` (fresh install)
 *
 * @param env - Defaults to `process.env`; pass a child `process.env` when resolving for a subprocess.
 */
export function resolveInstanceDataHomeDir(env: NodeJS.ProcessEnv = process.env): string {
  const operator = env.OPERATOROS_HOME?.trim();
  if (operator) return path.resolve(expandHomePrefix(operator));
  const legacyEnv = env.PAPERCLIP_HOME?.trim();
  if (legacyEnv) return path.resolve(expandHomePrefix(legacyEnv));

  const operatorDefault = path.join(os.homedir(), ".operatoros");
  const legacyDefault = path.join(os.homedir(), ".paperclip");
  try {
    if (existsSync(operatorDefault)) return operatorDefault;
    if (existsSync(legacyDefault)) return legacyDefault;
  } catch {
    // ignore permission errors; fall through
  }
  return operatorDefault;
}
