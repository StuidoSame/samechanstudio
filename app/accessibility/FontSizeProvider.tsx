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
  FONT_SIZE_STORAGE_KEY,
  isFontSize,
  type FontSize,
} from "./types";

type FontSizeContextValue = {
  fontSize: FontSize;
  setFontSize: (fontSize: FontSize) => void;
};

const FontSizeContext = createContext<FontSizeContextValue | null>(null);

function updateFontSizeAttribute(fontSize: FontSize) {
  document.documentElement.dataset.fontSize = fontSize;
}

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>("medium");

  const applyFontSize = useCallback(
    (nextFontSize: FontSize, persist: boolean) => {
      setFontSizeState(nextFontSize);
      updateFontSizeAttribute(nextFontSize);

      if (!persist) return;

      try {
        window.localStorage.setItem(FONT_SIZE_STORAGE_KEY, nextFontSize);
      } catch {
        // Keep the in-memory preference when storage is unavailable.
      }
    },
    [],
  );

  const setFontSize = useCallback(
    (nextFontSize: FontSize) => applyFontSize(nextFontSize, true),
    [applyFontSize],
  );

  useEffect(() => {
    const initializationTimer = window.setTimeout(() => {
      const fontSizeAttribute = document.documentElement.dataset.fontSize;
      const initialFontSize = isFontSize(fontSizeAttribute)
        ? fontSizeAttribute
        : "medium";
      applyFontSize(initialFontSize, false);
    }, 0);

    return () => window.clearTimeout(initializationTimer);
  }, [applyFontSize]);

  const value = useMemo(
    () => ({ fontSize, setFontSize }),
    [fontSize, setFontSize],
  );

  return (
    <FontSizeContext.Provider value={value}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  const value = useContext(FontSizeContext);

  if (!value) {
    throw new Error("useFontSize must be used within FontSizeProvider");
  }

  return value;
}
