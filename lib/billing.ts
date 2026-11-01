import "server-only";
import Stripe from "stripe";
export function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw Error("Stripe is not configured");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}
export function adsEligible(entitled: boolean, consent: boolean) {
  return process.env.ADS_ENABLED === "true" && !entitled && consent;
}
