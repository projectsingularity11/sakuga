import { operator } from "./client";
import { z } from "zod";
const [id, state, reason] = process.argv.slice(2);
const anime_id = z.coerce.number().int().positive().parse(id);
const decision = z.enum(["published", "quarantine", "excluded"]).parse(state);
z.string().min(10).parse(reason);
const client = operator();
const actor = process.env.OPERATOR_ID;
if (!actor) throw Error("Set non-secret OPERATOR_ID for audit attribution");
const { error } = await client
  .from("moderation_overrides")
  .upsert({
    anime_id,
    decision,
    reason,
    actor,
    updated_at: new Date().toISOString(),
  });
if (error) throw Error("Override failed");
const { error: update } = await client
  .from("anime")
  .update({
    moderation: decision,
    moderation_reason: reason,
    ...(decision !== "published" ? { cover_url: null, banner_url: null } : {}),
  })
  .eq("id", anime_id);
if (update) throw Error("Catalog update failed; rerun moderation command");
const { error: audit } = await client
  .from("admin_audit")
  .insert({
    actor,
    action: `moderation:${decision}`,
    entity: String(anime_id),
  });
if (audit) throw Error("Audit failed; operator follow-up required");
console.log(
  "Moderation saved. Refresh catalog data to restore permitted artwork after a publish decision.",
);
