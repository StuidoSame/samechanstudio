import type { ReactNode } from "react";

export type WatchVariant = "left" | "center" | "right";

type WatchFrameProps = {
  variant: WatchVariant;
  ariaLabel: string;
  onActivate: () => void;
  children?: ReactNode;
};

export function WatchFrame({ variant, ariaLabel, onActivate, children }: WatchFrameProps) {
  return (
    <button
      type="button"
      className={`device-watch device-watch--${variant}`}
      aria-label={ariaLabel}
      onClick={onActivate}
    >
      <span className="device-watch-strap device-watch-strap--top" aria-hidden="true" />
      <span className="device-watch-strap device-watch-strap--bottom" aria-hidden="true" />
      <div className="device-watch-body">
        <div className="device-screen device-watch-screen">{children}</div>
        <span className="device-watch-crown" aria-hidden="true" />
        <span className="device-watch-button" aria-hidden="true" />
        <span className="device-frame-highlight" aria-hidden="true" />
      </div>
    </button>
  );
}
