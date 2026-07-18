import Image from "next/image";
import { CoverImageWithVideo } from "@/components/project/CoverImageWithVideo";

type CoverImageProps = {
  src: string;
  videoSrc?: string;
  sizes: string;
  priority?: boolean;
};

export function CoverImage({
  src,
  videoSrc,
  sizes,
  priority = false,
}: CoverImageProps) {
  if (videoSrc) {
    return (
      <CoverImageWithVideo
        src={src}
        videoSrc={videoSrc}
        sizes={sizes}
        priority={priority}
      />
    );
  }

  return (
    <>
      <div className="cover-skeleton skeleton-shimmer" aria-hidden />
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        className="cover__img cover__img--loaded"
        priority={priority}
      />
    </>
  );
}
