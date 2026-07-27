export const SUPPORTED_LOCALES = ["ko", "en", "ja", "zh-CN", "zh-TW"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_STORAGE_KEY = "same-studio-locale-v1";

export const APP_TRANSLATION_IDS = [
  "mapary",
  "runtronome",
  "odow",
  "locaunt",
  "pepesnap",
  "tocklist",
  "skkoo",
  "terubozu",
  "feeloo",
] as const;

export type AppTranslationId = (typeof APP_TRANSLATION_IDS)[number];

export const TRANSLATION_DEVICES = ["iphone", "ipad", "watch", "android"] as const;

export type TranslationDevice = (typeof TRANSLATION_DEVICES)[number];

export type TranslatedAppDetail = {
  keywords: readonly string[];
  description: string;
};

export type TranslationMessages = {
  header: {
    controlsLabel: string;
    languageButtonLabel: string;
    languageOptionsLabel: string;
    controlsButtonLabel: string;
    switchToDarkMode: string;
    switchToLightMode: string;
  };
  carousel: {
    pauseAutoplay: string;
    startAutoplay: string;
    fastForward: string;
  };
  sectionNavigation: {
    navigationLabel: string;
    moveToSection: string;
    summaries: {
      apps: string;
      about: string;
      device: string;
      contact: string;
    };
  };
  devicePhilosophy: {
    phone: {
      category: string;
      title: string;
      body: string;
    };
    tablet: {
      category: string;
      title: string;
      body: string;
    };
    watch: {
      category: string;
      title: string;
      body: string;
    };
  };
  dailyQuestion: {
    questions: readonly string[];
    examples: readonly (readonly string[])[];
    dateLocale: string;
    stageLabel: string;
    todayFallback: string;
    examplesLabel: string;
    savedStatus: string;
    inputLabel: string;
    completedPlaceholder: string;
    inputPlaceholder: string;
    saveButtonLabel: string;
  };
  puzzle: {
    stageLabel: string;
    boardLabel: string;
    tileLabel: string;
    tileOn: string;
    tileOff: string;
    resetButtonLabel: string;
  };
  drum: {
    kickLabel: string;
    snareLabel: string;
    hiHatLabel: string;
    padShortcutLabel: string;
  };
  contact: {
    description: string;
  };
  appDetail: {
    appIconAlt: string;
    closeLabel: string;
    storeSelectorLabel: string;
    storeLinkLabel: string;
    previewAlt: string;
    deviceSelectorLabel: string;
    fallback: TranslatedAppDetail;
    apps: Record<
      AppTranslationId,
      Partial<Record<TranslationDevice, TranslatedAppDetail>>
    >;
  };
  footer: {
    businessNameLabel: string;
    businessRegistrationLabel: string;
    representativeLabel: string;
    emailLabel: string;
  };
};

export type DeepPartial<T> = T extends readonly (infer Item)[]
  ? readonly DeepPartial<Item>[]
  : T extends object
    ? { [Key in keyof T]?: DeepPartial<T[Key]> }
    : T;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && SUPPORTED_LOCALES.includes(value as Locale);
}

