"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "../i18n/I18nProvider";

type PageSectionId = "apps" | "about" | "devices" | "contact";

const PAGE_SECTIONS = [
  {
    id: "apps",
    label: "APPS",
  },
  {
    id: "about",
    label: "ABOUT",
  },
  {
    id: "devices",
    label: "DEVICES",
  },
  {
    id: "contact",
    label: "CONTACT",
  },
] as const satisfies ReadonlyArray<{
  id: PageSectionId;
  label: string;
}>;

type PageSectionNavigationProps = {
  hidden: boolean;
};

export function PageSectionNavigation({
  hidden,
}: PageSectionNavigationProps) {
  const { locale, messages, format } = useI18n();
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

    const initialUpdateFrame = window.requestAnimationFrame(updateActiveSection);

    const Observer = (
      window as Window & {
        IntersectionObserver?: typeof globalThis.IntersectionObserver;
      }
    ).IntersectionObserver;

    if (!Observer) {
      window.addEventListener("scroll", updateActiveSection, { passive: true });
      window.addEventListener("resize", updateActiveSection);
      return () => {
        window.cancelAnimationFrame(initialUpdateFrame);
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
      window.cancelAnimationFrame(initialUpdateFrame);
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
      aria-label={messages.sectionNavigation.navigationLabel}
      aria-hidden={navigationHidden}
      inert={navigationHidden ? true : undefined}
    >
      {PAGE_SECTIONS.map((section) => {
        const active = activeSectionId === section.id;
        const summaryId = `page-section-summary-${section.id}`;
        const summary =
          section.id === "devices"
            ? messages.sectionNavigation.summaries.device
            : messages.sectionNavigation.summaries[section.id];

        return (
          <button
            key={`${locale}-${section.id}`}
            type="button"
            className={active ? "is-active" : ""}
            aria-label={format(messages.sectionNavigation.moveToSection, {
              section: section.label,
            })}
            aria-describedby={summaryId}
            aria-current={active ? "location" : undefined}
            tabIndex={navigationHidden ? -1 : 0}
            onClick={() => scrollToSection(section.id)}
          >
            <span className="page-section-navigation-dot" aria-hidden="true" />
            <span className="page-section-navigation-tooltip" aria-hidden="true">
              <strong>{section.label}</strong>
              <span>{summary}</span>
            </span>
            <span
              id={summaryId}
              className="page-section-navigation-sr-only"
            >
              {summary}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
