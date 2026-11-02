import Link from "next/link";
import { account, createCollection } from "@/app/actions";
export default async function Page() {
  const { client, user } = await account();
  const { data, error } = await client
    .from("collections")
    .select("*")
    .eq("user_id", user.id)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw Error("Collections could not be loaded");
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Collections</h1>
        </div>
      </div>
      <div className="collection-list">
        {data?.map((c) => (
          <Link href={`/app/collections/${c.id}`} key={c.id}>
            <span>{c.rules ? "Smart collection" : "Private collection"}</span>
            <h2>{c.name}</h2>
            <p>{c.description}</p>
            <span>Open collection ↗</span>
          </Link>
        ))}
      </div>
      <section className="editor">
        <h2>New collection</h2>
        <form className="stack" action={createCollection}>
          <label>
            Name
            <input
              name="name"
              required
              maxLength={100}
              placeholder="Collection name"
            />
          </label>
          <label>
            Automatically include
            <select name="rules" defaultValue="">
              <option value="">Manual collection</option>
              <option value={'{"status":"planned","maxEpisodes":13}'}>
                Short series on my watchlist
              </option>
              <option value={'{"status":"completed","favorite":true}'}>
                Completed favorites
              </option>
              <option value={'{"status":"watching"}'}>
                Currently watching
              </option>
              <option value={'{"minScore":8}'}>My highest rated (8+)</option>
            </select>
          </label>
          <button className="button">Create collection</button>
        </form>
      </section>
    </>
  );
}
