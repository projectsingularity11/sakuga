import { readFile, writeFile, mkdir, unlink } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
const sourceDir = process.argv[2];
if (!sourceDir)
  throw Error(
    "Pass a directory containing exported source images and sources.json",
  );
const old = JSON.parse(await readFile("lib/home-artwork.json", "utf8"));
const oldPaths =
  JSON.stringify(old).match(/\/art\/home\/[a-zA-Z0-9.-]+\.(?:avif|webp)/g) ||
  [];
const sources = JSON.parse(await readFile(`${sourceDir}/sources.json`, "utf8"));
await mkdir("public/art/home", { recursive: true });
const manifest = {};
async function encode(bytes, id, kind, width, format) {
  const pipeline = sharp(bytes)
    .rotate()
    .resize({ width, withoutEnlargement: true });
  const data = await (
    format === "avif"
      ? pipeline.avif({ quality: 68, effort: 4 })
      : pipeline.webp({ quality: 88, effort: 4 })
  ).toBuffer({ resolveWithObject: true });
  const hash = createHash("sha256")
    .update(data.data)
    .digest("hex")
    .slice(0, 12);
  const name = `${id}-${kind}-${hash}.${format}`;
  await writeFile(`public/art/home/${name}`, data.data);
  return {
    url: `/art/home/${name}`,
    width: data.info.width,
    height: data.info.height,
    bytes: data.data.length,
  };
}
for (const source of sources) {
  const bytes = Buffer.from(
      await readFile(`${sourceDir}/${source.id}-${source.kind}.b64`, "utf8"),
      "base64",
    ),
    width = source.kind === "banner" ? 1920 : 1000,
    small = source.kind === "banner" ? 960 : 380;
  const [webp, avif, smallWebp, smallAvif] = await Promise.all([
    encode(bytes, source.id, source.kind, width, "webp"),
    encode(bytes, source.id, source.kind, width, "avif"),
    encode(bytes, source.id, source.kind, small, "webp"),
    encode(bytes, source.id, source.kind, small, "avif"),
  ]);
  manifest[source.id] ??= {};
  manifest[source.id][source.kind] = {
    webp: webp.url,
    avif: avif.url,
    width: webp.width,
    height: webp.height,
    source: source.source,
    bytes: webp.bytes,
    smallWebp: smallWebp.url,
    smallAvif: smallAvif.url,
    smallWidth: smallWebp.width,
  };
  console.log(
    `${source.id} ${source.kind}: ${source.width}x${source.height} source → ${webp.width}x${webp.height}, WebP ${Math.round(webp.bytes / 1024)} KB, AVIF ${Math.round(avif.bytes / 1024)} KB`,
  );
}
await writeFile(
  "lib/home-artwork.json",
  JSON.stringify(manifest, null, 2) + "\n",
);

const used = new Set(
  JSON.stringify(manifest).match(
    /\/art\/home\/[a-zA-Z0-9.-]+\.(?:avif|webp)/g,
  ) || [],
);
for (const file of new Set(oldPaths)) {
  if (!used.has(file)) await unlink("public" + file).catch(() => {});
}
