import { db } from "./supabase";
import type { Anime } from "./domain";
import { scalarParams } from "./search";
const cache = new Map<
  string,
  { expires: number; value: { titles: Anime[]; count: number; page: number } }
>();
export async function catalog(raw: Record<string, unknown>) {
  const params = scalarParams(raw),
    client = await db();
  const page = Math.max(
    1,
    Math.min(10000, Math.floor(Number(params.page) || 1)),
  );
  const key = JSON.stringify(Object.entries(params).sort());
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;
  const { data, error } = await client.rpc("search_anime", {
    query: (params.q || "").slice(0, 100),
    filters: params,
    page_number: page,
  });
  if (error) throw Error("Catalog is temporarily unavailable. Please retry.");
  const value = {
    titles: (data?.titles || []) as Anime[],
    count: Number(data?.count || 0),
    page,
  };
  if (cache.size >= 100) cache.delete(cache.keys().next().value!);
  cache.set(key, { expires: Date.now() + 30000, value });
  return value;
}
