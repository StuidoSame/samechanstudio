"use client";

import { useState, type ReactNode } from "react";

type IPhoneFrameProps = {
  children?: ReactNode;
};

export function IPhoneFrame({ children }: IPhoneFrameProps) {
  const [momentVisible, setMomentVisible] = useState(false);
  const [momentSaved, setMomentSaved] = useState(false);

  return (
    <div className="device-phone-stage" aria-label="Interactive iPhone moment">
      <div className="device-phone-frame">
        <span className="device-phone-button device-phone-button--action" aria-hidden="true" />
        <span className="device-phone-button device-phone-button--volume-up" aria-hidden="true" />
        <span className="device-phone-button device-phone-button--volume-down" aria-hidden="true" />
        <span className="device-phone-button device-phone-button--power" aria-hidden="true" />
        <div className="device-screen device-phone-screen">
          {children ?? (
            <div
              className={`phone-moment${momentVisible ? " is-visible" : ""}`}
              onClick={() => setMomentVisible(true)}
              onFocusCapture={() => setMomentVisible(true)}
              onPointerEnter={() => setMomentVisible(true)}
            >
              <div className="phone-moment-heading">
                <span>TODAY</span>
                <i aria-hidden="true" />
              </div>
              <div className="phone-moment-card">
                <span className="phone-moment-orb" aria-hidden="true" />
                <p>What made you smile today?</p>
                <small>A small moment worth keeping.</small>
              </div>
              <button
                type="button"
                className={`phone-moment-action${momentSaved ? " is-saved" : ""}`}
                aria-pressed={momentSaved}
                onClick={(event) => {
                  event.stopPropagation();
                  setMomentVisible(true);
                  setMomentSaved((saved) => !saved);
                }}
              >
                <span aria-hidden="true">{momentSaved ? "✓" : "+"}</span>
                {momentSaved ? "Saved for today" : "Remember this moment"}
              </button>
            </div>
          )}
        </div>
        <span className="device-phone-island" aria-hidden="true" />
        <span className="device-frame-highlight" aria-hidden="true" />
      </div>
    </div>
  );
}
