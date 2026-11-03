import Link from "next/link";
/** The offset frame corner is shared with active routes and editorial headings. */
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Sakuga home">
      <span className="brand-word">
        saku<span>ga</span>
      </span>
      <span className="brand-initial" aria-hidden="true">
        s
      </span>
      <span className="brand-corner" aria-hidden="true" />
    </Link>
  );
}
