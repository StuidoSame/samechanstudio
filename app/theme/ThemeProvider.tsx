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
import {
  isTheme,
  THEME_STORAGE_KEY,
  type Theme,
} from "./types";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function updateThemeMetadata(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document
    .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#191522" : "#f3eeff");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  const applyTheme = useCallback((nextTheme: Theme, persist: boolean) => {
    setThemeState(nextTheme);
    updateThemeMetadata(nextTheme);

    if (!persist) return;

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Keep the in-memory theme when storage is unavailable.
    }
  }, []);

  const setTheme = useCallback(
    (nextTheme: Theme) => applyTheme(nextTheme, true),
    [applyTheme],
  );

  const toggleTheme = useCallback(() => {
    setThemeState((currentTheme) => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      updateThemeMetadata(nextTheme);

      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      } catch {
        // Keep the in-memory theme when storage is unavailable.
      }

      return nextTheme;
    });
  }, []);

  useEffect(() => {
    const initializationTimer = window.setTimeout(() => {
      const initialTheme = isTheme(document.documentElement.dataset.theme)
        ? document.documentElement.dataset.theme
        : "light";
      applyTheme(initialTheme, false);
    }, 0);

    return () => window.clearTimeout(initializationTimer);
  }, [applyTheme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [setTheme, theme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return value;
}

