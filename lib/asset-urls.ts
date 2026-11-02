export function trustedImage(url: string | null) {
  if (!url) return null;
  if (
    /^\/art\/(?:home\/)?[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*\.(png|jpe?g|webp|avif)$/.test(
      url,
    )
  )
    return url;
  try {
    const u = new URL(url);
    return u.protocol === "https:" &&
      [
        "s4.anilist.co",
        "media.kitsu.app",
        "media.kitsu.io",
        "cdn.myanimelist.net",
        "cdn.anime-planet.com",
        "cdn.anisearch.com",
      ].includes(u.hostname)
      ? url
      : null;
  } catch {
    return null;
  }
}
export function trustedSource(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" &&
      ["anilist.co", "myanimelist.net", "kitsu.app", "kitsu.io"].includes(
        u.hostname,
      )
      ? url
      : null;
  } catch {
    return null;
  }
}
