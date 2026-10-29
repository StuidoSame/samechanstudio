import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const child = spawn(process.execPath, [resolve(root, "scripts/graft.mjs"), "mcp"], {
  cwd: root,
  stdio: ["pipe", "pipe", "inherit"],
  shell: false,
});
const pending = new Map();
let sequence = 0;
let buffer = "";
child.stdout.setEncoding("utf8");
child.stdout.on("data", (chunk) => {
  buffer += chunk;
  let end;
  while ((end = buffer.indexOf("\n")) !== -1) {
    const line = buffer.slice(0, end);
    buffer = buffer.slice(end + 1);
    if (!line.trim()) continue;
    const message = JSON.parse(line);
    const waiting = pending.get(message.id);
    if (!waiting) continue;
    pending.delete(message.id);
    clearTimeout(waiting.timer);
    if (message.error) waiting.reject(new Error(JSON.stringify(message.error)));
    else waiting.resolve(message.result);
  }
});
function failPending(error) {
  for (const waiting of pending.values()) {
    clearTimeout(waiting.timer);
    waiting.reject(error);
  }
  pending.clear();
}
child.on("error", failPending);
child.on("exit", (code) => failPending(new Error(`Graft exited (${code})`)));
function request(method, params) {
  const id = ++sequence;
  return new Promise((resolveRequest, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`MCP request timed out: ${method}`));
    }, 45000);
    pending.set(id, { resolve: resolveRequest, reject, timer });
    child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);
  });
}
const cases = [
  ["graft_repo_map", { max_dirs: 16 }, /app\/components\//],
  ["graft_find_code", { query: "HomeExperience", limit: 2 }, /HomeExperience\.tsx/],
  ["graft_find_all", { pattern: "createPageMetadata", fixed: true, in: "app" }, /app\/lib\/seo\.ts/],
  ["graft_file_api", { file: "app/components/HomeExperience.tsx" }, /function HomeExperience/],
  ["graft_trace_calls", { symbol: "createPageMetadata", direction: "in" }, /app\/page\.tsx/],
  ["graft_check_freshness", {}, /graph check: OK/],
];
try {
  const initialization = await request("initialize", {
    protocolVersion: "2024-11-05", capabilities: {},
    clientInfo: { name: "same-studio-graft-verification", version: "1.0.0" },
  });
  child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })}\n`);
  const { tools } = await request("tools/list", {});
  const results = [];
  for (const [name, args, expected] of cases) {
    assert.ok(tools.some((tool) => tool.name === name), `Missing tool: ${name}`);
    const result = await request("tools/call", { name, arguments: args });
    const text = result.content.filter((part) => part.type === "text").map((part) => part.text).join("\n");
    assert.ok(!result.isError, text);
    assert.match(text, expected);
    results.push({ tool: name, status: "PASS", text });
    console.log(`PASS ${name}`);
  }
  const report = {
    verifiedAt: new Date().toISOString(), server: initialization.serverInfo,
    tools: tools.map(({ name, inputSchema }) => ({ name, inputSchema })), results,
  };
  await mkdir(resolve(root, "outputs"), { recursive: true });
  await writeFile(resolve(root, "outputs/graft-verification.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log("GRAFT_READY — six MCP tools verified against SAME STUDIO; structural freshness OK. Deep semantic summaries are not built.");
} finally {
  child.stdin.end();
  const timer = setTimeout(() => child.kill("SIGTERM"), 2000);
  timer.unref();
  child.once("exit", () => clearTimeout(timer));
}
