import { createClient } from "npm:@supabase/supabase-js@2.80.0";
import { imageSize } from "npm:image-size@2.0.2";
import { JOB_KEY_SHA256 } from "./job-config.ts";
// One-time public artwork export is disabled after the bundled assets are generated.
const ENABLED = false;
const ids = [
  1, 20, 21, 16498, 154587, 113415, 101922, 127230, 171018, 21827, 21507, 21519,
  101347, 101280, 20605, 20954,
];
const client = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);
Deno.serve(async (req: Request) => {
  if (!ENABLED) return new Response("Asset export completed", { status: 410 });
  const hash = Array.from(
    new Uint8Array(
      await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(req.headers.get("x-sakuga-job-key") || ""),
      ),
    ),
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  if (req.method !== "POST" || hash !== JOB_KEY_SHA256)
    return new Response("Unauthorized", { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!ids.includes(body.id) || !["banner", "cover"].includes(body.kind))
    return new Response("Invalid asset", { status: 400 });
  const { data, error } = await client
    .from("anime")
    .select("id,banner_url,cover_url,title_english")
    .eq("id", body.id)
    .eq("moderation", "published")
    .single();
  if (error || !data) return new Response("Unavailable", { status: 404 });
  let urls = [body.kind === "banner" ? data.banner_url : data.cover_url];
  {
    const { data: mapping } = await client
      .from("source_mappings")
      .select("external_id")
      .eq("anime_id", body.id)
      .eq("provider", "kitsu")
      .eq("verified", true)
      .maybeSingle();
    if (mapping) {
      try {
        const r = await fetch(
          `https://kitsu.io/api/edge/anime/${encodeURIComponent(mapping.external_id)}`,
          { signal: AbortSignal.timeout(12000) },
        );
        if (r.ok) {
          const attrs = (await r.json()).data?.attributes;
          const v =
            body.kind === "cover" ? attrs?.posterImage : attrs?.coverImage;
          urls = [v?.original, ...urls];
        }
      } catch {}
    }
  }
  let best: {
    source: string;
    bytes: Uint8Array;
    width: number;
    height: number;
  } | null = null;
  for (const url of [...new Set(urls)]) {
    if (
      typeof url !== "string" ||
      !/^https:\/\/(s4\.anilist\.co|media\.kitsu\.(app|io))\//.test(url)
    )
      continue;
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!r.ok || Number(r.headers.get("content-length")) > 5_000_000)
        continue;
      const reader = r.body!.getReader(),
        chunks: Uint8Array[] = [];
      let size = 0;
      for (;;) {
        const part = await reader.read();
        if (part.done) break;
        size += part.value.length;
        if (size > 5_000_000) {
          await reader.cancel();
          throw Error("Too large");
        }
        chunks.push(part.value);
      }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const c of chunks) {
        bytes.set(c, offset);
        offset += c.length;
      }
      const d = imageSize(bytes);
      if (!best || d.width * d.height > best.width * best.height)
        best = { source: url, bytes, width: d.width, height: d.height };
    } catch {}
  }
  if (!best) return new Response("Source unavailable", { status: 502 });
  let binary = "";
  for (let i = 0; i < best.bytes.length; i += 8192)
    binary += String.fromCharCode(...best.bytes.subarray(i, i + 8192));
  return Response.json({
    id: body.id,
    kind: body.kind,
    source: best.source,
    width: best.width,
    height: best.height,
    base64: btoa(binary),
  });
});
