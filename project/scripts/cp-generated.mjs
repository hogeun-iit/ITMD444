import { cpSync, existsSync } from "node:fs";
import { join } from "node:path";

const cwd = process.cwd();
const src = join(cwd, "src", "generated");
const dest = join(cwd, "dist", "generated");
if (existsSync(src)) {
  cpSync(src, dest, { recursive: true });
}
