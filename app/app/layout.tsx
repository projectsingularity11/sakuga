import Link from "next/link";
import { WorkspaceShell } from "@/components/workspace-shell";
import { ThemeApply } from "@/components/preferences";
import {
  Home,
  Compass,
  Library,
  Layers,
  ChartNoAxesCombined,
  Settings,
  ArrowUpRight,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { account, logout } from "@/app/actions";
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { client, user } = await account();
  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return (
    <WorkspaceShell>
      <ThemeApply theme={profile?.preferences?.theme} />
      <aside className="sidebar" id="workspace-sidebar">
        <Brand />

        <nav aria-label="Workspace">
          {[
            [Home, "/app", "Home"],
            [Compass, "/app/discover", "Discover"],
            [Library, "/app/library", "My library"],
            [Layers, "/app/collections", "Collections"],
            [ChartNoAxesCombined, "/app/statistics", "Statistics"],
            [Settings, "/app/settings", "Settings"],
          ].map(([Icon, href, label]) => {
            const I = Icon as typeof Home;
            return (
              <Link key={String(href)} href={String(href)}>
                <I size={19} />
                <span>{String(label)}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/app/billing">
            Sakuga Supporter <ArrowUpRight size={16} />
          </Link>
          <span>{profile?.display_name || "Your workspace"}</span>
          <form action={logout}>
            <button className="text-link">Log out</button>
          </form>
        </div>
      </aside>
      <div className="workspace">
        <header className="workspace-header">
          <Link href="/">
            Sakuga <ArrowUpRight size={15} />
          </Link>
          <Link href="/app/discover">
            Discover anime <ArrowUpRight size={15} />
          </Link>
        </header>
        <main id="main" className="workspace-main">
          {children}
        </main>
      </div>
    </WorkspaceShell>
  );
}
