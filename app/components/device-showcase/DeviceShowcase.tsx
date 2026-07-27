"use client";

import { useEffect, useRef, useState } from "react";
import { DeviceSection } from "./DeviceSection";
import { IPhoneFrame } from "./IPhoneFrame";
import { IPadFrame } from "./IPadFrame";
import { WatchGroup } from "./WatchGroup";

type DeviceJourneyId = "phone" | "tablet" | "watch";

const phoneCopy = {
  index: "01",
  category: "순간",
  title: "작은 순간을\n놓치지 않도록.",
  body: "하루를 바꾸는 건 거창한 결심보다\n짧게 남긴 한 줄일 때가 많습니다.\n오늘의 마음을 기록하는 작은 성공이\n내일의 나를 조금 더 선명하게 만듭니다.",
};

const tabletCopy = {
  index: "02",
  category: "사유",
  title: "잠시 멈춰\n생각할 수 있도록.",
  body: "복잡한 하루에도 잠깐의 여백은 필요합니다.\n작은 문제 하나를 천천히 풀어가며\n생각이 정리되는 순간을 만나고,\n또 하나의 작은 성공을 완성합니다.",
};

const watchCopy = {
  index: "03",
  category: "박자",
  title: "나만의 박자를\n찾을 수 있도록.",
  body: "완벽한 연주보다 중요한 건\n직접 두드려보는 짧은 시작입니다.\n세 개의 작은 화면이 하나의 리듬이 되고,\n그 한 번의 박자가 작은 성공으로 남습니다.",
};

const JOURNEY_SECTIONS: Array<{ id: DeviceJourneyId; label: string }> = [
  { id: "phone", label: "iPhone" },
  { id: "tablet", label: "iPad" },
  { id: "watch", label: "Apple Watch" },
];

export function DeviceShowcase() {
  const showcaseRef = useRef<HTMLElement>(null);
  const journeyDecorationRef = useRef<HTMLDivElement>(null);
  const [activeJourneyId, setActiveJourneyId] = useState<DeviceJourneyId>("phone");
  const [isJourneyVisible, setIsJourneyVisible] = useState(false);

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
    if (!showcase || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextVisible = entry.isIntersecting && entry.intersectionRatio > 0.01;
        setIsJourneyVisible((isVisible) =>
          isVisible === nextVisible ? isVisible : nextVisible,
        );
      },
      { threshold: [0, 0.01], rootMargin: "-10% 0px" },
    );

    observer.observe(showcase);
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

  const scrollToJourneySection = (id: DeviceJourneyId) => {
    const section = document.getElementById(`device-${id}`);
    if (!section) return;

    section.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "center",
    });
  };

  return (
    <>
      <section
        ref={showcaseRef}
        className="device-showcase"
        aria-label="SAME STUDIO device showcase"
      >
        <div ref={journeyDecorationRef} className="device-journey-decoration" aria-hidden="true">
          <svg
            className="device-journey-svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            fill="none"
            focusable="false"
          >
            <path
              className="device-journey-line device-journey-line--base"
              d="M50.5 4C48.5 22 49 36 50 49C51 64 50.5 77 49 96"
              pathLength="1"
            />
            <path
              className="device-journey-line device-journey-line--progress"
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
            <span className="device-journey-node-label">MAKE ROOM TO THINK</span>
          </span>
          <span
            className={`device-journey-node device-journey-node--watch${activeJourneyId === "watch" ? " is-active" : ""}`}
          >
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
      <nav
        className={`device-journey-progress${isJourneyVisible ? " is-visible" : ""}`}
        aria-label="Device Philosophy 섹션 이동"
        aria-hidden={!isJourneyVisible}
      >
        {JOURNEY_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            className={activeJourneyId === section.id ? "is-active" : ""}
            aria-label={`${section.label} 섹션으로 이동`}
            aria-current={activeJourneyId === section.id ? "true" : undefined}
            tabIndex={isJourneyVisible ? 0 : -1}
            onClick={() => scrollToJourneySection(section.id)}
          />
        ))}
      </nav>
    </>
  );
}
