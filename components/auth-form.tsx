"use client";
import { useFormStatus } from "react-dom";
import { authenticate } from "@/app/actions";
export function AuthForm({
  mode,
  next,
  enabled,
}: {
  mode: "login" | "signup" | "reset";
  next?: string;
  enabled: boolean;
}) {
  return (
    <form action={authenticate} className="stack">
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="next" value={next || "/app"} />
      <label>
        Email address
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
        />
      </label>
      {mode !== "reset" && (
        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
            required
            minLength={mode === "signup" ? 10 : 1}
            maxLength={128}
          />
        </label>
      )}
      <Submit
        enabled={enabled}
        text={
          mode === "login"
            ? "Welcome back"
            : mode === "signup"
              ? "Create your account"
              : "Send reset link"
        }
      />
    </form>
  );
}
function Submit({ enabled, text }: { enabled: boolean; text: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="button" disabled={!enabled || pending}>
      {pending ? "Please wait…" : text}
    </button>
  );
}
