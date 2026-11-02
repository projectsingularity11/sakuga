import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { configured } from "@/lib/supabase";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; next?: string }>;
}) {
  const p = await searchParams;
  const enabled = configured();
  return (
    <>
      <h1>Create account</h1>

      {!enabled && (
        <div className="notice" role="status">
          Accounts are not available yet. The operator must connect Supabase
          before you can sign in.
        </div>
      )}
      {p.notice && (
        <p role="status" className="notice">
          {p.notice === "email"
            ? "Check your inbox for the next step."
            : p.notice === "failed"
              ? "We couldn’t complete that request. Check your details or try a new link."
              : p.notice === "deleted"
                ? "Your account has been deleted."
                : "Account setup is pending."}
        </p>
      )}
      <AuthForm mode="signup" next={p.next} enabled={enabled} />
      <p className="auth-links">
        <Link href="/login">Log in</Link> ·{" "}
        <Link href="/signup">Create account</Link> ·{" "}
        <Link href="/forgot-password">Forgot password?</Link>
      </p>
      <small>
        By creating an account you agree to our <Link href="/terms">terms</Link>{" "}
        and <Link href="/privacy">privacy policy</Link>.
      </small>
    </>
  );
}
