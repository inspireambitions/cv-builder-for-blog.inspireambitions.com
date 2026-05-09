import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standaloneRoot = join(root, ".next", "standalone");
const standaloneNext = join(standaloneRoot, ".next");

await mkdir(standaloneNext, { recursive: true });

const staticSource = join(root, ".next", "static");
const staticTarget = join(standaloneNext, "static");
if (existsSync(staticSource)) {
  await rm(staticTarget, { recursive: true, force: true });
  await cp(staticSource, staticTarget, { recursive: true });
}

const publicSource = join(root, "public");
const publicTarget = join(standaloneRoot, "public");
if (existsSync(publicSource)) {
  await rm(publicTarget, { recursive: true, force: true });
  await cp(publicSource, publicTarget, { recursive: true });
}

console.log("Standalone assets prepared for local verification.");
