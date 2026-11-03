export const SAKURA_ACCENT = "#FF8FB8";
export function polishTheme<T extends { accent: string; preset: string }>(
  theme: T,
): T {
  if (theme.preset === "Custom") return theme;
  return ["Iris", "Prism", "Midnight"].includes(theme.preset) ||
    ["#fa9877", "#ef8762", "#b6a1ff", "#72b9ff"].includes(
      theme.accent.toLowerCase(),
    )
    ? { ...theme, preset: "Midnight", accent: SAKURA_ACCENT }
    : theme;
}

/** Pick readable control text for arbitrary saved accents, including old dark presets. */
export function accentForeground(hex: string) {
  const rgb = hex
    .replace("#", "")
    .match(/.{2}/g)!
    .map((c) => {
      const value = parseInt(c, 16) / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    });
  const luminance = rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  return luminance > 0.179 ? "#000000" : "#FFFFFF";
}
export function customAccentTokens(accent: string) {
  const foreground = accentForeground(accent);
  return {
    "--accent": accent,
    "--accent-on": foreground,
    "--accent-hover": `color-mix(in srgb, ${accent} 88%, ${foreground === "#000000" ? "white" : "black"})`,
  };
}
