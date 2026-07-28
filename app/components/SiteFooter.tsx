"use client";

import { useI18n } from "../i18n/I18nProvider";
import { InternalTransitionLink } from "../navigation/InternalTransitionLink";

const FOOTER_BUSINESS_VALUES = {
  businessName: "세임스튜디오 (SAME STUDIO)",
  registrationNumber: "272-08-03608",
  email: "contact@samestudio.kr",
} as const;

const FOOTER_NAVIGATION = [
  { id: "support", label: "SUPPORT", href: "/support/" },
  { id: "home", label: "HOME", href: "/" },
  { id: "privacy", label: "PRIVACY", href: "/privacy/" },
  { id: "terms", label: "TERMS", href: "/terms/" },
  { id: "delete-account", label: "DELETE ACCOUNT", href: "/delete-account/" },
] as const;

export type FooterPage = (typeof FOOTER_NAVIGATION)[number]["id"];

function SocialIcon({
  platform,
}: {
  platform: "github" | "x" | "instagram" | "threads";
}) {
  if (platform === "github") {
    return <svg className="footer-social-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.76-.24.76-.54v-2.08c-3.1.67-3.76-1.32-3.76-1.32-.5-1.3-1.24-1.64-1.24-1.64-1.02-.7.08-.69.08-.69 1.12.08 1.72 1.16 1.72 1.16 1 1.71 2.62 1.22 3.26.93.1-.73.39-1.22.71-1.5-2.48-.28-5.08-1.24-5.08-5.52 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.1-2.96 0 0 .94-.3 3.08 1.15a10.6 10.6 0 0 1 5.6 0c2.14-1.45 3.08-1.15 3.08-1.15.6 1.54.22 2.68.1 2.96.72.78 1.15 1.78 1.15 3 0 4.29-2.61 5.24-5.1 5.52.4.35.76 1.03.76 2.08v3.06c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8z" /></svg>;
  }
  if (platform === "x") {
    return <svg className="footer-social-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14.27 10.16 22.65 0h-1.99l-7.28 8.82L7.57 0H.86l8.79 13.1L.86 23.76h1.99l7.68-9.31 6.13 9.31h6.71l-9.1-13.6Zm-2.72 3.3-.89-1.31L3.57 1.53h3.05l5.72 8.56.89 1.31 7.44 10.94h-3.05l-6.07-8.88Z" /></svg>;
  }
  if (platform === "instagram") {
    return <svg className="footer-social-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7.3 2h9.4A5.3 5.3 0 0 1 22 7.3v9.4a5.3 5.3 0 0 1-5.3 5.3H7.3A5.3 5.3 0 0 1 2 16.7V7.3A5.3 5.3 0 0 1 7.3 2Zm0 2A3.3 3.3 0 0 0 4 7.3v9.4A3.3 3.3 0 0 0 7.3 20h9.4a3.3 3.3 0 0 0 3.3-3.3V7.3A3.3 3.3 0 0 0 16.7 4H7.3Zm4.7 3.4a4.6 4.6 0 1 1 0 9.2 4.6 4.6 0 0 1 0-9.2Zm0 2a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2Zm5-2.65a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z" /></svg>;
  }
  return <svg className="footer-social-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.263 11.097c-.03-3.486-1.92-5.586-5.111-5.586-2.13 0-3.922.963-4.863 2.499l2.062 1.438c.535-.843 1.272-1.543 2.628-1.543 1.528 0 2.318.85 2.544 2.431a15 15 0 0 0-2.236-.173c-4.125 0-6.068 1.867-6.068 4.336s1.943 3.99 4.804 3.99c3.139 0 5.013-2.115 5.781-4.735.798.361 1.348 1.204 1.348 2.47 0 3.387-3.907 5.232-7.22 5.232-4.885 0-8.077-3.207-8.077-8.424 0-6.392 4.223-10.487 9.9-10.487 3.808 0 5.69 1.671 6.97 3.914l2.108-1.475C21.44 2.078 18.331 0 13.663 0 6.227 0 1.168 5.277 1.168 12.934c0 7 4.953 11.066 10.856 11.066 4.878 0 9.809-2.846 9.809-7.716 0-2.545-1.46-4.231-3.569-5.187m-6.33 4.855c-1.077 0-2.026-.512-2.026-1.453 0-1.483 1.822-1.934 3.606-1.934.678 0 1.34.045 1.927.173-.422 1.927-1.671 3.215-3.508 3.214Z" /></svg>;
}

export function SiteFooter({ currentPage = "home" }: { currentPage?: FooterPage }) {
  const { locale, messages } = useI18n();

  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-social" aria-label="SAME STUDIO social links">
          <a href="https://github.com/StuidoSame" target="_blank" rel="noopener noreferrer" aria-label="SAME STUDIO GitHub"><SocialIcon platform="github" /></a>
          <a href="https://x.com/samechan0412" target="_blank" rel="noopener noreferrer" aria-label="SAME STUDIO X"><SocialIcon platform="x" /></a>
          <a href="https://www.instagram.com/do.ob0909" target="_blank" rel="noopener noreferrer" aria-label="SAME STUDIO Instagram"><SocialIcon platform="instagram" /></a>
          <a href="https://www.threads.com/@do.ob0909?hl=ko" target="_blank" rel="noopener noreferrer" aria-label="SAME STUDIO Threads"><SocialIcon platform="threads" /></a>
        </div>
        <p className="footer-copyright">© 2026 SAME STUDIO</p>
        <div className="footer-business">
          <span className="footer-business-row" key={`${locale}-business-name`}><span className="footer-business-label">{messages.footer.businessNameLabel}:</span><span className="footer-business-value">{FOOTER_BUSINESS_VALUES.businessName}</span></span>
          <span className="footer-business-row" key={`${locale}-registration-number`}><span className="footer-business-label">{messages.footer.businessRegistrationLabel}:</span><span className="footer-business-value" lang="en">{FOOTER_BUSINESS_VALUES.registrationNumber}</span></span>
          <span className="footer-business-row" key={`${locale}-representative`}><span className="footer-business-label">{messages.footer.representativeLabel}:</span><span className="footer-business-value footer-owner-value"><span className="footer-owner-name-ko">김동찬</span>{" "}<span className="footer-owner-name-en" lang="en">KIM DONGCHAN</span></span></span>
          <span className="footer-business-row" key={`${locale}-email`}><span className="footer-business-label">{messages.footer.emailLabel}:</span><a className="footer-business-value" href={`mailto:${FOOTER_BUSINESS_VALUES.email}`} lang="en">{FOOTER_BUSINESS_VALUES.email}</a></span>
        </div>
        <nav className="footer-page-navigation" aria-label="Footer navigation">
          {FOOTER_NAVIGATION.map((item) => (
            <InternalTransitionLink
              key={item.id}
              href={item.href}
              aria-current={currentPage === item.id ? "page" : undefined}
            >
              {item.label}
            </InternalTransitionLink>
          ))}
        </nav>
      </div>
    </footer>
  );
}
