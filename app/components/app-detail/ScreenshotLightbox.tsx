"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { ResilientScreenshotImage } from "./ResilientScreenshotImage";

const SWIPE_THRESHOLD = 48;

type SwipeStart = {
  pointerId: number;
  x: number;
  y: number;
};

type ScreenshotLightboxProps = {
  activeIndex: number;
  closeLabel: string;
  dialogLabel: string;
  errorLabel: string;
  imageAlt: string;
  nextLabel: string;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  previousLabel: string;
  screenshots: string[];
};

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Unable to preload ${src}`));
    image.src = src;
  });
}

export function ScreenshotLightbox({
  activeIndex,
  closeLabel,
  dialogLabel,
  errorLabel,
  imageAlt,
  nextLabel,
  onClose,
  onIndexChange,
  previousLabel,
  screenshots,
}: ScreenshotLightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const swipeRef = useRef<SwipeStart | null>(null);
  const [direction, setDirection] = useState<"previous" | "next">("next");
  const currentScreenshot = screenshots[activeIndex];
  const canGoPrevious = activeIndex > 0;
  const canGoNext = activeIndex < screenshots.length - 1;

  const moveTo = useCallback(
    (nextIndex: number) => {
      if (nextIndex < 0 || nextIndex >= screenshots.length) return;
      setDirection(nextIndex < activeIndex ? "previous" : "next");
      onIndexChange(nextIndex);
    },
    [activeIndex, onIndexChange, screenshots.length],
  );

  useEffect(() => {
    const adjacentPaths = [
      screenshots[activeIndex],
      screenshots[activeIndex - 1],
      screenshots[activeIndex + 1],
    ].filter((path): path is string => Boolean(path));

    void Promise.allSettled(adjacentPaths.map(preloadImage));
  }, [activeIndex, screenshots]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus({ preventScroll: true });
    });

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveTo(activeIndex - 1);
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        moveTo(activeIndex + 1);
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

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, moveTo, onClose]);

  if (!currentScreenshot) return null;

  return createPortal(
    <div
      className="screenshot-lightbox"
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={dialogLabel}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onPointerDown={(event) => {
        if (event.pointerType !== "touch") return;
        swipeRef.current = {
          pointerId: event.pointerId,
          x: event.clientX,
          y: event.clientY,
        };
      }}
      onPointerUp={(event) => {
        const start = swipeRef.current;
        swipeRef.current = null;
        if (!start || start.pointerId !== event.pointerId) return;

        const deltaX = event.clientX - start.x;
        const deltaY = event.clientY - start.y;
        if (
          Math.abs(deltaX) < SWIPE_THRESHOLD ||
          Math.abs(deltaX) <= Math.abs(deltaY) * 1.2
        ) {
          return;
        }

        moveTo(activeIndex + (deltaX < 0 ? 1 : -1));
      }}
      onPointerCancel={() => {
        swipeRef.current = null;
      }}
    >
      <button
        className="screenshot-lightbox-close"
        ref={closeButtonRef}
        type="button"
        aria-label={closeLabel}
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
      >
        <span aria-hidden="true">×</span>
      </button>

      <div
        className="screenshot-lightbox-stage"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div
          className={`screenshot-lightbox-image-frame is-${direction}`}
          key={currentScreenshot}
          onClick={(event) => event.stopPropagation()}
        >
          <ResilientScreenshotImage
            key={currentScreenshot}
            className="screenshot-lightbox-image"
            src={currentScreenshot}
            alt={imageAlt}
            errorLabel={errorLabel}
            loading="eager"
          />
        </div>
      </div>

      {screenshots.length > 1 ? (
        <>
          <button
            className="screenshot-lightbox-arrow is-previous"
            type="button"
            aria-label={previousLabel}
            disabled={!canGoPrevious}
            onClick={(event) => {
              event.stopPropagation();
              moveTo(activeIndex - 1);
            }}
          >
            <span aria-hidden="true">‹</span>
          </button>
          <button
            className="screenshot-lightbox-arrow is-next"
            type="button"
            aria-label={nextLabel}
            disabled={!canGoNext}
            onClick={(event) => {
              event.stopPropagation();
              moveTo(activeIndex + 1);
            }}
          >
            <span aria-hidden="true">›</span>
          </button>
        </>
      ) : null}

      <p className="screenshot-lightbox-position" aria-live="polite">
        {String(activeIndex + 1).padStart(2, "0")} / {String(screenshots.length).padStart(2, "0")}
      </p>
    </div>,
    document.body,
  );
}
