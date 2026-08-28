export const SUPPORTED_LOCALES = ["ko", "en", "ja", "zh-CN", "zh-TW"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_STORAGE_KEY = "same-studio-locale-v1";

export const APP_TRANSLATION_IDS = [
  "mapary",
  "runtronome",
  "evrune",
  "pini",
  "pepesnap",
  "tocklist",
  "skkoo",
  "terubozu",
  "feeloo",
  "waesseum",
] as const;

export type AppTranslationId = (typeof APP_TRANSLATION_IDS)[number];

export const TRANSLATION_DEVICES = ["iphone", "ipad", "watch", "android"] as const;

export type TranslationDevice = (typeof TRANSLATION_DEVICES)[number];

export type TranslatedAppDetail = {
  keywords: readonly string[];
  description: string;
};

export type SupportFaqItem = {
  question: string;
  answer: string;
};

export type TranslationLines = readonly [string, ...string[]];

export type DeviceCopy = {
  index: string;
  label: string;
  titleLines: TranslationLines;
  descriptionLines: TranslationLines;
};

export type TranslationMessages = {
  header: {
    controlsLabel: string;
    languageButtonLabel: string;
    languageOptionsLabel: string;
    languageNames: Record<Locale, string>;
    controlsButtonLabel: string;
    switchToDarkMode: string;
    switchToLightMode: string;
    turnBackgroundMusicOn: string;
    turnBackgroundMusicOff: string;
    textSizeLabel: string;
    textSizeSmall: string;
    textSizeDefault: string;
    textSizeLarge: string;
    openTextSizeMenu: string;
    closeTextSizeMenu: string;
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
    phone: DeviceCopy;
    tablet: DeviceCopy;
    watch: DeviceCopy;
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
    previewRegionLabel: string;
    previewAlt: string;
    previewLoadingLabel: string;
    previewUnavailableLabel: string;
    previousScreenshotLabel: string;
    nextScreenshotLabel: string;
    screenshotPositionLabel: string;
    enlargeScreenshotLabel: string;
    lightboxLabel: string;
    closeLightboxLabel: string;
    previousImageLabel: string;
    nextImageLabel: string;
    deviceSelectorLabel: string;
    fallback: TranslatedAppDetail;
    apps: Record<
      AppTranslationId,
      Partial<Record<TranslationDevice, TranslatedAppDetail>>
    >;
  };
  support: {
    hero: {
      label: string;
      title: string;
      description: string;
    };
    sections: {
      contact: string;
      details: string;
      responseTime: string;
      faq: string;
    };
    fields: {
      appName: string;
      device: string;
      osVersion: string;
      message: string;
    };
    examples: {
      appName: string;
      device: string;
      osVersion: string;
      message: string;
    };
    actions: {
      emailSupport: string;
    };
    responseLines: readonly [string, string];
    email: {
      subject: string;
      body: string;
    };
    accessibility: {
      previousApps: string;
      nextApps: string;
      appGallery: string;
      selectApp: string;
      appIconAlt: string;
      form: string;
      emailSupport: string;
      emailAddress: string;
    };
    faq: readonly SupportFaqItem[];
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
