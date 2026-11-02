import { purchasesConfigured } from "@/lib/billing";
import { account } from "@/app/actions";
export default async function Page() {
  const { client, user } = await account();
  const { data, error } = await client
    .from("entitlements")
    .select("ad_free,updated_at")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error)
    throw Error("Purchase status could not be verified. Please retry.");
  return (
    <>
      <h1>A quieter forever.</h1>
      <section className="billing-panel">
        <span className="wordmark-small">SAKUGA SUPPORTER</span>
        <h2>
          {data?.ad_free
            ? "Thank you for keeping us going."
            : "No ads. No subscription."}
        </h2>
        <p className="price">
          $5 <small>USD, once</small>
        </p>
        <p>
          Ads aren’t currently shown. Your purchase supports Sakuga and removes
          Sakuga-served advertising from your account for the lifetime of the
          operating service.
        </p>
        {data?.ad_free ? (
          <div className="notice">
            Your account is ad-free. Purchase verified server-side.
          </div>
        ) : purchasesConfigured() ? (
          <form method="post" action="/api/checkout">
            <button className="button">Become a supporter ↗</button>
          </form>
        ) : (
          <div className="notice">
            Purchases are not available yet. Payment setup is pending.
          </div>
        )}
        <p className="muted">
          Entitlements appear only after payment confirmation. Returning from
          checkout does not grant access.
        </p>
      </section>
    </>
  );
}
