import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { safeReturn } from "@/lib/domain";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (code) {
    const client = await db();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(
        new URL(
          safeReturn(url.searchParams.get("next")),
          process.env.NEXT_PUBLIC_SITE_URL || url.origin,
        ),
      );
  }
  return NextResponse.redirect(new URL("/login?notice=failed", url.origin));
}
