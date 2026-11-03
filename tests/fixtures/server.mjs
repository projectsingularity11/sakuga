// Test-only Supabase protocol fixture. Never used by the deployed application.
import http from "node:http";
import { spawn } from "node:child_process";
const user = {
  id: "00000000-0000-4000-8000-000000000001",
  aud: "authenticated",
  role: "authenticated",
  email: "fixture@example.test",
  app_metadata: { provider: "email" },
  user_metadata: {},
  created_at: "2026-01-01T00:00:00Z",
};
const token = () =>
  [
    Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
      "base64url",
    ),
    Buffer.from(
      JSON.stringify({
        sub: user.id,
        aud: "authenticated",
        role: "authenticated",
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      }),
    ).toString("base64url"),
    "fixture-signature",
  ].join(".");
const titles = [
  {
    id: 16498,
    title: "Shingeki no Kyojin",
    title_english: "Attack on Titan",
    title_romaji: "Shingeki no Kyojin",
    title_native: "進撃の巨人",
    synonyms: ["Attack on Titan"],
    genres: ["Action"],
    year: 2013,
    format: "TV",
    airing_status: "FINISHED",
    synopsis: "Fixture synopsis for UI testing.",
    series_id: 16498,
    series_count: 2,
  },
  {
    id: 154587,
    title: "Sousou no Frieren",
    title_english: "Frieren: Beyond Journey’s End",
    title_romaji: "Sousou no Frieren",
    title_native: "葬送のフリーレン",
    synonyms: ["Frieren"],
    genres: ["Fantasy"],
    year: 2023,
    format: "TV",
    airing_status: "FINISHED",
    synopsis: "Fixture synopsis for UI testing.",
    series_count: 1,
  },
  ...[
    [1, "Cowboy Bebop", 1998],
    [127230, "Chainsaw Man", 2022],
    [171018, "DAN DA DAN", 2024],
    [101922, "Demon Slayer: Kimetsu no Yaiba", 2019],
    [113415, "JUJUTSU KAISEN", 2020],
  ].map(([id, title, year]) => ({
    id,
    title,
    title_english: title,
    title_romaji: title,
    title_native: null,
    synonyms: [],
    genres: ["Action"],
    year,
    format: "TV",
    airing_status: "FINISHED",
    synopsis: "Fixture synopsis for UI testing.",
    series_count: 1,
  })),
  {
    id: 20958,
    title: "Shingeki no Kyojin 2",
    title_english: "Attack on Titan Season 2",
    title_romaji: "Shingeki no Kyojin 2",
    synonyms: [],
    genres: ["Action"],
    year: 2017,
    format: "TV",
    airing_status: "FINISHED",
    synopsis: "Second season fixture synopsis.",
    series_id: 16498,
    series_count: 2,
  },
].map((a) => ({
  ...a,
  cover_url: [16498, 20958].includes(a.id) ? null : `/art/${a.id}.jpg`,
  banner_url: null,
  studios: [],
  ratings: [],
  source_mappings: [],
  episodes: 12,
  duration: 24,
  mature: false,
  updated_at: "2026-11-02",
}));
const libraryUpdates = new Map();
let savedPreferences = null,
  savedName = "Fixture viewer";
const server = http.createServer(async (req, res) => {
  let text = "";
  for await (const chunk of req) text += chunk;
  res.setHeader("Content-Type", "application/json");
  const url = new URL(req.url, "http://fixture");
  const auth = req.headers.authorization?.startsWith("Bearer ey");
  if (
    url.pathname === "/auth/v1/token" &&
    JSON.parse(text || "{}").refresh_token === "fixture-refresh"
  )
    return res.end(
      JSON.stringify({
        access_token: token(),
        refresh_token: "fixture-refresh",
        token_type: "bearer",
        expires_in: 3600,
        user,
      }),
    );
  if (url.pathname === "/auth/v1/user" && auth)
    return res.end(JSON.stringify(user));
  if (req.url.includes("/rpc/library_show_page") && auth) {
    const entries = titles
      .filter((a) => a.series_id === 16498)
      .map((a) => ({
        user_id: user.id,
        anime_id: a.id,
        anime: a,
        progress: a.id === 16498 ? 3 : 7,
        status: "watching",
        score: null,
        favorite: false,
        priority: 0,
        notes: "",
        tags: [],
        rewatches: 0,
        started_on: null,
        completed_on: null,
        updated_at: "2026-11-02",
        created_at: "2026-11-02",
        ...libraryUpdates.get(a.id),
      }));
    return res.end(JSON.stringify({ count: 1, entries }));
  }
  if (url.pathname === "/rest/v1/rpc/personal_statistics" && auth) {
    return res.end(
      JSON.stringify({
        total: 2,
        episodes: 10,
        statuses: { watching: 2 },
        scores: {},
        genres: { Action: 2 },
        formats: { TV: 2 },
      }),
    );
  }
  if (req.url.includes("/rpc/search_anime")) {
    const input = JSON.parse(text || "{}"),
      q = (input.query || "").toLowerCase();
    const rows = titles.filter((a) =>
      [a.title, a.title_english, a.title_romaji, a.title_native, ...a.synonyms]
        .filter(Boolean)
        .some((t) => t.toLowerCase().includes(q)),
    );
    const grouped = [
      ...new Map(
        rows.map((a) => [
          a.series_id || a.id,
          {
            ...titles.find((t) => t.id === (a.series_id || a.id)),
            matched_id: a.id,
          },
        ]),
      ).values(),
    ];
    return res.end(JSON.stringify({ titles: grouped, count: grouped.length }));
  }
  if (url.pathname === "/rest/v1/anime") {
    if (
      url.searchParams.has("id") &&
      url.searchParams.get("id").startsWith("eq.")
    ) {
      const id = Number(url.searchParams.get("id").slice(3));
      return res.end(JSON.stringify(titles.find((a) => a.id === id) || null));
    }
    const series = url.searchParams.get("series_id");
    return res.end(
      JSON.stringify(
        series
          ? titles.filter((a) => a.series_id === Number(series.slice(3)))
          : titles,
      ),
    );
  }
  if (url.pathname === "/rest/v1/profiles" && auth) {
    if (req.method === "PATCH") {
      const value = JSON.parse(text);
      savedPreferences = value.preferences;
      savedName = value.display_name;
      return res.end("{}");
    }
    return res.end(
      JSON.stringify({
        id: user.id,
        display_name: savedName,
        preferences: savedPreferences || {
          language: "english",
          theme: {
            mode: "dark",
            accent: "#fa9877",
            intensity: 8,
            preset: "Ember",
          },
        },
      }),
    );
  }
  if (
    ["/rest/v1/library", "/rest/v1/collections"].includes(url.pathname) &&
    auth
  ) {
    if (url.pathname === "/rest/v1/collections") return res.end("[]");
    if (req.method === "POST") {
      const value = JSON.parse(text);
      libraryUpdates.set(value.anime_id, value);
      return res.end(JSON.stringify(value));
    }
    const entries = titles
      .filter((a) => a.series_id === 16498)
      .map((a) => ({
        user_id: user.id,
        anime_id: a.id,
        anime: a,
        progress: a.id === 16498 ? 3 : 7,
        status: "watching",
        score: null,
        favorite: false,
        priority: 0,
        notes: "",
        tags: [],
        rewatches: 0,
        started_on: null,
        completed_on: null,
        updated_at: "2026-11-02",
        created_at: "2026-11-02",
        ...libraryUpdates.get(a.id),
      }));
    const selected = url.searchParams.get("anime_id");
    if (selected?.startsWith("eq."))
      return res.end(
        JSON.stringify(
          entries.find((e) => e.anime_id === Number(selected.slice(3))) || null,
        ),
      );
    res.setHeader("content-range", `0-${entries.length - 1}/${entries.length}`);
    return res.end(JSON.stringify(entries));
  }
  res.statusCode = 401;
  res.end("{}");
});
server.listen(54322, "127.0.0.1", () => {
  const child = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "dev",
      "--hostname",
      "127.0.0.1",
      "--port",
      "3100",
    ],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54322",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "fixture-publishable",
        NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3100",
        AUTH_CALLBACK_ORIGIN: "http://127.0.0.1:3100",
      },
    },
  );
  process.on("SIGTERM", () => {
    child.kill();
    server.close();
  });
  child.on("exit", (code) => process.exit(code || 0));
});
