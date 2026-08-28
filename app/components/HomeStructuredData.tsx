import { apps } from "../lib/apps";
import {
  absoluteUrl,
  SEO_CONTENT,
  SITE_NAME,
  SITE_URL,
} from "../lib/seo";

const organizationId = `${SITE_URL}/#organization`;
const websiteId = `${SITE_URL}/#website`;

const graph = [
  {
    "@type": "Organization",
    "@id": organizationId,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/assets/favicon/favicon.ico"),
    sameAs: [
      "https://github.com/StuidoSame",
      "https://x.com/samechan0412",
      "https://www.instagram.com/do.ob0909",
      "https://www.threads.com/@do.ob0909?hl=ko",
    ],
  },
  {
    "@type": "WebSite",
    "@id": websiteId,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: ["ko", "en", "ja", "zh-CN", "zh-TW"],
    publisher: { "@id": organizationId },
  },
  ...apps
    .filter((app) => app.appStoreUrl || app.googlePlayUrl)
    .map((app) => ({
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software-${app.id}`,
      name: app.name,
      applicationCategory: "LifestyleApplication",
      operatingSystem: app.platforms
        .map((platform) => (platform === "apple" ? "iOS" : "Android"))
        .join(", "),
      description: SEO_CONTENT.ko.home.appDescriptions[app.id],
      url: `${SITE_URL}/#app-${app.id}`,
      downloadUrl: app.appStoreUrl ?? app.googlePlayUrl,
      image: absoluteUrl(app.icon),
      sameAs: [app.appStoreUrl, app.googlePlayUrl].filter(Boolean),
      author: { "@id": organizationId },
    })),
];

export function HomeStructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": graph,
        }).replaceAll("<", "\\u003c"),
      }}
    />
  );
}
