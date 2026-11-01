import Link from "next/link";
import { account, deleteAccount, logout } from "@/app/actions";
import { Preferences, Importer } from "@/components/preferences";
export default async function Page() {
  const { client, user } = await account();
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error) throw Error("Settings could not be loaded");
  return (
    <>
      <h1>A space that feels like you.</h1>
      <p>Fine-tune the atmosphere. Keep your stories yours.</p>
      <Preferences name={data.display_name} preferences={data.preferences} />
      <section className="editor">
        <h2>Your data, yours to take.</h2>
        <p>
          Export library progress, scores, tags, dates and private notes.
          Collection definitions and viewing history are not included in this
          export.
        </p>
        <div className="actions">
          <a className="button outline" href="/api/export">
            Download JSON
          </a>
          <a className="button outline" href="/api/export?format=csv">
            Download CSV
          </a>
        </div>
      </section>
      <Importer />
      <section className="editor">
        <h2>Account</h2>
        <form action={logout}>
          <button className="text-link">Log out</button>
        </form>
        <p>{user.email}</p>
        <Link href="/forgot-password" className="text-link">
          Send a password reset email
        </Link>
        <details className="report">
          <summary className="danger">Delete my account</summary>
          <p>
            This permanently deletes your profile, library, collections and
            viewing history. Payment transaction records may be retained without
            your account ID for reconciliation; Stripe retains records under its
            own policy.
          </p>
          <form action={deleteAccount} className="stack">
            <label>
              Type DELETE to confirm
              <input
                name="confirm"
                required
                pattern="DELETE"
                autoComplete="off"
              />
            </label>
            <button className="danger">Permanently delete account</button>
          </form>
        </details>
      </section>
    </>
  );
}
