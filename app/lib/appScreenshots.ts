import type { Locale } from "../i18n/types";
import type { DetailDevice } from "./appDetailCapabilities";

export const SCREENSHOT_LOCALES = ["ko", "en", "ja", "zhg", "zhb"] as const;

export type ScreenshotLocale = (typeof SCREENSHOT_LOCALES)[number];

export const SCREENSHOT_LOCALE_MAP = {
  ko: "ko",
  en: "en",
  ja: "ja",
  "zh-CN": "zhg",
  "zh-TW": "zhb",
} as const satisfies Record<Locale, ScreenshotLocale>;

export type LocalizedScreenshotDevice = "phone" | "ipad";
export type SharedScreenshotDevice = "watch";
export type ScreenshotDevice =
  | LocalizedScreenshotDevice
  | SharedScreenshotDevice;

export const SCREENSHOT_DEVICE_MAP = {
  iphone: "phone",
  androidPhone: "phone",
  ipad: "ipad",
  appleWatch: "watch",
} as const satisfies Record<DetailDevice, ScreenshotDevice>;
