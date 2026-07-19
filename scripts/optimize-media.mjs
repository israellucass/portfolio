#!/usr/bin/env node
/**
 * Optimize all project media with sharp (images) + ffmpeg (GIF→MP4).
 *
 * What it does:
 * 1. Convert cover GIFs → WebP (poster) + MP4 (loop)
 * 2. Convert cover PNGs/JPGs → WebP
 * 3. For every asset image: generate WebP at 600/1200/1920 widths
 * 4. Remove oversized variants (_rw_3840) and placeholder files (176B)
 * 5. Update all JSON references: .gif→.webp, .png→.webp
 * 6. Compress the single project video
 */

import { execSync } from "child_process";
import { readFileSync, readdirSync, writeFileSync, existsSync, unlinkSync } from "fs";
import { readdir, rename as renameAsync, stat, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";

const ROOT = decodeURIComponent(new URL("..", import.meta.url).pathname);
const PUBLIC = path.join(ROOT, "public");
const COVERS = path.join(PUBLIC, "images", "covers");
const ASSETS = path.join(PUBLIC, "images", "assets");
const SITE = path.join(PUBLIC, "images", "site");
const VIDEOS = path.join(PUBLIC, "videos");
const CONTENT = path.join(ROOT, "src", "content");

const WEBP_QUALITY = 85;
const COVER_MAX_W = 808;
const ASSET_WIDTHS = [600, 1200, 1920];
const PLACEHOLDER_SIZE = 200; // bytes — files smaller than this are broken exports

function log(...args) {
  console.log(`[optimize]`, ...args);
}

function run(cmd) {
  execSync(cmd, { stdio: "ignore" });
}

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extname(file) {
  return path.extname(file).toLowerCase();
}

// ─── COVERS ────────────────────────────────────────────────────────

async function optimizeCover(file) {
  const srcPath = path.join(COVERS, file);
  const ext = extname(file);
  const base = path.basename(file, ext);
  const webpPath = path.join(COVERS, `${base}.webp`);
  const mp4Path = path.join(COVERS, `${base}.mp4`);
  const before = (await stat(srcPath)).size;

  if (ext === ".gif") {
    // GIF → WebP poster + MP4 loop via ffmpeg (sharp can't do GIF→MP4)
    const frame = path.join(COVERS, `${base}.frame.png`);
    run(`ffmpeg -y -i "${srcPath}" -vf "scale='min(${COVER_MAX_W},iw)':-2" -frames:v 1 "${frame}"`);
    await sharp(frame).webp({ quality: WEBP_QUALITY }).toFile(webpPath);
    unlinkSync(frame);

    try {
      run(`ffmpeg -y -i "${srcPath}" -vf "scale='min(${COVER_MAX_W},iw)':-2" -c:v libx264 -pix_fmt yuv420p -movflags +faststart -an -crf 24 "${mp4Path}"`);
    } catch {
      log(`  ${file}: mp4 fallback with palette`);
      try {
        run(`ffmpeg -y -i "${srcPath}" -vf "fps=15,scale='min(${COVER_MAX_W},iw)':-2,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -c:v libx264 -pix_fmt yuv420p -movflags +faststart -an -crf 24 "${mp4Path}"`);
      } catch {
        log(`  ${file}: mp4 failed, keeping webp only`);
      }
    }
    const webpSize = (await stat(webpPath)).size;
    const mp4Size = existsSync(mp4Path) ? (await stat(mp4Path)).size : 0;
    log(`${file}: ${humanSize(before)} → webp ${humanSize(webpSize)}${mp4Size ? ` + mp4 ${humanSize(mp4Size)}` : ""}`);
    return;
  }

  // PNG/JPG cover → WebP
  await sharp(srcPath)
    .resize({ width: COVER_MAX_W, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(webpPath);
  const webpSize = (await stat(webpPath)).size;
  log(`${file}: ${humanSize(before)} → webp ${humanSize(webpSize)}`);
}

// ─── ASSETS ─────────────────────────────────────────────────────────

async function optimizeAsset(file) {
  const srcPath = path.join(ASSETS, file);
  const ext = extname(file);

  // Skip if it's already a variant or webp/mp4
  if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") return;
  if (file.includes("_rw_")) return; // we process originals only

  const base = path.basename(file, ext);
  const before = (await stat(srcPath)).size;

  // Remove placeholder variants (176B files are broken exports)
  for (const w of [...ASSET_WIDTHS, 3840]) {
    const variantPatterns = [
      path.join(ASSETS, `${base}_rw_${w}.png`),
      path.join(ASSETS, `${base}_rw_${w}.jpg`),
      path.join(ASSETS, `${base}_rw_${w}.jpeg`),
    ];
    for (const v of variantPatterns) {
      if (existsSync(v)) {
        const vSize = (await stat(v)).size;
        if (vSize < PLACEHOLDER_SIZE) {
          unlinkSync(v);
          log(`  removed placeholder: ${path.basename(v)} (${humanSize(vSize)})`);
        }
      }
    }
  }

  // Generate WebP at needed widths
  for (const w of ASSET_WIDTHS) {
    const webpPath = path.join(ASSETS, `${base}_rw_${w}.webp`);
    if (existsSync(webpPath)) continue;

    const img = sharp(srcPath);
    const meta = await img.metadata();
    const targetW = Math.min(w, meta.width);
    await img
      .resize({ width: targetW, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(webpPath);
  }

  // Remove old PNG/JPG variants (we now have WebP)
  for (const w of [...ASSET_WIDTHS, 3840]) {
    for (const ext of [".png", ".jpg", ".jpeg"]) {
      const v = path.join(ASSETS, `${base}_rw_${w}${ext}`);
      if (existsSync(v)) {
        const vSize = (await stat(v)).size;
        unlinkSync(v);
        log(`  removed old variant: ${path.basename(v)} (${humanSize(vSize)})`);
      }
    }
  }

  const after = (await stat(srcPath)).size;
  log(`${file}: ${humanSize(before)} → ${humanSize(after)} (originals kept)`);
}

// ─── JSON PATH UPDATES ──────────────────────────────────────────────

function updateJsonPaths() {
  let count = 0;

  function walk(dir) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.name.endsWith(".json")) continue;

      let text = readFileSync(full, "utf-8");
      let changed = false;

      // .gif → .webp (already done by old script, but ensure)
      if (text.includes(".gif")) {
        text = text.replace(/\.gif/g, ".webp");
        changed = true;
      }

      // .png → .webp for cover paths (the bug: old script missed these)
      if (text.includes('"cover"')) {
        text = text.replace(/"(\.\/)?\/images\/covers\/([^"]+?)\.png"/g, (match) => {
          const webpPath = path.join(COVERS, `${match.match(/\/([^\/]+)\.png/)[1]}.webp`);
          if (existsSync(webpPath)) {
            changed = true;
            return match.replace(/\.png"/, '.webp"');
          }
          return match;
        });
      }

      if (changed) {
        writeFileSync(full, text, "utf-8");
        count++;
      }
    }
  }

  walk(CONTENT);
  return count;
}

// ─── MAIN ───────────────────────────────────────────────────────────

async function main() {
  log("Starting media optimization…\n");

  // Phase 1: Covers
  log("=== Cover images ===");
  const coverFiles = await readdir(COVERS);
  for (const file of coverFiles.sort()) {
    const ext = extname(file);
    if ([".gif", ".png", ".jpg", ".jpeg"].includes(ext)) {
      await optimizeCover(file);
    }
  }

  // Phase 2: Asset images
  log("\n=== Asset images ===");
  const assetFiles = await readdir(ASSETS);
  let assetCount = 0;
  for (const file of assetFiles.sort()) {
    const ext = extname(file);
    if ([".png", ".jpg", ".jpeg"].includes(ext) && !file.includes("_rw_")) {
      await optimizeAsset(file);
      assetCount++;
    }
  }
  log(`Processed ${assetCount} original assets`);

  // Phase 3: Site images
  log("\n=== Site images ===");
  const ogJpg = path.join(SITE, "og-image.jpg");
  if (existsSync(ogJpg)) {
    const webpPath = path.join(SITE, "og-image.webp");
    if (!existsSync(webpPath)) {
      await sharp(ogJpg).resize(1200).webp({ quality: WEBP_QUALITY }).toFile(webpPath);
      log(`og-image.jpg → og-image.webp`);
    }
  }

  // Phase 4: Project video
  log("\n=== Project video ===");
  const cowboysMp4 = path.join(VIDEOS, "cowboys-vs-cyborgs-game-art.mp4");
  if (existsSync(cowboysMp4)) {
    const before = (await stat(cowboysMp4)).size;
    const tmp = cowboysMp4.replace(".mp4", ".tmp.mp4");
    run(`ffmpeg -y -i "${cowboysMp4}" -c:v libx264 -crf 24 -preset slow -movflags +faststart -an "${tmp}"`);
    unlinkSync(cowboysMp4);
    await renameAsync(tmp, cowboysMp4);
    const after = (await stat(cowboysMp4)).size;
    log(`cowboys-vs-cyborgs-game-art.mp4: ${humanSize(before)} → ${humanSize(after)}`);
  }

  // Phase 5: Update JSON paths
  log("\n=== JSON path updates ===");
  const updated = updateJsonPaths();
  log(`Updated ${updated} JSON files`);

  // Summary
  log("\n=== Summary ===");
  const totalSize = await dirSize(PUBLIC);
  log(`Total public/ size: ${humanSize(totalSize)}`);
}

async function dirSize(dir) {
  let size = 0;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      size += await dirSize(full);
    } else {
      size += (await stat(full)).size;
    }
  }
  return size;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
