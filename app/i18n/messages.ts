import { en } from "./locales/en";
import { ja } from "./locales/ja";
import { ko } from "./locales/ko";
import { zhCN } from "./locales/zh-CN";
import { zhTW } from "./locales/zh-TW";
import type {
  DeepPartial,
  Locale,
  TranslationMessages,
} from "./types";

const partialMessages: Record<Locale, DeepPartial<TranslationMessages>> = {
  ko,
  en,
  ja,
  "zh-CN": zhCN,
  "zh-TW": zhTW,
};

const warnedMissingKeys = new Set<string>();
const validatedLocales = new Set<Locale>();
const DEVICE_IDS = ["phone", "tablet", "watch"] as const;

function assertMeaningfulLines(
  locale: Locale,
  path: string,
  lines: readonly string[],
) {
  if (lines.length === 0) {
    throw new Error(
      `Translation "${locale}.${path}" must contain at least one line.`,
    );
  }

  lines.forEach((line, index) => {
    const normalizedLine = line.trim();

    if (!normalizedLine || Array.from(normalizedLine).length < 2) {
      throw new Error(
        `Translation "${locale}.${path}.${index}" must be a meaningful, non-empty line.`,
      );
    }
  });
}

function assertLocaleShape(locale: Locale, messages: TranslationMessages) {
  if (validatedLocales.has(locale)) return;

  DEVICE_IDS.forEach((deviceId, deviceIndex) => {
    const copy = messages.devicePhilosophy[deviceId];
    const expectedIndex = String(deviceIndex + 1).padStart(2, "0");

    if (copy.index !== expectedIndex || !copy.label.trim()) {
      throw new Error(
        `Translation "${locale}.devicePhilosophy.${deviceId}" has an invalid index or label.`,
      );
    }

    assertMeaningfulLines(
      locale,
      `devicePhilosophy.${deviceId}.titleLines`,
      copy.titleLines,
    );
    assertMeaningfulLines(
      locale,
      `devicePhilosophy.${deviceId}.descriptionLines`,
      copy.descriptionLines,
    );
  });

  if (
    messages.dailyQuestion.questions.length !== 7 ||
    messages.dailyQuestion.examples.length !== 7 ||
    messages.dailyQuestion.examples.some(
      (examples) =>
        examples.length === 0 || examples.some((example) => !example.trim()),
    )
  ) {
    throw new Error(
      `Translation "${locale}.dailyQuestion" has an invalid weekly structure.`,
    );
  }

  validatedLocales.add(locale);
}

function mergeWithKoreanFallback<T>(
  fallback: T,
  candidate: DeepPartial<T> | undefined,
  locale: Locale,
  path: string,
): T {
  if (candidate === undefined) {
    if (process.env.NODE_ENV !== "production" && locale !== "ko") {
      const warningKey = `${locale}:${path}`;
      if (!warnedMissingKeys.has(warningKey)) {
        warnedMissingKeys.add(warningKey);
        console.warn(`Missing translation key "${path}" for locale "${locale}"; using Korean fallback.`);
      }
    }
    return fallback;
  }

  if (Array.isArray(fallback) || typeof fallback !== "object" || fallback === null) {
    return candidate as T;
  }

  const candidateRecord = candidate as Record<string, unknown>;
  return Object.fromEntries(
    Object.entries(fallback as Record<string, unknown>).map(([key, value]) => [
      key,
      mergeWithKoreanFallback(
        value,
        candidateRecord[key] as DeepPartial<typeof value> | undefined,
        locale,
        path ? `${path}.${key}` : key,
      ),
    ]),
  ) as T;
}

export function getMessages(locale: Locale): TranslationMessages {
  const messages =
    locale === "ko"
      ? ko
      : mergeWithKoreanFallback(ko, partialMessages[locale], locale, "");

  if (process.env.NODE_ENV !== "production") {
    assertLocaleShape(locale, messages);
  }

  return messages;
}

export function formatMessage(
  template: string,
  values: Record<string, string | number>,
) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
