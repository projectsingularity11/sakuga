import { catalog } from "@/lib/catalog";
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") || "";
  if (!q.trim()) return Response.json({ titles: [], count: 0 });
  try {
    return Response.json(await catalog({ q }), {
      headers: { "Cache-Control": "public, max-age=60" },
    });
  } catch {
    return Response.json(
      { error: "Search is unavailable. Please try again." },
      { status: 503 },
    );
  }
}
