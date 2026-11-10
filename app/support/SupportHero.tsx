"use client";

import { useI18n } from "../i18n/I18nProvider";
import { ArchiveHeroScene } from "../components/archive/ArchiveHeroScene";

export function SupportHero() {
  const { messages } = useI18n();
  const { hero } = messages.support;

  return (
    <header className="support-hero cosmic-archive-hero">
      <ArchiveHeroScene />
      <div className="archive-hero-copy">
        <div className="support-hero-label">
          <span className="support-hero-index">01</span>
          <span>{hero.label}</span>
          <span className="support-hero-line" aria-hidden="true" />
        </div>
        <h1 id="archive-title">{hero.title}</h1>
        <p className="support-hero-description">{hero.description}</p>
      </div>
    </header>
  );
}
