"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { useI18n } from "../i18n/I18nProvider";

const SUPPORT_APPS = [
  { name: "EVRUNE", icon: "/assets/icons/evrune_icon.png" },
  { name: "Mapary", icon: "/assets/icons/Mapary_icon.png" },
  { name: "PINI", icon: "/assets/icons/pini_icon.png" },
  { name: "Pulto", icon: "/assets/icons/pulto_icon.png" },
  { name: "PEPESNAP", icon: "/assets/icons/pepsnap.png" },
  { name: "Tocklist", icon: "/assets/icons/tocklist_icon.png" },
  { name: "Skkoo", icon: "/assets/icons/skkoo_icon.png" },
  { name: "TeruBozu", icon: "/assets/icons/terubozu_icon.png" },
  { name: "WAESSEUM", icon: "/assets/icons/waesseum_icon.png" },
  { name: "Feeloo", icon: "/assets/icons/feeloo_icon.png" },
] as const;

type SupportAppName = (typeof SUPPORT_APPS)[number]["name"];

export function SupportContent() {
  const { messages, format } = useI18n();
  const support = messages.support;
  const [selectedApp, setSelectedApp] = useState<SupportAppName>("Mapary");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const appRailRef = useRef<HTMLDivElement>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const dragRef = useRef({
    pointerId: -1,
    startX: 0,
    startScrollLeft: 0,
    dragged: false,
  });
  const [dragging, setDragging] = useState(false);
  const [galleryOverflowing, setGalleryOverflowing] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const emailHref = useMemo(() => {
    const subject = encodeURIComponent(support.email.subject);
    const body = encodeURIComponent(
      format(support.email.body, { app: selectedApp }),
    );
    return `mailto:contact@samestudio.kr?subject=${subject}&body=${body}`;
  }, [format, selectedApp, support.email]);

  const openEmailSupport = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.location.href = emailHref;
  };

  const updateGalleryState = useCallback(() => {
    if (scrollFrameRef.current !== null) return;
    scrollFrameRef.current = window.requestAnimationFrame(() => {
      scrollFrameRef.current = null;
      const rail = appRailRef.current;
      if (!rail) return;
      const maxScrollLeft = Math.max(rail.scrollWidth - rail.clientWidth, 0);
      const overflowing = maxScrollLeft > 2;
      setGalleryOverflowing(overflowing);
      setCanScrollLeft(overflowing && rail.scrollLeft > 2);
      setCanScrollRight(
        overflowing && rail.scrollLeft < maxScrollLeft - 2,
      );
    });
  }, []);

  useEffect(() => {
    const rail = appRailRef.current;
    if (!rail) return;
    const observer = new ResizeObserver(updateGalleryState);
    observer.observe(rail);
    Array.from(rail.children).forEach((item) => observer.observe(item));
    updateGalleryState();

    return () => {
      observer.disconnect();
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = null;
      }
      const pointerId = dragRef.current.pointerId;
      if (pointerId >= 0 && rail.hasPointerCapture(pointerId)) {
        rail.releasePointerCapture(pointerId);
      }
    };
  }, [updateGalleryState]);

  const moveGalleryByPage = (direction: -1 | 1) => {
    const rail = appRailRef.current;
    if (!rail) return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    rail.scrollBy({
      left: rail.clientWidth * 0.7 * direction,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  const onGalleryKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    moveGalleryByPage(event.key === "ArrowLeft" ? -1 : 1);
  };

  const onGalleryWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    const rail = appRailRef.current;
    if (!rail || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    const movingRight = event.deltaY > 0;
    if (
      (movingRight && !canScrollRight) ||
      (!movingRight && !canScrollLeft)
    ) {
      return;
    }
    event.preventDefault();
    rail.scrollLeft += event.deltaY;
  };

  const startAppRailDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const rail = appRailRef.current;
    if (!rail || rail.scrollWidth <= rail.clientWidth + 2) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: rail.scrollLeft,
      dragged: false,
    };
    setDragging(true);
    rail.setPointerCapture(event.pointerId);
  };

  const moveAppRail = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rail = appRailRef.current;
    const drag = dragRef.current;
    if (!rail || drag.pointerId !== event.pointerId) return;
    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) > 5) drag.dragged = true;
    rail.scrollLeft = drag.startScrollLeft - distance;
  };

  const finishAppRailDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rail = appRailRef.current;
    if (dragRef.current.pointerId !== event.pointerId) return;
    if (rail?.hasPointerCapture(event.pointerId)) {
      rail.releasePointerCapture(event.pointerId);
    }
    dragRef.current.pointerId = -1;
    setDragging(false);
    updateGalleryState();
  };

  return (
    <div className="support-card-content">
      <section className="support-section support-contact-section" aria-labelledby="support-contact-title">
        <div className="support-section-heading">
          <span className="support-eyebrow-index">01</span>
          <h2 id="support-contact-title">{support.sections.contact}</h2>
          <span className="support-heading-line" aria-hidden="true" />
        </div>
        <div
          className={`support-app-gallery${galleryOverflowing ? " is-scrollable" : ""}`}
        >
          {galleryOverflowing && (
            <button
              type="button"
              className="support-app-arrow support-app-arrow--previous"
              aria-label={support.accessibility.previousApps}
              disabled={!canScrollLeft}
              onClick={() => moveGalleryByPage(-1)}
            >
              <span aria-hidden="true">‹</span>
            </button>
          )}
          <div
            ref={appRailRef}
            className={`support-app-rail${dragging ? " is-dragging" : ""}`}
            role="region"
            aria-label={support.accessibility.appGallery}
            tabIndex={0}
            onScroll={updateGalleryState}
            onKeyDown={onGalleryKeyDown}
            onWheel={onGalleryWheel}
            onPointerDown={startAppRailDrag}
            onPointerMove={moveAppRail}
            onPointerUp={finishAppRailDrag}
            onPointerCancel={finishAppRailDrag}
            onLostPointerCapture={finishAppRailDrag}
            onClickCapture={(event) => {
              if (!dragRef.current.dragged) return;
              event.preventDefault();
              event.stopPropagation();
              dragRef.current.dragged = false;
            }}
          >
            {SUPPORT_APPS.map((app) => (
              <button
                key={app.name}
                type="button"
                className="support-app-icon-button"
                aria-label={format(support.accessibility.selectApp, { app: app.name })}
                aria-pressed={selectedApp === app.name}
                onClick={() => setSelectedApp(app.name)}
              >
                <span className="support-app-icon-frame">
                  <Image
                    src={app.icon}
                    alt={format(support.accessibility.appIconAlt, { app: app.name })}
                    width={96}
                    height={96}
                    sizes="(max-width: 680px) 66px, 88px"
                    draggable={false}
                    unoptimized
                    onLoad={updateGalleryState}
                  />
                </span>
                <span className="support-app-icon-label">{app.name}</span>
              </button>
            ))}
          </div>
          {galleryOverflowing && (
            <button
              type="button"
              className="support-app-arrow support-app-arrow--next"
              aria-label={support.accessibility.nextApps}
              disabled={!canScrollRight}
              onClick={() => moveGalleryByPage(1)}
            >
              <span aria-hidden="true">›</span>
            </button>
          )}
        </div>
      </section>

      <section className="support-section support-form-section" aria-labelledby="support-form-title">
        <div className="support-section-heading">
          <span className="support-eyebrow-index">02</span>
          <h2 id="support-form-title">{support.sections.details}</h2>
          <span className="support-heading-line" aria-hidden="true" />
        </div>
        <div className="support-form-grid" aria-label={support.accessibility.form}>
          <div className="support-form-field">
            <span className="support-form-label">{support.fields.appName}</span>
            <strong className="support-form-selected">{selectedApp}</strong>
            <span className="support-form-example">{support.examples.appName}</span>
          </div>
          <div className="support-form-field">
            <span className="support-form-label">{support.fields.device}</span>
            <span className="support-form-example">{support.examples.device}</span>
          </div>
          <div className="support-form-field">
            <span className="support-form-label">{support.fields.osVersion}</span>
            <span className="support-form-example">{support.examples.osVersion}</span>
          </div>
          <div className="support-form-field support-form-field--message">
            <span className="support-form-label">{support.fields.message}</span>
            <span className="support-form-example">{support.examples.message}</span>
          </div>
        </div>
        <a
          className="support-email-cta"
          href={emailHref}
          aria-label={support.accessibility.emailSupport}
          onClick={openEmailSupport}
        >
          <span>{support.actions.emailSupport}</span>
          <span aria-hidden="true">→</span>
        </a>
        <a
          className="support-email-address"
          href={emailHref}
          aria-label={support.accessibility.emailAddress}
          onClick={openEmailSupport}
        >
          contact@samestudio.kr
        </a>
      </section>

      <aside className="support-response-card" aria-labelledby="support-response-title">
        <span className="support-response-dot" aria-hidden="true" />
        <div>
          <h2 id="support-response-title">{support.sections.responseTime}</h2>
          {support.responseLines.map((line) => <p key={line}>{line}</p>)}
        </div>
      </aside>

      <section className="support-section support-faq-section" aria-labelledby="support-faq-title">
        <div className="support-section-heading">
          <span className="support-eyebrow-index">03</span>
          <h2 id="support-faq-title">{support.sections.faq}</h2>
          <span className="support-heading-line" aria-hidden="true" />
        </div>
        <div className="support-faq-list">
          {support.faq.map((item, index) => {
            const open = openFaqIndex === index;
            const panelId = `support-faq-panel-${index}`;
            return (
              <div className="support-faq-item" key={item.question}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenFaqIndex(open ? null : index)}
                  >
                    <span>{item.question}</span>
                    <span className="support-faq-symbol" aria-hidden="true">
                      {open ? "−" : "+"}
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  className="support-faq-answer"
                  role="region"
                  aria-hidden={!open}
                >
                  <div><p>{item.answer}</p></div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
