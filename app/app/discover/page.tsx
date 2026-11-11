import { redirect } from "next/navigation";
export default async function Discover({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const entries = Object.entries(params).filter(
    (entry): entry is [string, string] => entry[1] !== undefined,
  );
  redirect(
    entries.length
      ? `/app/search?${new URLSearchParams(entries)}`
      : "/discover",
  );
}
