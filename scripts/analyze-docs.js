#!/usr/bin/env node

/**
 * Documentation vs Code Analyzer
 *
 * Reports the volume of documentation and comments versus actual code
 * across the source files in this repository.
 *
 * Categorizes lines as:
 *   - Blank       : empty or whitespace-only lines
 *   - Docs        : lines in Markdown (.md) files
 *   - Comments    : inline comment lines in .ts, .js, and .css files
 *   - Code        : all other non-blank lines in source files
 *
 * Usage:
 *   npm run analyze
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// ── Configuration ────────────────────────────────────────────────────────────

/** Directories and files to scan (relative to rootDir). */
const SCAN_ROOTS = ["src", "scripts"];

/** Individual root-level source files to include. */
const ROOT_FILES = ["vite.config.ts", "eslint.config.js"];

/** Directories that are always excluded from scanning. */
const EXCLUDE_DIRS = new Set([
  "node_modules",
  ".git",
  "deploy",
  ".build",
  "dist",
]);

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Recursively collect all files under `dir`, skipping excluded directories.
 * @param {string} dir
 * @returns {string[]}
 */
function collectFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.has(entry.name)) {
        results.push(...collectFiles(path.join(dir, entry.name)));
      }
    } else if (entry.isFile()) {
      results.push(path.join(dir, entry.name));
    }
  }
  return results;
}

/**
 * Count blank, comment, and code lines in a TypeScript or JavaScript file.
 * @param {string[]} lines
 * @returns {{ blank: number, comment: number, code: number }}
 */
function countTsJs(lines) {
  let blank = 0;
  let comment = 0;
  let code = 0;
  let inBlock = false;

  for (const raw of lines) {
    const line = raw.trim();

    if (line === "") {
      blank++;
      continue;
    }

    if (inBlock) {
      comment++;
      if (line.indexOf("*/") !== -1) {
        inBlock = false;
      }
      continue;
    }

    if (line.startsWith("/*")) {
      comment++;
      // Block may open and close on the same line (e.g. /* foo */)
      if (line.indexOf("*/", 2) === -1) {
        inBlock = true;
      }
      continue;
    }

    if (line.startsWith("//")) {
      comment++;
      continue;
    }

    code++;
  }

  return { blank, comment, code };
}

/**
 * Count blank, comment, and code lines in a CSS file.
 * @param {string[]} lines
 * @returns {{ blank: number, comment: number, code: number }}
 */
function countCss(lines) {
  let blank = 0;
  let comment = 0;
  let code = 0;
  let inBlock = false;

  for (const raw of lines) {
    const line = raw.trim();

    if (line === "") {
      blank++;
      continue;
    }

    if (inBlock) {
      comment++;
      if (line.indexOf("*/") !== -1) {
        inBlock = false;
      }
      continue;
    }

    if (line.startsWith("/*")) {
      comment++;
      if (line.indexOf("*/", 2) === -1) {
        inBlock = true;
      }
      continue;
    }

    code++;
  }

  return { blank, comment, code };
}

/**
 * Count all non-blank lines in a Markdown file as documentation.
 * @param {string[]} lines
 * @returns {{ blank: number, docs: number }}
 */
function countMd(lines) {
  let blank = 0;
  let docs = 0;

  for (const raw of lines) {
    if (raw.trim() === "") {
      blank++;
    } else {
      docs++;
    }
  }

  return { blank, docs };
}

// ── Totals ────────────────────────────────────────────────────────────────────

const totals = {
  ts: { files: 0, blank: 0, comment: 0, code: 0 },
  js: { files: 0, blank: 0, comment: 0, code: 0 },
  css: { files: 0, blank: 0, comment: 0, code: 0 },
  md: { files: 0, blank: 0, docs: 0 },
};

/** @type {Array<{ file: string, blank: number, comment: number, code: number, docs: number }>} */
const fileRows = [];

// ── Collect and process files ─────────────────────────────────────────────────

const allFiles = [
  ...SCAN_ROOTS.flatMap((r) => collectFiles(path.join(rootDir, r))),
  ...ROOT_FILES.map((f) => path.join(rootDir, f)).filter((f) =>
    fs.existsSync(f),
  ),
];

for (const filePath of allFiles) {
  const ext = path.extname(filePath).toLowerCase();
  if (![".ts", ".js", ".css", ".md"].includes(ext)) continue;

  const lines = fs.readFileSync(filePath, "utf-8").split("\n");
  const rel = path.relative(rootDir, filePath);

  if (ext === ".ts") {
    const { blank, comment, code } = countTsJs(lines);
    totals.ts.files++;
    totals.ts.blank += blank;
    totals.ts.comment += comment;
    totals.ts.code += code;
    fileRows.push({ file: rel, blank, comment, code, docs: 0 });
  } else if (ext === ".js") {
    const { blank, comment, code } = countTsJs(lines);
    totals.js.files++;
    totals.js.blank += blank;
    totals.js.comment += comment;
    totals.js.code += code;
    fileRows.push({ file: rel, blank, comment, code, docs: 0 });
  } else if (ext === ".css") {
    const { blank, comment, code } = countCss(lines);
    totals.css.files++;
    totals.css.blank += blank;
    totals.css.comment += comment;
    totals.css.code += code;
    fileRows.push({ file: rel, blank, comment, code, docs: 0 });
  } else if (ext === ".md") {
    const { blank, docs } = countMd(lines);
    totals.md.files++;
    totals.md.blank += blank;
    totals.md.docs += docs;
    fileRows.push({ file: rel, blank, comment: 0, code: 0, docs });
  }
}

// ── Report ────────────────────────────────────────────────────────────────────

const pad = (s, n) => String(s).padStart(n);
const padL = (s, n) => String(s).padEnd(n);

console.log("\n📊 Documentation vs Code Analysis\n");

// ── Per-file table ────────────────────────────────────────────────────────────

const col = { file: 46, blank: 7, comment: 9, code: 6, docs: 6 };

const header =
  padL("File", col.file) +
  pad("Blank", col.blank) +
  pad("Comments", col.comment) +
  pad("Code", col.code) +
  pad("Docs", col.docs);

console.log(header);
console.log("─".repeat(header.length));

for (const row of fileRows.sort((a, b) => a.file.localeCompare(b.file))) {
  console.log(
    padL(row.file, col.file) +
      pad(row.blank, col.blank) +
      pad(row.comment, col.comment) +
      pad(row.code, col.code) +
      pad(row.docs, col.docs),
  );
}

console.log("─".repeat(header.length));

// ── Totals by type ────────────────────────────────────────────────────────────

console.log("\n📁 Totals by file type:\n");

const typeHeader =
  padL("Type", 10) +
  pad("Files", 7) +
  pad("Blank", 7) +
  pad("Comments", 10) +
  pad("Code", 8) +
  pad("Docs", 8);
console.log(typeHeader);
console.log("─".repeat(typeHeader.length));

const printTypeRow = (label, t) =>
  console.log(
    padL(label, 10) +
      pad(t.files, 7) +
      pad(t.blank, 7) +
      pad(t.comment ?? 0, 10) +
      pad(t.code ?? 0, 8) +
      pad(t.docs ?? 0, 8),
  );

printTypeRow(".ts", totals.ts);
printTypeRow(".js", totals.js);
printTypeRow(".css", totals.css);
printTypeRow(".md", totals.md);

// ── Grand summary ─────────────────────────────────────────────────────────────

const grandCode =
  totals.ts.code + totals.js.code + totals.css.code;
const grandComment =
  totals.ts.comment + totals.js.comment + totals.css.comment;
const grandDocs = totals.md.docs;
const grandBlank =
  totals.ts.blank +
  totals.js.blank +
  totals.css.blank +
  totals.md.blank;
const grandNonBlank = grandCode + grandComment + grandDocs;

console.log("─".repeat(typeHeader.length));
console.log(
  padL("TOTAL", 10) +
    pad(
      totals.ts.files + totals.js.files + totals.css.files + totals.md.files,
      7,
    ) +
    pad(grandBlank, 7) +
    pad(grandComment, 10) +
    pad(grandCode, 8) +
    pad(grandDocs, 8),
);

// ── Ratio ─────────────────────────────────────────────────────────────────────

const pct = (n) =>
  grandNonBlank === 0 ? "0.0%" : ((n / grandNonBlank) * 100).toFixed(1) + "%";

console.log("\n📈 Composition (excluding blank lines):\n");
console.log(`  Code lines     : ${grandCode.toLocaleString()} lines  (${pct(grandCode)})`);
console.log(`  Comment lines  : ${grandComment.toLocaleString()} lines  (${pct(grandComment)})`);
console.log(`  Docs lines     : ${grandDocs.toLocaleString()} lines  (${pct(grandDocs)})`);
console.log(`  ─────────────────────────────────`);
console.log(`  Total (non-blank): ${grandNonBlank.toLocaleString()} lines`);

const docAndComment = grandComment + grandDocs;
console.log(
  `\n  Documentation + Comments : ${docAndComment.toLocaleString()} lines (${pct(docAndComment)})`,
);
console.log(
  `  Actual code              : ${grandCode.toLocaleString()} lines (${pct(grandCode)})`,
);
console.log(
  `\n  Ratio (docs+comments : code) = ${
    grandCode === 0
      ? "∞"
      : (docAndComment / grandCode).toFixed(2)
  } : 1`,
);
console.log();
