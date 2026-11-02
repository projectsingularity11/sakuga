import { account, resetPassword } from "@/app/actions";
export default async function Page() {
  await account();
  return (
    <>
      <h1>New password</h1>
      <form action={resetPassword} className="stack">
        <label>
          New password
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={10}
            maxLength={128}
            required
          />
        </label>
        <button className="button">Save new password</button>
      </form>
    </>
  );
}
