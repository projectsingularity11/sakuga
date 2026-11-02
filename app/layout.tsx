import type { Metadata } from "next";
import "@fontsource/syne/400.css";
import "@fontsource/syne/500.css";
import "@fontsource/syne/700.css";
import "@fontsource/syne/800.css";
import "@fontsource/unbounded/500.css";
import "@fontsource/unbounded/600.css";
import "@fontsource/space-mono/400.css";
import "./globals.css";
import "./identity.css";
import { Experience } from "@/components/experience";
import { viewer } from "@/lib/viewer";
import { polishTheme } from "@/lib/appearance";
import { themeSchema } from "@/lib/domain";
export const metadata: Metadata = {
  title: {
    default: "Sakuga — Anime discovery & library",
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
  const profile = await viewer();
  const parsed = themeSchema.safeParse(profile?.preferences?.theme);
  const theme = parsed.success ? polishTheme(parsed.data) : undefined;
  const style = theme
    ? {
        "--accent": theme.preset === "Prism" ? undefined : theme.accent,
        "--ambient": `${theme.intensity}%`,
      }
    : undefined;
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      data-appearance={
        theme?.mode === "dark"
          ? "dark"
          : theme?.mode === "system"
            ? "system"
            : theme?.mode === "light"
              ? "light"
              : "dark"
      }
      style={style as React.CSSProperties}
    >
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Experience />
        {children}
      </body>
    </html>
  );
}
