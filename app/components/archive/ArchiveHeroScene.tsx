"use client";

import { useEffect, useRef } from "react";
import { SectionCosmos } from "../SectionCosmos";

export function ArchiveHeroScene() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !("IntersectionObserver" in window)) return;

    let inView = false;
    const updateMotion = () => {
      scene.toggleAttribute("data-in-view", inView && !document.hidden);
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      updateMotion();
    });
    observer.observe(scene);
    document.addEventListener("visibilitychange", updateMotion);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updateMotion);
    };
  }, []);

  return (
    <div className="archive-hero-scene" ref={sceneRef} aria-hidden="true">
      <SectionCosmos variant="hero" />
      <div className="archive-hero-system">
        <div className="archive-hero-float">
          <span className="archive-hero-orbit archive-hero-orbit--back" />
          <span className="archive-hero-companion" />
          <span className="archive-hero-planet" />
          <span className="archive-hero-orbit archive-hero-orbit--front" />
        </div>
      </div>
    </div>
  );
}
