import Link from "next/link";
import { Brand } from "@/components/brand";
export default function Page() {
  return (
    <main id="main" className="legal">
      <Brand />
      <h1>
        A small thank-you.
        <br />A quieter forever.
      </h1>
      <p>SAKUGA SUPPORTER</p>
      <h2>$5 USD. Once.</h2>
      <p>
        No subscription. Ads are not currently shown. Buying now supports Sakuga
        and keeps Sakuga-served advertising out of your account if ads are
        introduced, for the lifetime of the operating service.
      </p>
      <p>
        The free account includes the same library, collections, source ratings,
        and themes. This purchase is an account entitlement, not a promise that
        Sakuga will exist forever.
      </p>
      <Link className="button" href="/app/billing">
        Continue to your account ↗
      </Link>
      <p>
        <Link href="/terms">Purchase terms</Link>
      </p>
    </main>
  );
}
