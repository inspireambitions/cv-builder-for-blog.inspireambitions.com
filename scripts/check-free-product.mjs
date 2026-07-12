import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const root = process.cwd();
const roots = ["app", "components", "lib"];
const extensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
const forbidden = [
  /\bstripe\b/i,
  /checkout[_-]?session/i,
  /payment[_-]?intent/i,
  /STRIPE_(?:SECRET|PUBLISHABLE|WEBHOOK)/,
];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  }));
  return files.flat();
}

const files = (await Promise.all(roots.map((directory) => walk(join(root, directory)))))
  .flat()
  .filter((file) => extensions.has(extname(file)));

const violations = [];
for (const file of files) {
  const content = await readFile(file, "utf8");
  if (forbidden.some((pattern) => pattern.test(content))) {
    violations.push(relative(root, file));
  }
}

if (violations.length > 0) {
  console.error("Payment code is forbidden in this free product:");
  violations.forEach((file) => console.error(`- ${file}`));
  process.exit(1);
}

console.log(`Free-product guard passed across ${files.length} source files.`);
