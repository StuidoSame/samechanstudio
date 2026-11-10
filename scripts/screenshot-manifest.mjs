import assert from "node:assert/strict";
import { openSync, closeSync, readSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../public/assets/screenshot/", import.meta.url));
const manifest = new URL("../app/lib/screenshotFiles.json", import.meta.url);
const pattern = /^[a-z0-9-]+\/(?:android\/)?(?:ko|en|ja|zhg|zhb)\/(?:phone|ipad|watch)\/[1-9]\d*\.png$/;
const signature = Buffer.from("89504e470d0a1a0a0000000d49484452", "hex");
const groups = new Map();

for (const entry of readdirSync(root, { recursive: true, withFileTypes: true })) {
  if (entry.isDirectory() || entry.name === ".DS_Store") continue;

  const path = join(entry.parentPath, entry.name);
  const key = relative(root, path).split(sep).join("/");
  assert(entry.isFile() && pattern.test(key), `Invalid screenshot path: ${key}`);

  const header = Buffer.alloc(24);
  const file = openSync(path, "r");
  try {
    assert.equal(readSync(file, header, 0, header.length, 0), header.length, key);
  } finally {
    closeSync(file);
  }
  assert(header.subarray(0, 16).equals(signature), `Invalid PNG header: ${key}`);
  const width = header.readUInt32BE(16);
  const height = header.readUInt32BE(20);
  assert(width > 0 && height > 0, `Invalid PNG dimensions: ${key}`);

  const directory = key.slice(0, key.lastIndexOf("/"));
  const files = groups.get(directory) ?? [];
  files.push({ filename: entry.name, width, height });
  groups.set(directory, files);
}

const lines = [...groups.keys()].sort().map((directory) => {
  const files = groups.get(directory).sort((a, b) => parseInt(a.filename, 10) - parseInt(b.filename, 10));
  return `  "${directory}": ${JSON.stringify(files)}`;
});
const source = `{\n${lines.join(",\n")}\n}\n`;

if (process.argv.includes("--check")) {
  const checkedIn = readFileSync(manifest, "utf8").replace(/\r\n/g, "\n");
  if (checkedIn !== source) throw new Error("Run npm run screenshots:manifest and commit the result");
} else {
  writeFileSync(manifest, source);
}
