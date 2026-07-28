"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "../../i18n/I18nProvider";
import { WatchFrame, type WatchVariant } from "./WatchFrame";

type DrumId = "kick" | "snare" | "hihat";

type HitEffects = Record<DrumId, number[]>;

const DRUM_PADS: Array<{
  id: DrumId;
  label: string;
  variant: WatchVariant;
  audioSrc: string;
  shortcut: "A" | "S" | "D";
}> = [
  { id: "kick", label: "KICK", variant: "left", audioSrc: "/assets/mp3/kick.mp3", shortcut: "A" },
  { id: "snare", label: "SNARE", variant: "center", audioSrc: "/assets/mp3/snare.mp3", shortcut: "S" },
  { id: "hihat", label: "HI-HAT", variant: "right", audioSrc: "/assets/mp3/hihat.mp3", shortcut: "D" },
];

const DRUM_GAIN: Record<DrumId, number> = {
  kick: 0.9,
  snare: 0.72,
  hihat: 0.48,
};

const MASTER_GAIN = 0.28;

const KEY_TO_DRUM: Partial<Record<string, DrumId>> = {
  KeyA: "kick",
  KeyS: "snare",
  KeyD: "hihat",
};

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
  const { messages, format } = useI18n();
  const [activePad, setActivePad] = useState<string | null>(null);
  const [hitCount, setHitCount] = useState(0);
  const [hitCounts, setHitCounts] = useState<Record<DrumId, number>>({ kick: 0, snare: 0, hihat: 0 });
  const [hitEffects, setHitEffects] = useState<HitEffects>({ kick: [], snare: [], hihat: [] });
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const audioBuffersRef = useRef<Partial<Record<DrumId, AudioBuffer>>>({});
  const bufferPromisesRef = useRef<Partial<Record<DrumId, Promise<AudioBuffer>>>>({});
  const triggerDrumRef = useRef<(drumId: DrumId) => void>(() => undefined);
  const hitRecoveryTimerRef = useRef<number | null>(null);
  const effectSequenceRef = useRef(0);
  const effectTimersRef = useRef<Set<number>>(new Set());

  const getAudioContext = useCallback(() => {
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      return audioContextRef.current;
    }

    const AudioContextConstructor = window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return null;

    audioContextRef.current = new AudioContextConstructor();
    const masterGain = audioContextRef.current.createGain();
    masterGain.gain.value = MASTER_GAIN;
    masterGain.connect(audioContextRef.current.destination);
    masterGainRef.current = masterGain;
    return audioContextRef.current;
  }, []);

  const loadAudioBuffer = useCallback((
    context: AudioContext,
    pad: (typeof DRUM_PADS)[number],
    signal?: AbortSignal,
  ) => {
    const cachedBuffer = audioBuffersRef.current[pad.id];
    if (cachedBuffer) return Promise.resolve(cachedBuffer);

    const pendingBuffer = bufferPromisesRef.current[pad.id];
    if (pendingBuffer) return pendingBuffer;

    const bufferPromise = fetch(pad.audioSrc, { signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load ${pad.id} drum sample`);
        return response.arrayBuffer();
      })
      .then((arrayBuffer) => context.decodeAudioData(arrayBuffer))
      .then((buffer) => {
        if (!signal?.aborted && context === audioContextRef.current) {
          audioBuffersRef.current[pad.id] = buffer;
        }
        return buffer;
      })
      .catch((error) => {
        if (bufferPromisesRef.current[pad.id] === bufferPromise) {
          delete bufferPromisesRef.current[pad.id];
        }
        throw error;
      });

    bufferPromisesRef.current[pad.id] = bufferPromise;
    return bufferPromise;
  }, []);

  useEffect(() => {
    const preloadController = new AbortController();
    const context = getAudioContext();
    const effectTimers = effectTimersRef.current;

    if (context) {
      DRUM_PADS.forEach((pad) => {
        void loadAudioBuffer(context, pad, preloadController.signal).catch(() => undefined);
      });
    }

    return () => {
      preloadController.abort();
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        void audioContextRef.current.close();
      }
      audioContextRef.current = null;
      masterGainRef.current = null;
      audioBuffersRef.current = {};
      bufferPromisesRef.current = {};
      if (hitRecoveryTimerRef.current) window.clearTimeout(hitRecoveryTimerRef.current);
      effectTimers.forEach((timer) => window.clearTimeout(timer));
      effectTimers.clear();
    };
  }, [getAudioContext, loadAudioBuffer]);

  const createDrumOutput = (context: AudioContext, drum: DrumId) => {
    const drumGain = context.createGain();
    drumGain.gain.value = DRUM_GAIN[drum];
    drumGain.connect(masterGainRef.current ?? context.destination);
    return drumGain;
  };

  const playSynthesizedDrum = (context: AudioContext, drum: DrumId) => {
    const output = createDrumOutput(context, drum);
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

    try {
      if (context.state === "suspended") await context.resume();
    } catch {
      return;
    }

    const buffer = audioBuffersRef.current[pad.id];
    if (!buffer) {
      playSynthesizedDrum(context, pad.id);
      return;
    }

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(createDrumOutput(context, pad.id));
    source.start();
  };

  const triggerDrum = (drumId: DrumId) => {
    const pad = DRUM_PADS.find((candidate) => candidate.id === drumId);
    if (!pad) return;

    setActivePad(pad.id);
    setHitCount((current) => current + 1);
    setHitCounts((currentCounts) => ({ ...currentCounts, [pad.id]: currentCounts[pad.id] + 1 }));
    effectSequenceRef.current += 1;
    const effectId = effectSequenceRef.current;
    setHitEffects((currentEffects) => ({
      ...currentEffects,
      [pad.id]: [...currentEffects[pad.id], effectId].slice(-6),
    }));

    const effectTimer = window.setTimeout(() => {
      setHitEffects((currentEffects) => ({
        ...currentEffects,
        [pad.id]: currentEffects[pad.id].filter((id) => id !== effectId),
      }));
      effectTimersRef.current.delete(effectTimer);
    }, 620);
    effectTimersRef.current.add(effectTimer);
    void playSample(pad);

    if (hitRecoveryTimerRef.current) window.clearTimeout(hitRecoveryTimerRef.current);
    hitRecoveryTimerRef.current = window.setTimeout(() => {
      setActivePad(null);
      hitRecoveryTimerRef.current = null;
    }, 170);
  };

  const activatePad = (pad: (typeof DRUM_PADS)[number]) => triggerDrum(pad.id);

  useEffect(() => {
    triggerDrumRef.current = triggerDrum;
  });

  useEffect(() => {
    const handleShortcut = (event: globalThis.KeyboardEvent) => {
      const target = event.target;
      if (
        event.repeat ||
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }

      const drumId = KEY_TO_DRUM[event.code];
      if (!drumId) return;

      event.preventDefault();
      triggerDrumRef.current(drumId);
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <div
      className="device-watch-stage"
      aria-label="Three Apple Watch drum pads"
      aria-describedby="watch-drum-shortcuts"
    >
      <p id="watch-drum-shortcuts" className="watch-drum-sr-only">
        Use A for Kick, S for Snare, and D for Hi-hat. Enter or Space plays the focused Watch.
      </p>
      <div className="device-watch-group">
        {DRUM_PADS.map((pad) => (
          <WatchFrame
            key={pad.id}
            variant={pad.variant}
            ariaLabel={format(messages.drum.padShortcutLabel, {
              pad:
                pad.id === "kick"
                  ? messages.drum.kickLabel
                  : pad.id === "snare"
                    ? messages.drum.snareLabel
                    : messages.drum.hiHatLabel,
              shortcut: pad.shortcut,
            })}
            onActivate={() => activatePad(pad)}
            hitKey={hitCounts[pad.id]}
            isHit={activePad === pad.id}
          >
            <span className={`watch-drum-pad watch-drum-pad--${pad.id}${activePad === pad.id ? " is-active" : ""}`}>
              <span className="watch-drum-type">
                {pad.id === "kick" ? "LOW" : pad.id === "snare" ? "SNAP" : "TICK"}
              </span>
              <span className="watch-drum-disc">
                <span className="watch-drum-pattern" aria-hidden="true">
                  {Array.from({ length: 6 }, (_, index) => <i key={index} />)}
                </span>
                <strong>{pad.label}</strong>
              </span>
              <span className="watch-drum-splashes" aria-hidden="true">
                {hitEffects[pad.id].map((effectId) => (
                  <span className="watch-drum-splash" key={effectId}>
                    <span className="watch-drum-rings">
                      <i />
                      <i />
                      <i />
                    </span>
                    <span className="watch-drum-droplets">
                      {Array.from({ length: 6 }, (_, index) => <i key={index} />)}
                    </span>
                  </span>
                ))}
              </span>
              <small>{pad.shortcut}</small>
            </span>
          </WatchFrame>
        ))}
      </div>
      <div className="watch-hit-counter" aria-label={`${hitCount} HITS`}>
        <span key={hitCount} className="watch-hit-counter-value">
          {String(hitCount).padStart(2, "0")}
        </span>
        <span className="watch-hit-counter-label">HITS</span>
      </div>
    </div>
  );
}
