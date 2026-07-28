"use client";

import Image from "next/image";
import { useI18n } from "../i18n/I18nProvider";
import { apps } from "../lib/apps";
import { SEO_CONTENT } from "../lib/seo";

export function AppCatalog() {
  const { locale } = useI18n();
  const content = SEO_CONTENT[locale].home;

  return (
    <section className="app-catalog" aria-labelledby="apps-catalog-title">
      <div className="app-catalog-heading">
        <span aria-hidden="true">01 · APP COLLECTION</span>
        <h2 id="apps-catalog-title">{content.appsHeading}</h2>
      </div>
      <div className="app-catalog-grid">
        {apps.map((app) => (
          <article
            className="app-catalog-card"
            id={`app-${app.id}`}
            key={app.id}
            aria-labelledby={`app-${app.id}-title`}
          >
            <Image
              className="app-catalog-icon"
              src={app.icon}
              alt={`${app.name} app icon`}
              width={76}
              height={76}
              loading="lazy"
              unoptimized
            />
            <div className="app-catalog-copy">
              <h3 id={`app-${app.id}-title`}>{app.name}</h3>
              <p>{content.appDescriptions[app.id]}</p>
              <span className="app-catalog-platforms">{app.platforms}</span>
              <div className="app-catalog-links">
                {app.appStoreUrl && (
                  <a href={app.appStoreUrl} target="_blank" rel="noopener noreferrer">
                    {app.name} — {content.appStoreLabel}
                  </a>
                )}
                {app.googlePlayUrl && (
                  <a href={app.googlePlayUrl} target="_blank" rel="noopener noreferrer">
                    {app.name} — {content.googlePlayLabel}
                  </a>
                )}
                {!app.appStoreUrl && !app.googlePlayUrl && (
                  <span>{content.comingSoonLabel}</span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
