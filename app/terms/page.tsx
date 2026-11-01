import { Brand } from "@/components/brand";
export default function Page() {
  return (
    <main id="main" className="legal">
      <Brand />
      <h1>A home for your collection.</h1>
      <p>
        Sakuga is provided as an anime organization service. Do not abuse the
        service or upload unlawful content. Artwork and source metadata remain
        subject to their owners’ rights. Sakuga Supporter costs $5 USD once and
        removes Sakuga-served advertising while the service operates. It is not
        a subscription or guarantee of perpetual availability. Refunds and
        disputes revoke the entitlement; payment-provider processing times
        apply. Ads are not currently shown. Before accepting live payments the
        operator must publish its legal identity, contact, jurisdiction, refund
        procedure and applicable consumer cancellation rights. These draft terms
        require owner and legal review before public launch.
      </p>
      <p className="notice">
        Pre-launch policy · Owner review and business details required before a
        public launch.
      </p>
    </main>
  );
}
