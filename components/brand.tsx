import Link from "next/link";
/** Two animation cels form an open eye around a forward-moving aperture. */
export function SakugaMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="46"
      height="40"
      viewBox="0 0 64 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        className="mark-upper"
        d="M5 27C16 9 38 5 57 20"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        className="mark-lower"
        d="M59 21C47 39 25 43 7 28"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path d="M26 13C19 18 19 30 27 35L33 28L26 13Z" fill="currentColor" />
      <path
        className="mark-aperture"
        d="M31 13L44 24L32 35L37 24L31 13Z"
        fill="currentColor"
      />
    </svg>
  );
}
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Sakuga home">
      <SakugaMark className="brand-mark" />
      <span>sakuga</span>
    </Link>
  );
}
