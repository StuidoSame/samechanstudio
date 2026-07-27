"use client";

import { useEffect, useRef, useState } from "react";
import { WatchFrame, type WatchVariant } from "./WatchFrame";

type DrumId = "kick" | "snare" | "hihat";

const DRUM_PADS: Array<{
  id: DrumId;
  label: string;
  ariaLabel: string;
  variant: WatchVariant;
  audioSrc: string;
}> = [
  { id: "kick", label: "KICK", ariaLabel: "Kick drum", variant: "left", audioSrc: "/assets/mp3/kick.mp3" },
  { id: "snare", label: "SNARE", ariaLabel: "Snare drum", variant: "center", audioSrc: "/assets/mp3/snare.mp3" },
  { id: "hihat", label: "HI-HAT", ariaLabel: "Hi-hat", variant: "right", audioSrc: "/assets/mp3/hihat.mp3" },
];

export function WatchGroup() {
  const [activePad, setActivePad] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Partial<Record<DrumId, AudioBuffer>>>({});
  const bufferPromisesRef = useRef<Partial<Record<DrumId, Promise<AudioBuffer>>>>({});

  useEffect(
    () => () => {
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        void audioContextRef.current.close();
      }
    },
    [],
  );

  const getAudioContext = () => {
    if (audioContextRef.current) return audioContextRef.current;

    const AudioContextConstructor = window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return null;

    audioContextRef.current = new AudioContextConstructor();
    return audioContextRef.current;
  };

  const loadAudioBuffer = (context: AudioContext, pad: (typeof DRUM_PADS)[number]) => {
    const cachedBuffer = audioBuffersRef.current[pad.id];
    if (cachedBuffer) return Promise.resolve(cachedBuffer);

    const pendingBuffer = bufferPromisesRef.current[pad.id];
    if (pendingBuffer) return pendingBuffer;

    const bufferPromise = fetch(pad.audioSrc)
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load ${pad.id} drum sample`);
        return response.arrayBuffer();
      })
      .then((arrayBuffer) => context.decodeAudioData(arrayBuffer))
      .then((buffer) => {
        audioBuffersRef.current[pad.id] = buffer;
        return buffer;
      });

    bufferPromisesRef.current[pad.id] = bufferPromise;
    return bufferPromise;
  };

  const playSample = async (pad: (typeof DRUM_PADS)[number]) => {
    const context = getAudioContext();
    if (!context) return;

    if (context.state === "suspended") await context.resume();

    try {
      const buffer = await loadAudioBuffer(context, pad);
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.start();
    } catch {
      // Mission 3 adds a synthesized fallback for unavailable samples.
    }
  };

  const activatePad = (pad: (typeof DRUM_PADS)[number]) => {
    setActivePad(pad.id);
    void playSample(pad);
  };

  return (
    <div className="device-watch-stage" aria-label="Three Apple Watch drum pads">
      <div className="device-watch-group">
        {DRUM_PADS.map((pad) => (
          <WatchFrame
            key={pad.id}
            variant={pad.variant}
            ariaLabel={pad.ariaLabel}
            onActivate={() => activatePad(pad)}
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
