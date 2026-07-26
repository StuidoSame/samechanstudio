import type { ReactNode } from "react";

type IPhoneFrameProps = {
  children?: ReactNode;
};

export function IPhoneFrame({ children }: IPhoneFrameProps) {
  return (
    <div className="device-phone-stage" aria-label="Empty iPhone device frame">
      <div className="device-phone-frame">
        <span className="device-phone-button device-phone-button--action" aria-hidden="true" />
        <span className="device-phone-button device-phone-button--volume-up" aria-hidden="true" />
        <span className="device-phone-button device-phone-button--volume-down" aria-hidden="true" />
        <span className="device-phone-button device-phone-button--power" aria-hidden="true" />
        <div className="device-screen device-phone-screen">{children}</div>
        <span className="device-phone-island" aria-hidden="true" />
        <span className="device-frame-highlight" aria-hidden="true" />
      </div>
    </div>
  );
}
