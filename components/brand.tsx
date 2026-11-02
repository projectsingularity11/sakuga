import Link from "next/link";
export function SketchMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="48"
      height="44"
      viewBox="0 0 64 58"
      fill="none"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 30C17 9 42 8 57 27C42 48 19 47 6 30Z" strokeWidth="2.2" />
        <path
          d="M4 32C18 12 42 6 59 25M9 34C22 46 44 45 55 31"
          strokeWidth=".8"
        />
        <path
          d="M36 16C24 13 20 26 26 34C32 42 43 34 43 26C43 20 37 15 32 17"
          strokeWidth="1.6"
        />
        <path d="m31 21 9 7-12 7 3-14Z" fill="currentColor" strokeWidth=".8" />
        <path
          d="m9 14-4-6m14 4-2-7m34 8 5-7M10 43l-5 6m12-3-2 8m36-12 6 5M3 25l8-1m43 13 7 1"
          strokeWidth="1.2"
        />
        <path d="m16 19 3-2m-3 18 3 2m29-18 3 3" strokeWidth=".7" />
      </g>
    </svg>
  );
}
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Sakuga home">
      <SketchMark />
      <span>
        sakuga<span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
