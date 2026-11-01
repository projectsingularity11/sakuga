import Link from "next/link";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Sakuga home">
      <svg
        width="28"
        height="30"
        viewBox="0 0 28 30"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3 4h22L8 15l17 11H3l17-11L3 4Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      sakuga<span className="brand-dot">.</span>
    </Link>
  );
}
