import { Brand } from "@/components/brand";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main id="main" className="auth-layout">
      <aside>
        <Brand />
        <h1>
          A home for
          <br />
          the stories
          <br />
          <em>you love.</em>
        </h1>
        <p>Keep the stories close.</p>
      </aside>
      <section className="auth-content">{children}</section>
    </main>
  );
}
