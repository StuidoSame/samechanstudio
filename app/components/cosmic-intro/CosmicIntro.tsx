"use client";

import { useLayoutEffect, useRef, type CSSProperties } from "react";
import {
  consumeInternalHomeNavigation,
  usePageTransition,
} from "../../navigation/PageTransitionProvider";
import { claimCosmicIntro, playCosmicIntro, COSMIC_INTRO_DEVELOPMENT } from "./introLifecycle";
import { CosmicScenery } from "./CosmicScenery";
import "./cosmic-intro.css";

export function CosmicIntro() {
  const { pageTransitionActive } = usePageTransition();
  const eligible = useRef<boolean | null>(null);

  useLayoutEffect(() => {
    const root = document.documentElement;
    consumeInternalHomeNavigation();
    delete document.documentElement.dataset.internalHomeNavigation;
    // A first home mount can precede the router URL update. Decide only after
    // the destination has settled; returning from Support does not use a visit.
    if (pageTransitionActive) {
      if (eligible.current) eligible.current = false;
      return;
    }
    if (eligible.current === null) {
      eligible.current = claimCosmicIntro(window, false, COSMIC_INTRO_DEVELOPMENT);
    }
    if (!eligible.current) {
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
    <>
      <CosmicScenery />
      <div className="cosmic-intro" aria-hidden="true">
        <span className="cosmic-intro-wordmark" role="img" aria-label="SAME STUDIO">
          {Array.from("SAME STUDIO", (letter, index) => (
            <span
              key={index}
              className={letter === " " ? "cosmic-intro-letter-gap" : "cosmic-intro-letter"}
              style={{ "--cosmic-letter-index": index > 4 ? index - 1 : index } as CSSProperties}
              aria-hidden="true"
            >
              {letter}
            </span>
          ))}
        </span>
      </div>
    </>
  );
}
