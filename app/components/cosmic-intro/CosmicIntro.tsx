"use client";

import { useLayoutEffect, useRef, type CSSProperties } from "react";
import {
  consumeInternalHomeNavigation,
} from "../../navigation/PageTransitionProvider";
import { usePageTransition } from "../../navigation/PageTransitionContext";
import { claimCosmicIntro, playCosmicIntro, COSMIC_INTRO_DEVELOPMENT } from "./introLifecycle";
import { CosmicScenery } from "./CosmicScenery";
import { startSpaceFlight } from "./spaceFlight";
import { COSMIC_INTRO_TIMELINE_CSS } from "./introTiming.mjs";
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

    let stopFlight = () => {};
    const stopIntro = playCosmicIntro(root, window, () => {
      stopFlight();
      eligible.current = false;
    }, COSMIC_INTRO_DEVELOPMENT);
    const scene = document.querySelector<HTMLElement>(".cosmic-intro-scenery");
    if (scene) stopFlight = startSpaceFlight(scene, window, COSMIC_INTRO_DEVELOPMENT);
    return () => { stopFlight(); stopIntro(); };
  }, [pageTransitionActive]);

  // Default markup leaves content visible when scripts are unavailable.
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: COSMIC_INTRO_TIMELINE_CSS }} />
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
