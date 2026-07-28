import type { Metadata, Viewport } from "next";
import { FontSizeProvider } from "./accessibility/FontSizeProvider";
import { FONT_SIZE_STORAGE_KEY } from "./accessibility/types";
import { BackgroundAudioProvider } from "./audio/BackgroundAudioProvider";
import { SeoLocaleSync } from "./components/SeoLocaleSync";
import { I18nProvider } from "./i18n/I18nProvider";
import { createPageMetadata, ROOT_METADATA } from "./lib/seo";
import { PageTransitionProvider } from "./navigation/PageTransitionProvider";
import { ThemeProvider } from "./theme/ThemeProvider";
import { THEME_STORAGE_KEY } from "./theme/types";
import "./globals.css";

const themeInitializationScript = `
  (() => {
    const storageKey = ${JSON.stringify(THEME_STORAGE_KEY)};
    let theme = "dark";
    try {
      const storedTheme = window.localStorage.getItem(storageKey);
      if (storedTheme === "light" || storedTheme === "dark") {
        theme = storedTheme;
      }
    } catch {}

    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;

    const themeColor = document.querySelector('meta[name="theme-color"]');
    themeColor?.setAttribute(
      "content",
      theme === "dark" ? "#191522" : "#f3eeff",
    );
  })();
`;

const fontSizeInitializationScript = `
  (() => {
    const storageKey = ${JSON.stringify(FONT_SIZE_STORAGE_KEY)};
    let fontSize = "medium";
    try {
      const storedFontSize = window.localStorage.getItem(storageKey);
      if (["small", "medium", "large"].includes(storedFontSize)) {
        fontSize = storedFontSize;
      } else if (storedFontSize !== null) {
        window.localStorage.setItem(storageKey, fontSize);
      }
    } catch {}

    document.documentElement.dataset.fontSize = fontSize;
  })();
`;

export const metadata: Metadata = {
  ...ROOT_METADATA,
  ...createPageMetadata("home"),
};

export const viewport: Viewport = {
  themeColor: "#191522",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
        <script
          dangerouslySetInnerHTML={{ __html: fontSizeInitializationScript }}
        />
      </head>
      <body>
        <BackgroundAudioProvider>
          <PageTransitionProvider>
            <ThemeProvider>
              <FontSizeProvider>
                <I18nProvider>
                  <SeoLocaleSync />
                  {children}
                </I18nProvider>
              </FontSizeProvider>
            </ThemeProvider>
          </PageTransitionProvider>
        </BackgroundAudioProvider>
      </body>
    </html>
  );
}
