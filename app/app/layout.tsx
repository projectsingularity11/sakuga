import Link from "next/link";
import { WorkspaceShell } from "@/components/workspace-shell";
import { ThemeApply } from "@/components/preferences";
import { ArrowUpRight } from "lucide-react";
import {
  WorkspaceNavigation,
  WorkspaceHeader,
} from "@/components/workspace-navigation";
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

        <WorkspaceNavigation />
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
        <WorkspaceHeader
          language={profile?.preferences?.language || "english"}
        />
        <main id="main" className="workspace-main">
          {children}
        </main>
      </div>
    </WorkspaceShell>
  );
}
