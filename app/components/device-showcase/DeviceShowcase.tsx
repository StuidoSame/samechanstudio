"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "../../i18n/I18nProvider";
import { DeviceSection } from "./DeviceSection";
import { IPhoneFrame } from "./IPhoneFrame";
import { IPadFrame } from "./IPadFrame";
import { WatchGroup } from "./WatchGroup";

type DeviceJourneyId = "phone" | "tablet" | "watch";

export function DeviceShowcase() {
  const { locale, messages } = useI18n();
  const showcaseRef = useRef<HTMLElement>(null);
  const journeyDecorationRef = useRef<HTMLDivElement>(null);
  const [activeJourneyId, setActiveJourneyId] = useState<DeviceJourneyId>("phone");

  useEffect(() => {
    const showcase = showcaseRef.current;
    if (!showcase || !("IntersectionObserver" in window)) return;

    const sections = Array.from(
      showcase.querySelectorAll<HTMLElement>("[data-device-journey-section]"),
    );
    const visibleSections = new Map<HTMLElement, boolean>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibleSections.set(entry.target as HTMLElement, entry.isIntersecting);
        });

        const viewportCenter = window.innerHeight / 2;
        const closestSection = sections
          .filter((section) => visibleSections.get(section))
          .map((section) => {
            const rect = section.getBoundingClientRect();
            return {
              id: section.dataset.deviceJourneySection as DeviceJourneyId,
              distance: Math.abs(rect.top + rect.height / 2 - viewportCenter),
            };
          })
          .sort((a, b) => a.distance - b.distance)[0];

        if (closestSection) {
          setActiveJourneyId((currentId) =>
            currentId === closestSection.id ? currentId : closestSection.id,
          );
        }
      },
      {
        rootMargin: "-35% 0px -35% 0px",
        threshold: [0, 0.2, 0.5, 0.8, 1],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const showcase = showcaseRef.current;
    const decoration = journeyDecorationRef.current;
    if (!showcase || !decoration) return;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameId: number | null = null;

    const updateJourneyProgress = () => {
      frameId = null;
      if (reducedMotionQuery.matches) {
        decoration.style.setProperty("--device-journey-progress", "1");
        return;
      }

      const watchSection = showcase.querySelector<HTMLElement>(
        '[data-device-journey-section="watch"]',
      );
      if (!watchSection) return;

      const scrollTop = window.scrollY;
      const showcaseRect = showcase.getBoundingClientRect();
      const watchRect = watchSection.getBoundingClientRect();
      const startScroll = scrollTop + showcaseRect.top - window.innerHeight;
      const endScroll = scrollTop + watchRect.top + watchRect.height / 2 - window.innerHeight / 2;
      const progress = Math.min(
        1,
        Math.max(0, (scrollTop - startScroll) / Math.max(1, endScroll - startScroll)),
      );

      decoration.style.setProperty("--device-journey-progress", progress.toFixed(4));
    };

    const requestProgressUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateJourneyProgress);
    };

    updateJourneyProgress();
    window.addEventListener("scroll", requestProgressUpdate, { passive: true });
    window.addEventListener("resize", requestProgressUpdate);
    reducedMotionQuery.addEventListener("change", requestProgressUpdate);

    return () => {
      window.removeEventListener("scroll", requestProgressUpdate);
      window.removeEventListener("resize", requestProgressUpdate);
      reducedMotionQuery.removeEventListener("change", requestProgressUpdate);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <section
      ref={showcaseRef}
      className="device-showcase"
      id="devices"
      aria-label="SAME STUDIO device showcase"
    >
      <div
        ref={journeyDecorationRef}
        className="device-journey-decoration"
        aria-hidden="true"
      >
        <svg
          className="device-journey-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          fill="none"
          focusable="false"
        >
          <path
            className="device-journey-line device-journey-line--base device-journey-line--wide"
            d="M50.5 4C48.5 22 49 36 47.3 49C47.6 64 48.5 77 49 96"
            pathLength="1"
          />
          <path
            className="device-journey-line device-journey-line--progress device-journey-line--wide"
            d="M50.5 4C48.5 22 49 36 47.3 49C47.6 64 48.5 77 49 96"
            pathLength="1"
          />
          <path
            className="device-journey-line device-journey-line--base device-journey-line--compact"
            d="M50.5 4C48.5 22 49 36 50 49C51 64 50.5 77 49 96"
            pathLength="1"
          />
          <path
            className="device-journey-line device-journey-line--progress device-journey-line--compact"
            d="M50.5 4C48.5 22 49 36 50 49C51 64 50.5 77 49 96"
            pathLength="1"
          />
        </svg>
        <span
          className={`device-journey-node device-journey-node--phone${activeJourneyId === "phone" ? " is-active" : ""}`}
        >
          <span className="device-journey-node-core" />
          <span className="device-journey-node-label">CAPTURE A MOMENT</span>
        </span>
        <span
          className={`device-journey-node device-journey-node--tablet${activeJourneyId === "tablet" ? " is-active" : ""}`}
        >
          <span className="device-journey-node-core" />
          <span className="device-journey-node-label">
            MAKE ROOM TO THINK
          </span>
        </span>
        <span
          className={`device-journey-node device-journey-node--watch${activeJourneyId === "watch" ? " is-active" : ""}`}
        >
          <span className="device-journey-node-core" />
          <span className="device-journey-node-label">
            FIND A QUICK RHYTHM
          </span>
        </span>
      </div>
      <div className="device-showcase-inner">
        <DeviceSection
          index="01"
          {...messages.devicePhilosophy.phone}
          journeyId="phone"
          locale={locale}
          className="device-showcase-phone"
          cosmosVariant="phone"
          device={<IPhoneFrame />}
        />
        <DeviceSection
          index="02"
          {...messages.devicePhilosophy.tablet}
          journeyId="tablet"
          locale={locale}
          className="device-showcase-tablet"
          cosmosVariant="tablet"
          device={<IPadFrame />}
          reversed
        />
        <DeviceSection
          index="03"
          {...messages.devicePhilosophy.watch}
          journeyId="watch"
          locale={locale}
          className="device-showcase-watch"
          cosmosVariant="watch"
          device={<WatchGroup />}
        />
      </div>
    </section>
  );
}
