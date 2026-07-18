import fs from "fs";
import path from "path";
import { getCoverVideoPath } from "@/lib/media";

/** Returns the MP4 path only when the file exists under public/. */
export function resolveCoverVideoPath(cover: string): string | undefined {
  const videoPath = getCoverVideoPath(cover);
  if (!videoPath) {
    return undefined;
  }

  const absolutePath = path.join(process.cwd(), "public", videoPath);
  return fs.existsSync(absolutePath) ? videoPath : undefined;
}
