/** Companion MP4 loop for a WebP poster (same basename). */
export function getCoverVideoPath(cover: string): string | undefined {
  if (!cover.endsWith(".webp")) {
    return undefined;
  }

  return cover.replace(/\.webp$/, ".mp4");
}

/** Companion MP4 for a WebP project image src. */
export function getImageVideoPath(src: string): string | undefined {
  return getCoverVideoPath(src);
}
