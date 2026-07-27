"use client";

import { useEffect, useRef, type ReactNode } from "react";

export type WatchVariant = "left" | "center" | "right";

type WatchFrameProps = {
  variant: WatchVariant;
  ariaLabel: string;
  onActivate: () => void;
  hitKey: number;
  isHit: boolean;
  children?: ReactNode;
};

export function WatchFrame({ variant, ariaLabel, onActivate, hitKey, isHit, children }: WatchFrameProps) {
  const hitWrapperRef = useRef<HTMLSpanElement>(null);
  const hitAnimationRef = useRef<Animation | null>(null);

  useEffect(() => {
    const hitWrapper = hitWrapperRef.current;
    if (!hitWrapper || hitKey === 0 || typeof hitWrapper.animate !== "function") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const keyframes: Keyframe[] = reducedMotion
      ? [
          { transform: "scale(1)" },
          { transform: "scale(0.98)" },
          { transform: "scale(1)" },
        ]
      : variant === "left"
        ? [
            { transform: "translate3d(0, 0, 0) scale(1) rotate(0deg)" },
            { offset: 0.42, transform: "translate3d(0, 3px, 0) scale(0.965) rotate(-0.7deg)" },
            { offset: 0.72, transform: "translate3d(0, 1px, 0) scale(0.985) rotate(0.4deg)" },
            { transform: "translate3d(0, 0, 0) scale(1) rotate(0deg)" },
          ]
        : variant === "center"
          ? [
              { transform: "translate3d(0, 0, 0) scale(1)" },
              { offset: 0.32, transform: "translate3d(-3px, 2px, 0) scale(0.965)" },
              { offset: 0.66, transform: "translate3d(3px, 1px, 0) scale(0.98)" },
              { transform: "translate3d(0, 0, 0) scale(1)" },
            ]
          : [
              { transform: "translate3d(0, 0, 0) scale(1) rotate(0deg)" },
              { offset: 0.38, transform: "translate3d(0, 2px, 0) scale(0.97) rotate(1deg)" },
              { offset: 0.7, transform: "translate3d(0, 0, 0) scale(0.99) rotate(-0.6deg)" },
              { transform: "translate3d(0, 0, 0) scale(1) rotate(0deg)" },
            ];

    hitAnimationRef.current?.cancel();
    hitAnimationRef.current = hitWrapper.animate(keyframes, {
      duration: reducedMotion ? 100 : variant === "left" ? 180 : variant === "center" ? 160 : 135,
      easing: "ease-out",
    });

    return () => hitAnimationRef.current?.cancel();
  }, [hitKey, variant]);

  return (
    <button
      type="button"
      className={`device-watch device-watch--${variant}${isHit ? " is-hit" : ""}`}
      data-hit-count={hitKey}
      aria-label={ariaLabel}
      onPointerDown={onActivate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onActivate();
        }
      }}
      onClick={(event) => {
        if (event.detail === 0) onActivate();
      }}
    >
      <span ref={hitWrapperRef} className={`drum-hit-wrapper${hitKey > 0 ? " is-struck" : ""}`}>
        <span className="device-watch-strap device-watch-strap--top" aria-hidden="true" />
        <span className="device-watch-strap device-watch-strap--bottom" aria-hidden="true" />
        <span className="device-watch-body">
          <span className="device-screen device-watch-screen">{children}</span>
          <span className="device-watch-crown" aria-hidden="true" />
          <span className="device-watch-button" aria-hidden="true" />
          <span className="device-frame-highlight" aria-hidden="true" />
        </span>
      </span>
    </button>
  );
}
