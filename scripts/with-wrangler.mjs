import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// npm's POSIX VAR=value syntax does not work in the Windows default shell.
// Resolve package bins and spawn Node directly, preserving spaces and arguments.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [command, ...args] = process.argv.slice(2);
if (!["vinext", "vite", "wrangler"].includes(command)) {
  console.error("Usage: node scripts/with-wrangler.mjs <vinext|vite|wrangler> [args...]");
  process.exit(1);
}
const packageRoot = resolve(root, "node_modules", command);
const pkg = JSON.parse(readFileSync(resolve(packageRoot, "package.json"), "utf8"));
const bin = typeof pkg.bin === "string" ? pkg.bin : pkg.bin[command];
const child = spawn(process.execPath, [resolve(packageRoot, bin), ...args], {
  cwd: root,
  stdio: "inherit",
  shell: false,
  env: {
    ...process.env,
    WRANGLER_LOG_PATH: process.env.WRANGLER_LOG_PATH || ".wrangler/wrangler.log",
  },
});
child.on("error", (error) => {
  console.error(`Could not start ${command}: ${error.message}`);
  process.exitCode = 1;
});
child.on("exit", (code, signal) => {
  process.exitCode = signal ? 1 : (code ?? 1);
});
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
