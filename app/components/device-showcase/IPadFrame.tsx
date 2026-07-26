import type { ReactNode } from "react";

type IPadFrameProps = {
  children?: ReactNode;
};

export function IPadFrame({ children }: IPadFrameProps) {
  return (
    <div className="device-tablet-stage" aria-label="Empty iPad device frame">
      <div className="device-tablet-frame">
        <div className="device-screen device-tablet-screen">{children}</div>
        <span className="device-tablet-camera" aria-hidden="true" />
        <span className="device-tablet-button" aria-hidden="true" />
        <span className="device-frame-highlight" aria-hidden="true" />
      </div>
    </div>
  );
}
