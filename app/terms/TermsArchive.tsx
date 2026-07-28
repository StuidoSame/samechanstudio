"use client";

import { useEffect, useState } from "react";
import { CosmicInteractionLayer } from "../components/CosmicInteractionLayer";
import { SectionCosmos } from "../components/SectionCosmos";
import { useI18n } from "../i18n/I18nProvider";
import { InternalTransitionLink } from "../navigation/InternalTransitionLink";
import { TERMS_MESSAGES } from "./termsMessages";

const COSMOS_VARIANTS = [
  "about",
  "phone",
  "tablet",
  "watch",
  "contact",
  "phone",
  "about",
] as const;

function createMailto(subject: string, body: string) {
  return `mailto:contact@samestudio.kr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function ArchiveQuote({ eyebrow, children }: { eyebrow: string; children: string }) {
  return (
    <blockquote className="terms-quote">
      <span>{eyebrow}</span>
      <p>{children}</p>
    </blockquote>
  );
}

export function TermsArchive() {
  const { locale } = useI18n();
  const messages = TERMS_MESSAGES[locale];
  const [activeSection, setActiveSection] = useState("using-service");
  const [revealedSections, setRevealedSections] = useState<Set<string>>(
    () => new Set(),
  );
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);
    return () => mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-terms-section]"),
    );
    const revealObserver = new IntersectionObserver(
      (entries) => {
        const newlyVisible = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target.id);
        if (!newlyVisible.length) return;
        setRevealedSections((current) => {
          const next = new Set(current);
          newlyVisible.forEach((id) => next.add(id));
          return next;
        });
      },
      { rootMargin: "0px 0px -12%", threshold: 0.16 },
    );

    const navigationObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-24% 0px -62%", threshold: 0 },
    );

    sections.forEach((section) => {
      revealObserver.observe(section);
      navigationObserver.observe(section);
    });

    return () => {
      revealObserver.disconnect();
      navigationObserver.disconnect();
    };
  }, [reducedMotion]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  const supportMailto = createMailto(
    messages.actions.emailSubject,
    messages.actions.emailBody,
  );

  return (
    <article
      className="archive-document legal-archive-document terms-document"
      aria-labelledby="terms-title"
    >
      <CosmicInteractionLayer reducedMotion={reducedMotion} />

      <header className="terms-hero">
        <SectionCosmos variant="hero" />
        <div className="terms-hero-content">
          <div className="terms-kicker" aria-label={messages.hero.archiveAriaLabel}>
            <span>02</span>
            <span>{messages.hero.label}</span>
            <i aria-hidden="true" />
          </div>
          <h1 id="terms-title">{messages.hero.title}</h1>
          <p className="terms-hero-description">
            {messages.hero.description.split("\n").map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
          <p className="terms-updated">{messages.hero.updated}</p>
        </div>
      </header>

      <section className="terms-summary" aria-label={messages.summary.ariaLabel}>
        {messages.summary.items.map((item, index) => (
          <article className="terms-summary-card" key={item.label}>
            <span className="terms-summary-index">0{index + 1}</span>
            <p className="terms-summary-label">{item.label}</p>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <div className="terms-archive-layout">
        <nav className="terms-contents" aria-label={messages.contents.navigationLabel}>
          <p>{messages.contents.label}</p>
          <div className="terms-contents-list">
            {messages.sections.map((section) => (
              <button
                type="button"
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                aria-current={activeSection === section.id ? "location" : undefined}
              >
                <span>{section.number}</span>
                {section.title}
              </button>
            ))}
          </div>
        </nav>

        <div className="terms-route" aria-label={messages.contents.detailLabel}>
          {messages.sections.map((section, index) => {
            const isRevealed = reducedMotion || revealedSections.has(section.id);
            return (
              <div className="terms-route-unit" key={section.id}>
                <section
                  id={section.id}
                  className={`terms-section${isRevealed ? " is-revealed" : ""}`}
                  data-terms-section=""
                  aria-labelledby={`${section.id}-title`}
                >
                  <span className="terms-route-node" aria-hidden="true" />
                  <div className="terms-card">
                    <SectionCosmos variant={COSMOS_VARIANTS[index]} />
                    <div className="terms-card-content">
                      <div className="terms-card-heading">
                        <span>{section.number}</span>
                        <p>{section.eyebrow}</p>
                        <i aria-hidden="true" />
                      </div>
                      <h2 id={`${section.id}-title`}>{section.title}</h2>
                      <div className="terms-copy">
                        {section.paragraphs.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                      {section.id === "privacy" ? (
                        <InternalTransitionLink
                          className="terms-inline-action"
                          href="/privacy/"
                          aria-label={messages.actions.privacyPolicyAriaLabel}
                        >
                          {messages.actions.privacyPolicy}
                        </InternalTransitionLink>
                      ) : null}
                      {section.id === "contact" ? (
                        <a
                          className="terms-inline-action"
                          href={supportMailto}
                          aria-label={messages.actions.emailSupportAriaLabel}
                        >
                          {messages.actions.emailSupport}
                        </a>
                      ) : null}
                    </div>
                  </div>
                </section>

                {index < messages.sections.length - 1 ? (
                  <svg
                    className={`terms-connector${isRevealed ? " is-drawn" : ""}`}
                    viewBox="0 0 220 150"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      pathLength="1"
                      d={index % 2 === 0 ? "M18 0 C18 75 202 72 202 150" : "M202 0 C202 78 18 72 18 150"}
                    />
                  </svg>
                ) : null}

                {index === 1 ? (
                  <ArchiveQuote eyebrow={messages.quotes[0].eyebrow}>
                    {messages.quotes[0].text}
                  </ArchiveQuote>
                ) : null}
                {index === 4 ? (
                  <ArchiveQuote eyebrow={messages.quotes[1].eyebrow}>
                    {messages.quotes[1].text}
                  </ArchiveQuote>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <InternalTransitionLink
        className="archive-back terms-back"
        href="/"
        aria-label={messages.actions.backAriaLabel}
      >
        {messages.actions.back}
      </InternalTransitionLink>
    </article>
  );
}
