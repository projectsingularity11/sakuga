"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Library,
  Layers,
  ChartNoAxesCombined,
  Settings,
  ArrowUpRight,
} from "lucide-react";
import { SearchBox } from "./search-box";
const items = [
  { icon: Home, href: "/app", label: "Home" },
  { icon: Compass, href: "/app/discover", label: "Discover" },
  { icon: Library, href: "/app/library", label: "My library" },
  { icon: Layers, href: "/app/collections", label: "Collections" },
  { icon: ChartNoAxesCombined, href: "/app/statistics", label: "Statistics" },
  { icon: Settings, href: "/app/settings", label: "Settings" },
];
export function WorkspaceNavigation() {
  const path = usePathname();
  return (
    <nav aria-label="Workspace">
      {items.map(({ icon: Icon, href, label }) => (
        <Link
          key={href}
          href={href}
          title={label}
          aria-current={
            (href === "/app" ? path === href : path.startsWith(href))
              ? "page"
              : undefined
          }
        >
          <Icon size={19} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
export function WorkspaceHeader({ language }: { language: string }) {
  const path = usePathname(),
    label =
      items.find((i) => i.href !== "/app" && path.startsWith(i.href))?.label ||
      (path.includes("/anime/") ? "Anime details" : "Home");
  return (
    <header className="workspace-header">
      <div className="workspace-location">
        <Link href="/" aria-label="Sakuga homepage">
          sakuga
        </Link>
        <span aria-hidden="true">/</span>
        <span>{label}</span>
      </div>
      <SearchBox language={language} />
      <Link className="workspace-browse" href="/discover">
        Browse <ArrowUpRight size={15} />
      </Link>
    </header>
  );
}
