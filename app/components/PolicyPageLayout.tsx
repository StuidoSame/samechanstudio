"use client";

import { useEffect, type ReactNode } from "react";
import { SiteFooter, type FooterPage } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import type { ArchiveDocumentTitle } from "./archive/ArchivePortalTransition";
import "../policy-pages.css";

type PolicyPageLayoutProps = {
  page: Exclude<FooterPage, "home">;
  title: ArchiveDocumentTitle;
  children: ReactNode;
};

export function PolicyPageLayout({
  page,
  title,
  children,
}: PolicyPageLayoutProps) {
  useEffect(() => {
    document.body.classList.add("archive-page");
    document.body.dataset.archiveDocument = page;
    return () => {
      document.body.classList.remove("archive-page");
      delete document.body.dataset.archiveDocument;
    };
  }, [page]);

  return (
    <>
      <div className="archive-space" aria-hidden="true">
        <i className="archive-star archive-star-1" /><i className="archive-star archive-star-2 is-diamond" /><i className="archive-star archive-star-3" /><i className="archive-star archive-star-4" /><i className="archive-star archive-star-5 is-diamond" /><i className="archive-star archive-star-6" /><i className="archive-star archive-star-7" /><i className="archive-star archive-star-8" /><i className="archive-star archive-star-9 is-diamond" /><i className="archive-star archive-star-10" />
        <span className="archive-orb archive-orb-one" />
        <span className="archive-orb archive-orb-two" />
        <svg className="archive-constellation" viewBox="0 0 230 120" fill="none"><path d="M7 94 48 61l39 12 39-47 42 22 53-39" /><circle cx="7" cy="94" r="2.5" /><circle cx="48" cy="61" r="2.5" /><circle cx="87" cy="73" r="2.5" /><circle cx="126" cy="26" r="2.5" /><circle cx="168" cy="48" r="2.5" /><circle cx="221" cy="9" r="2.5" /></svg>
      </div>
      <div className="archive-arrival" aria-hidden="true"><span className="archive-portal-surface" /></div>
      <div className="archive-shell policy-page-layout">
        <SiteHeader selectedArchiveTitle={title} />
        <main className="archive-main policy-page-content">{children}</main>
        <SiteFooter currentPage={page} />
      </div>
    </>
  );
}
