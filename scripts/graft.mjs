import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

// Resolve from this file so MCP never indexes another chat's working directory.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const localPath = join(root, ".graft", "local.json");
const local = existsSync(localPath)
  ? JSON.parse(readFileSync(localPath, "utf8"))
  : {};
const require = createRequire(import.meta.url);
const candidates = [process.env.GRAFT_CLI, local.cli];
try {
  candidates.push(join(dirname(require.resolve("@nanonets/graft/package.json")), "dist", "cli.js"));
} catch (error) {
  if (error.code !== "MODULE_NOT_FOUND") throw error;
}
// Standard global npm layouts on Windows and Unix; custom prefixes use GRAFT_CLI.
candidates.push(
  join(dirname(process.execPath), "node_modules", "@nanonets", "graft", "dist", "cli.js"),
  resolve(dirname(process.execPath), "..", "lib", "node_modules", "@nanonets", "graft", "dist", "cli.js"),
);
if (process.env.APPDATA) {
  candidates.push(join(process.env.APPDATA, "npm", "node_modules", "@nanonets", "graft", "dist", "cli.js"));
}
const cli = candidates.find((candidate) => candidate && existsSync(candidate));
if (!cli) {
  console.error("Graft not found. Install @nanonets/graft@0.18.0 globally, or set GRAFT_CLI / .graft/local.json. See docs/agent/GRAFT.md.");
  process.exit(1);
}
const args = process.argv.slice(2);
if (!args.length) args.push("map");
const child = spawn(process.env.GRAFT_NODE || local.node || process.execPath, [
  cli, "--dir", join(root, "graft"), ...args,
], {
  cwd: root,
  stdio: "inherit",
  shell: false,
  env: {
    ...process.env,
    DO_NOT_TRACK: "1",
    GRAFT_NO_GITIGNORE: "1",
    GRAFT_NO_IGNORE: "1",
  },
});
child.on("error", (error) => {
  console.error(`Graft could not start: ${error.message}`);
  process.exitCode = 1;
});
child.on("exit", (code, signal) => {
  process.exitCode = signal ? 1 : (code ?? 1);
});
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
