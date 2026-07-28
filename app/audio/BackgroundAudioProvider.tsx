"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

const BACKGROUND_AUDIO_PATH = "/assets/mp3/main.mp3";
const BACKGROUND_AUDIO_VOLUME = 0.2;
const BACKGROUND_AUDIO_MUTED_STORAGE_KEY = "same-studio-background-audio-muted-v1";
const PLAYBACK_START_EVENTS = ["pointerdown", "touchstart", "keydown"] as const;

let sharedAudio: HTMLAudioElement | null = null;
let sharedAudioUsers = 0;
let sharedAudioDisposalTimer: number | null = null;

function acquireBackgroundAudio(): HTMLAudioElement {
  if (sharedAudioDisposalTimer !== null) {
    window.clearTimeout(sharedAudioDisposalTimer);
    sharedAudioDisposalTimer = null;
  }

  if (!sharedAudio) {
    sharedAudio = new Audio(BACKGROUND_AUDIO_PATH);
    sharedAudio.loop = true;
    sharedAudio.preload = "auto";
    sharedAudio.volume = BACKGROUND_AUDIO_VOLUME;
    sharedAudio.dataset.sameStudioBackgroundAudio = "true";
  }
  if (!sharedAudio.isConnected) document.body.appendChild(sharedAudio);

  sharedAudioUsers += 1;
  return sharedAudio;
}

function releaseBackgroundAudio(audio: HTMLAudioElement) {
  sharedAudioUsers = Math.max(0, sharedAudioUsers - 1);
  if (sharedAudioUsers > 0 || sharedAudioDisposalTimer !== null) return;

  sharedAudioDisposalTimer = window.setTimeout(() => {
    sharedAudioDisposalTimer = null;
    if (sharedAudioUsers > 0 || sharedAudio !== audio) return;

    audio.pause();
    audio.remove();
    audio.removeAttribute("src");
    audio.load();
    sharedAudio = null;
  }, 0);
}

type BackgroundAudioContextValue = {
  muted: boolean;
  setMuted: (muted: boolean) => void;
  toggleMuted: () => void;
  requestPlayback: () => void;
};

const BackgroundAudioContext =
  createContext<BackgroundAudioContextValue | null>(null);

function readStoredMutedPreference() {
  if (typeof window === "undefined") return false;

  try {
    return (
      window.localStorage.getItem(BACKGROUND_AUDIO_MUTED_STORAGE_KEY) ===
      "true"
    );
  } catch {
    return false;
  }
}

export function BackgroundAudioProvider({ children }: { children: ReactNode }) {
  const [muted, setMutedState] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeRef = useRef(false);
  const playbackAttemptRef = useRef<Promise<void> | null>(null);
  const playbackRequestRef = useRef<() => void>(() => undefined);
  const interactionHandlerRef = useRef<EventListener | null>(null);
  const listenersInstalledRef = useRef(false);

  const removePlaybackListeners = useCallback(() => {
    const handler = interactionHandlerRef.current;
    if (!handler || !listenersInstalledRef.current) return;

    PLAYBACK_START_EVENTS.forEach((eventName) => {
      window.removeEventListener(eventName, handler);
    });
    listenersInstalledRef.current = false;
  }, []);

  const installPlaybackListeners = useCallback(() => {
    if (listenersInstalledRef.current) return;

    const handler: EventListener = () => playbackRequestRef.current();
    interactionHandlerRef.current = handler;
    PLAYBACK_START_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handler, {
        once: true,
        passive: true,
      });
    });
    listenersInstalledRef.current = true;
  }, []);

  const requestPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || audio.muted) return;

    if (!audio.paused) {
      removePlaybackListeners();
      return;
    }
    if (playbackAttemptRef.current) return;

    let playbackAttempt: Promise<void>;
    try {
      playbackAttempt = audio.play();
    } catch {
      installPlaybackListeners();
      return;
    }

    playbackAttemptRef.current = playbackAttempt;
    void playbackAttempt
      .then(() => {
        if (activeRef.current) removePlaybackListeners();
      })
      .catch(() => {
        if (activeRef.current) installPlaybackListeners();
      })
      .finally(() => {
        if (playbackAttemptRef.current === playbackAttempt) {
          playbackAttemptRef.current = null;
        }
      });
  }, [installPlaybackListeners, removePlaybackListeners]);

  useEffect(() => {
    activeRef.current = true;
    playbackRequestRef.current = requestPlayback;

    const audio = acquireBackgroundAudio();
    audioRef.current = audio;

    const storedMutedPreference = readStoredMutedPreference();
    audio.muted = storedMutedPreference;
    window.queueMicrotask(() => {
      if (activeRef.current) setMutedState(storedMutedPreference);
    });
    if (!storedMutedPreference) requestPlayback();

    return () => {
      activeRef.current = false;
      playbackRequestRef.current = () => undefined;
      removePlaybackListeners();
      playbackAttemptRef.current = null;
      audioRef.current = null;
      releaseBackgroundAudio(audio);
    };
  }, [removePlaybackListeners, requestPlayback]);

  const setMuted = useCallback(
    (nextMuted: boolean) => {
      setMutedState(nextMuted);
      const audio = audioRef.current;
      if (audio) audio.muted = nextMuted;

      try {
        window.localStorage.setItem(
          BACKGROUND_AUDIO_MUTED_STORAGE_KEY,
          String(nextMuted),
        );
      } catch {
        // Keep the in-memory preference when storage is unavailable.
      }

      if (nextMuted) {
        removePlaybackListeners();
      } else {
        requestPlayback();
      }
    },
    [removePlaybackListeners, requestPlayback],
  );

  const toggleMuted = useCallback(() => {
    setMuted(!muted);
  }, [muted, setMuted]);

  const value = useMemo(
    () => ({
      muted,
      setMuted,
      toggleMuted,
      requestPlayback,
    }),
    [muted, requestPlayback, setMuted, toggleMuted],
  );

  return (
    <BackgroundAudioContext.Provider value={value}>
      {children}
    </BackgroundAudioContext.Provider>
  );
}

export function useBackgroundAudio() {
  const value = useContext(BackgroundAudioContext);
  if (!value) {
    throw new Error(
      "useBackgroundAudio must be used within BackgroundAudioProvider",
    );
  }
  return value;
}
