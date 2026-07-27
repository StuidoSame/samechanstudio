import type { ReactNode } from "react";

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
  return (
    <button
      type="button"
      className={`device-watch device-watch--${variant}${isHit ? " is-hit" : ""}`}
      aria-label={ariaLabel}
      onPointerDown={onActivate}
      onClick={(event) => {
        if (event.detail === 0) onActivate();
      }}
    >
      <span key={hitKey} className={`drum-hit-wrapper${hitKey > 0 ? " is-struck" : ""}`}>
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
