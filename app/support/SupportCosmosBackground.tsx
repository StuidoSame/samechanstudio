"use client";

import { useEffect, useState } from "react";
import { CosmicInteractionLayer } from "../components/CosmicInteractionLayer";
import { SectionCosmos } from "../components/SectionCosmos";

export function SupportCosmosBackground() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);

    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);
    return () => mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  return (
    <>
      <CosmicInteractionLayer
        enablePointerTrail={false}
        reducedMotion={reducedMotion}
      />
      <div
        className="support-cosmos-backdrop"
        data-support-cosmos=""
        aria-hidden="true"
      >
        <div className="support-cosmos-layer support-cosmos-layer--hero">
          <SectionCosmos variant="hero" />
        </div>
        <div className="support-cosmos-layer support-cosmos-layer--middle">
          <SectionCosmos variant="contact" />
        </div>
        <div className="support-cosmos-layer support-cosmos-layer--lower">
          <SectionCosmos variant="about" />
        </div>

        <span className="support-cosmos-planet support-cosmos-planet--hero" />
        <span className="support-cosmos-planet support-cosmos-planet--middle" />
        <span className="support-cosmos-planet support-cosmos-planet--lower" />
        <span className="support-cosmos-dust support-cosmos-dust--one" />
        <span className="support-cosmos-dust support-cosmos-dust--two" />
      </div>
    </>
  );
}
