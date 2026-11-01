import { Brand } from "@/components/brand";
export default function Page() {
  return (
    <main id="main" className="legal">
      <Brand />
      <h1>Your stories are personal.</h1>
      <p>
        Library entries, notes, collections, viewing history and preferences are
        private by default. Supabase handles authentication and stores account
        data. Stripe processes payments; Sakuga does not store card details. No
        advertising SDK is currently loaded. You can export your library and
        delete your account in Settings. Transaction records may be retained for
        reconciliation and legal obligations; Stripe has its own retention
        policy. Provider requests during ingestion are server-side, rather than
        triggered by each user page view. Before public launch the operator must
        supply a privacy contact, retention schedule, data-controller identity,
        regional rights process and consent policy.
      </p>
      <p className="notice">
        Pre-launch policy · Owner review and business details required before a
        public launch.
      </p>
    </main>
  );
}
