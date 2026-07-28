import type { Locale } from "../i18n/types";

export const SCREENSHOT_LOCALES = ["ko", "en", "ja", "zhg", "zhb"] as const;

export type ScreenshotLocale = (typeof SCREENSHOT_LOCALES)[number];

export const SCREENSHOT_LOCALE_MAP = {
  ko: "ko",
  en: "en",
  ja: "ja",
  "zh-CN": "zhg",
  "zh-TW": "zhb",
} as const satisfies Record<Locale, ScreenshotLocale>;
