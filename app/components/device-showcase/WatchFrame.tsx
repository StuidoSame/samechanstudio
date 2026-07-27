import type { ReactNode } from "react";

export type WatchVariant = "left" | "center" | "right";

type WatchFrameProps = {
  variant: WatchVariant;
  children?: ReactNode;
};

export function WatchFrame({ variant, children }: WatchFrameProps) {
  return (
    <div
      className={`device-watch device-watch--${variant}`}
      aria-label={children
        ? `Interactive Apple Watch ${variant} device frame`
        : `Empty Apple Watch ${variant} device frame`}
    >
      <span className="device-watch-strap device-watch-strap--top" aria-hidden="true" />
      <span className="device-watch-strap device-watch-strap--bottom" aria-hidden="true" />
      <div className="device-watch-body">
        <div className="device-screen device-watch-screen">{children}</div>
        <span className="device-watch-crown" aria-hidden="true" />
        <span className="device-watch-button" aria-hidden="true" />
        <span className="device-frame-highlight" aria-hidden="true" />
      </div>
    </div>
  );
}
