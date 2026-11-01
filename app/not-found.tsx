import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="empty-state">
      <h1>This story isn’t here.</h1>
      <p>The page may have moved, or the title is no longer available.</p>
      <Link href="/" className="button">
        Back home
      </Link>
    </main>
  );
}
