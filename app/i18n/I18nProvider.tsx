"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { resolveInitialLocale } from "./locale";
import {
  LOCALE_STORAGE_KEY,
  type Locale,
} from "./types";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

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

  const value = useMemo(
    () => ({ locale, setLocale }),
    [locale, setLocale],
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
