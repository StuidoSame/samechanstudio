"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "../../i18n/I18nProvider";
import type { AppTranslationId, TranslationDevice } from "../../i18n/types";
import type { AppItem } from "../../lib/apps";
import {
  getAvailableDetailDevices,
  isDetailStoreAvailable,
  type DetailDevice,
  type DetailStore,
} from "../../lib/appDetailCapabilities";
import { getAppScreenshots } from "../../lib/appScreenshots";

const OVERLAY_EXIT_MS = 300;

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

const DETAIL_STORES: DetailStore[] = ["apple", "google"];

const DEVICE_LABELS: Record<DetailDevice, string> = {
  iphone: "iPhone",
  ipad: "iPad",
  appleWatch: "Watch",
  androidPhone: "Android",
};

const DEVICE_ARIA_LABELS: Record<DetailDevice, string> = {
  iphone: "iPhone",
  ipad: "iPad",
  appleWatch: "Apple Watch",
  androidPhone: "Android Phone",
};

const TRANSLATION_DEVICE_BY_DETAIL_DEVICE: Record<
  DetailDevice,
  TranslationDevice
> = {
  iphone: "iphone",
  ipad: "ipad",
  appleWatch: "watch",
  androidPhone: "android",
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
    <svg className="app-detail-store-icon is-google" viewBox="0 0 32 36" fill="none" aria-hidden="true">
      <path d="M3.7 2.9c-.45.5-.7 1.25-.7 2.18v25.84c0 .93.25 1.68.7 2.18L18.25 18 3.7 2.9Z" fill="#34A853" />
      <path d="m18.25 18 4.86-5.04L6.54 3.47A4.02 4.02 0 0 0 3.7 2.9L18.25 18Z" fill="#4285F4" />
      <path d="M18.25 18 3.7 33.1c.76.82 1.86.77 2.84.21l16.57-9.5L18.25 18Z" fill="#EA4335" />
      <path d="m28.47 16.03-5.36-3.07L18.25 18l4.86 5.04 5.36-3.07c1.52-.87 1.52-3.07 0-3.94Z" fill="#FBBC04" />
    </svg>
  );
}

function DeviceSilhouette({ device }: { device: DetailDevice }) {
  return (
    <span
      className={`app-detail-device-silhouette is-${device}`}
      aria-hidden="true"
    >
      <span />
    </span>
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
  const availableDevices = useMemo(
    () => getAvailableDetailDevices(app.id),
    [app.id],
  );
  const [selectedDevice, setSelectedDevice] = useState<DetailDevice | null>(
    availableDevices[0] ?? null,
  );
  const selectedContent = selectedDevice
    ? messages.appDetail.apps[app.id as AppTranslationId]?.[
        TRANSLATION_DEVICE_BY_DETAIL_DEVICE[selectedDevice]
      ] ?? messages.appDetail.fallback
    : null;
  const screenshots = useMemo(
    () =>
      selectedDevice
        ? getAppScreenshots({ appId: app.id, device: selectedDevice, locale })
        : [],
    [app.id, locale, selectedDevice],
  );
  const previewImage = screenshots[0] ?? null;
  const previewFit = "contain";
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    const deviceResetFrame = window.requestAnimationFrame(() => {
      setSelectedDevice(availableDevices[0] ?? null);
    });
    return () => window.cancelAnimationFrame(deviceResetFrame);
  }, [app.id, availableDevices]);

  useEffect(() => {
    const previewResetFrame = window.requestAnimationFrame(() => {
      setPreviewFailed(false);
    });
    return () => window.cancelAnimationFrame(previewResetFrame);
  }, [app.id, previewImage, selectedDevice]);

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
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onRequestClose();
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
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onRequestClose, open]);

  return (
    <div
      className={`app-detail-overlay${open ? " is-open" : ""}`}
      aria-hidden={!open}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onRequestClose();
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
            onClick={onRequestClose}
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="app-detail-content">
          <div
            className="app-detail-store-selector"
            aria-label={messages.appDetail.storeSelectorLabel}
          >
            {DETAIL_STORES.map((store) => {
              const storeUrl =
                store === "apple" ? app.appStoreUrl : app.googlePlayUrl;
              const storeAvailable = isDetailStoreAvailable(app.id, store);
              const ariaLabel = format(messages.appDetail.storeLinkLabel, {
                store: STORE_LABELS[store],
                app: app.name,
              });
              const icon = (
                <span className="app-detail-store-icon-slot">
                  <StoreIcon store={store} />
                </span>
              );

              if (!storeAvailable || !storeUrl) {
                return (
                  <button
                    className="app-detail-store-button"
                    type="button"
                    key={store}
                    aria-label={ariaLabel}
                    disabled
                  >
                    {icon}
                  </button>
                );
              }

              return (
                <a
                  className="app-detail-store-button"
                  href={storeUrl}
                  key={store}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={ariaLabel}
                >
                  {icon}
                </a>
              );
            })}
          </div>
          <div
            className={`app-detail-preview${selectedDevice ? ` is-${selectedDevice}` : ""}`}
            aria-label={`${app.name} ${selectedDevice ? DEVICE_ARIA_LABELS[selectedDevice] : ""} preview area`}
            data-preview-key={`${app.id}:${selectedDevice ?? "none"}`}
          >
            <div
              className="app-detail-preview-media"
              key={`${app.id}:${selectedDevice ?? "none"}:${previewImage ?? "placeholder"}`}
              data-preview-fit={previewFit}
            >
              {previewImage && !previewFailed ? (
                <Image
                  className="app-detail-preview-image"
                  src={previewImage}
                  alt={format(messages.appDetail.previewAlt, {
                    app: app.name,
                    device: selectedDevice
                      ? DEVICE_ARIA_LABELS[selectedDevice]
                      : "",
                  })}
                  fill
                  sizes="(max-width: 767px) calc(100vw - 72px), min(80vw, 1060px)"
                  style={{ objectFit: previewFit }}
                  onError={() => setPreviewFailed(true)}
                  unoptimized
                />
              ) : selectedDevice ? (
                <span className="app-detail-preview-marker">
                  <DeviceSilhouette device={selectedDevice} />
                </span>
              ) : null}
            </div>
          </div>
          <div
            className="device-detail-copy"
            data-description-key={`${app.id}:${selectedDevice ?? "none"}`}
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
            className="app-detail-device-selector"
            role="group"
            aria-label={messages.appDetail.deviceSelectorLabel}
          >
            {availableDevices.map((device) => (
              <button
                className="app-detail-device-button"
                type="button"
                key={device}
                aria-label={DEVICE_ARIA_LABELS[device]}
                aria-pressed={selectedDevice === device}
                onClick={() => setSelectedDevice(device)}
              >
                <DeviceSilhouette device={device} />
                <span className="app-detail-device-label">
                  {DEVICE_LABELS[device]}
                </span>
              </button>
            ))}
          </div>
          <span className="app-detail-screenshot-count" aria-hidden="true">
            0
          </span>
        </div>
      </div>
    </div>
  );
}
