/* Native pictures use pre-encoded, content-hashed files and avoid first-view image transcoding. */
import type { CachedPicture } from "@/lib/home-artwork";
export function ArtPicture({
  art,
  mobile,
  className = "",
  alt = "",
  eager = false,
  kind = "banner",
  onError,
}: {
  art: CachedPicture;
  mobile?: CachedPicture;
  className?: string;
  alt?: string;
  eager?: boolean;
  kind?: "cover" | "banner";
  onError?: () => void;
}) {
  const srcset = (image: CachedPicture, kind: "avif" | "webp") =>
    image.smallWidth
      ? `${kind === "avif" ? image.smallAvif : image.smallWebp} ${image.smallWidth}w, ${image[kind]} ${image.width}w`
      : undefined;
  return (
    <picture className={className}>
      {mobile && (
        <>
          <source
            media="(max-width:600px)"
            type="image/avif"
            srcSet={mobile.avif}
          />
          <source
            media="(max-width:600px)"
            type="image/webp"
            srcSet={mobile.webp}
          />
        </>
      )}
      <source
        type="image/avif"
        srcSet={srcset(art, "avif") || art.avif}
        sizes={kind === "cover" ? "(max-width:600px) 44vw,260px" : "100vw"}
      />
      <img
        src={art.webp}
        srcSet={srcset(art, "webp")}
        sizes={kind === "cover" ? "(max-width:600px) 44vw,260px" : "100vw"}
        width={art.width}
        height={art.height}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        decoding="async"
        onError={onError}
      />
    </picture>
  );
}
