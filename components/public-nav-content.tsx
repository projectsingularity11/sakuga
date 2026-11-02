"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "./brand";
import { SearchBox } from "./search-box";
export function PublicNavContent({ language }: { language: string }) {
  const path = usePathname();
  return (
    <header className="public-nav">
      <Brand />
      <nav aria-label="Main">
        <Link
          href="/discover"
          aria-current={path === "/discover" ? "page" : undefined}
        >
          Discover
        </Link>
        <Link
          href="/app/library"
          aria-current={path.startsWith("/app/library") ? "page" : undefined}
        >
          My list
        </Link>
      </nav>
      <SearchBox language={language} />
      <Link className="nav-login" href="/login">
        Log in
      </Link>
    </header>
  );
}
