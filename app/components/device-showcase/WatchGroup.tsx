"use client";

import { useEffect, useState } from "react";
import { WatchFrame } from "./WatchFrame";

const WATCH_GLANCE_STATES = [
  { label: "Now", kind: "ring" },
  { label: "One small thing", kind: "prompt" },
  { label: "Checked", kind: "check" },
  { label: "Done", kind: "done" },
] as const;

export function WatchGroup() {
  const [activeState, setActiveState] = useState(0);
  const [manualComplete, setManualComplete] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setReducedMotion(media.matches);
    const initialSync = window.setTimeout(syncPreference, 0);

    media.addEventListener("change", syncPreference);
    return () => {
      window.clearTimeout(initialSync);
      media.removeEventListener("change", syncPreference);
    };
  }, []);

  useEffect(() => {
    if (manualComplete || reducedMotion) return;

    const interval = window.setInterval(() => {
      setActiveState((state) => (state + 1) % WATCH_GLANCE_STATES.length);
    }, 3800);

    return () => window.clearInterval(interval);
  }, [manualComplete, reducedMotion]);

  useEffect(() => {
    if (!manualComplete) return;

    const recovery = window.setTimeout(() => {
      setActiveState(0);
      setManualComplete(false);
    }, 4400);

    return () => window.clearTimeout(recovery);
  }, [manualComplete]);

  const completeNow = () => {
    setActiveState(WATCH_GLANCE_STATES.length - 1);
    setManualComplete(true);
  };

  return (
    <div className="device-watch-stage" aria-label="Three Apple Watch frames">
      <div className="device-watch-group">
        <WatchFrame variant="left" />
        <WatchFrame variant="center">
          <button
            type="button"
            className="watch-glance"
            aria-label="Complete one small thing"
            onClick={completeNow}
          >
            {WATCH_GLANCE_STATES.map((state, index) => (
              <span
                key={state.label}
                className={`watch-glance-state watch-glance-state--${state.kind}${activeState === index ? " is-active" : ""}`}
                aria-hidden={activeState !== index}
              >
                {state.kind === "ring" && <i className="watch-glance-ring" aria-hidden="true" />}
                {(state.kind === "check" || state.kind === "done") && (
                  <i className="watch-glance-check" aria-hidden="true">✓</i>
                )}
                <small>{state.label}</small>
              </span>
            ))}
          </button>
        </WatchFrame>
        <WatchFrame variant="right" />
      </div>
    </div>
  );
}
