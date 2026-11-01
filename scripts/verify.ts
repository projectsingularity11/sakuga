import { operator } from "./client";
const { data, error } = await operator().rpc("catalog_health");
if (error)
  throw Error(
    "Catalog health query failed. Apply migrations and verify server credentials.",
  );
console.log(JSON.stringify(data, null, 2));
if (data.published_eligible_distinct < 10000) {
  console.error(
    "LAUNCH BLOCKED: fewer than 10,000 eligible distinct published anime.",
  );
  process.exitCode = 1;
}
