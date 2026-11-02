import Link from "next/link";
import { ArrowUpRight, Compass, Search } from "lucide-react";
import { Brand } from "./brand";
export function PublicNav() {
  return (
    <header className="public-nav">
      <Brand />
      <nav aria-label="Main">
        <Link href="/discover">
          <Compass size={15} />
          Discover
        </Link>
        <Link href="/discover?format=TV">Series</Link>
        <Link href="/discover?format=MOVIE">Films</Link>
        <Link href="/pricing">Support Sakuga</Link>
      </nav>
      <div>
        <Link className="nav-search" href="/discover" aria-label="Search anime">
          <Search size={19} />
        </Link>
        <Link className="text-link" href="/login">
          Log in
        </Link>
        <Link className="button small" href="/signup">
          Create account
          <ArrowUpRight size={15} />
        </Link>
      </div>
    </header>
  );
}
