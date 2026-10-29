"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Context,
  type ReactNode,
} from "react";
import type { ViteHotContext } from "vite/types/hot.d.ts";
import { resolveInitialLocale } from "./locale";
import { formatMessage, getMessages } from "./messages";
import {
  LOCALE_STORAGE_KEY,
  type Locale,
  type TranslationMessages,
} from "./types";

type I18nContextValue = {
  locale: Locale;
  messages: TranslationMessages;
  format: typeof formatMessage;
  setLocale: (locale: Locale) => void;
};

const hot = (import.meta as ImportMeta & { hot?: ViteHotContext }).hot;
// Locale/catalog edits can refresh consumers before their provider. Retain
// one context identity across development updates; production creates it once.
const I18nContext =
  (hot?.data.sameStudioI18nContext as Context<I18nContextValue | null> | undefined)
  ?? createContext<I18nContextValue | null>(null);
if (hot) hot.data.sameStudioI18nContext = I18nContext;

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ko");

  const applyLocale = useCallback((nextLocale: Locale, persist: boolean) => {
    setLocaleState(nextLocale);
    document.documentElement.lang = nextLocale;

    if (!persist) return;

    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    } catch {
      // Storage can be unavailable in private or restricted browser contexts.
    }
  }, []);

  const setLocale = useCallback(
    (nextLocale: Locale) => applyLocale(nextLocale, true),
    [applyLocale],
  );

  useEffect(() => {
    const initializationTimer = window.setTimeout(() => {
      let storedLocale: string | null = null;

      try {
        storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      } catch {
        // Continue with the browser language when storage is unavailable.
      }

      const browserLanguages =
        navigator.languages.length > 0
          ? navigator.languages
          : [navigator.language];
      applyLocale(resolveInitialLocale(storedLocale, browserLanguages), false);
    }, 0);

    return () => window.clearTimeout(initializationTimer);
  }, [applyLocale]);

  const messages = useMemo(() => getMessages(locale), [locale]);
  const value = useMemo(
    () => ({ locale, messages, format: formatMessage, setLocale }),
    [locale, messages, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);

  if (!value) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return value;
}
