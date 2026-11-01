import { z } from "zod";
const media = z.object({
  id: z.number().int(),
  idMal: z.number().int().nullable(),
  title: z.object({
    english: z.string().nullable(),
    romaji: z.string(),
    native: z.string().nullable(),
  }),
  synonyms: z.array(z.string()),
  description: z.string().nullable(),
  format: z.string().nullable(),
  seasonYear: z.number().nullable(),
  season: z.string().nullable(),
  status: z.string().nullable(),
  episodes: z.number().nullable(),
  duration: z.number().nullable(),
  genres: z.array(z.string()),
  isAdult: z.boolean(),
  popularity: z.number().nullable(),
  averageScore: z.number().nullable(),
  coverImage: z.object({ large: z.string().nullable() }),
  studios: z.object({ nodes: z.array(z.object({ name: z.string() })) }),
});
export type Media = z.infer<typeof media>;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
export async function providerFetch(
  url: string,
  init: RequestInit = {},
  attempts = 5,
): Promise<Response> {
  for (let i = 0; i < attempts; i++) {
    const r = await fetch(url, { ...init, signal: AbortSignal.timeout(30000) });
    if (r.ok) return r;
    if (![429, 500, 502, 503, 504].includes(r.status))
      throw Error(`Provider request rejected (${r.status})`);
    if (i === attempts - 1)
      throw Error(`Provider retry limit reached (${r.status})`);
    const retry = r.headers.get("retry-after");
    const seconds = retry ? Number(retry) : NaN;
    await wait(
      Number.isFinite(seconds)
        ? Math.max(0, seconds) * 1000
        : 1000 * 2 ** i + Math.random() * 500,
    );
  }
  throw Error("Provider unavailable");
}
export async function anilistPage(page: number) {
  const query = `query($page:Int!){Page(page:$page,perPage:50){pageInfo{hasNextPage}media(type:ANIME,sort:[POPULARITY_DESC,ID]){id idMal title{english romaji native} synonyms description(asHtml:false) format seasonYear season status episodes duration genres isAdult popularity averageScore coverImage{large} studios(isMain:true){nodes{name}}}}}`;
  const r = await providerFetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { page } }),
  });
  const body = z
    .object({
      data: z.object({
        Page: z.object({
          pageInfo: z.object({ hasNextPage: z.boolean() }),
          media: z.array(media),
        }),
      }),
    })
    .parse(await r.json());
  return body.data.Page;
}
export async function malRating(id: number) {
  if (!process.env.MAL_CLIENT_ID) return null;
  const r = await providerFetch(
    `https://api.myanimelist.net/v2/anime/${id}?fields=mean,num_scoring_users,rating`,
    { headers: { "X-MAL-CLIENT-ID": process.env.MAL_CLIENT_ID } },
  );
  return z
    .object({
      id: z.number(),
      mean: z.number().nullable().optional(),
      num_scoring_users: z.number().nullable().optional(),
      rating: z.string().optional(),
    })
    .parse(await r.json());
}
export function plainSynopsis(value: string | null) {
  return (
    value
      ?.replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .trim() || null
  );
}
