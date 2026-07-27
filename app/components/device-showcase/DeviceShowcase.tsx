"use client";

import { useEffect, useRef, useState } from "react";
import { DeviceSection } from "./DeviceSection";
import { IPhoneFrame } from "./IPhoneFrame";
import { IPadFrame } from "./IPadFrame";
import { WatchGroup } from "./WatchGroup";

type DeviceJourneyId = "phone" | "tablet" | "watch";

const phoneCopy = {
  index: "01",
  category: "PHONE",
  title: "Close to you.",
  body: "Made for everyday moments.\nSmall experiences designed\nto stay close at hand.",
};

const tabletCopy = {
  index: "02",
  category: "TABLET",
  title: "Room to think.",
  body: "A small puzzle for a quieter moment.\nOne simple pattern, refreshed each day.",
};

const watchCopy = {
  index: "03",
  category: "WATCH",
  title: "Tap into rhythm.",
  body: "Three small screens.\nOne quick beat.",
};

export function DeviceShowcase() {
  const showcaseRef = useRef<HTMLElement>(null);
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

  return (
    <section
      ref={showcaseRef}
      className="device-showcase"
      aria-label="SAME STUDIO device showcase"
    >
      <div className="device-journey-decoration" aria-hidden="true">
        <svg
          className="device-journey-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          fill="none"
          focusable="false"
        >
          <path
            className="device-journey-line"
            d="M52 4C47 22 48 36 51 49C54 64 53 77 48 96"
            pathLength="1"
          />
        </svg>
        <span className={`device-journey-node device-journey-node--phone${activeJourneyId === "phone" ? " is-active" : ""}`}>
          <span className="device-journey-node-core" />
          <span className="device-journey-node-label">CAPTURE A MOMENT</span>
        </span>
        <span className={`device-journey-node device-journey-node--tablet${activeJourneyId === "tablet" ? " is-active" : ""}`}>
          <span className="device-journey-node-core" />
          <span className="device-journey-node-label">MAKE ROOM TO THINK</span>
        </span>
        <span className={`device-journey-node device-journey-node--watch${activeJourneyId === "watch" ? " is-active" : ""}`}>
          <span className="device-journey-node-core" />
          <span className="device-journey-node-label">FIND A QUICK RHYTHM</span>
        </span>
      </div>
      <div className="device-showcase-inner">
        <DeviceSection
          {...phoneCopy}
          journeyId="phone"
          className="device-showcase-phone"
          cosmosVariant="phone"
          device={<IPhoneFrame />}
        />
        <DeviceSection
          {...tabletCopy}
          journeyId="tablet"
          className="device-showcase-tablet"
          cosmosVariant="tablet"
          device={<IPadFrame />}
          reversed
        />
        <DeviceSection
          {...watchCopy}
          journeyId="watch"
          className="device-showcase-watch"
          cosmosVariant="watch"
          device={<WatchGroup />}
        />
      </div>
    </section>
  );
}
