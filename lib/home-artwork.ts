import manifest from "./home-artwork.json";
export type CachedPicture = {
  webp: string;
  avif: string;
  width: number;
  height: number;
  source: string;
  bytes: number;
  smallWebp?: string;
  smallAvif?: string;
  smallWidth?: number;
};
export type HomeArtwork = { banner?: CachedPicture; cover?: CachedPicture };
export const homeArtwork = manifest as Record<string, HomeArtwork>;
export function artworkFor(id: number) {
  return homeArtwork[String(id)];
}
