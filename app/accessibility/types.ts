export const FONT_SIZE_STORAGE_KEY = "same-studio-font-size";

export const FONT_SIZE_OPTIONS = ["small", "medium", "large"] as const;

export type FontSize = (typeof FONT_SIZE_OPTIONS)[number];

export function isFontSize(value: unknown): value is FontSize {
  return (
    typeof value === "string" &&
    FONT_SIZE_OPTIONS.includes(value as FontSize)
  );
}
