import type { Locale } from "../i18n/types";
import type { DetailScreen } from "./appDetailCapabilities";

export const SCREENSHOT_LOCALES = ["ko", "en", "ja", "zhg", "zhb"] as const;

export type ScreenshotLocale = (typeof SCREENSHOT_LOCALES)[number];

export const SCREENSHOT_LOCALE_MAP = {
  ko: "ko",
  en: "en",
  ja: "ja",
  "zh-CN": "zhg",
  "zh-TW": "zhb",
} as const satisfies Record<Locale, ScreenshotLocale>;

export type LocalizedScreenshotManifest = Partial<
  Record<ScreenshotLocale, string[]>
>;

export type AppScreenshotManifest = {
  screenshotId: string;
  phone?: LocalizedScreenshotManifest;
  pad?: LocalizedScreenshotManifest;
  // Watch captures are retained as source assets even though the public
  // screenshot selector is intentionally limited to Phone and Pad.
  watch?: string[];
};

export type ScreenshotManifest = Record<string, AppScreenshotManifest>;

const screenshotPathCollator = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base",
});

function naturallySortedScreenshots(screenshots: string[]): string[] {
  return [...screenshots].sort((left, right) =>
    screenshotPathCollator.compare(left, right),
  );
}

function numberedScreenshots(directory: string, count: number): string[] {
  return naturallySortedScreenshots(
    Array.from(
      { length: count },
      (_, index) => `/assets/screenshot/${directory}/${index + 1}.png`,
    ),
  );
}

function screenshotFiles(
  directory: string,
  filenames: readonly string[],
): string[] {
  return naturallySortedScreenshots(
    filenames.map((filename) => `/assets/screenshot/${directory}/${filename}`),
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

function localizedScreenshotFiles(
  appDirectory: string,
  deviceDirectory: string,
  filenames: readonly string[],
): Record<ScreenshotLocale, string[]> {
  const screenshotsForLocale = (locale: ScreenshotLocale) =>
    naturallySortedScreenshots(
      filenames.map(
        (filename) =>
          `/assets/screenshot/${appDirectory}/${deviceDirectory}/${locale}/${filename}`,
      ),
    );

  return {
    ko: screenshotsForLocale("ko"),
    en: screenshotsForLocale("en"),
    ja: screenshotsForLocale("ja"),
    zhg: screenshotsForLocale("zhg"),
    zhb: screenshotsForLocale("zhb"),
  };
}

const MAPARY_PHONE_SCREENSHOT_FILES = [
  "1.png",
  "2.png",
  "3.png",
  "4.png",
  "5.png",
] as const;

const PULTO_PHONE_SCREENSHOT_FILES = [
  "1.png",
  "2.png",
  "3.png",
  "4.png",
  "5.png",
] as const;

const PULTO_WATCH_SCREENSHOT_FILES = [
  "1.png",
  "2.png",
  "3.png",
  "4.png",
] as const;

export const SCREENSHOT_MANIFEST = {
  mapary: {
    screenshotId: "mapary",
    phone: localizedScreenshotFiles(
      "mapary",
      "phone",
      MAPARY_PHONE_SCREENSHOT_FILES,
    ),
    pad: {
      ko: numberedScreenshots("mapary/ipad/ko", 5),
      ja: numberedScreenshots("mapary/ipad/ja", 5),
      zhg: numberedScreenshots("mapary/ipad/zhg", 5),
      zhb: numberedScreenshots("mapary/ipad/zhb", 5),
    },
  },
  runtronome: {
    screenshotId: "runtronome",
    phone: localizedScreenshotFiles(
      "runtronome",
      "phone",
      PULTO_PHONE_SCREENSHOT_FILES,
    ),
    watch: screenshotFiles(
      "runtronome/watch",
      PULTO_WATCH_SCREENSHOT_FILES,
    ),
  },
  evrune: {
    screenshotId: "evrune",
    phone: localizedScreenshots("evrune", "phone", 5),
    pad: localizedScreenshots("evrune", "ipad", 5),
  },
  pini: {
    screenshotId: "pini",
    phone: localizedScreenshots("pini", "phone", 6),
  },
  pepesnap: {
    screenshotId: "pepesnap",
    phone: localizedScreenshots("pepesnap", "phone", 6),
    pad: localizedScreenshots("pepesnap", "pad", 5),
  },
  tocklist: {
    screenshotId: "tocklist",
    phone: localizedScreenshots("tocklist", "phone", 6),
    pad: localizedScreenshots("tocklist", "ipad", 5),
  },
  skkoo: {
    screenshotId: "skkoo",
    phone: localizedScreenshots("skkoo", "phone", 6),
    pad: localizedScreenshots("skkoo", "ipad", 5),
  },
  terubozu: {
    screenshotId: "terubozu",
    phone: localizedScreenshots("terubozu", "phone", 6),
  },
  waesseum: {
    screenshotId: "waesseum",
    phone: localizedScreenshots("waesseum", "phone", 6),
    pad: localizedScreenshots("waesseum", "ipad", 5),
  },
} satisfies ScreenshotManifest;

function nonEmptyScreenshots(
  screenshots: string[] | undefined,
): string[] | null {
  return screenshots && screenshots.length > 0 ? screenshots : null;
}

export function resolveLocalizedScreenshots(
  localizedScreenshots: LocalizedScreenshotManifest | undefined,
  locale: Locale,
): string[] {
  if (!localizedScreenshots) return [];

  const screenshotLocale = SCREENSHOT_LOCALE_MAP[locale];
  const localizedMatch = nonEmptyScreenshots(
    localizedScreenshots[screenshotLocale],
  );
  if (localizedMatch) return localizedMatch;

  const koreanFallback = nonEmptyScreenshots(localizedScreenshots.ko);
  if (koreanFallback) return koreanFallback;

  const englishFallback = nonEmptyScreenshots(localizedScreenshots.en);
  if (englishFallback) return englishFallback;

  for (const fallbackLocale of SCREENSHOT_LOCALES) {
    const firstAvailable = nonEmptyScreenshots(
      localizedScreenshots[fallbackLocale],
    );
    if (firstAvailable) return firstAvailable;
  }

  return [];
}

export function getAppScreenshots({
  appId,
  screen,
  locale,
}: {
  appId: string;
  screen: DetailScreen;
  locale: Locale;
}): string[] {
  const appScreenshots: AppScreenshotManifest | undefined =
    SCREENSHOT_MANIFEST[appId as keyof typeof SCREENSHOT_MANIFEST];

  if (!appScreenshots) return [];

  return [
    ...new Set(
      naturallySortedScreenshots(
        resolveLocalizedScreenshots(appScreenshots[screen], locale),
      ),
    ),
  ];
}
