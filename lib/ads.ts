import "server-only";
import { adsEligible } from "./billing";
export type AdPlacement = "discover-footer" | "library-footer";
// No provider is configured, so no slot, network request or third-party script exists.
// A future adapter MUST be called only after this server gate and consent validation.
export function adPlacement(
  _placement: AdPlacement,
  context: { entitled: boolean; consent: boolean },
) {
  if (!adsEligible(context.entitled, context.consent)) return null;
  return null;
}
