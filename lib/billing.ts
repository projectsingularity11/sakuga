import "server-only";
import Stripe from "stripe";
export function stripeSecret() {
  return process.env.STRIPE_SECRET_KEY || process.env.Sakuga_STRIPE_SECRET_KEY;
}
export function purchasesConfigured() {
  return !!(
    stripeSecret() &&
    process.env.STRIPE_WEBHOOK_SECRET &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
export function stripe() {
  if (!stripeSecret()) throw Error("Stripe is not configured");
  return new Stripe(stripeSecret()!);
}
export function adsEligible(entitled: boolean, consent: boolean) {
  return process.env.ADS_ENABLED === "true" && !entitled && consent;
}
