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
      </aside>
      <section className="auth-content">{children}</section>
    </main>
  );
}
