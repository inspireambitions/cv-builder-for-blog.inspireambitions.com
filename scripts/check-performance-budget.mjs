import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const root = process.cwd();
const nextDir = join(root, ".next");
const legacyManifestPath = join(nextDir, "app-build-manifest.json");
const buildManifestPath = join(nextDir, "build-manifest.json");
const appClientManifestPath = join(nextDir, "server", "app", "page_client-reference-manifest.js");
const MAX_INITIAL_JS_GZIP = 250 * 1024;
const MAX_INITIAL_FONT_BYTES = 120 * 1024;

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesIn(path) : [path];
  }));
  return nested.flat();
}

try {
  const routeFiles = new Set();
  try {
    const manifest = JSON.parse(await readFile(legacyManifestPath, "utf8"));
    [...(manifest.pages["/layout"] || []), ...(manifest.pages["/page"] || [])]
      .filter((file) => file.endsWith(".js"))
      .forEach((file) => routeFiles.add(file));
  } catch {
    const buildManifest = JSON.parse(await readFile(buildManifestPath, "utf8"));
    (buildManifest.rootMainFiles || []).forEach((file) => routeFiles.add(file));

    const source = await readFile(appClientManifestPath, "utf8");
    const marker = 'globalThis.__RSC_MANIFEST["/page"] = ';
    const start = source.indexOf(marker);
    if (start < 0) throw new Error("Root route client manifest was not found.");
    const routeManifest = JSON.parse(source.slice(start + marker.length).trim().replace(/;$/, ""));
    Object.values(routeManifest.entryJSFiles || {}).flat()
      .filter((file) => typeof file === "string" && file.endsWith(".js"))
      .forEach((file) => routeFiles.add(file.replace(/^\/_next\//, "")));
  }

  if (routeFiles.size === 0) throw new Error("No initial JavaScript files were found for the root route.");

  let gzipBytes = 0;
  for (const file of routeFiles) {
    const content = await readFile(join(nextDir, file));
    gzipBytes += gzipSync(content).byteLength;
  }

  const mediaDir = join(nextDir, "static", "media");
  const mediaFiles = await filesIn(mediaDir).catch(() => []);
  const fontFiles = mediaFiles.filter((file) => /\.(woff2?|ttf|otf)$/i.test(file));
  const fontBytes = (await Promise.all(fontFiles.map(async (file) => (await stat(file)).size)))
    .reduce((sum, size) => sum + size, 0);

  const failures = [];
  if (gzipBytes > MAX_INITIAL_JS_GZIP) failures.push(`Initial JS ${gzipBytes} > ${MAX_INITIAL_JS_GZIP} gzip bytes`);
  if (fontBytes > MAX_INITIAL_FONT_BYTES) failures.push(`Initial fonts ${fontBytes} > ${MAX_INITIAL_FONT_BYTES} bytes`);

  console.log(`Initial JS: ${gzipBytes} gzip bytes across ${routeFiles.size} files.`);
  console.log(`Initial fonts: ${fontBytes} bytes across ${fontFiles.length} files.`);

  if (failures.length > 0) {
    failures.forEach((failure) => console.error(failure));
    process.exit(1);
  }
} catch (error) {
  console.error("Performance budget could not be measured.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
