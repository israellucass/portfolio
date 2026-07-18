#!/usr/bin/env python3
"""Convert heavy GIF/PNG assets to WebP posters + MP4 loops for web delivery."""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
MAX_WIDTH = 808
WEBP_QUALITY = 82
MP4_CRF = 28


def max_width_for(path: Path) -> int:
    name = path.name
    if "_rw_3840" in name:
        return 3840
    if "_rw_1920" in name:
        return 1920
    if "_rw_1200" in name:
        return 1200
    if "_rw_600" in name:
        return 600
    if path.parent.name == "covers":
        return MAX_WIDTH
    return 1920

GIF_COVERS = [
    "atendimento-mateus.gif",
    "cubo.gif",
    "dark-feelings-2d-animation.gif",
    "the-life-of-ratildo-flash-animation.gif",
    "unused-2d-animation.gif",
]

PNG_COVERS = [
    "olhe-e-aprenda.png",
    "copia-de-smart-financeiro.png",
    "smart-financeiro.png",
    "tutti-frutti-visual-identity.png",
]


def run(cmd: list[str]) -> None:
    result = subprocess.run(
        cmd, check=False, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE
    )
    if result.returncode != 0:
        raise subprocess.CalledProcessError(
            result.returncode, cmd, stderr=result.stderr
        )


def gif_to_webp_and_mp4(src: Path) -> tuple[Path, Path | None]:
    webp = src.with_suffix(".webp")
    mp4 = src.with_suffix(".mp4")
    frame = src.with_suffix(".frame.png")
    width = max_width_for(src)
    scale = f"scale='min({width},iw)':-2"

    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(src),
            "-vf",
            scale,
            "-frames:v",
            "1",
            str(frame),
        ]
    )
    run(["cwebp", "-q", str(WEBP_QUALITY), str(frame), "-o", str(webp)])
    frame.unlink(missing_ok=True)

    try:
        run(
            [
                "ffmpeg",
                "-y",
                "-i",
                str(src),
                "-vf",
                scale,
                "-c:v",
                "libx264",
                "-pix_fmt",
                "yuv420p",
                "-movflags",
                "+faststart",
                "-an",
                "-crf",
                str(MP4_CRF),
                str(mp4),
            ]
        )
        return webp, mp4
    except subprocess.CalledProcessError:
        mp4.unlink(missing_ok=True)
        try:
            run(
                [
                    "ffmpeg",
                    "-y",
                    "-i",
                    str(src),
                    "-vf",
                    f"fps=15,{scale},split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
                    "-c:v",
                    "libx264",
                    "-pix_fmt",
                    "yuv420p",
                    "-movflags",
                    "+faststart",
                    "-an",
                    "-crf",
                    str(MP4_CRF),
                    str(mp4),
                ]
            )
            return webp, mp4
        except subprocess.CalledProcessError:
            mp4.unlink(missing_ok=True)
            return webp, None


def png_to_webp(src: Path) -> Path:
    webp = src.with_suffix(".webp")
    frame = src.with_suffix(".frame.png")
    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(src),
            "-vf",
            f"scale='min({MAX_WIDTH},iw)':-2",
            "-frames:v",
            "1",
            str(frame),
        ]
    )
    run(["cwebp", "-q", str(WEBP_QUALITY), str(frame), "-o", str(webp)])
    frame.unlink(missing_ok=True)
    return webp


def compress_mp4(src: Path) -> None:
    tmp = src.with_suffix(".tmp.mp4")
    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(src),
            "-c:v",
            "libx264",
            "-crf",
            str(MP4_CRF),
            "-preset",
            "slow",
            "-movflags",
            "+faststart",
            "-an",
            str(tmp),
        ]
    )
    tmp.replace(src)


def human_size(path: Path) -> str:
    size = path.stat().st_size
    for unit in ("B", "KB", "MB"):
        if size < 1024 or unit == "MB":
            return f"{size / (1024 ** (0 if unit == 'B' else (1 if unit == 'KB' else 2))):.1f} {unit}" if unit != "B" else f"{size} B"
        size /= 1024
    return f"{size:.1f} MB"


def replace_gif_paths_in_json(root: Path) -> int:
    pattern = re.compile(r"(\/images\/[^\"']+?)\.gif")
    count = 0

    for json_path in root.rglob("*.json"):
        text = json_path.read_text(encoding="utf-8")
        if ".gif" not in text:
            continue
        updated = pattern.sub(r"\1.webp", text)
        if updated != text:
            json_path.write_text(updated, encoding="utf-8")
            count += 1

    return count


def convert_asset_gifs(assets_dir: Path) -> None:
    for gif in sorted(assets_dir.glob("*.gif")):
        webp = gif.with_suffix(".webp")
        mp4 = gif.with_suffix(".mp4")
        if webp.exists() and (mp4.exists() or not gif_to_mp4_candidate(gif)):
            continue
        if webp.exists() and not mp4.exists():
            try:
                width = max_width_for(gif)
                scale = f"scale='min({width},iw)':-2"
                run(
                    [
                        "ffmpeg",
                        "-y",
                        "-i",
                        str(gif),
                        "-vf",
                        scale,
                        "-c:v",
                        "libx264",
                        "-pix_fmt",
                        "yuv420p",
                        "-movflags",
                        "+faststart",
                        "-an",
                        "-crf",
                        str(MP4_CRF),
                        str(mp4),
                    ]
                )
                continue
            except subprocess.CalledProcessError:
                pass
        print(f"  asset {gif.name} …")
        gif_to_webp_and_mp4(gif)


def gif_to_mp4_candidate(gif: Path) -> bool:
    return gif.stat().st_size > 120_000


def main() -> int:
    covers_dir = PUBLIC / "images" / "covers"
    site_dir = PUBLIC / "images" / "site"
    videos_dir = PUBLIC / "videos"
    assets_dir = PUBLIC / "images" / "assets"

    print("Cover GIFs → WebP + MP4")
    for name in GIF_COVERS:
        src = covers_dir / name
        if not src.exists():
            print(f"  skip missing {name}")
            continue
        before = src.stat().st_size
        webp, mp4 = gif_to_webp_and_mp4(src)
        mp4_size = mp4.stat().st_size // 1024 if mp4 else 0
        print(
            f"  {name}: {before // 1024}KB → webp {webp.stat().st_size // 1024}KB"
            + (f", mp4 {mp4_size}KB" if mp4 else " (static webp only)")
        )

    print("Cover PNGs → WebP")
    for name in PNG_COVERS:
        src = covers_dir / name
        if not src.exists():
            continue
        before = src.stat().st_size
        webp = png_to_webp(src)
        print(f"  {name}: {before // 1024}KB → webp {webp.stat().st_size // 1024}KB")

    og_gif = site_dir / "og-image.gif"
    if og_gif.exists():
        og_webp = site_dir / "og-image.webp"
        og_jpg = site_dir / "og-image.jpg"
        og_frame = site_dir / "og-image.frame.png"
        run(
            [
                "ffmpeg",
                "-y",
                "-i",
                str(og_gif),
                "-vf",
                "scale=1200:-2",
                "-frames:v",
                "1",
                str(og_frame),
            ]
        )
        run(["cwebp", "-q", str(WEBP_QUALITY), str(og_frame), "-o", str(og_webp)])
        run(
            [
                "ffmpeg",
                "-y",
                "-i",
                str(og_frame),
                "-frames:v",
                "1",
                str(og_jpg),
            ]
        )
        og_frame.unlink(missing_ok=True)
        print(f"  og-image: gif {og_gif.stat().st_size // 1024}KB → webp/jpg")

    cowboys = videos_dir / "cowboys-vs-cyborgs-game-art.mp4"
    if cowboys.exists():
        before = cowboys.stat().st_size
        compress_mp4(cowboys)
        print(f"  cowboys mp4: {before // 1024}KB → {cowboys.stat().st_size // 1024}KB")

    print("Project asset GIFs (full-size only) …")
    convert_asset_gifs(assets_dir)

    print("Updating JSON paths .gif → .webp …")
    updated = replace_gif_paths_in_json(ROOT / "src" / "content")
    print(f"  updated {updated} JSON files")

    return 0


if __name__ == "__main__":
    sys.exit(main())
