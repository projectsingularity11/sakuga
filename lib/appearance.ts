export const IRIS_ACCENT = "#b6a1ff";
export function polishTheme<T extends { accent: string; preset: string }>(
  theme: T,
): T {
  return ["#fa9877", "#ef8762"].includes(theme.accent.toLowerCase())
    ? { ...theme, preset: "Iris", accent: IRIS_ACCENT }
    : theme;
}
