import { isLocale, type Locale } from "./types";

export function mapBrowserLanguage(language: string): Locale | null {
  const normalized = language.trim().replaceAll("_", "-").toLowerCase();

  if (normalized === "ko" || normalized.startsWith("ko-")) {
    return "ko";
  }

  if (normalized === "en" || normalized.startsWith("en-")) {
    return "en";
  }

  if (normalized === "ja" || normalized.startsWith("ja-")) {
    return "ja";
  }

  if (
    normalized === "zh-cn" ||
    normalized === "zh-sg" ||
    normalized.includes("hans")
  ) {
    return "zh-CN";
  }

  if (
    normalized === "zh-tw" ||
    normalized === "zh-hk" ||
    normalized === "zh-mo" ||
    normalized.includes("hant")
  ) {
    return "zh-TW";
  }

  return null;
}

export function resolveInitialLocale(
  storedLocale: string | null,
  browserLanguages: readonly string[],
): Locale {
  if (isLocale(storedLocale)) {
    return storedLocale;
  }

  for (const language of browserLanguages) {
    const locale = mapBrowserLanguage(language);
    if (locale) {
      return locale;
    }
  }

  return "ko";
}

