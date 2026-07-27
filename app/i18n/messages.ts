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
  if (locale === "ko") return ko;
  return mergeWithKoreanFallback(ko, partialMessages[locale], locale, "");
}

export function formatMessage(
  template: string,
  values: Record<string, string | number>,
) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

