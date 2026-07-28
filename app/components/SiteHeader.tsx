"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useBackgroundAudio } from "../audio/BackgroundAudioProvider";
import { useI18n } from "../i18n/I18nProvider";
import type { Locale } from "../i18n/types";
import { useTheme } from "../theme/ThemeProvider";
import type { ArchiveDocumentTitle } from "./archive/ArchivePortalTransition";

const LANGUAGE_OPTIONS = [
  { code: "ko" },
  { code: "en" },
  { code: "ja" },
  { code: "zh-CN" },
  { code: "zh-TW" },
] as const satisfies readonly { code: Locale }[];

type WordmarkPulse = { key: number; fast: boolean };

type SiteHeaderProps = {
  homePage?: boolean;
  wordmarkPulse?: WordmarkPulse;
  reducedMotion?: boolean;
  selectedArchiveTitle?: ArchiveDocumentTitle;
  onMenuOpenChange?: (open: boolean) => void;
  onArchiveNavigate?: (
    event: ReactMouseEvent<HTMLAnchorElement>,
    documentTitle: ArchiveDocumentTitle,
    href: string,
  ) => void;
};

export function SiteHeader({
  homePage = false,
  wordmarkPulse = { key: 0, fast: false },
  reducedMotion = false,
  selectedArchiveTitle,
  onMenuOpenChange,
  onArchiveNavigate,
}: SiteHeaderProps) {
  const { locale, messages, setLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { muted: backgroundAudioMuted, toggleMuted: toggleBackgroundAudio } =
    useBackgroundAudio();
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [darkPressKey, setDarkPressKey] = useState(0);
  const [headerUtilityHidden, setHeaderUtilityHidden] = useState(false);
  const [headerUtilityDragging, setHeaderUtilityDragging] = useState(false);
  const [headerUtilityDragX, setHeaderUtilityDragX] = useState(0);
  const [headerUtilityHideDistance, setHeaderUtilityHideDistance] = useState(0);
  const [headerUtilityHintKey, setHeaderUtilityHintKey] = useState(0);
  const headerRef = useRef<HTMLElement>(null);
  const headerUtilityRef = useRef<HTMLDivElement>(null);
  const headerLanguageButtonRef = useRef<HTMLButtonElement>(null);
  const languagePanelRef = useRef<HTMLDivElement>(null);
  const languagePanelWasOpenRef = useRef(false);
  const headerUtilityHandleRef = useRef<HTMLButtonElement>(null);
  const headerUtilityWasHiddenRef = useRef(false);
  const headerUtilitySuppressClickRef = useRef(false);
  const headerUtilityDragRef = useRef({
    id: -1,
    startX: 0,
    startY: 0,
    distanceX: 0,
    horizontal: false,
  });

  useEffect(() => {
    onMenuOpenChange?.(menuOpen);
  }, [menuOpen, onMenuOpenChange]);

  useEffect(() => {
    if (!menuOpen && !languageOpen) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return;
      if (
        languageOpen &&
        !languagePanelRef.current?.contains(event.target) &&
        !headerLanguageButtonRef.current?.contains(event.target)
      ) {
        setLanguageOpen(false);
      }
      if (menuOpen && !headerRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      setLanguageOpen(false);
    };

    window.addEventListener("pointerdown", closeOnOutsidePointer);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closeOnOutsidePointer);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [languageOpen, menuOpen]);

  useEffect(() => {
    if (languageOpen) {
      languagePanelWasOpenRef.current = true;
      const focusTimer = window.setTimeout(() => {
        languagePanelRef.current
          ?.querySelector<HTMLButtonElement>(
            '[role="menuitemradio"][aria-checked="true"]',
          )
          ?.focus({ preventScroll: true });
      }, 0);
      return () => window.clearTimeout(focusTimer);
    }

    if (languagePanelWasOpenRef.current) {
      languagePanelWasOpenRef.current = false;
      headerLanguageButtonRef.current?.focus({ preventScroll: true });
    }
  }, [languageOpen]);

  useEffect(() => {
    if (!headerUtilityHidden || reducedMotion) return;
    let hintInterval: number | undefined;
    const firstHint = window.setTimeout(() => {
      setHeaderUtilityHintKey((key) => key + 1);
      hintInterval = window.setInterval(
        () => setHeaderUtilityHintKey((key) => key + 1),
        5500,
      );
    }, 1000);
    return () => {
      window.clearTimeout(firstHint);
      if (hintInterval !== undefined) window.clearInterval(hintInterval);
    };
  }, [headerUtilityHidden, reducedMotion]);

  useEffect(() => {
    if (headerUtilityHidden) {
      headerUtilityHandleRef.current?.focus({ preventScroll: true });
    } else if (headerUtilityWasHiddenRef.current) {
      headerLanguageButtonRef.current?.focus({ preventScroll: true });
    }
    headerUtilityWasHiddenRef.current = headerUtilityHidden;
  }, [headerUtilityHidden]);

  const onHeaderUtilityPointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (headerUtilityHidden || !event.isPrimary || event.button !== 0) return;
    const drag = headerUtilityDragRef.current;
    drag.id = event.pointerId;
    drag.startX = event.clientX;
    drag.startY = event.clientY;
    drag.distanceX = 0;
    drag.horizontal = false;
    headerUtilitySuppressClickRef.current = false;
  };

  const onHeaderUtilityPointerMove = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    const drag = headerUtilityDragRef.current;
    if (drag.id !== event.pointerId) return;
    const distanceX = Math.max(0, event.clientX - drag.startX);
    const distanceY = Math.abs(event.clientY - drag.startY);

    if (!drag.horizontal) {
      if (distanceY > 8 && distanceY > distanceX) {
        drag.id = -1;
        setHeaderUtilityDragging(false);
        setHeaderUtilityDragX(0);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        return;
      }
      if (distanceX < 8 || distanceX <= distanceY * 1.2) return;
      drag.horizontal = true;
      headerUtilitySuppressClickRef.current = true;
      setHeaderUtilityDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    drag.distanceX = distanceX;
    setHeaderUtilityDragX(distanceX);
  };

  const finishHeaderUtilityDrag = (
    event: ReactPointerEvent<HTMLDivElement>,
    cancelled = false,
  ) => {
    const drag = headerUtilityDragRef.current;
    if (drag.id !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const threshold = window.matchMedia("(max-width: 767px)").matches ? 40 : 55;
    if (!cancelled && drag.horizontal && drag.distanceX >= threshold) {
      const rect = headerUtilityRef.current?.getBoundingClientRect();
      setHeaderUtilityHideDistance(
        rect ? Math.max(window.innerWidth - rect.left + 24, 0) : window.innerWidth,
      );
      setLanguageOpen(false);
      setHeaderUtilityHidden(true);
    }
    drag.id = -1;
    drag.distanceX = 0;
    drag.horizontal = false;
    setHeaderUtilityDragging(false);
    setHeaderUtilityDragX(0);
    window.setTimeout(() => {
      headerUtilitySuppressClickRef.current = false;
    }, 0);
  };

  const headerUtilityStyle = {
    "--header-utility-drag-x": `${headerUtilityDragX * 0.75}px`,
    "--header-utility-drag-opacity": String(
      1 - Math.min(headerUtilityDragX / 200, 0.35),
    ),
    "--header-utility-drag-scale": String(
      1 - Math.min(headerUtilityDragX / 2500, 0.02),
    ),
    "--header-utility-hide-x": `${headerUtilityHideDistance}px`,
  } as CSSProperties;

  const closeMenus = () => {
    setMenuOpen(false);
    setLanguageOpen(false);
  };
  const sectionPrefix = homePage ? "" : "/";
  const archiveLinks = [
    { title: "SUPPORT" as const, href: "/support" },
    { title: "TERMS" as const, href: "/terms" },
    { title: "PRIVACY" as const, href: "/privacy" },
  ];

  return (
    <header className="site-header" ref={headerRef}>
      <Link
        href={homePage ? "#apps" : "/"}
        className="wordmark"
        aria-label="SAME STUDIO home"
      >
        <span className="wordmark-hover-layer">
          <span
            key={wordmarkPulse.key}
            className={`wordmark-change-layer${
              wordmarkPulse.key > 0 ? " is-changing" : ""
            }${wordmarkPulse.fast ? " is-fast-forward" : ""}`}
            data-pulse-key={wordmarkPulse.key}
          >
            SAME STUDIO
          </span>
        </span>
      </Link>
      <div
        ref={headerUtilityRef}
        className={`header-utility${headerUtilityDragging ? " is-dragging" : ""}${
          headerUtilityHidden ? " is-hidden" : ""
        }`}
        style={headerUtilityStyle}
        aria-hidden={headerUtilityHidden}
        inert={headerUtilityHidden ? true : undefined}
        onPointerDown={onHeaderUtilityPointerDown}
        onPointerMove={onHeaderUtilityPointerMove}
        onPointerUp={(event) => finishHeaderUtilityDrag(event)}
        onPointerCancel={(event) => finishHeaderUtilityDrag(event, true)}
        onClickCapture={(event) => {
          if (!headerUtilitySuppressClickRef.current) return;
          event.preventDefault();
          event.stopPropagation();
          headerUtilitySuppressClickRef.current = false;
        }}
      >
        <div className="header-utility-bar" aria-label={messages.header.controlsLabel}>
          <button
            ref={headerLanguageButtonRef}
            type="button"
            className="header-utility-segment language-control"
            aria-label={messages.header.languageButtonLabel}
            aria-expanded={languageOpen}
            aria-controls="language-panel"
            aria-haspopup="menu"
            tabIndex={headerUtilityHidden ? -1 : 0}
            onClick={() => {
              setMenuOpen(false);
              setLanguageOpen((open) => !open);
            }}
          >
            <svg className="language-control-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3.6 9h16.8M3.6 15h16.8M12 3c2.15 2.35 3.25 5.35 3.25 9S14.15 18.65 12 21M12 3c-2.15 2.35-3.25 5.35-3.25 9S9.85 18.65 12 21" /></svg>
            <span>LANG</span>
          </button>
          <span className="header-utility-divider" aria-hidden="true" />
          <button
            type="button"
            className="header-utility-segment dark-control"
            aria-label={theme === "dark" ? messages.header.switchToLightMode : messages.header.switchToDarkMode}
            aria-pressed={theme === "dark"}
            tabIndex={headerUtilityHidden ? -1 : 0}
            onClick={() => {
              setLanguageOpen(false);
              toggleTheme();
              setDarkPressKey((key) => key + 1);
            }}
          >
            <span key={`${theme}-${darkPressKey}`} className={`dark-control-icon${darkPressKey > 0 ? " is-pressing" : ""}`} aria-hidden="true">
              {theme === "dark" ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3.6" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" /></svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.1 15.25A8.25 8.25 0 0 1 8.75 3.9 8.25 8.25 0 1 0 20.1 15.25Z" /></svg>
              )}
            </span>
          </button>
          <span className="header-utility-divider" aria-hidden="true" />
          <button
            type="button"
            className="header-utility-segment audio-control"
            aria-label={backgroundAudioMuted ? messages.header.turnBackgroundMusicOn : messages.header.turnBackgroundMusicOff}
            aria-pressed={!backgroundAudioMuted}
            title={backgroundAudioMuted ? messages.header.turnBackgroundMusicOn : messages.header.turnBackgroundMusicOff}
            tabIndex={headerUtilityHidden ? -1 : 0}
            onClick={() => {
              setLanguageOpen(false);
              toggleBackgroundAudio();
            }}
          >
            <span className="audio-control-icon" aria-hidden="true">
              {backgroundAudioMuted ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6.8 8.5H4.5v7h2.3L11 19V5Z" /><path d="m16 9 5 5M21 9l-5 5" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6.8 8.5H4.5v7h2.3L11 19V5Z" /><path d="M15.5 8.1a5.5 5.5 0 0 1 0 7.8M18.4 5.2a9.5 9.5 0 0 1 0 13.6" /></svg>
              )}
            </span>
          </button>
        </div>
      </div>
      <div
        ref={languagePanelRef}
        id="language-panel"
        className={`language-panel${languageOpen ? " is-open" : ""}`}
        role="menu"
        aria-label={messages.header.languageOptionsLabel}
        aria-hidden={!languageOpen}
        onKeyDown={(event) => {
          if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
          const options = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'));
          const currentIndex = options.indexOf(document.activeElement as HTMLButtonElement);
          const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : event.key === "ArrowDown" ? (currentIndex + 1) % options.length : (currentIndex - 1 + options.length) % options.length;
          event.preventDefault();
          options[nextIndex]?.focus({ preventScroll: true });
        }}
      >
        {LANGUAGE_OPTIONS.map((language) => (
          <button key={language.code} type="button" className="language-option" role="menuitemradio" aria-checked={locale === language.code} onClick={() => { setLocale(language.code); setLanguageOpen(false); }}>
            <span className="language-label">{messages.header.languageNames[language.code]}</span>
            <span className="language-selected-indicator" aria-hidden="true" />
          </button>
        ))}
      </div>
      <button
        ref={headerUtilityHandleRef}
        type="button"
        className={`header-utility-handle${headerUtilityHidden ? " is-visible" : ""}`}
        aria-label={messages.header.controlsButtonLabel}
        aria-hidden={!headerUtilityHidden}
        tabIndex={headerUtilityHidden ? 0 : -1}
        onClick={() => {
          setLanguageOpen(false);
          setHeaderUtilityDragX(0);
          setHeaderUtilityHidden(false);
        }}
      >
        <span key={headerUtilityHintKey} className={headerUtilityHintKey > 0 ? "is-hinting" : ""} aria-hidden="true">‹</span>
      </button>
      <nav id="site-menu" className={menuOpen ? "is-open" : ""} aria-label="Primary navigation">
        <Link href={`${sectionPrefix}#about`} onClick={closeMenus}>ABOUT</Link>
        <Link href={`${sectionPrefix}#apps`} onClick={closeMenus}>APPS</Link>
        <Link href={`${sectionPrefix}#contact`} onClick={closeMenus}>CONTACT</Link>
        {archiveLinks.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className={selectedArchiveTitle === item.title ? "is-archive-selected" : undefined}
            aria-current={selectedArchiveTitle === item.title ? "page" : undefined}
            onClick={(event) => {
              closeMenus();
              onArchiveNavigate?.(event, item.title, item.href);
            }}
          >
            {item.title}
          </Link>
        ))}
      </nav>
      <button
        type="button"
        className="menu-control"
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-controls="site-menu"
        onClick={() => {
          setLanguageOpen(false);
          setMenuOpen((open) => !open);
        }}
      >
        <span />
        <span />
      </button>
    </header>
  );
}
