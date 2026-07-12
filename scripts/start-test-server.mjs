import "./prepare-standalone.mjs";
import { spawn } from "node:child_process";
import { join } from "node:path";

const child = spawn(process.execPath, [join(".next", "standalone", "server.js")], {
  stdio: "inherit",
  env: {
    ...process.env,
    PORT: process.env.PORT || "3215",
    HOSTNAME: process.env.HOSTNAME || "127.0.0.1",
  },
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("exit", (code) => process.exit(code ?? 0));
