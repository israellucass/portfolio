#!/usr/bin/env python3
"""Archive live site content before Adobe account access is lost."""

from __future__ import annotations

import json
import re
import subprocess
import time
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parent.parent
PROJECTS_DIR = ROOT / "src" / "content" / "projects"
ARCHIVE_DIR = ROOT / "archive"
HTML_DIR = ARCHIVE_DIR / "html"
EMBED_DIR = ARCHIVE_DIR / "embeds"
SITE_IMAGES_DIR = ROOT / "public" / "images" / "site"
VIDEOS_DIR = ROOT / "public" / "videos"

BASE = "https://isrrr.com"

SITE_ASSETS = {
    "favicon.png": "https://cdn.myportfolio.com/b983f42b545d35df7ea610688890b76a/e6981c7b-b85b-4ddf-ac67-20285a3beb34_carw_1x1x32.png?h=6a3d239ce95bd42a7060dd908fce99c4",
    "apple-touch-icon.jpg": "https://cdn.myportfolio.com/b983f42b545d35df7ea610688890b76a/d1227c42-9447-4561-829f-0910833b3575_carw_1x1x180.jpg?h=294f62cb03729db359343089420e0fb1",
    "og-image.gif": "https://cdn.myportfolio.com/b983f42b545d35df7ea610688890b76a/5f1b8646-237d-4bc7-a21e-e7ababd8c767_car_202x158.gif?h=f5aca3f6ae61671a391682ca80bacb7b",
    "theme.css": "https://cdn.myportfolio.com/b983f42b545d35df7ea610688890b76a/568d92c0fa93e30a9440f018ac0308621783038755.css?h=5cab0e2c280d4e04ad3dcfe697fad8d0",
}

STATIC_PAGES = [
    "",
    "projects",
    "ux",
    "motion-graphics",
    "games",
    "graphic",
    "about",
]

EXTERNAL_EMBEDS = [
    {
        "id": "cubo-xd",
        "type": "adobe-xd",
        "url": "https://xd.adobe.com/embed/7c6b3c57-33dd-42cd-8ea6-7a37cf2de096-2938/?fullscreen",
        "projects": ["cubo", "atendimento-mateus"],
        "note": "Export prototype from Adobe XD as MP4/PDF before account closes.",
    },
    {
        "id": "smart-financeiro-xd",
        "type": "adobe-xd",
        "url": "https://xd.adobe.com/embed/87a613ec-1050-4395-9798-cf620bc9f8a4-d2f5/",
        "projects": ["smart-financeiro", "copia-de-smart-financeiro"],
        "note": "Export prototype from Adobe XD as MP4/PDF before account closes.",
    },
    {
        "id": "cowboys-vimeo",
        "type": "vimeo",
        "url": "https://player.vimeo.com/video/138450981",
        "projects": ["cowboys-vs-cyborgs-game-art"],
        "localVideo": "/videos/cowboys-vs-cyborgs-game-art.mp4",
    },
]


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as response:
        return response.read().decode("utf-8", errors="replace")


def fetch_binary(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as response:
        return response.read()


def download_file(url: str, dest: Path) -> bool:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists():
        print(f"  exists  {dest.relative_to(ROOT)}")
        return True
    try:
        data = fetch_binary(url)
        dest.write_bytes(data)
        print(f"  saved   {dest.relative_to(ROOT)} ({len(data) // 1024} KB)")
        return True
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as error:
        print(f"  FAILED  {dest.name}: {error}")
        return False


def project_slugs() -> list[str]:
    index_path = PROJECTS_DIR / "index.json"
    if not index_path.exists():
        return []
    index = json.loads(index_path.read_text())
    return index.get("slugs", [])


def snapshot_pages(slugs: list[str]) -> list[str]:
    HTML_DIR.mkdir(parents=True, exist_ok=True)
    saved: list[str] = []

    routes = STATIC_PAGES + slugs
    for route in routes:
        url = BASE if not route else f"{BASE}/{route}"
        filename = "index.html" if route == "" else f"{route.replace('/', '_')}.html"
        dest = HTML_DIR / filename
        try:
            html = fetch(url)
            dest.write_text(html, encoding="utf-8")
            saved.append(filename)
            print(f"  html    {filename}")
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as error:
            print(f"  FAILED  {filename}: {error}")
        time.sleep(0.2)

    return saved


def parse_head_metadata(html: str) -> dict:
    def meta_content(name: str, *, prop: bool = False) -> str | None:
        if prop:
            match = re.search(
                rf'<meta\s+property="{re.escape(name)}"\s+content="([^"]*)"',
                html,
            )
        else:
            match = re.search(
                rf'<meta\s+name="{re.escape(name)}"\s+content="([^"]*)"',
                html,
            )
        return match.group(1) if match else None

    title = re.search(r"<title>([^<]+)</title>", html)
    icon = re.search(r'<link rel="icon" href="([^"]+)"', html)
    apple = re.search(r'<link rel="apple-touch-icon" href="([^"]+)"', html)

    return {
        "title": title.group(1).strip() if title else None,
        "description": meta_content("description"),
        "keywords": meta_content("keywords"),
        "ogTitle": meta_content("og:title", prop=True),
        "ogDescription": meta_content("og:description", prop=True),
        "ogImage": meta_content("og:image", prop=True),
        "twitterCard": meta_content("twitter:card"),
        "twitterSite": meta_content("twitter:site"),
        "favicon": icon.group(1) if icon else None,
        "appleTouchIcon": apple.group(1) if apple else None,
    }


def snapshot_embeds() -> None:
    EMBED_DIR.mkdir(parents=True, exist_ok=True)
    for embed in EXTERNAL_EMBEDS:
        slug = embed["id"]
        dest = EMBED_DIR / f"{slug}.html"
        try:
            html = fetch(embed["url"])
            dest.write_text(html, encoding="utf-8")
            print(f"  embed   {slug}.html")
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as error:
            print(f"  FAILED  embed {slug}: {error}")
        time.sleep(0.3)


def download_vimeo() -> bool:
    dest = VIDEOS_DIR / "cowboys-vs-cyborgs-game-art.mp4"
    if dest.exists():
        print(f"  exists  {dest.relative_to(ROOT)}")
        return True

    VIDEOS_DIR.mkdir(parents=True, exist_ok=True)
    try:
        subprocess.run(
            [
                "yt-dlp",
                "-f",
                "best[ext=mp4]/best",
                "-o",
                str(dest),
                "https://vimeo.com/138450981",
            ],
            check=True,
            capture_output=True,
            text=True,
        )
        print(f"  saved   {dest.relative_to(ROOT)}")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError) as error:
        print(f"  FAILED  vimeo download: {error}")
        return False


def normalize_project_links(project: dict) -> dict:
    if isinstance(project.get("cover"), str):
        project["cover"] = project["cover"].replace("&amp;", "&")

    def rewrite_blocks(blocks: list) -> list:
        updated: list = []
        for block in blocks:
            item = dict(block)
            if item.get("type") == "html" and isinstance(item.get("content"), str):
                item["content"] = item["content"].replace(
                    "https://portfolio.adobe.com/about", "/about"
                )
            if item.get("type") == "tree":
                item["columns"] = [
                    {**column, "blocks": rewrite_blocks(column["blocks"])}
                    for column in item["columns"]
                ]
            updated.append(item)
        return updated

    if "blocks" in project:
        project["blocks"] = rewrite_blocks(project["blocks"])

    return project


def fix_category_membership(project: dict) -> dict:
    homepage_only = {
        "atendimento-mateus",
        "copia-de-smart-financeiro",
        "baralho-samba",
        "swingin-lovers",
    }
    slug = project.get("slug", "")
    if slug in homepage_only:
        project["categories"] = ["featured"]
    return project


def attach_local_video(project: dict, vimeo_ok: bool) -> dict:
    if not vimeo_ok or project.get("slug") != "cowboys-vs-cyborgs-game-art":
        return project

    local_video = "/videos/cowboys-vs-cyborgs-game-art.mp4"
    blocks = project.get("blocks", [])
    for block in blocks:
        if (
            block.get("type") == "embed"
            and isinstance(block.get("src"), str)
            and "vimeo.com" in block["src"]
        ):
            block["localSrc"] = local_video
    return project


def write_site_metadata(home_html: str, about_html: str) -> None:
    meta = {
        "source": BASE,
        "home": parse_head_metadata(home_html),
        "about": parse_head_metadata(about_html),
        "analyticsId": None,
    }

    analytics = re.search(r'"googleAnalyticsId"\s*:\s*"([^"]+)"', home_html)
    if analytics:
        meta["analyticsId"] = analytics.group(1)

    (ARCHIVE_DIR / "site-meta.json").write_text(
        json.dumps(meta, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def copy_next_icon() -> None:
    favicon = SITE_IMAGES_DIR / "favicon.png"
    app_icon = ROOT / "src" / "app" / "icon.png"
    if favicon.exists():
        app_icon.write_bytes(favicon.read_bytes())
        print(f"  copied  {app_icon.relative_to(ROOT)}")


def archive_all() -> None:
    print("Archiving live site content...\n")

    slugs = project_slugs()
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)

    print("[1/6] Site assets")
    for name, url in SITE_ASSETS.items():
        download_file(url, SITE_IMAGES_DIR / name)
    copy_next_icon()

    print("\n[2/6] HTML snapshots")
    saved_pages = snapshot_pages(slugs)
    (ARCHIVE_DIR / "pages.json").write_text(
        json.dumps({"saved": saved_pages, "count": len(saved_pages)}, indent=2) + "\n"
    )

    home_html = (HTML_DIR / "index.html").read_text(encoding="utf-8") if (HTML_DIR / "index.html").exists() else ""
    about_html = (HTML_DIR / "about.html").read_text(encoding="utf-8") if (HTML_DIR / "about.html").exists() else ""
    write_site_metadata(home_html, about_html)

    print("\n[3/6] Embed snapshots")
    snapshot_embeds()

    print("\n[4/6] Vimeo video")
    vimeo_ok = download_vimeo()

    print("\n[5/6] Embed inventory")
    embed_manifest = {
        "embeds": EXTERNAL_EMBEDS,
        "vimeoArchived": vimeo_ok,
        "manualSteps": [
            "Export Adobe XD prototypes (cubo-xd, smart-financeiro-xd) as MP4 or PDF from Adobe XD.",
            "Verify Mega.nz download links in brasilero-game still work; re-host game files if needed.",
        ],
    }
    (ARCHIVE_DIR / "embeds.json").write_text(
        json.dumps(embed_manifest, indent=2, ensure_ascii=False) + "\n"
    )

    print("\n[6/6] Normalize project JSON")
    for path in sorted(PROJECTS_DIR.glob("*.json")):
        if path.name == "index.json":
            continue
        project = json.loads(path.read_text())
        project = normalize_project_links(project)
        project = fix_category_membership(project)
        if path.stem == "cowboys-vs-cyborgs-game-art":
            project = attach_local_video(project, vimeo_ok)
        path.write_text(json.dumps(project, indent=2, ensure_ascii=False) + "\n")

    print(f"\nArchive complete → {ARCHIVE_DIR}")


def main() -> None:
    archive_all()


if __name__ == "__main__":
    main()
