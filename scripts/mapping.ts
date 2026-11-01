import { operator } from "./client";
import { z } from "zod";
const [id, provider, external, reason] = process.argv.slice(2);
const anime_id = z.coerce.number().int().positive().parse(id);
const source = z.enum(["mal", "anilist", "kitsu"]).parse(provider);
const external_id = z.string().regex(/^\d+$/).parse(external);
const actor = process.env.OPERATOR_ID;
if (!actor) throw Error("Set OPERATOR_ID for audit attribution");
z.string().min(10).parse(reason);
const client = operator();
const { error } = await client.rpc("correct_mapping", {
  target_anime: anime_id,
  source_provider: source,
  new_external: external_id,
  operator_id: actor,
  explanation: reason,
});
if (error)
  throw Error("Mapping correction failed; verify uniqueness and anime ID.");
console.log(
  "Manual mapping saved and stale rating removed. Refresh ingestion to fetch its verified score.",
);
