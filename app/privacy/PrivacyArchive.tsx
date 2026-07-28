"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CosmicInteractionLayer } from "../components/CosmicInteractionLayer";
import { SectionCosmos } from "../components/SectionCosmos";
import { useI18n } from "../i18n/I18nProvider";
import { usePageTransition } from "../navigation/PageTransitionProvider";
import { PRIVACY_MESSAGES } from "./privacyMessages";

const COSMOS_VARIANTS = [
  "about",
  "phone",
  "tablet",
  "watch",
  "contact",
  "phone",
  "about",
  "contact",
] as const;

function createMailto(subject: string, body: string) {
  return `mailto:contact@samestudio.kr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function PrivacyArchive() {
  const { locale } = useI18n();
  const { navigateWithTransition } = usePageTransition();
  const messages = PRIVACY_MESSAGES[locale];
  const [activeSection, setActiveSection] = useState("information");
  const [revealedSections, setRevealedSections] = useState<Set<string>>(
    () => new Set(),
  );
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-privacy-section]"),
    );

    const revealObserver = new IntersectionObserver(
      (entries) => {
        const visibleIds = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target.id);
        if (!visibleIds.length) return;
        setRevealedSections((current) => {
          const next = new Set(current);
          visibleIds.forEach((id) => next.add(id));
          return next;
        });
        entries.forEach((entry) => {
          if (entry.isIntersecting) revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10%", threshold: 0.12 },
    );

    let scrollFrame = 0;
    const updateActiveSection = () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = 0;
        const activationLine = Math.max(124, window.innerHeight * 0.24);
        const currentSection = [...sections]
          .reverse()
          .find((section) => section.getBoundingClientRect().top <= activationLine);
        setActiveSection((current) =>
          currentSection && currentSection.id !== current
            ? currentSection.id
            : current,
        );
      });
    };

    sections.forEach((section) => {
      if (!reducedMotion) revealObserver.observe(section);
    });
    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      revealObserver.disconnect();
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
    };
  }, [locale, reducedMotion]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  const deletionMailto = createMailto(
    messages.deletion.subject,
    messages.deletion.body,
  );
  const contactMailto = createMailto(messages.contact.subject, "");

  return (
    <article
      className="archive-document privacy-document"
      aria-labelledby="privacy-title"
    >
      <CosmicInteractionLayer reducedMotion={reducedMotion} />

      <header className="privacy-hero">
        <SectionCosmos variant="hero" />
        <div className="privacy-hero-glow" aria-hidden="true" />
        <div className="privacy-hero-content">
          <div className="privacy-kicker" aria-label="Privacy archive section 03">
            <span>03</span>
            <span>{messages.hero.label}</span>
            <i aria-hidden="true" />
          </div>
          <h1 id="privacy-title">{messages.hero.title}</h1>
          <p className="privacy-hero-description">
            {messages.hero.description.split("\n").map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
          <p className="privacy-updated">{messages.hero.updated}</p>
        </div>
      </header>

      <section className="privacy-summary" aria-label={messages.contents.navigationLabel}>
        {messages.summary.map((item, index) => (
          <article className="privacy-summary-card" key={item.label}>
            <span className="privacy-summary-index">0{index + 1}</span>
            <p className="privacy-summary-label">{item.label}</p>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <div className="privacy-mobile-contents">
        <label htmlFor="privacy-section-select">{messages.contents.label}</label>
        <select
          id="privacy-section-select"
          value={activeSection}
          onChange={(event) => scrollToSection(event.target.value)}
          aria-label={messages.contents.mobileLabel}
        >
          {messages.sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.number} · {section.title}
            </option>
          ))}
        </select>
      </div>

      <div className="privacy-archive-layout">
        <nav className="privacy-contents" aria-label={messages.contents.navigationLabel}>
          <p>{messages.contents.label}</p>
          <div className="privacy-contents-list">
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

        <div className="privacy-route">
          {messages.sections.map((section, index) => {
            const isRevealed = reducedMotion || revealedSections.has(section.id);
            return (
              <div className="privacy-route-unit" key={section.id}>
                <section
                  id={section.id}
                  className={`privacy-section${isRevealed ? " is-revealed" : ""}`}
                  data-privacy-section=""
                  aria-labelledby={`${section.id}-title`}
                >
                  <span className="privacy-route-node" aria-hidden="true" />
                  <div className="privacy-card">
                    <SectionCosmos variant={COSMOS_VARIANTS[index]} />
                    <div className="privacy-card-content">
                      <div className="privacy-card-heading">
                        <span>{section.number}</span>
                        <p>{section.eyebrow}</p>
                        <i aria-hidden="true" />
                      </div>
                      <h2 id={`${section.id}-title`}>{section.title}</h2>
                      <p className="privacy-intro">{section.intro}</p>

                      {section.items ? (
                        <div className="privacy-item-grid">
                          {section.items.map((item) => (
                            <article className="privacy-item" key={`${section.id}-${item.label}`}>
                              <p>{item.label}</p>
                              <h3>{item.title}</h3>
                              <div>{item.text}</div>
                            </article>
                          ))}
                        </div>
                      ) : null}

                      {section.paragraphs ? (
                        <div className="privacy-copy">
                          {section.paragraphs.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                          ))}
                        </div>
                      ) : null}

                      {section.id === "storage" ? (
                        <a
                          className="privacy-deletion-link"
                          href={deletionMailto}
                          aria-label={messages.deletion.ariaLabel}
                        >
                          {messages.deletion.label}
                        </a>
                      ) : null}

                      {section.id === "rights" ? (
                        <ol className="privacy-rights-list">
                          {messages.rights.map((right, rightIndex) => (
                            <li key={right}>
                              <span>{String(rightIndex + 1).padStart(2, "0")}</span>
                              {right}
                            </li>
                          ))}
                        </ol>
                      ) : null}

                      {section.id === "contact" ? (
                        <div className="privacy-contact-panel">
                          <h3>{messages.contact.heading}</h3>
                          <dl>
                            <div><dt>{messages.contact.businessLabel}</dt><dd>{messages.contact.business}</dd></div>
                            <div><dt>{messages.contact.representativeLabel}</dt><dd>{messages.contact.representative}</dd></div>
                            <div><dt>{messages.contact.emailLabel}</dt><dd><a href={contactMailto} aria-label={messages.contact.emailAriaLabel}>contact@samestudio.kr</a></dd></div>
                            <div><dt>{messages.contact.websiteLabel}</dt><dd><Link href="/">samestudio.kr</Link></dd></div>
                          </dl>
                          <a className="privacy-contact-button" href={contactMailto} aria-label={messages.contact.buttonAriaLabel}>
                            {messages.contact.button}
                          </a>
                          <p>{messages.contact.changeNotice}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </section>

                {index < messages.sections.length - 1 ? (
                  <svg
                    className={`privacy-connector${isRevealed ? " is-drawn" : ""}`}
                    viewBox="0 0 220 148"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      pathLength="1"
                      d={index % 2 === 0 ? "M20 0 C20 72 200 74 200 148" : "M200 0 C200 74 20 72 20 148"}
                    />
                  </svg>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <Link
        className="archive-back privacy-back"
        href="/"
        onClick={(event) => navigateWithTransition(event, "/")}
      >
        BACK
      </Link>
    </article>
  );
}
