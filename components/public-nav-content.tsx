"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ArrowUpRight, UserRound } from "lucide-react";
import { Brand } from "./brand";
import { SearchBox } from "./search-box";
export function PublicNavContent({
  language,
  signedIn,
}: {
  language: string;
  signedIn: boolean;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="public-nav">
      <Brand />
      <nav
        aria-label="Main"
        className={open ? "nav-links is-open" : "nav-links"}
        id="public-menu"
      >
        <Link
          href="/discover"
          aria-current={path === "/discover" ? "page" : undefined}
          onClick={() => setOpen(false)}
        >
          Discover <ArrowUpRight size={14} />
        </Link>
        <Link
          href="/app/library"
          aria-current={path.startsWith("/app/library") ? "page" : undefined}
          onClick={() => setOpen(false)}
        >
          My list <ArrowUpRight size={14} />
        </Link>
      </nav>
      <SearchBox language={language} />
      <Link className="nav-login" href={signedIn ? "/app" : "/login"}>
        <UserRound size={16} />
        <span>{signedIn ? "My account" : "Log in"}</span>
      </Link>
      <button
        type="button"
        className="nav-menu-toggle icon-control"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="public-menu"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={19} /> : <Menu size={19} />}
      </button>
    </header>
  );
}
