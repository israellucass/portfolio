#!/usr/bin/env node
/**
 * Rewrite project JSON image paths to match files on disk after WebP conversion.
 * Fixes stale .png/.jpg references and missing _rw_3840 variants.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const CONTENT_DIRS = [
  path.join(ROOT, "src", "content", "projects"),
  path.join(ROOT, "src", "content", "project-meta"),
];

const IMAGE_PATH_RE = /"(\/images\/[^"]+)"/g;
const WIDTH_SUFFIX_RE = /_rw_(\d+)(\.\w+)$/;

function resolveImagePath(imagePath) {
  const rel = imagePath.slice(1);
  const full = path.join(PUBLIC, rel);
  if (existsSync(full)) {
    return imagePath;
  }

  const ext = path.extname(full);
  const base = full.slice(0, -ext.length);

  const candidates = [];

  if (WIDTH_SUFFIX_RE.test(imagePath)) {
    const withoutWidth = imagePath.replace(WIDTH_SUFFIX_RE, "");
    const widthMatch = imagePath.match(WIDTH_SUFFIX_RE);
    const requestedWidth = Number(widthMatch[1]);

    for (const width of [requestedWidth, 1920, 1200, 600]) {
      for (const altExt of [".webp", ".jpg", ".jpeg", ".png"]) {
        candidates.push(`${withoutWidth}_rw_${width}${altExt}`);
      }
    }
  }

  for (const altExt of [".webp", ".jpg", ".jpeg", ".png", ".mp4", ".gif"]) {
    if (altExt !== ext) {
      candidates.push(`${base}${altExt}`);
    }
  }

  for (const candidate of candidates) {
    const candidateRel = candidate.startsWith("/")
      ? candidate
      : `/${path.relative(PUBLIC, candidate).split(path.sep).join("/")}`;
    const candidateFull = candidate.startsWith("/")
      ? path.join(PUBLIC, candidate.slice(1))
      : candidate;

    if (existsSync(candidateFull)) {
      return candidateRel;
    }
  }

  return null;
}

function fixFile(filePath) {
  let text = readFileSync(filePath, "utf-8");
  const replacements = new Map();

  for (const match of text.matchAll(IMAGE_PATH_RE)) {
    const original = match[1];
    if (replacements.has(original)) {
      continue;
    }

    const resolved = resolveImagePath(original);
    if (resolved && resolved !== original) {
      replacements.set(original, resolved);
    }
  }

  if (replacements.size === 0) {
    return 0;
  }

  for (const [from, to] of replacements) {
    text = text.split(`"${from}"`).join(`"${to}"`);
  }

  writeFileSync(filePath, text, "utf-8");
  return replacements.size;
}

function main() {
  let filesChanged = 0;
  let pathsFixed = 0;
  const unresolved = new Set();

  for (const dir of CONTENT_DIRS) {
    for (const file of readdirSync(dir).filter((name) => name.endsWith(".json"))) {
      const filePath = path.join(dir, file);
      const text = readFileSync(filePath, "utf-8");

      for (const match of text.matchAll(IMAGE_PATH_RE)) {
        const original = match[1];
        const resolved = resolveImagePath(original);
        if (!resolved) {
          unresolved.add(original);
        }
      }

      const count = fixFile(filePath);
      if (count > 0) {
        filesChanged += 1;
        pathsFixed += count;
        console.log(`${path.relative(ROOT, filePath)}: ${count} path(s)`);
      }
    }
  }

  console.log(`\nUpdated ${filesChanged} file(s), ${pathsFixed} path(s).`);

  if (unresolved.size > 0) {
    console.log(`\nUnresolved (${unresolved.size}):`);
    for (const item of unresolved) {
      const resolved = resolveImagePath(item);
      if (!resolved) {
        console.log(`  ${item}`);
      }
    }
    process.exitCode = 1;
  }
}

main();
