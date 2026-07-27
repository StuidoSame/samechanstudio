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

function createNoiseBuffer(context: AudioContext, duration: number) {
  const frameCount = Math.ceil(context.sampleRate * duration);
  const buffer = context.createBuffer(1, frameCount, context.sampleRate);
  const channel = buffer.getChannelData(0);

  for (let index = 0; index < frameCount; index += 1) {
    channel[index] = Math.random() * 2 - 1;
  }

  return buffer;
}

export function WatchGroup() {
  const [activePad, setActivePad] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
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
    const masterGain = audioContextRef.current.createGain();
    masterGain.gain.value = 0.28;
    masterGain.connect(audioContextRef.current.destination);
    masterGainRef.current = masterGain;
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
      })
      .catch((error) => {
        delete bufferPromisesRef.current[pad.id];
        throw error;
      });

    bufferPromisesRef.current[pad.id] = bufferPromise;
    return bufferPromise;
  };

  const playSynthesizedDrum = (context: AudioContext, drum: DrumId) => {
    const output = masterGainRef.current ?? context.destination;
    const now = context.currentTime;

    if (drum === "kick") {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(145, now);
      oscillator.frequency.exponentialRampToValueAtTime(52, now + 0.19);
      gain.gain.setValueAtTime(0.72, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
      oscillator.connect(gain).connect(output);
      oscillator.start(now);
      oscillator.stop(now + 0.25);
      return;
    }

    const noise = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    if (drum === "snare") {
      noise.buffer = createNoiseBuffer(context, 0.18);
      filter.type = "bandpass";
      filter.frequency.value = 1750;
      filter.Q.value = 0.7;
      gain.gain.setValueAtTime(0.42, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.17);
      noise.connect(filter).connect(gain).connect(output);

      const body = context.createOscillator();
      const bodyGain = context.createGain();
      body.type = "triangle";
      body.frequency.setValueAtTime(180, now);
      bodyGain.gain.setValueAtTime(0.13, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
      body.connect(bodyGain).connect(output);
      body.start(now);
      body.stop(now + 0.11);
      noise.start(now);
      noise.stop(now + 0.18);
      return;
    }

    noise.buffer = createNoiseBuffer(context, 0.075);
    filter.type = "highpass";
    filter.frequency.value = 6800;
    gain.gain.setValueAtTime(0.26, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);
    noise.connect(filter).connect(gain).connect(output);
    noise.start(now);
    noise.stop(now + 0.075);
  };

  const playSample = async (pad: (typeof DRUM_PADS)[number]) => {
    const context = getAudioContext();
    if (!context) return;

    if (context.state === "suspended") await context.resume();

    try {
      const buffer = await loadAudioBuffer(context, pad);
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(masterGainRef.current ?? context.destination);
      source.start();
    } catch {
      playSynthesizedDrum(context, pad.id);
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
