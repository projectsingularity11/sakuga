export const PRISM_ACCENT = "#72b9ff";
export function polishTheme<T extends { accent: string; preset: string }>(
  theme: T,
): T {
  return ["Iris", "Prism"].includes(theme.preset) ||
    ["#fa9877", "#ef8762", "#b6a1ff"].includes(theme.accent.toLowerCase())
    ? { ...theme, preset: "Prism", accent: PRISM_ACCENT }
    : theme;
}
