import { z } from "zod";
export const statuses = [
  "planned",
  "watching",
  "completed",
  "on_hold",
  "dropped",
] as const;
export const labels: Record<string, string> = {
  planned: "Plan to watch",
  watching: "Watching",
  completed: "Completed",
  on_hold: "On hold",
  dropped: "Dropped",
};
export const entrySchema = z.object({
  anime_id: z.number().int().positive(),
  status: z.enum(statuses),
  progress: z.number().int().min(0),
  score: z.number().min(0).max(10).nullable(),
  favorite: z.boolean(),
  priority: z.number().int().min(0).max(3),
  notes: z.string().max(10000),
  tags: z.array(z.string().min(1).max(40)).max(30),
  rewatches: z.number().int().min(0),
  started_on: z.iso.date().nullable(),
  completed_on: z.iso.date().nullable(),
});
export const ruleSchema = z
  .object({
    status: z.enum(statuses).optional(),
    favorite: z.boolean().optional(),
    maxEpisodes: z.number().int().positive().max(10000).optional(),
    genre: z.string().max(80).optional(),
    minScore: z.number().min(0).max(10).optional(),
  })
  .strict();
export type Rule = z.infer<typeof ruleSchema>;
export type Anime = {
  series_id?: number | null;
  series_count?: number;
  matched_id?: number;
  id: number;
  title: string;
  imdb_id?: string | null;
  trailer_url?: string | null;
  synopsis_language?: string | null;
  title_english?: string | null;
  cover_width?: number | null;
  cover_height?: number | null;
  airing_status?: string | null;
  synonyms?: string[];
  title_romaji: string | null;
  title_native: string | null;
  synopsis: string | null;
  cover_url: string | null;
  banner_url: string | null;
  format: string | null;
  year: number | null;
  episodes: number | null;
  duration: number | null;
  genres: string[];
  studios: string[];
  mature: boolean;
  updated_at: string;
  ratings: Rating[];
  source_mappings: Mapping[];
};
export type Rating = {
  provider: string;
  score: number | null;
  scale: number;
  votes: number | null;
  refreshed_at: string;
};
export type Mapping = { provider: string; url: string; verified: boolean };
export type Entry = z.infer<typeof entrySchema> & {
  anime: Anime | null;
  updated_at: string;
  created_at: string;
};
export function normalize(score: number | null, scale: number) {
  if (score === null) return null;
  if (scale <= 0 || score < 0 || score > scale) throw Error("Invalid score");
  return (score / scale) * 10;
}
export function eligible(input: {
  genres: string[];
  adult: boolean | null;
  classification?: string;
}) {
  if (
    input.genres.some((g) =>
      ["hentai", "pornography"].includes(g.toLowerCase()),
    ) ||
    input.classification === "Rx"
  )
    return { state: "excluded", reason: "Explicit pornography classification" };
  if (input.adult !== false)
    return {
      state: "quarantine",
      reason: "Adult classification requires manual review",
    };
  return {
    state: "published",
    reason: "No explicit classification; provider metadata checked",
  };
}
export function progressValid(progress: number, total: number | null) {
  return (
    Number.isInteger(progress) &&
    progress >= 0 &&
    (total === null || progress <= total)
  );
}
export function matches(entry: Entry, rule: Rule) {
  const a = entry.anime;
  return (
    (!rule.status || entry.status === rule.status) &&
    (rule.favorite === undefined || entry.favorite === rule.favorite) &&
    (rule.maxEpisodes === undefined ||
      (a?.episodes != null && a.episodes <= rule.maxEpisodes)) &&
    (!rule.genre || !!a?.genres.includes(rule.genre)) &&
    (rule.minScore === undefined ||
      (entry.score !== null && entry.score >= rule.minScore))
  );
}
export function safeReturn(value: string | null) {
  return value?.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\") &&
    !/[\u0000-\u001f]/.test(value)
    ? value
    : "/app";
}
export function parseImport(text: string) {
  if (new TextEncoder().encode(text).length > 2_000_000)
    throw Error("Maximum file size is 2 MB");
  return z
    .object({ version: z.literal(1), entries: z.array(entrySchema).max(2000) })
    .parse(JSON.parse(text));
}
export const presets: Record<string, string> = {
  Prism: "#72b9ff",
  Ink: "#344b44",
  Porcelain: "#71614b",
  Sakura: "#984b62",
  Matcha: "#4f633a",
  Ocean: "#316579",
  Ember: "#a74729",
  Lavender: "#70538c",
  Slate: "#526372",
};
export const themeSchema = z.object({
  preset: z.enum([
    "Iris",
    "Prism",
    "Ink",
    "Porcelain",
    "Sakura",
    "Matcha",
    "Ocean",
    "Ember",
    "Lavender",
    "Slate",
  ]),
  mode: z.enum(["light", "dark", "system"]),
  intensity: z.number().min(0).max(30),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});
export function themeTokens(accent: string, intensity: number) {
  const parsed = z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .parse(accent);
  return { accent: parsed, intensity: Math.min(30, Math.max(0, intensity)) };
}
export { trustedImage, trustedSource } from "./asset-urls";
