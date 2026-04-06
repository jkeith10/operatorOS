/**
 * One-shot: rename npm scope paperclipai -> operatoros in source trees.
 * Skips node_modules and dist directories (rebuild outputs). Run from repo root:
 *   node scripts/apply-operatoros-scope-rename.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function shouldSkip(absPath) {
  const normalized = absPath.replaceAll("\\", "/");
  if (normalized.includes("/node_modules/")) return true;
  if (normalized.includes("/dist/")) return true;
  if (normalized.includes("/.git/")) return true;
  return false;
}

const exts = new Set([
  ".ts",
  ".tsx",
  ".mts",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".yml",
  ".yaml",
  ".sh",
]);

function walk(dir) {
  let changed = 0;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, ent.name);
    if (shouldSkip(abs)) continue;
    if (ent.isDirectory()) {
      changed += walk(abs);
      continue;
    }
    if (!exts.has(path.extname(ent.name))) continue;
    const text = fs.readFileSync(abs, "utf8");
    const OLD = "@" + "paperclipai";
    const NEW = "@" + "operatoros";
    if (!text.includes(OLD)) continue;
    fs.writeFileSync(abs, text.split(OLD).join(NEW), "utf8");
    changed += 1;
  }
  return changed;
}

const n = walk(root);
console.error(`Updated ${n} files (scope rename). Re-run: pnpm install && pnpm -r build`);
