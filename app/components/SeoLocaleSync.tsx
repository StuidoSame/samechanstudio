"use client";

import { useEffect } from "react";
import { useI18n } from "../i18n/I18nProvider";
import {
  getCanonicalUrl,
  getOpenGraphLocale,
  getPageSeo,
  getSeoPageFromPathname,
  SITE_NAME,
} from "../lib/seo";

function setMetaContent(selector: string, content: string) {
  document.querySelector<HTMLMetaElement>(selector)?.setAttribute("content", content);
}

export function SeoLocaleSync() {
  const { locale } = useI18n();

  useEffect(() => {
    const page = getSeoPageFromPathname(window.location.pathname);
    const content = getPageSeo(page, locale);
    const canonical = getCanonicalUrl(page);

    document.title = content.title;
    setMetaContent('meta[name="description"]', content.description);
    setMetaContent('meta[property="og:title"]', content.title);
    setMetaContent('meta[property="og:description"]', content.description);
    setMetaContent('meta[property="og:url"]', canonical);
    setMetaContent('meta[property="og:site_name"]', SITE_NAME);
    setMetaContent('meta[property="og:locale"]', getOpenGraphLocale(locale));
    setMetaContent('meta[name="twitter:title"]', content.title);
    setMetaContent('meta[name="twitter:description"]', content.description);
  }, [locale]);

  return null;
}
