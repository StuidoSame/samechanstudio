"use client";

import { useI18n } from "../i18n/I18nProvider";

export function SupportHero() {
  const { messages } = useI18n();
  const { hero } = messages.support;

  return (
    <div className="support-hero">
      <div className="support-hero-label">
        <span className="support-hero-index">01</span>
        <span>{hero.label}</span>
        <span className="support-hero-line" aria-hidden="true" />
      </div>
      <h1 id="archive-title">{hero.title}</h1>
      <p className="support-hero-description">{hero.description}</p>
      <span className="support-hero-decoration" aria-hidden="true">
        <i className="support-hero-orbit" />
        <i className="support-hero-star support-hero-star--one" />
        <i className="support-hero-star support-hero-star--two" />
        <i className="support-hero-star support-hero-star--three" />
      </span>
    </div>
  );
}
