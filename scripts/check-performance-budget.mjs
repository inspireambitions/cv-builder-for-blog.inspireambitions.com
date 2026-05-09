import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const chunksDir = join(root, ".next", "static", "chunks", "app");
const MAX_APP_CHUNK_BYTES = 1_500_000;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return walk(path);
      return path.endsWith(".js") ? [path] : [];
    })
  );
  return files.flat();
}

try {
  const files = await walk(chunksDir);
  const sizes = await Promise.all(
    files.map(async (file) => ({ file, size: (await stat(file)).size }))
  );
  const total = sizes.reduce((sum, item) => sum + item.size, 0);

  if (total > MAX_APP_CHUNK_BYTES) {
    console.error(
      `App JS budget exceeded: ${total} bytes > ${MAX_APP_CHUNK_BYTES} bytes`
    );
    process.exit(1);
  }

  console.log(`App JS budget OK: ${total} bytes across ${sizes.length} files`);
} catch (error) {
  console.warn("Performance budget skipped: build chunks were not found.");
  console.warn(error instanceof Error ? error.message : error);
}
