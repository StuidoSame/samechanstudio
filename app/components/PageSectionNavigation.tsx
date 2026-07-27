"use client";

import { useCallback, useEffect, useState } from "react";

type PageSectionId = "apps" | "about" | "devices" | "contact";

const PAGE_SECTIONS = [
  {
    id: "apps",
    label: "APPS",
    summary: "SAME STUDIO가 만든 앱들을 둘러보세요.",
  },
  {
    id: "about",
    label: "ABOUT",
    summary: "작은 앱을 정성껏 만드는 SAME STUDIO의 이야기.",
  },
  {
    id: "devices",
    label: "DEVICES",
    summary: "순간, 사유, 박자로 이어지는 작은 성공의 경험.",
  },
  {
    id: "contact",
    label: "CONTACT",
    summary: "앱 문의와 제휴, 오류 제보를 이메일로 보내주세요.",
  },
] as const satisfies ReadonlyArray<{
  id: PageSectionId;
  label: string;
  summary: string;
}>;

type PageSectionNavigationProps = {
  hidden: boolean;
};

export function PageSectionNavigation({
  hidden,
}: PageSectionNavigationProps) {
  const [activeSectionId, setActiveSectionId] =
    useState<PageSectionId>("apps");
  const [footerVisible, setFooterVisible] = useState(false);

  const updateActiveSection = useCallback(() => {
    const viewportCenter = window.innerHeight / 2;
    const closestSection = PAGE_SECTIONS.map((section) => {
      const element = document.getElementById(section.id);
      if (!element) return null;

      const rect = element.getBoundingClientRect();
      const distance =
        rect.top > viewportCenter
          ? rect.top - viewportCenter
          : rect.bottom < viewportCenter
            ? viewportCenter - rect.bottom
            : 0;

      return { id: section.id, distance };
    })
      .filter((section): section is { id: PageSectionId; distance: number } =>
        Boolean(section),
      )
      .sort((a, b) => a.distance - b.distance)[0];

    if (closestSection) {
      setActiveSectionId((currentId) =>
        currentId === closestSection.id ? currentId : closestSection.id,
      );
    }
  }, []);

  useEffect(() => {
    const sections = PAGE_SECTIONS.map((section) =>
      document.getElementById(section.id),
    ).filter((section): section is HTMLElement => Boolean(section));
    if (sections.length === 0) return;

    updateActiveSection();

    const Observer = (
      window as Window & {
        IntersectionObserver?: typeof globalThis.IntersectionObserver;
      }
    ).IntersectionObserver;

    if (!Observer) {
      window.addEventListener("scroll", updateActiveSection, { passive: true });
      window.addEventListener("resize", updateActiveSection);
      return () => {
        window.removeEventListener("scroll", updateActiveSection);
        window.removeEventListener("resize", updateActiveSection);
      };
    }

    const observer = new Observer(updateActiveSection, {
      rootMargin: "-35% 0px -35% 0px",
      threshold: [0, 0.2, 0.5, 0.8, 1],
    });
    sections.forEach((section) => observer.observe(section));
    window.addEventListener("resize", updateActiveSection);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [updateActiveSection]);

  useEffect(() => {
    const footer = document.querySelector("footer");
    const Observer = (
      window as Window & {
        IntersectionObserver?: typeof globalThis.IntersectionObserver;
      }
    ).IntersectionObserver;
    if (!footer || !Observer) return;

    const observer = new Observer(
      ([entry]) =>
        setFooterVisible(
          entry.isIntersecting && entry.intersectionRatio >= 0.55,
        ),
      { threshold: [0, 0.55] },
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const navigationHidden = hidden || footerVisible;

  const scrollToSection = (sectionId: PageSectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  };

  return (
    <nav
      className={`page-section-navigation${navigationHidden ? " is-hidden" : ""}`}
      aria-label="페이지 주요 섹션 이동"
      aria-hidden={navigationHidden}
      inert={navigationHidden ? true : undefined}
    >
      {PAGE_SECTIONS.map((section) => {
        const active = activeSectionId === section.id;
        const summaryId = `page-section-summary-${section.id}`;

        return (
          <button
            key={section.id}
            type="button"
            className={active ? "is-active" : ""}
            aria-label={`${section.label} 섹션으로 이동`}
            aria-describedby={summaryId}
            aria-current={active ? "location" : undefined}
            tabIndex={navigationHidden ? -1 : 0}
            onClick={() => scrollToSection(section.id)}
          >
            <span className="page-section-navigation-dot" aria-hidden="true" />
            <span className="page-section-navigation-tooltip" aria-hidden="true">
              <strong>{section.label}</strong>
              <span>{section.summary}</span>
            </span>
            <span
              id={summaryId}
              className="page-section-navigation-sr-only"
            >
              {section.summary}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
