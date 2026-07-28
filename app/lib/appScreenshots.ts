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

export type LocalizedScreenshotManifest = Partial<
  Record<ScreenshotLocale, string[]>
>;

export type AppScreenshotManifest = {
  screenshotId: string;
  phone?: LocalizedScreenshotManifest;
  ipad?: LocalizedScreenshotManifest;
  watch?: string[];
};

export type ScreenshotManifest = Record<string, AppScreenshotManifest>;

function numberedScreenshots(directory: string, count: number): string[] {
  return Array.from(
    { length: count },
    (_, index) => `/assets/screenshot/${directory}/${index + 1}.png`,
  );
}

function localizedScreenshots(
  appDirectory: string,
  deviceDirectory: string,
  count: number,
): Record<ScreenshotLocale, string[]> {
  return {
    ko: numberedScreenshots(`${appDirectory}/${deviceDirectory}/ko`, count),
    en: numberedScreenshots(`${appDirectory}/${deviceDirectory}/en`, count),
    ja: numberedScreenshots(`${appDirectory}/${deviceDirectory}/ja`, count),
    zhg: numberedScreenshots(`${appDirectory}/${deviceDirectory}/zhg`, count),
    zhb: numberedScreenshots(`${appDirectory}/${deviceDirectory}/zhb`, count),
  };
}

export const SCREENSHOT_MANIFEST = {
  mapary: {
    screenshotId: "mapary",
    phone: localizedScreenshots("mapary", "phone", 6),
    ipad: localizedScreenshots("mapary", "ipad", 5),
    watch: numberedScreenshots("mapary/watch", 3),
  },
  runtronome: {
    screenshotId: "runtronome",
    phone: localizedScreenshots("runtronome", "phone", 6),
    watch: numberedScreenshots("runtronome/watch", 2),
  },
  odow: {
    screenshotId: "odow",
    phone: localizedScreenshots("odow", "phone", 5),
    ipad: localizedScreenshots("odow", "ipad", 5),
  },
  locaunt: {
    screenshotId: "lacaunt",
    phone: localizedScreenshots("lacaunt", "phone", 6),
  },
  pepesnap: {
    screenshotId: "pepesnap",
    phone: localizedScreenshots("pepesnap", "phone", 6),
    ipad: localizedScreenshots("pepesnap", "pad", 5),
  },
  tocklist: {
    screenshotId: "tocklist",
    phone: localizedScreenshots("tocklist", "phone", 6),
    ipad: localizedScreenshots("tocklist", "ipad", 5),
  },
  skkoo: {
    screenshotId: "skkoo",
    phone: localizedScreenshots("skkoo", "phone", 6),
    ipad: localizedScreenshots("skkoo", "ipad", 5),
  },
  terubozu: {
    screenshotId: "terubozu",
    phone: localizedScreenshots("terubozu", "phone", 6),
  },
  weasseum: {
    screenshotId: "weasseum",
    phone: localizedScreenshots("weasseum", "phone", 6),
    ipad: localizedScreenshots("weasseum", "ipad", 5),
  },
} satisfies ScreenshotManifest;
