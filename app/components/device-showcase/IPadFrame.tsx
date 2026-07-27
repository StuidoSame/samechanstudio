"use client";

import type { ReactNode } from "react";

type IPadFrameProps = {
  children?: ReactNode;
};

export function IPadFrame({ children }: IPadFrameProps) {
  return (
    <div className="device-tablet-stage" aria-label="Interactive iPad daily puzzle">
      <div className="device-tablet-frame">
        <div className="device-screen device-tablet-screen">
          {children ?? (
            <div className="tablet-puzzle">
              <header className="tablet-puzzle-header">
                <span>THINK SPACE</span>
                <time>01 / 07</time>
              </header>
              <main className="tablet-puzzle-main">
                <p id="tablet-puzzle-instructions">Make every light feel the same.</p>
                <div className="tablet-puzzle-board" aria-labelledby="tablet-puzzle-instructions">
                  {Array.from({ length: 9 }, (_, index) => (
                    <span key={index} className="tablet-puzzle-tile" aria-hidden="true" />
                  ))}
                </div>
              </main>
              <footer className="tablet-puzzle-footer">
                <span>Moves 00</span>
                <button type="button" disabled>Reset</button>
                <span className="tablet-puzzle-status" aria-hidden="true" />
              </footer>
            </div>
          )}
        </div>
        <span className="device-tablet-camera" aria-hidden="true" />
        <span className="device-tablet-button" aria-hidden="true" />
        <span className="device-frame-highlight" aria-hidden="true" />
      </div>
    </div>
  );
}
