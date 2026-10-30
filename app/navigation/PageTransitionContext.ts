"use client";

import { createContext, useContext, type MouseEvent } from "react";

type PageTransitionContextValue = {
  pageTransitionActive: boolean;
  navigateWithTransition: (event: MouseEvent<HTMLAnchorElement>, href: string) => boolean;
};

// Keep context identity stable when the presentation/provider is hot-reloaded.
export const PageTransitionContext = createContext<PageTransitionContextValue | null>(null);

export function usePageTransition() {
  const value = useContext(PageTransitionContext);
  if (!value) throw new Error("usePageTransition must be used within PageTransitionProvider");
  return value;
}
