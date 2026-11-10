"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useI18n } from "../../i18n/I18nProvider";
import type { AppTranslationId } from "../../i18n/types";
import type { AppItem, AppPlatform } from "../../lib/apps";
import {
  getAppDetailPlatforms,
  type DetailStore,
} from "../../lib/appDetailCapabilities";
import {
  DETAIL_SCREEN_ORDER,
  getAppScreenshotSet,
  getAvailableDetailScreens,
  type DetailScreen,
} from "../../lib/appScreenshots";
import { ResilientScreenshotImage } from "./ResilientScreenshotImage";
import { ScreenshotLightbox } from "./ScreenshotLightbox";

const OVERLAY_EXIT_MS = 300;
const GALLERY_SCROLL_AMOUNT = 0.78;
const GALLERY_EDGE_TOLERANCE = 2;
const DRAG_THRESHOLD = 5;

type GalleryState = {
  activeIndex: number;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  hasOverflow: boolean;
};

type GalleryDrag = {
  pointerId: number;
  startX: number;
  startScrollLeft: number;
  moved: boolean;
};

const INITIAL_GALLERY_STATE: GalleryState = {
  activeIndex: 0,
  canScrollLeft: false,
  canScrollRight: false,
  hasOverflow: false,
};

type AppDetailOverlayProps = {
  app: AppItem;
  open: boolean;
  onRequestClose: () => void;
  onExited: () => void;
};

const STORE_LABELS: Record<DetailStore, string> = {
  apple: "Apple App Store",
  google: "Google Play",
};

const SCREEN_LABELS: Record<DetailScreen, string> = {
  phone: "Phone",
  ipad: "Pad",
};

const PLATFORM_LABELS: Record<AppPlatform, string> = {
  apple: "Apple",
  android: "Android",
};

function StoreIcon({ store }: { store: DetailStore }) {
  if (store === "apple") {
    return (
      <svg className="app-detail-store-icon is-apple" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M16.72 12.76c.02-2.08 1.7-3.08 1.78-3.13a3.82 3.82 0 0 0-3.01-1.63c-1.27-.13-2.51.76-3.16.76-.67 0-1.67-.75-2.76-.73a4.02 4.02 0 0 0-3.39 2.07c-1.47 2.54-.37 6.28 1.03 8.33.7 1 1.52 2.11 2.6 2.07 1.05-.04 1.44-.67 2.71-.67 1.25 0 1.62.67 2.72.64 1.13-.02 1.84-1 2.51-2.01a8.3 8.3 0 0 0 1.15-2.34 3.6 3.6 0 0 1-2.18-3.36ZM14.66 6.65a3.67 3.67 0 0 0 .84-2.64 3.75 3.75 0 0 0-2.43 1.26 3.5 3.5 0 0 0-.86 2.54 3.1 3.1 0 0 0 2.45-1.16Z" />
      </svg>
    );
  }

  return (
    <svg className="app-detail-store-icon is-google" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7.45 7.15 6.12 4.84a.72.72 0 0 1 1.25-.72l1.39 2.41A8.02 8.02 0 0 1 12 5.86c1.16 0 2.26.24 3.24.67l1.39-2.41a.72.72 0 1 1 1.25.72l-1.33 2.31A6.83 6.83 0 0 1 19 12.42H5a6.83 6.83 0 0 1 2.45-5.27Zm1.37 2.9a.86.86 0 1 0 0-1.72.86.86 0 0 0 0 1.72Zm6.36 0a.86.86 0 1 0 0-1.72.86.86 0 0 0 0 1.72ZM5 13.86h14v4.76A1.38 1.38 0 0 1 17.62 20h-.76v1.5a1 1 0 0 1-2 0V20H9.14v1.5a1 1 0 0 1-2 0V20h-.76A1.38 1.38 0 0 1 5 18.62v-4.76Zm-2.5.02a1 1 0 0 1 2 0v4.24a1 1 0 0 1-2 0v-4.24Zm17 0a1 1 0 0 1 2 0v4.24a1 1 0 0 1-2 0v-4.24Z"
      />
    </svg>
  );
}

function ScreenFormIcon({ screen }: { screen: DetailScreen }) {
  return (
    <svg
      className={`app-detail-screen-icon is-${screen}`}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {screen === "phone" ? (
        <>
          <rect x="9" y="3" width="14" height="26" rx="2.5" />
          <path d="M13 6h6M14.5 26h3" />
        </>
      ) : (
        <>
          <rect x="3" y="6" width="26" height="20" rx="2.5" />
          <path d="M6 10v12M26 15.5v1" />
        </>
      )}
    </svg>
  );
}

export function AppDetailOverlay({
  app,
  open,
  onRequestClose,
  onExited,
}: AppDetailOverlayProps) {
  const { locale, messages, format } = useI18n();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const galleryFrameRef = useRef<number | null>(null);
  const dragRef = useRef<GalleryDrag | null>(null);
  const suppressClickRef = useRef(false);
  const lightboxTriggerRef = useRef<HTMLButtonElement | null>(null);
  const appId = app.screenshotId ?? app.id;
  const platforms = getAppDetailPlatforms(app);
  const [preferredScreen, setPreferredScreen] = useState<DetailScreen>("phone");
  const { availableScreens, selectedScreen, screenshotSet } = useMemo(() => {
    const availableScreens = getAvailableDetailScreens(appId);
    const selectedScreen = availableScreens.includes(preferredScreen)
      ? preferredScreen
      : availableScreens[0] ?? "phone";
    const screenshotSet = getAppScreenshotSet({ appId, screen: selectedScreen, locale });
    return { availableScreens, selectedScreen, screenshotSet };
  }, [appId, locale, preferredScreen]);
  const appDetailContent =
    messages.appDetail.apps[app.id as AppTranslationId];
  const phoneContent = appDetailContent?.iphone ?? appDetailContent?.android;
  const selectedContent =
    (selectedScreen === "ipad" ? appDetailContent?.ipad : undefined)
    ?? phoneContent ?? messages.appDetail.fallback;
  const screenshots = screenshotSet.screenshots;
  const screenshotLanguage = messages.header.languageNames[screenshotSet.locale ?? locale];
  const previewKey = `${appId}:${selectedScreen}:${locale}`;
  const [galleryState, setGalleryState] = useState<GalleryState>(
    INITIAL_GALLERY_STATE,
  );
  const [isDragging, setIsDragging] = useState(false);
  const [lightbox, setLightbox] = useState<{ previewKey: string; index: number } | null>(null);
  const lightboxIndex = lightbox?.previewKey === previewKey && screenshots.length
    ? Math.min(lightbox.index, screenshots.length - 1)
    : null;
  const galleryIndex = Math.max(0, Math.min(galleryState.activeIndex, screenshots.length - 1));
  const screenshotPosition = `${String(galleryIndex + 1).padStart(2, "0")} / ${String(screenshots.length).padStart(2, "0")}`;

  const closeLightbox = useCallback(() => {
    setLightbox(null);
    const trigger = lightboxTriggerRef.current;
    window.requestAnimationFrame(() => {
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    });
  }, [setLightbox]);

  const closeAppDetail = useCallback(() => {
    setLightbox(null);
    onRequestClose();
  }, [onRequestClose, setLightbox]);

  const updateGalleryState = useCallback(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;

    const maximumScroll = Math.max(0, gallery.scrollWidth - gallery.clientWidth);
    const hasOverflow = maximumScroll > GALLERY_EDGE_TOLERANCE;
    const items = Array.from(
      gallery.querySelectorAll<HTMLElement>("[data-screenshot-index]"),
    );
    const canScrollLeft = hasOverflow && gallery.scrollLeft > GALLERY_EDGE_TOLERANCE;
    const canScrollRight = hasOverflow && gallery.scrollLeft < maximumScroll - GALLERY_EDGE_TOLERANCE;
    let activeIndex = hasOverflow && !canScrollRight ? items.length - 1 : 0;

    if (canScrollLeft && canScrollRight && items.length > 0) {
      const galleryStart = gallery.scrollLeft;
      const firstItemOffset = items[0].offsetLeft;
      let nearestDistance = Number.POSITIVE_INFINITY;

      items.forEach((item, index) => {
        const distance = Math.abs(item.offsetLeft - firstItemOffset - galleryStart);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          activeIndex = index;
        }
      });
    }

    const nextState = {
      activeIndex,
      hasOverflow,
      canScrollLeft,
      canScrollRight,
    };

    setGalleryState((current) =>
      current.activeIndex === nextState.activeIndex &&
      current.hasOverflow === nextState.hasOverflow &&
      current.canScrollLeft === nextState.canScrollLeft &&
      current.canScrollRight === nextState.canScrollRight
        ? current
        : nextState,
    );
  }, []);

  const scheduleGalleryUpdate = useCallback(() => {
    if (galleryFrameRef.current !== null) return;

    galleryFrameRef.current = window.requestAnimationFrame(() => {
      galleryFrameRef.current = null;
      updateGalleryState();
    });
  }, [updateGalleryState]);

  const scrollGallery = useCallback(
    (direction: -1 | 1) => {
      const gallery = galleryRef.current;
      if (!gallery) return;

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      gallery.scrollBy({
        left: gallery.clientWidth * GALLERY_SCROLL_AMOUNT * direction,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    },
    [],
  );

  useEffect(() => {
    const galleryResetFrame = window.requestAnimationFrame(() => {
      setGalleryState(INITIAL_GALLERY_STATE);
      setLightbox((current) => current?.previewKey === previewKey ? current : null);
      dragRef.current = null;
      suppressClickRef.current = false;
      setIsDragging(false);
      updateGalleryState();
    });
    return () => window.cancelAnimationFrame(galleryResetFrame);
  }, [previewKey, updateGalleryState]);

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;

    const resizeObserver = new ResizeObserver(scheduleGalleryUpdate);
    resizeObserver.observe(gallery);
    const track = gallery.firstElementChild;
    if (track) resizeObserver.observe(track);
    gallery.addEventListener("scroll", scheduleGalleryUpdate, {
      passive: true,
    });
    scheduleGalleryUpdate();

    return () => {
      gallery.removeEventListener("scroll", scheduleGalleryUpdate);
      resizeObserver.disconnect();
      if (galleryFrameRef.current !== null) {
        window.cancelAnimationFrame(galleryFrameRef.current);
        galleryFrameRef.current = null;
      }
    };
  }, [previewKey, scheduleGalleryUpdate]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, []);

  useEffect(() => {
    if (open) return;
    const timer = window.setTimeout(onExited, OVERLAY_EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [onExited, open]);

  useEffect(() => {
    if (!open) return;

    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(focusFrame);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (lightboxIndex !== null) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeAppDetail();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeAppDetail, lightboxIndex, open]);

  return (
    <div
      className={`app-detail-overlay${open ? " is-open" : ""}`}
      aria-hidden={!open}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) closeAppDetail();
      }}
    >
      <div
        className="app-detail-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-detail-title"
      >
        <header className="app-detail-header">
          <h2 id="app-detail-title">
            <Image
              className="app-detail-title-icon"
              src={app.icon}
              alt={format(messages.appDetail.appIconAlt, { app: app.name })}
              width={52}
              height={52}
              unoptimized
            />
            <span>{app.name}</span>
          </h2>
          <button
            className="app-detail-close"
            ref={closeButtonRef}
            type="button"
            aria-label={messages.appDetail.closeLabel}
            onClick={closeAppDetail}
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="app-detail-content" data-app-id={app.id}>
          <div className="app-detail-preview-toolbar">
            <div
              className="app-detail-store-selector"
              role="group"
              aria-label={messages.appDetail.storeSelectorLabel}
            >
              {platforms.map(({ platform, store, url }) => {
                const icon = (
                  <span className="app-detail-store-icon-slot">
                    <StoreIcon store={store} />
                  </span>
                );

                if (!url) {
                  return (
                    <span
                      className="app-detail-store-button app-detail-platform-badge"
                      role="img"
                      aria-label={`${app.name}: ${PLATFORM_LABELS[platform]}`}
                      key={store}
                  >
                      {icon}
                    </span>
                  );
                }

                return (
                  <a
                    className="app-detail-store-button"
                    href={url}
                    key={store}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={format(messages.appDetail.storeLinkLabel, {
                      store: STORE_LABELS[store],
                      app: app.name,
                    })}
                >
                    {icon}
                  </a>
                );
              })}
            </div>
            {screenshotSet.locale && screenshotSet.locale !== locale && (
              <p className="app-detail-preview-fallback" role="status">
                {format(messages.appDetail.previewFallbackLabel, { language: screenshotLanguage })}
              </p>
            )}
          </div>
          <div
            className={`app-detail-preview is-${selectedScreen}`}
            role="region"
            aria-label={format(messages.appDetail.previewRegionLabel, {
              app: app.name,
              device: SCREEN_LABELS[selectedScreen],
            })}
            data-preview-key={previewKey}
          >
            {screenshots.length > 0 ? (
              <div
                key={previewKey}
                className={`app-detail-gallery${isDragging ? " is-dragging" : ""}`}
                ref={galleryRef}
                tabIndex={0}
                aria-label={format(messages.appDetail.previewRegionLabel, {
                  app: app.name,
                  device: SCREEN_LABELS[selectedScreen],
                })}
                onKeyDown={(event) => {
                  if (
                    event.key !== "ArrowLeft" &&
                    event.key !== "ArrowRight"
                  ) {
                    return;
                  }
                  event.preventDefault();
                  scrollGallery(event.key === "ArrowLeft" ? -1 : 1);
                }}
                onWheel={(event) => {
                  const gallery = event.currentTarget;
                  if (
                    !galleryState.hasOverflow ||
                    Math.abs(event.deltaX) >= Math.abs(event.deltaY)
                  ) {
                    return;
                  }

                  const maximumScroll =
                    gallery.scrollWidth - gallery.clientWidth;
                  const canMove =
                    (event.deltaY < 0 && gallery.scrollLeft > 0) ||
                    (event.deltaY > 0 &&
                      gallery.scrollLeft < maximumScroll);
                  if (!canMove) return;

                  event.preventDefault();
                  gallery.scrollLeft += event.deltaY;
                }}
                onPointerDown={(event) => {
                  if (event.pointerType !== "mouse" || event.button !== 0) {
                    return;
                  }

                  dragRef.current = {
                    pointerId: event.pointerId,
                    startX: event.clientX,
                    startScrollLeft: event.currentTarget.scrollLeft,
                    moved: false,
                  };
                }}
                onPointerLeave={() => {
                  if (!dragRef.current?.moved) dragRef.current = null;
                }}
                onPointerMove={(event) => {
                  const drag = dragRef.current;
                  if (!drag || drag.pointerId !== event.pointerId) return;

                  const distance = event.clientX - drag.startX;
                  if (!drag.moved && Math.abs(distance) < DRAG_THRESHOLD) {
                    return;
                  }

                  if (!drag.moved) {
                    drag.moved = true;
                    event.currentTarget.setPointerCapture(event.pointerId);
                    setIsDragging(true);
                  }
                  event.preventDefault();
                  event.currentTarget.scrollLeft =
                    drag.startScrollLeft - distance;
                }}
                onPointerUp={(event) => {
                  const drag = dragRef.current;
                  if (!drag || drag.pointerId !== event.pointerId) return;

                  suppressClickRef.current = drag.moved;
                  dragRef.current = null;
                  setIsDragging(false);
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    event.currentTarget.releasePointerCapture(event.pointerId);
                  }
                }}
                onPointerCancel={(event) => {
                  dragRef.current = null;
                  suppressClickRef.current = false;
                  setIsDragging(false);
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    event.currentTarget.releasePointerCapture(event.pointerId);
                  }
                }}
                onClickCapture={(event) => {
                  if (!suppressClickRef.current) return;
                  event.preventDefault();
                  event.stopPropagation();
                  suppressClickRef.current = false;
                }}
              >
                <div className="app-detail-gallery-track">
                  {screenshots.map(({ src, width, height }, index) => (
                    <button
                      className="app-detail-gallery-item"
                      type="button"
                      data-screenshot-index={index}
                      key={src}
                      style={{ aspectRatio: `${width} / ${height}` }}
                      aria-label={format(
                        messages.appDetail.enlargeScreenshotLabel,
                        { app: app.name, current: index + 1 },
                      )}
                      onClick={(event) => {
                        lightboxTriggerRef.current = event.currentTarget;
                        setLightbox({ previewKey, index });
                      }}
                    >
                      <ResilientScreenshotImage
                        className="app-detail-preview-image"
                        src={src}
                        errorLabel={messages.appDetail.previewUnavailableLabel}
                        alt={format(messages.appDetail.previewAlt, {
                          app: app.name,
                          device: SCREEN_LABELS[selectedScreen],
                          language: screenshotLanguage,
                          current: index + 1,
                          total: screenshots.length,
                        })}
                        loading={index < 3 ? "eager" : "lazy"}
                        onLoad={scheduleGalleryUpdate}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
                <span className="app-detail-preview-marker">
                  <ScreenFormIcon screen={selectedScreen} />
                  <span
                    className="app-detail-preview-empty"
                    role="status"
                    aria-live="polite"
                  >
                    {messages.appDetail.previewUnavailableLabel}
                  </span>
                </span>
            )}
            {screenshots.length > 0 && (
              <div
                className={`app-detail-gallery-controls${galleryState.hasOverflow ? " has-overflow" : ""}`}
              >
                <button
                  className="app-detail-gallery-button is-previous"
                  type="button"
                  aria-label={format(
                    messages.appDetail.previousScreenshotLabel,
                    { app: app.name },
                  )}
                  disabled={!galleryState.canScrollLeft}
                  onClick={() => scrollGallery(-1)}
                >
                  <span aria-hidden="true">‹</span>
                </button>
                <span
                  className="app-detail-gallery-position"
                  role="status"
                  aria-live="polite"
                  aria-label={format(
                    messages.appDetail.screenshotPositionLabel,
                    {
                      app: app.name,
                      current: galleryIndex + 1,
                      total: screenshots.length,
                    },
                  )}
                >
                  {screenshotPosition}
                </span>
                <button
                  className="app-detail-gallery-button is-next"
                  type="button"
                  aria-label={format(messages.appDetail.nextScreenshotLabel, {
                    app: app.name,
                  })}
                  disabled={!galleryState.canScrollRight}
                  onClick={() => scrollGallery(1)}
                >
                  <span aria-hidden="true">›</span>
                </button>
              </div>
            )}
          </div>
          <div
            className="device-detail-copy"
            data-description-key={`${app.id}:${selectedScreen}`}
            aria-live="polite"
          >
            <div className="device-keywords">
              {selectedContent?.keywords.map((keyword) => (
                <span key={keyword}>{keyword}</span>
              ))}
            </div>
            <p>{selectedContent?.description}</p>
          </div>
          <div
            className="app-detail-screen-selector"
            role="group"
            aria-label={messages.appDetail.screenSelectorLabel}
          >
            {DETAIL_SCREEN_ORDER.map((screen) => (
              <button
                className="app-detail-screen-button"
                type="button"
                key={screen}
                aria-label={SCREEN_LABELS[screen]}
                aria-pressed={selectedScreen === screen}
                disabled={!availableScreens.includes(screen)}
                onClick={() => setPreferredScreen(screen)}
              >
                <ScreenFormIcon screen={screen} />
                <span className="app-detail-screen-label">
                  {SCREEN_LABELS[screen]}
                </span>
              </button>
            ))}
          </div>
          <span className="app-detail-screenshot-count" aria-hidden="true">
            {screenshots.length}
          </span>
        </div>
      </div>
      {lightboxIndex !== null ? (
        <ScreenshotLightbox
          activeIndex={lightboxIndex}
          closeLabel={messages.appDetail.closeLightboxLabel}
          dialogLabel={format(messages.appDetail.lightboxLabel, {
            app: app.name,
          })}
          errorLabel={messages.appDetail.previewUnavailableLabel}
          imageAlt={format(messages.appDetail.previewAlt, {
            app: app.name,
            device: SCREEN_LABELS[selectedScreen],
            language: screenshotLanguage,
            current: lightboxIndex + 1,
            total: screenshots.length,
          })}
          nextLabel={messages.appDetail.nextImageLabel}
          onClose={closeLightbox}
          onIndexChange={(index) => setLightbox({ previewKey, index })}
          previousLabel={messages.appDetail.previousImageLabel}
          screenshots={screenshots}
        />
      ) : null}
    </div>
  );
}
