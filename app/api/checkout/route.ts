import { account } from "@/app/actions";
import { stripe, purchasesConfigured } from "@/lib/billing";
export async function POST(request: Request) {
  const { client, user } = await account();
  const origin = process.env.NEXT_PUBLIC_SITE_URL;
  if (
    !origin ||
    new URL(request.url).origin !== new URL(origin).origin ||
    request.headers.get("origin") !== new URL(origin).origin
  )
    return Response.json({ error: "Invalid request origin" }, { status: 403 });
  if (!purchasesConfigured())
    return Response.json(
      { error: "Purchases are not available yet." },
      { status: 503 },
    );
  const { data, error } = await client
    .from("entitlements")
    .select("ad_free")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error)
    return Response.json(
      { error: "Could not verify purchase status" },
      { status: 503 },
    );
  if (data?.ad_free) return Response.redirect(`${origin}/app/billing`, 303);
  const session = await stripe().checkout.sessions.create(
    {
      mode: "payment",
      client_reference_id: user.id,
      metadata: { user_id: user.id, product: "sakuga_supporter_v1" },
      customer_creation: "always",
      payment_intent_data: { metadata: { user_id: user.id } },
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: 500,
            product_data: { name: "Sakuga Supporter — No Ads Forever" },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/app/billing?payment=pending`,
      cancel_url: `${origin}/app/billing`,
    },
    { idempotencyKey: `sakuga:${user.id}:${Math.floor(Date.now() / 3600000)}` },
  );
  if (!session.url)
    return Response.json({ error: "Checkout unavailable" }, { status: 503 });
  return Response.redirect(session.url, 303);
}
