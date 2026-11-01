import { stripe } from "@/lib/billing";
import { admin } from "@/lib/admin";
import type Stripe from "stripe";
export async function POST(request: Request) {
  if (!process.env.STRIPE_WEBHOOK_SECRET)
    return Response.json({ error: "Not configured" }, { status: 503 });
  let event: Stripe.Event;
  const s = stripe();
  try {
    event = s.webhooks.constructEvent(
      await request.text(),
      request.headers.get("stripe-signature") || "",
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }
  const client = admin();
  try {
    let session: Stripe.Checkout.Session | undefined;
    let active = true;
    if (
      [
        "checkout.session.completed",
        "checkout.session.async_payment_succeeded",
      ].includes(event.type)
    ) {
      session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status !== "paid")
        return Response.json({ received: true });
    } else if (
      [
        "charge.refunded",
        "charge.dispute.created",
        "charge.dispute.closed",
      ].includes(event.type)
    ) {
      const obj = event.data.object as Stripe.Charge | Stripe.Dispute;
      const intent =
        typeof obj.payment_intent === "string"
          ? obj.payment_intent
          : obj.payment_intent?.id;
      if (!intent) return Response.json({ received: true });
      const result = await s.checkout.sessions.list({
        payment_intent: intent,
        limit: 1,
      });
      session = result.data[0];
      active =
        event.type === "charge.dispute.closed" &&
        (obj as Stripe.Dispute).status === "won";
    } else return Response.json({ received: true });
    if (
      !session ||
      session.amount_total !== 500 ||
      session.currency !== "usd" ||
      !session.metadata?.user_id ||
      session.mode !== "payment" ||
      session.metadata.product !== "sakuga_supporter_v1"
    )
      return Response.json({ error: "Unexpected payment" }, { status: 400 });
    const intent =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id; // Reconcile current provider state: late events must not regrant refunded purchases.
    if (intent) {
      const pi = await s.paymentIntents.retrieve(intent, {
        expand: ["latest_charge"],
      });
      const charge = pi.latest_charge as Stripe.Charge | null;
      if (
        charge &&
        (charge.refunded || charge.amount_refunded > 0 || charge.disputed)
      )
        active = false;
    }
    const { error } = await client.rpc("apply_payment", {
      event_id: event.id,
      session_id: session.id,
      account_id: session.metadata.user_id,
      customer_id:
        typeof session.customer === "string" ? session.customer : null,
      intent_id: intent || null,
      active,
    });
    if (error) throw Error("Persistence");
    return Response.json({ received: true });
  } catch {
    return Response.json(
      { error: "Payment processing failed; retry required" },
      { status: 500 },
    );
  }
}
