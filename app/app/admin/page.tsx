import { notFound } from "next/navigation";
import { account } from "@/app/actions";
import { admin } from "@/lib/admin";
export default async function Page() {
  const { user } = await account();
  if (!(process.env.ADMIN_USER_IDS || "").split(",").includes(user.id))
    notFound();
  const client = admin();
  const [
    { data: jobs },
    { count: published },
    { count: quarantined },
    { data: reports },
  ] = await Promise.all([
    client.from("ingestion_jobs").select("*"),
    client
      .from("anime")
      .select("id", { count: "exact", head: true })
      .eq("moderation", "published"),
    client
      .from("anime")
      .select("id", { count: "exact", head: true })
      .eq("moderation", "quarantine"),
    client
      .from("content_reports")
      .select("id,anime_id,reason,created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);
  return (
    <>
      <h1>Catalog operations</h1>
      <p>
        {published || 0} published · {quarantined || 0} awaiting review
      </p>
      <h2>Ingestion checkpoints</h2>
      <pre>{JSON.stringify(jobs, null, 2)}</pre>
      <h2>Content reports</h2>
      {reports?.map((r) => (
        <article className="report" key={r.id}>
          <h3>Title {r.anime_id}</h3>
          <p>{r.reason}</p>
          <small>{r.created_at}</small>
        </article>
      ))}
      <p>
        Use the documented operator CLI for audited moderation and mapping
        corrections. Admin access comes only from the server environment
        allowlist.
      </p>
    </>
  );
}
