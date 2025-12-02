#!/usr/bin/env node
/**
 * Simple bundle size budget check.
 * Measures total bytes of compiled client chunks in .next/static/chunks.
 */
const fs = require("fs");
const path = require("path");

const chunksDir = path.join(process.cwd(), ".next", "static", "chunks");
const budget = Number(process.env.BUNDLE_BUDGET_BYTES || 900_000); // ~0.9 MB

function collectFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectFiles(full));
    else if (entry.isFile() && entry.name.endsWith(".js")) files.push(full);
  }
  return files;
}

const files = collectFiles(chunksDir);
if (files.length === 0) {
  console.error("No bundle files found in .next/static/chunks. Run `pnpm build` first.");
  process.exit(1);
}

let total = 0;
let largest = { file: "", size: 0 };
for (const file of files) {
  const size = fs.statSync(file).size;
  total += size;
  if (size > largest.size) largest = { file, size };
}

const formatKb = (n) => `${(n / 1024).toFixed(1)} KB`;
console.log(`Bundle size: total=${formatKb(total)}; files=${files.length}; largest=${formatKb(largest.size)} (${path.basename(largest.file)})`);

if (total > budget) {
  console.error(`❌ Bundle budget exceeded: ${formatKb(total)} > ${formatKb(budget)} (set BUNDLE_BUDGET_BYTES to override)`);
  process.exit(1);
}

console.log("✅ Bundle size within budget.");
