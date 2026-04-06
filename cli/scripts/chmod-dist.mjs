import { execFileSync } from "node:child_process";

if (process.platform !== "win32") {
  execFileSync("chmod", ["+x", "dist/index.js"], { stdio: "inherit" });
}
