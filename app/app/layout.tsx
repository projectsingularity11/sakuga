import Link from "next/link";
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
    <div className="app-shell">
      <ThemeApply theme={profile?.preferences?.theme} />
      <aside className="sidebar">
        <Brand />
        <span className="sidebar-label">YOUR LITTLE CORNER</span>
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
                {String(label)}
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
          <span>A space for your stories.</span>
          <Link href="/app/discover">
            Find your next favorite <ArrowUpRight size={15} />
          </Link>
        </header>
        <main id="main" className="workspace-main">
          {children}
        </main>
      </div>
    </div>
  );
}
