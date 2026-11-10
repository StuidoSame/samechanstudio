import type { Locale } from "../i18n/types";
import type { AppPlatform } from "./apps";
import filesByDirectory from "./screenshotFiles.json" with { type: "json" };

export const SCREENSHOT_LOCALE_MAP = {
  ko: "ko",
  en: "en",
  ja: "ja",
  "zh-CN": "zhg",
  "zh-TW": "zhb",
} as const satisfies Record<Locale, string>;

export const DETAIL_SCREEN_ORDER = ["phone", "ipad"] as const;

export type DetailScreen = (typeof DETAIL_SCREEN_ORDER)[number];

export type Screenshot = {
  src: string;
  width: number;
  height: number;
};

type ScreenshotFile = Omit<Screenshot, "src"> & { filename: string };
const screenshotFiles: Readonly<Record<string, readonly ScreenshotFile[] | undefined>> = filesByDirectory;

type ResolvedScreenshotSet = {
  locale: Locale | null;
  screenshots: Screenshot[];
};

const FALLBACK_LOCALES = ["en", "ko", "ja", "zh-CN", "zh-TW"] as const satisfies readonly Locale[];
const EMPTY_SET: ResolvedScreenshotSet = { locale: null, screenshots: [] };

function screenshotDirectory(
  appId: string,
  platform: AppPlatform,
  locale: Locale,
  screen: DetailScreen,
) {
  const appDirectory = platform === "android" ? `${appId}/android` : appId;
  return `${appDirectory}/${SCREENSHOT_LOCALE_MAP[locale]}/${screen}`;
}

export function getAvailableDetailScreens(appId: string, platform: AppPlatform = "apple") {
  return DETAIL_SCREEN_ORDER.filter((screen) =>
    FALLBACK_LOCALES.some((locale) => screenshotFiles[screenshotDirectory(appId, platform, locale, screen)]),
  );
}

export function resolveScreenshotLocale(locale: Locale, hasScreenshots: (locale: Locale) => boolean) {
  // Keep the existing English-first fallback within the same platform and device.
  return hasScreenshots(locale) ? locale : FALLBACK_LOCALES.find(hasScreenshots) ?? null;
}

export function getAppScreenshotSet({
  appId,
  platform = "apple",
  screen,
  locale,
}: {
  appId: string;
  platform?: AppPlatform;
  screen: DetailScreen;
  locale: Locale;
}): ResolvedScreenshotSet {
  const resolvedLocale = resolveScreenshotLocale(locale, (candidate) =>
    Boolean(screenshotFiles[screenshotDirectory(appId, platform, candidate, screen)]),
  );
  if (!resolvedLocale) return EMPTY_SET;

  const directory = screenshotDirectory(appId, platform, resolvedLocale, screen);
  return {
    locale: resolvedLocale,
    screenshots: (screenshotFiles[directory] ?? []).map(({ filename, width, height }) => ({
      src: `/assets/screenshot/${directory}/${filename}`,
      width,
      height,
    })),
  };
}
