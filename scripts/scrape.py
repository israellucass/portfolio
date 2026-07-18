#!/usr/bin/env python3
"""Scrape project data from isrrr.com into src/content/projects/."""

import html as htmlmod
import json
import re
import time
import urllib.request
from pathlib import Path

BASE = "https://isrrr.com"
ROOT = Path(__file__).resolve().parent.parent
PROJECTS_DIR = ROOT / "src" / "content" / "projects"

MODULE_PATTERN = re.compile(
    r'<div class="project-module module (tree|image|text|embed|video)[^"]*"'
)


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as response:
        return response.read().decode("utf-8", errors="replace")


def clean_text(value: str) -> str:
    return htmlmod.unescape(re.sub(r"\s+", " ", value)).strip()


def extract_balanced_div(html: str, start: int) -> tuple[str, int]:
    """Return a div element starting at or after start, and the index after it."""
    div_start = html.find("<div", start)
    if div_start == -1:
        return "", len(html)

    depth = 0
    index = div_start
    length = len(html)

    while index < length:
        next_open = html.find("<div", index)
        next_close = html.find("</div>", index)

        if next_close == -1:
            return html[div_start:], length

        if next_open != -1 and next_open < next_close:
            depth += 1
            index = next_open + 4
            continue

        depth -= 1
        index = next_close + 6
        if depth == 0:
            return html[div_start:index], index

    return html[div_start:], length


def parse_gallery(html: str) -> list[dict]:
    projects = []
    for match in re.finditer(
        r'href="(/[^"]+)"[^>]*data-hover-hint="galleryPageCover"', html
    ):
        slug = match.group(1).lstrip("/")
        chunk = html[match.start() : match.start() + 4000]
        title = re.search(r'class="title[^"]*">([^<]+)', chunk)
        year = re.search(r'class="date">([^<]+)', chunk)
        tags = re.search(r'class="custom1[^"]*">([^<]+)', chunk)
        img = re.search(r'data-src="([^"]+)"', chunk)
        cover = clean_text(img.group(1)).replace("&amp;", "&") if img else ""
        projects.append(
            {
                "slug": slug,
                "title": clean_text(title.group(1))
                if title
                else slug.replace("-", " ").title(),
                "year": clean_text(year.group(1)) if year else "",
                "tags": clean_text(tags.group(1)) if tags else "",
                "cover": cover,
            }
        )
    return projects


def parse_image_module(module_html: str) -> dict | None:
    urls: list[str] = []
    for img_match in re.finditer(
        r'data-src="(https://cdn\.myportfolio\.com/[^"]+)"', module_html
    ):
        url = clean_text(img_match.group(1)).replace("&amp;", "&")
        if "_car_" in url and "_rwc_" not in url:
            continue
        urls.append(url)

    if not urls:
        for img_match in re.finditer(
            r'src="(https://cdn\.myportfolio\.com/[^"]+)"', module_html
        ):
            url = clean_text(img_match.group(1)).replace("&amp;", "&")
            if "_car_" in url and "_rwc_" not in url:
                continue
            urls.append(url)

    if not urls:
        return None

    def image_score(url: str) -> int:
        rw = re.search(r"_rw_(\d+)", url)
        if rw:
            return int(rw.group(1))
        if "_rwc_" in url:
            return 800
        if "_car_" not in url:
            return 500
        return 0

    best = max(urls, key=image_score)
    lightbox_match = re.search(
        r'class="js-lightbox" data-src="(https://cdn\.myportfolio\.com/[^"]+)"',
        module_html,
    )
    lightbox = (
        clean_text(lightbox_match.group(1)).replace("&amp;", "&")
        if lightbox_match
        else best
    )

    return {"type": "image", "src": best, "lightboxSrc": lightbox}


def parse_text_module(module_html: str) -> dict | None:
    text_match = re.search(
        r'class="rich-text js-text-editable module-text">(.*?)</div>\s*</div>',
        module_html,
        re.DOTALL,
    )
    if not text_match:
        return None
    content = text_match.group(1).strip()
    content = content.replace("https://portfolio.adobe.com/about", "/about")
    plain = clean_text(re.sub(r"<[^>]+>", " ", content))
    if len(plain) < 2:
        return None
    return {"type": "html", "content": content}


def parse_embed_module(module_html: str) -> dict | None:
    embed_match = re.search(r'<iframe src="([^"]+)"', module_html)
    if not embed_match:
        return None
    return {"type": "embed", "src": embed_match.group(1)}


def parse_single_module(module_html: str, mod_type: str) -> dict | None:
    if mod_type == "text":
        return parse_text_module(module_html)
    if mod_type == "image":
        return parse_image_module(module_html)
    if mod_type in ("embed", "video"):
        return parse_embed_module(module_html)
    return None


def parse_modules(html: str) -> list[dict]:
    blocks: list[dict] = []
    index = 0

    while index < len(html):
        match = MODULE_PATTERN.search(html, index)
        if not match:
            break

        module_html, end = extract_balanced_div(html, match.start())
        mod_type = match.group(1)

        if mod_type == "tree":
            blocks.append(parse_tree_module(module_html))
        else:
            parsed = parse_single_module(module_html, mod_type)
            if parsed:
                blocks.append(parsed)

        index = end

    return blocks


def parse_tree_module(module_html: str) -> dict:
    columns: list[dict] = []
    child_pattern = re.compile(
        r'<div class="tree-child-wrapper" style="flex: (\d+)"'
    )
    child_matches = list(child_pattern.finditer(module_html))

    for index, match in enumerate(child_matches):
        flex = int(match.group(1))
        child_start = match.end()
        child_end = (
            child_matches[index + 1].start()
            if index + 1 < len(child_matches)
            else len(module_html)
        )
        child_html = module_html[child_start:child_end]
        columns.append({"flex": flex, "blocks": parse_modules(child_html)})

    return {"type": "tree", "columns": columns}


def parse_project_content(html: str) -> list[dict]:
    """Extract project blocks preserving tree column layouts."""
    marker = html.find('id="project-modules"')
    if marker == -1:
        return []

    div_start = html.rfind("<div", 0, marker)
    if div_start == -1:
        return []

    module_root, _ = extract_balanced_div(html, div_start)
    inner_start = module_root.find(">") + 1
    inner_html = module_root[inner_start : module_root.rfind("</div>")]

    return parse_modules(inner_html)


def write_projects(projects: list[dict], homepage_order: list[str]) -> None:
    PROJECTS_DIR.mkdir(parents=True, exist_ok=True)

    for stale in PROJECTS_DIR.glob("*.json"):
        if stale.name != "index.json":
            stale.unlink()

    for project in projects:
        slug = project["slug"]
        path = PROJECTS_DIR / f"{slug}.json"
        path.write_text(json.dumps(project, indent=2, ensure_ascii=False) + "\n")

    index = {
        "source": BASE,
        "count": len(projects),
        "homepageOrder": homepage_order,
        "slugs": [project["slug"] for project in projects],
    }
    (PROJECTS_DIR / "index.json").write_text(
        json.dumps(index, indent=2, ensure_ascii=False) + "\n"
    )


def main() -> None:
    category_pages = {
        "ux": fetch(f"{BASE}/ux"),
        "motion": fetch(f"{BASE}/motion-graphics"),
        "games": fetch(f"{BASE}/games"),
        "graphic": fetch(f"{BASE}/graphic"),
    }
    home = fetch(BASE)
    homepage_projects = parse_gallery(home)
    homepage_order = [project["slug"] for project in homepage_projects]

    all_projects: dict[str, dict] = {}
    for project in homepage_projects:
        all_projects[project["slug"]] = {
            **project,
            "categories": ["featured"],
            "featured": True,
        }

    for category, html in category_pages.items():
        for project in parse_gallery(html):
            slug = project["slug"]
            if slug not in all_projects:
                all_projects[slug] = {
                    **project,
                    "categories": [category],
                    "featured": False,
                }
            elif category not in all_projects[slug]["categories"]:
                all_projects[slug]["categories"].append(category)

    slugs = list(all_projects.keys())
    for index, slug in enumerate(slugs, start=1):
        print(f"[{index}/{len(slugs)}] {slug}")
        try:
            html = fetch(f"{BASE}/{slug}")
            all_projects[slug]["blocks"] = parse_project_content(html)
            tree_count = sum(
                1 for block in all_projects[slug]["blocks"] if block.get("type") == "tree"
            )
            print(f"  blocks={len(all_projects[slug]['blocks'])} trees={tree_count}")
        except Exception as error:
            print(f"  error: {error}")
            all_projects[slug]["blocks"] = []
        time.sleep(0.3)

    projects = [all_projects[slug] for slug in homepage_order if slug in all_projects]
    remaining = sorted(
        [project for slug, project in all_projects.items() if slug not in homepage_order],
        key=lambda item: -int(item.get("year") or "0"),
    )
    projects.extend(remaining)

    write_projects(projects, homepage_order)
    print(f"Saved {len(projects)} projects to {PROJECTS_DIR}")

    print("\nDownloading images locally...")
    from download_images import download_all_projects

    download_all_projects()


if __name__ == "__main__":
    main()
