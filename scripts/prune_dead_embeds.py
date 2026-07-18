#!/usr/bin/env python3
"""Remove dead external embed blocks from project JSON files."""

from __future__ import annotations

import json
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
PROJECTS_DIR = ROOT / "src" / "content" / "projects"

ALLOWED_HOSTS = {"xd.adobe.com", "player.vimeo.com"}


def embed_is_alive(url: str) -> bool:
    try:
        parsed_host = urlparse(url).hostname
    except Exception:
        return False

    if parsed_host not in ALLOWED_HOSTS:
        return True

    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=8) as response:
            return 200 <= response.status < 400
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError):
        return False


def prune_blocks(blocks: list) -> tuple[list, int]:
    pruned = 0
    kept: list = []

    for block in blocks:
        if block.get("type") == "tree":
            columns = []
            for column in block["columns"]:
                new_blocks, count = prune_blocks(column["blocks"])
                pruned += count
                columns.append({**column, "blocks": new_blocks})
            kept.append({**block, "columns": columns})
            continue

        if block.get("type") == "embed":
            src = block.get("src", "")
            local_src = block.get("localSrc")
            if local_src or embed_is_alive(src):
                kept.append(block)
            else:
                pruned += 1
            continue

        kept.append(block)

    return kept, pruned


def main() -> None:
    total = 0

    for path in sorted(PROJECTS_DIR.glob("*.json")):
        if path.name == "index.json":
            continue

        project = json.loads(path.read_text())
        blocks, pruned = prune_blocks(project.get("blocks", []))
        if pruned == 0:
            continue

        project["blocks"] = blocks
        path.write_text(json.dumps(project, indent=2, ensure_ascii=False) + "\n")
        print(f"{path.stem}: removed {pruned} embed(s)")
        total += pruned

    if total == 0:
        print("No dead embeds found.")
    else:
        print(f"\nRemoved {total} dead embed block(s) total.")


if __name__ == "__main__":
    main()
