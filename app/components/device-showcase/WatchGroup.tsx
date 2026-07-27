"use client";

import { useState } from "react";
import { WatchFrame, type WatchVariant } from "./WatchFrame";

const DRUM_PADS: Array<{
  id: "kick" | "snare" | "hihat";
  label: string;
  ariaLabel: string;
  variant: WatchVariant;
}> = [
  { id: "kick", label: "KICK", ariaLabel: "Kick drum", variant: "left" },
  { id: "snare", label: "SNARE", ariaLabel: "Snare drum", variant: "center" },
  { id: "hihat", label: "HI-HAT", ariaLabel: "Hi-hat", variant: "right" },
];

export function WatchGroup() {
  const [activePad, setActivePad] = useState<string | null>(null);

  return (
    <div className="device-watch-stage" aria-label="Three Apple Watch drum pads">
      <div className="device-watch-group">
        {DRUM_PADS.map((pad) => (
          <WatchFrame
            key={pad.id}
            variant={pad.variant}
            ariaLabel={pad.ariaLabel}
            onActivate={() => setActivePad(pad.id)}
          >
            <span className={`watch-drum-pad${activePad === pad.id ? " is-active" : ""}`}>
              <strong>{pad.label}</strong>
            </span>
          </WatchFrame>
        ))}
      </div>
    </div>
  );
}
