"use client";

import { useLayoutEffect, useRef } from "react";
import {
  consumeInternalHomeNavigation,
  usePageTransition,
} from "../../navigation/PageTransitionProvider";
import { claimCosmicIntro, playCosmicIntro, COSMIC_INTRO_DEVELOPMENT } from "./introLifecycle";
import "./cosmic-intro.css";

export function CosmicIntro() {
  const { pageTransitionActive } = usePageTransition();
  const eligible = useRef<boolean | null>(null);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const internalNavigation = consumeInternalHomeNavigation();
    delete document.documentElement.dataset.internalHomeNavigation;
    if (eligible.current === null) {
      eligible.current = claimCosmicIntro(window, pageTransitionActive || internalNavigation, COSMIC_INTRO_DEVELOPMENT);
    }
    if (pageTransitionActive) eligible.current = false;
    if (!eligible.current || pageTransitionActive) {
      delete root.dataset.cosmicIntro;
      delete root.dataset.cosmicIntroMotion;
      delete root.dataset.cosmicIntroPreview;
      return;
    }

    return playCosmicIntro(root, window, () => {
      eligible.current = false;
    }, COSMIC_INTRO_DEVELOPMENT);
  }, [pageTransitionActive]);

  // Default markup leaves content visible when scripts are unavailable.
  return (
    <div className="cosmic-intro" aria-hidden="true">
      <span className="cosmic-intro-wordmark">SAME STUDIO</span>
    </div>
  );
}
