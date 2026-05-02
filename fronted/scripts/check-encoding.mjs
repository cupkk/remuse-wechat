import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../..");

const roots = [
  join(repoRoot, "fronted/src"),
  join(repoRoot, "fronted/scripts"),
  join(repoRoot, "fronted/index.html"),
  join(repoRoot, "backend/src"),
  join(repoRoot, "backend/scripts")
];

const ignoredDirs = new Set([
  "node_modules",
  "dist",
  "build",
  "data",
  "uploads",
  "backups",
  ".git",
  ".tmp",
  "output"
]);

const badPatterns = [
  { pattern: /\uFFFD/, reason: "replacement character" },
  { pattern: /锟斤拷|ï¿½/, reason: "classic mojibake marker" },
  { pattern: /(?:涓|鐢|鍥|璇|浣|鏃|鎴|鍙|鍚|鍗|鍝|骞|灞|棣|鎼|绫|绛|璧|澶|鏆|€)/, reason: "likely UTF-8 text decoded as GBK" },
  { pattern: /(?:Ã.|Â.|â€|å.|æ.|ç.)/, reason: "likely UTF-8 text decoded as Latin-1" }
];

const files = [];
const seen = new Set();

function walk(target) {
  if (!existsSync(target)) return;

  const stat = statSync(target);
  if (stat.isDirectory()) {
    for (const name of readdirSync(target)) {
      if (ignoredDirs.has(name)) continue;
      walk(join(target, name));
    }
    return;
  }

  if (target.endsWith("check-encoding.mjs")) return;
  if (!/\.(tsx?|css|html|mjs|json)$/.test(target) || seen.has(target)) return;
  seen.add(target);
  files.push(target);
}

for (const root of roots) walk(root);

const failures = [];

for (const file of files) {
  const text = readFileSync(file, "utf8");
  const hit = badPatterns.find(({ pattern }) => pattern.test(text));
  if (hit) failures.push({ file, reason: hit.reason });
}

if (failures.length > 0) {
  console.error("检测到疑似中文乱码：");
  for (const failure of failures) {
    console.error(`${failure.file} (${failure.reason})`);
  }
  process.exit(1);
}

console.log("中文编码检查通过");
