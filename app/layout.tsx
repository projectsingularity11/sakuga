import type { Metadata } from "next";
import "@fontsource/newsreader/400.css";
import "@fontsource/newsreader/400-italic.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import "./globals.css";
import { db, configured } from "@/lib/supabase";
import { themeSchema } from "@/lib/domain";
export const metadata: Metadata = {
  title: {
    default: "Sakuga — Keep the stories close",
    template: "%s · Sakuga",
  },
  description:
    "A quiet home for your anime. Discover, compare source ratings, and keep a library that feels like yours.",
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let theme;
  if (configured()) {
    const client = await db();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (user) {
      const { data } = await client
        .from("profiles")
        .select("preferences")
        .eq("id", user.id)
        .maybeSingle();
      const parsed = themeSchema.safeParse(data?.preferences?.theme);
      if (parsed.success) theme = parsed.data;
    }
  }
  const style = theme
    ? { "--accent": theme.accent, "--ambient": `${theme.intensity}%` }
    : undefined;
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-appearance={
        theme?.mode === "dark"
          ? "dark"
          : theme?.mode === "system"
            ? "system"
            : "dark"
      }
      style={style as React.CSSProperties}
    >
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
