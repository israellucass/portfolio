#!/usr/bin/env python3
"""Download portfolio images locally and rewrite project JSON URLs."""

from __future__ import annotations

import json
import re
import time
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parent.parent
PROJECTS_DIR = ROOT / "src" / "content" / "projects"
IMAGES_DIR = ROOT / "public" / "images"
COVERS_DIR = IMAGES_DIR / "covers"
ASSETS_DIR = IMAGES_DIR / "assets"

CDN_PATTERN = re.compile(r"https://cdn\.myportfolio\.com/[^\"'\s]+")


def fetch_binary(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as response:
        return response.read()


def asset_filename(url: str) -> str:
    path = unquote(urlparse(url).path)
    name = path.rsplit("/", 1)[-1]
    return re.sub(r"[^\w.\-]", "_", name) or "asset.bin"


def cover_extension(url: str) -> str:
    name = asset_filename(url)
    if "." in name:
        return name.rsplit(".", 1)[-1].lower()
    return "jpg"


def public_path(dest: Path) -> str:
    return f"/images/{dest.relative_to(IMAGES_DIR).as_posix()}"


def download_url(url: str, dest: Path, cache: dict[str, str]) -> str:
    if url.startswith("/images/"):
        return url

    if url in cache:
        return cache[url]

    dest.parent.mkdir(parents=True, exist_ok=True)

    if not dest.exists():
        try:
            data = fetch_binary(url)
            dest.write_bytes(data)
            print(f"    downloaded {dest.name} ({len(data) // 1024} KB)")
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as error:
            print(f"    FAILED {url}: {error}")
            cache[url] = url
            return url
        time.sleep(0.05)
    else:
        print(f"    exists  {dest.name}")

    local = public_path(dest)
    cache[url] = local
    return local


def rewrite_blocks(blocks: list, cache: dict[str, str]) -> list:
    result: list = []

    for block in blocks:
        if block.get("type") == "image":
            updated = dict(block)
            for key in ("src", "lightboxSrc"):
                value = updated.get(key)
                if isinstance(value, str) and value.startswith("http"):
                    dest = ASSETS_DIR / asset_filename(value)
                    updated[key] = download_url(value, dest, cache)
            result.append(updated)
            continue

        if block.get("type") == "tree":
            result.append(
                {
                    **block,
                    "columns": [
                        {
                            **column,
                            "blocks": rewrite_blocks(column["blocks"], cache),
                        }
                        for column in block["columns"]
                    ],
                }
            )
            continue

        if block.get("type") == "html" and isinstance(block.get("content"), str):
            content = block["content"]

            def replace_url(match: re.Match[str]) -> str:
                url = match.group(0)
                dest = ASSETS_DIR / asset_filename(url)
                return download_url(url, dest, cache)

            result.append(
                {**block, "content": CDN_PATTERN.sub(replace_url, content)}
            )
            continue

        result.append(block)

    return result


def process_project(project: dict, cache: dict[str, str]) -> dict:
    slug = project["slug"]
    print(f"[{slug}]")

    cover = project.get("cover")
    if isinstance(cover, str) and cover.startswith("http"):
        ext = cover_extension(cover)
        dest = COVERS_DIR / f"{slug}.{ext}"
        project["cover"] = download_url(cover, dest, cache)

    if "blocks" in project:
        project["blocks"] = rewrite_blocks(project["blocks"], cache)

    return project


def download_all_projects() -> int:
    cache: dict[str, str] = {}
    files = sorted(
        path for path in PROJECTS_DIR.glob("*.json") if path.name != "index.json"
    )

    for path in files:
        project = json.loads(path.read_text())
        project = process_project(project, cache)
        path.write_text(json.dumps(project, indent=2, ensure_ascii=False) + "\n")

    print(f"\nDone. {len(cache)} URLs mapped. Images saved to {IMAGES_DIR}")
    return len(cache)


def main() -> None:
    download_all_projects()


if __name__ == "__main__":
    main()
