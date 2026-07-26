"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import type { JellyInteraction } from "./JellyCanvas";
import { AppDetailOverlay } from "./app-detail/AppDetailOverlay";
import { DeviceShowcase } from "./device-showcase/DeviceShowcase";
import {
  TypeReveal,
  TypeRevealGroup,
} from "./type-reveal/TypeReveal";
import { getTypeRevealDelay } from "./type-reveal/typeRevealTiming";
import { apps, DEFAULT_APP_INDEX, type AppItem } from "../lib/apps";
import { HERO_ANDROID_APP_IDS } from "../lib/appDetailCapabilities";

const JellyCanvas = dynamic(() => import("./JellyCanvas"), { ssr: false });
const LoaderJellyCanvas = dynamic(() => import("./JellyCanvas"), {
  ssr: false,
  loading: () => (
    <div
      className="jelly-fallback preloader-jelly preloader-module-fallback"
      aria-hidden="true"
    >
      <span />
    </div>
  ),
});

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const progress = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return progress * progress * (3 - 2 * progress);
};

const LOADER_WORDS = ["SAME", "STUDIO"] as const;
const LOADER_DURATION = 2400;
const LOADER_COMPLETE_HOLD_MS = 250;
const LOADER_JELLY_EXIT_MS = 420;
const LOADER_LOGO_MOVE_MS = 650;
const LOADER_EFFECT_MS = 550;
const FINAL_LOGO_HOLD_MS = 800;
const LOADER_EXIT_MS = 450;
const AUTOPLAY_RESUME_DELAY_MS = 3000;
const TYPE_CHAR_INTERVAL_MS = 70;
const NAME_EMPHASIS_MS = 300;
const PLATFORM_REVEAL_MS = 250;
const DETAIL_REVEAL_MS = 300;
const ACTIVE_COMPLETE_HOLD_MS = 500;
const PLAY_RESUME_DELAY_MS = 400;
const FAST_FORWARD_TRANSITION_MS = 280;
const FAST_FORWARD_GAP_MS = 70;
const REDUCED_MOTION_FAST_FORWARD_TRANSITION_MS = 360;
const ABOUT_REVEAL_STEPS = [
  { text: "SAME STUDIO / ABOUT", speed: 32 },
  { text: "Small apps, made with a lot of care.", speed: 45 },
  {
    text: "SAME STUDIO is an independent mobile app studio based in Daejeon, Korea. We build gentle tools for records, places, rhythm, and focus.",
    speed: 18,
  },
  {
    text: "Soft on first impression, dependable in daily use. Each app is designed to make a small recurring moment feel a little clearer.",
    speed: 18,
  },
] as const;
const CONTACT_REVEAL_STEPS = [
  { text: "CONTACT", speed: 32 },
  { text: "Say hello.", speed: 45 },
  {
    text: "앱 이용 문의, 제휴, 오류 제보는 이메일로 연락해주세요.",
    speed: 18,
  },
  {
    text: "필요한 내용을 확인한 뒤 순차적으로 답변드립니다.",
    speed: 18,
  },
  { text: "contact@samestudio.kr", speed: 32 },
] as const;
const HEADER_LANGUAGES = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "zh-CN", label: "简体中文" },
  { code: "zh-TW", label: "繁體中文" },
] as const;
type HeaderLanguageCode = (typeof HEADER_LANGUAGES)[number]["code"];
type LoaderPhase =
  | "loading"
  | "complete"
  | "revealing"
  | "effect"
  | "final"
  | "leaving";
type ActiveSequencePhase =
  | "idle"
  | "typing"
  | "name-emphasis"
  | "platform-reveal"
  | "detail-reveal"
  | "hold"
  | "complete";
type SpaceObject = {
  depth: "far" | "near";
  type: "dot" | "star" | "ring" | "sphere" | "diamond";
  motion: "a" | "b";
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
  rotation: number;
};
const SPACE_OBJECTS: SpaceObject[] = [
  { depth: "far", type: "dot", motion: "a", x: 5, y: 13, size: 2, color: "#ffffff", opacity: 0.42, duration: 7.3, delay: 1.1, driftX: 8, driftY: 5, rotation: 4 },
  { depth: "far", type: "ring", motion: "b", x: 93, y: 15, size: 10, color: "#d9cbff", opacity: 0.34, duration: 10.8, delay: 4.2, driftX: -4, driftY: 11, rotation: -7 },
  { depth: "far", type: "dot", motion: "a", x: 8, y: 33, size: 2, color: "#f5c4e7", opacity: 0.48, duration: 8.9, delay: 2.7, driftX: 12, driftY: 3, rotation: 8 },
  { depth: "far", type: "dot", motion: "b", x: 95, y: 38, size: 2, color: "#b8d8ff", opacity: 0.38, duration: 12.1, delay: 5.4, driftX: -5, driftY: 7, rotation: -5 },
  { depth: "far", type: "dot", motion: "a", x: 6, y: 56, size: 2, color: "#bda5ff", opacity: 0.28, duration: 9.7, delay: 3.8, driftX: 6, driftY: 9, rotation: 7 },
  { depth: "far", type: "dot", motion: "b", x: 92, y: 60, size: 3, color: "#d9cbff", opacity: 0.27, duration: 13.4, delay: 7.2, driftX: -9, driftY: 4, rotation: -6 },
  { depth: "far", type: "dot", motion: "a", x: 10, y: 79, size: 3, color: "#ffffff", opacity: 0.5, duration: 8.2, delay: 0.9, driftX: 5, driftY: 10, rotation: 3 },
  { depth: "far", type: "star", motion: "b", x: 89, y: 82, size: 8, color: "#f5c4e7", opacity: 0.36, duration: 11.6, delay: 6.1, driftX: -7, driftY: 6, rotation: -8 },
  { depth: "far", type: "dot", motion: "a", x: 18, y: 12, size: 2, color: "#bda5ff", opacity: 0.3, duration: 9.1, delay: 4.8, driftX: 4, driftY: 5, rotation: 4 },
  { depth: "far", type: "dot", motion: "b", x: 82, y: 22, size: 2, color: "#b8d8ff", opacity: 0.32, duration: 12.8, delay: 8.3, driftX: -6, driftY: 3, rotation: -3 },
  { depth: "far", type: "ring", motion: "a", x: 3, y: 70, size: 9, color: "#ffffff", opacity: 0.24, duration: 10.2, delay: 2.2, driftX: 8, driftY: 6, rotation: 6 },
  { depth: "far", type: "dot", motion: "b", x: 97, y: 74, size: 2, color: "#d9cbff", opacity: 0.44, duration: 7.8, delay: 5.9, driftX: -5, driftY: 8, rotation: -5 },
  { depth: "far", type: "diamond", motion: "a", x: 13, y: 92, size: 10, color: "#b8d8ff", opacity: 0.25, duration: 13.8, delay: 9.1, driftX: 7, driftY: 4, rotation: 8 },
  { depth: "far", type: "sphere", motion: "b", x: 87, y: 91, size: 12, color: "#f5c4e7", opacity: 0.24, duration: 11.1, delay: 3.3, driftX: -8, driftY: 5, rotation: -7 },
  { depth: "near", type: "dot", motion: "b", x: 4, y: 22, size: 2, color: "#ffffff", opacity: 0.52, duration: 7.1, delay: 3.1, driftX: -6, driftY: 5, rotation: -8 },
  { depth: "near", type: "dot", motion: "a", x: 96, y: 29, size: 2, color: "#bda5ff", opacity: 0.38, duration: 9.4, delay: 6.7, driftX: 5, driftY: 9, rotation: 7 },
  { depth: "near", type: "sphere", motion: "b", x: 9, y: 47, size: 10, color: "#b8d8ff", opacity: 0.32, duration: 12.5, delay: 1.6, driftX: -8, driftY: 4, rotation: -5 },
  { depth: "near", type: "diamond", motion: "a", x: 91, y: 49, size: 8, color: "#d9cbff", opacity: 0.4, duration: 8.6, delay: 4.5, driftX: 6, driftY: 7, rotation: 8 },
  { depth: "near", type: "dot", motion: "b", x: 2, y: 44, size: 3, color: "#f5c4e7", opacity: 0.46, duration: 10.6, delay: 7.8, driftX: -4, driftY: 10, rotation: -4 },
  { depth: "near", type: "star", motion: "a", x: 98, y: 55, size: 9, color: "#ffffff", opacity: 0.42, duration: 13.1, delay: 2.9, driftX: 7, driftY: 5, rotation: 9 },
  { depth: "near", type: "dot", motion: "b", x: 15, y: 68, size: 2, color: "#d9cbff", opacity: 0.34, duration: 8.1, delay: 5.2, driftX: -5, driftY: 6, rotation: -3 },
  { depth: "near", type: "dot", motion: "a", x: 85, y: 69, size: 2, color: "#b8d8ff", opacity: 0.4, duration: 11.9, delay: 8.7, driftX: 4, driftY: 8, rotation: 5 },
  { depth: "near", type: "ring", motion: "b", x: 7, y: 88, size: 12, color: "#bda5ff", opacity: 0.3, duration: 9.9, delay: 3.6, driftX: -7, driftY: 4, rotation: -8 },
  { depth: "near", type: "star", motion: "a", x: 93, y: 88, size: 7, color: "#f5c4e7", opacity: 0.44, duration: 12.3, delay: 6.4, driftX: 6, driftY: 5, rotation: 7 },
  { depth: "near", type: "dot", motion: "b", x: 24, y: 91, size: 2, color: "#ffffff", opacity: 0.32, duration: 7.6, delay: 1.8, driftX: -4, driftY: 7, rotation: -4 },
  { depth: "near", type: "dot", motion: "a", x: 76, y: 94, size: 2, color: "#d9cbff", opacity: 0.36, duration: 10.4, delay: 7.4, driftX: 5, driftY: 4, rotation: 5 },
];

const getSpaceObjectStyle = (object: SpaceObject) =>
  ({
    left: `${object.x}%`,
    top: `${object.y}%`,
    width: `${object.size}px`,
    height: `${object.size}px`,
    color: object.color,
    animationDuration: `${object.duration}s`,
    animationDelay: `-${object.delay}s`,
    "--object-opacity": object.opacity,
    "--float-x-a": `${object.driftX}px`,
    "--float-y-a": `${-object.driftY}px`,
    "--float-x-b": `${object.driftX * -0.62}px`,
    "--float-y-b": `${object.driftY * 0.78}px`,
    "--float-x-c": `${object.driftX * 0.28}px`,
    "--float-y-c": `${object.driftY * 0.36}px`,
    "--float-rotation-a": `${object.rotation}deg`,
    "--float-rotation-b": `${object.rotation * -0.65}deg`,
    "--float-rotation-c": `${object.rotation * 0.35}deg`,
    "--float-rotation-d": `${object.rotation * -0.55}deg`,
    "--float-rotation-e": `${object.rotation * 0.42}deg`,
  }) as CSSProperties;

const smoothStep = (value: number) => value * value * (3 - 2 * value);

const wrapIndex = (index: number) =>
  ((index % apps.length) + apps.length) % apps.length;

const getCircularSlot = (appIndex: number, progress: number) => {
  const nearestCycle = Math.round((progress - appIndex) / apps.length);
  return appIndex + nearestCycle * apps.length - progress;
};

const interpolateSlotValue = (absoluteSlot: number, anchors: number[]) => {
  const lower = Math.min(Math.floor(absoluteSlot), anchors.length - 1);
  const upper = Math.min(lower + 1, anchors.length - 1);
  const progress = smoothstep(0, 1, absoluteSlot - Math.floor(absoluteSlot));
  return anchors[lower] + (anchors[upper] - anchors[lower]) * progress;
};

const sampleTensionCurve = (
  progress: number,
  anchors: ReadonlyArray<readonly [number, number]>,
) => {
  const value = clamp(progress, 0, 1);

  for (let index = 1; index < anchors.length; index += 1) {
    const [endProgress, endValue] = anchors[index];
    if (value > endProgress) continue;
    const [startProgress, startValue] = anchors[index - 1];
    const segment = smoothstep(
      0,
      1,
      (value - startProgress) / Math.max(endProgress - startProgress, 0.001),
    );
    return startValue + (endValue - startValue) * segment;
  }

  return anchors.at(-1)?.[1] ?? 0;
};

const ENTER_TENSION_CURVE = [
  [0, 0],
  [0.25, 0.24],
  [0.5, 0.47],
  [0.75, 0.82],
  [0.9, 1],
  [0.97, 1],
  [1, 0],
] as const;

const EXIT_TENSION_CURVE = [
  [0, 0],
  [0.3, 0.3],
  [0.55, 0.6],
  [0.75, 0.9],
  [0.9, 1],
  [0.97, 1],
  [1, 0],
] as const;

const presentationProgress = (elapsed: number) => {
  const points = [
    [0, 0],
    [400, 0.12],
    [800, 0.28],
    [1200, 0.48],
    [1600, 0.67],
    [2000, 0.84],
    [2300, 0.95],
    [LOADER_DURATION, 1],
  ] as const;
  const time = clamp(elapsed, 0, LOADER_DURATION);

  for (let index = 1; index < points.length; index += 1) {
    const [endTime, endProgress] = points[index];
    if (time > endTime) continue;
    const [startTime, startProgress] = points[index - 1];
    const segmentProgress = smoothStep(
      (time - startTime) / (endTime - startTime),
    );
    return startProgress + (endProgress - startProgress) * segmentProgress;
  }

  return 1;
};

const easeSlot = (slot: number, width: number) => {
  const sign = Math.sign(slot);
  const absolute = Math.abs(slot);
  const mobile = width < 768;
  const tablet = width >= 768 && width < 1024;
  const anchors = mobile
    ? [0, width * 0.59, width * 1.04, width * 1.35]
    : tablet
      ? [0, width * 0.31, width * 0.46, width * 0.58]
      : [0, width * 0.22, width * 0.39, width * 0.5, width * 0.58];
  const lower = Math.min(Math.floor(absolute), anchors.length - 1);
  const upper = Math.min(lower + 1, anchors.length - 1);
  const mix = absolute - Math.floor(absolute);
  return sign * (anchors[lower] + (anchors[upper] - anchors[lower]) * mix);
};

function AppCard({
  app,
  index,
  setRef,
  onSelect,
}: {
  app: AppItem;
  index: number;
  setRef: (node: HTMLButtonElement | null) => void;
  onSelect: (index: number) => void;
}) {
  return (
    <button
      ref={setRef}
      className="app-card"
      type="button"
      aria-label={`Select ${app.name}`}
      onClick={() => onSelect(index)}
    >
      <Image
        className="carousel-app-icon"
        src={app.icon}
        alt=""
        fill
        sizes="(max-width: 767px) 56vw, (max-width: 1023px) 32vw, 21vw"
        draggable={false}
        unoptimized
      />
    </button>
  );
}

function PlatformIcon({ platform }: { platform: "apple" | "android" }) {
  return (
    <span className="platform-icon-interaction" aria-hidden="true">
      {platform === "apple" ? (
      <svg
        className="platform-icon"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.25.07 2.12.69 2.85.74 1.1-.22 2.15-.85 3.32-.76 1.4.11 2.45.66 3.15 1.66-2.89 1.74-2.2 5.55.45 6.62-.53 1.4-1.21 2.79-1.77 4.71ZM12.03 7.25c-.15-2.08 1.55-3.8 3.49-3.97.27 2.4-2.18 4.2-3.49 3.97Z" />
      </svg>
      ) : (
        <svg
          className="platform-icon"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="m7.38 6.26-1.3-2.25.87-.5 1.33 2.3A7.55 7.55 0 0 1 12 4.85c1.34 0 2.6.35 3.7.96l1.34-2.3.87.5-1.3 2.25A7.48 7.48 0 0 1 19.5 12H4.5a7.48 7.48 0 0 1 2.88-5.74ZM8.5 9.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm7 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM4.5 13h15v5.5a1.5 1.5 0 0 1-1.5 1.5h-1v2.25a1.25 1.25 0 0 1-2.5 0V20h-5v2.25a1.25 1.25 0 0 1-2.5 0V20H6a1.5 1.5 0 0 1-1.5-1.5V13ZM2.75 13A1.25 1.25 0 0 1 4 14.25v3.5a1.25 1.25 0 0 1-2.5 0v-3.5A1.25 1.25 0 0 1 2.75 13Zm18.5 0a1.25 1.25 0 0 1 1.25 1.25v3.5a1.25 1.25 0 0 1-2.5 0v-3.5A1.25 1.25 0 0 1 21.25 13Z" />
        </svg>
      )}
      <i className="platform-sparkle sparkle-a" />
      <i className="platform-sparkle sparkle-b" />
    </span>
  );
}

function PlatformIcons({ app }: { app: AppItem }) {
  const supportsApple = true;
  const supportsAndroid = HERO_ANDROID_APP_IDS.has(app.id);
  const platformNames = [
    supportsApple ? "Apple" : null,
    supportsAndroid ? "Android" : null,
  ].filter(Boolean);

  if (platformNames.length === 0) return null;

  return (
    <span
      className="platform-icons"
      aria-label={`Supported platforms: ${platformNames.join(", ")}`}
    >
      {supportsApple && <PlatformIcon platform="apple" />}
      {supportsAndroid && <PlatformIcon platform="android" />}
    </span>
  );
}

function SocialIcon({ platform }: { platform: "github" | "x" | "instagram" | "threads" }) {
  if (platform === "github") {
    return <svg className="footer-social-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.76-.24.76-.54v-2.08c-3.1.67-3.76-1.32-3.76-1.32-.5-1.3-1.24-1.64-1.24-1.64-1.02-.7.08-.69.08-.69 1.12.08 1.72 1.16 1.72 1.16 1 1.71 2.62 1.22 3.26.93.1-.73.39-1.22.71-1.5-2.48-.28-5.08-1.24-5.08-5.52 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.1-2.96 0 0 .94-.3 3.08 1.15a10.6 10.6 0 0 1 5.6 0c2.14-1.45 3.08-1.15 3.08-1.15.6 1.54.22 2.68.1 2.96.72.78 1.15 1.78 1.15 3 0 4.29-2.61 5.24-5.1 5.52.4.35.76 1.03.76 2.08v3.06c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8z" /></svg>;
  }
  if (platform === "x") {
    return <svg className="footer-social-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14.27 10.16 22.65 0h-1.99l-7.28 8.82L7.57 0H.86l8.79 13.1L.86 23.76h1.99l7.68-9.31 6.13 9.31h6.71l-9.1-13.6Zm-2.72 3.3-.89-1.31L3.57 1.53h3.05l5.72 8.56.89 1.31 7.44 10.94h-3.05l-6.07-8.88Z" /></svg>;
  }
  if (platform === "instagram") {
    return <svg className="footer-social-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7.3 2h9.4A5.3 5.3 0 0 1 22 7.3v9.4a5.3 5.3 0 0 1-5.3 5.3H7.3A5.3 5.3 0 0 1 2 16.7V7.3A5.3 5.3 0 0 1 7.3 2Zm0 2A3.3 3.3 0 0 0 4 7.3v9.4A3.3 3.3 0 0 0 7.3 20h9.4a3.3 3.3 0 0 0 3.3-3.3V7.3A3.3 3.3 0 0 0 16.7 4H7.3Zm4.7 3.4a4.6 4.6 0 1 1 0 9.2 4.6 4.6 0 0 1 0-9.2Zm0 2a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2Zm5-2.65a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z" /></svg>;
  }
  return <svg className="footer-social-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.263 11.097c-.03-3.486-1.92-5.586-5.111-5.586-2.13 0-3.922.963-4.863 2.499l2.062 1.438c.535-.843 1.272-1.543 2.628-1.543 1.528 0 2.318.85 2.544 2.431a15 15 0 0 0-2.236-.173c-4.125 0-6.068 1.867-6.068 4.336s1.943 3.99 4.804 3.99c3.139 0 5.013-2.115 5.781-4.735.798.361 1.348 1.204 1.348 2.47 0 3.387-3.907 5.232-7.22 5.232-4.885 0-8.077-3.207-8.077-8.424 0-6.392 4.223-10.487 9.9-10.487 3.808 0 5.69 1.671 6.97 3.914l2.108-1.475C21.44 2.078 18.331 0 13.663 0 6.227 0 1.168 5.277 1.168 12.934c0 7 4.953 11.066 10.856 11.066 4.878 0 9.809-2.846 9.809-7.716 0-2.545-1.46-4.231-3.569-5.187m-6.33 4.855c-1.077 0-2.026-.512-2.026-1.453 0-1.483 1.822-1.934 3.606-1.934.678 0 1.34.045 1.927.173-.422 1.927-1.671 3.215-3.508 3.214Z" /></svg>;
}

function Loader({
  progress,
  interactionRef,
  reducedMotion,
  phase,
  completionMediaVisible,
  containerRef,
}: {
  progress: number;
  interactionRef: React.MutableRefObject<JellyInteraction>;
  reducedMotion: boolean;
  phase: LoaderPhase;
  completionMediaVisible: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const normalizedProgress = clamp(progress / 100, 0, 1);
  const displayProgress = Math.floor(progress);

  return (
    <div
      ref={containerRef}
      className={`preloader is-${phase}`}
      role="status"
      aria-live="polite"
      aria-label={phase === "loading" ? `Loading ${displayProgress}%` : "Loading complete"}
      data-loader-progress={normalizedProgress.toFixed(3)}
      data-loader-phase={phase}
      style={
        {
          "--loader-progress": normalizedProgress,
          "--loader-wordmark-shift": `${(1 - normalizedProgress) * 115}px`,
          "--loader-wordmark-mobile-shift": `${(1 - normalizedProgress) * 84}px`,
          "--loader-wordmark-short-shift": `${(1 - normalizedProgress) * 46}px`,
        } as CSSProperties
      }
    >
      <div className="preloader-pointer-glow" aria-hidden="true" />
      <span className="preloader-wordmark" aria-label="SAME STUDIO">
        {LOADER_WORDS.map((word, wordIndex) => (
          <span className="preloader-word" aria-hidden="true" key={word}>
            {[...word].map((letter, letterIndex) => {
              const revealIndex = letterIndex + (wordIndex === 0 ? 0 : 4);
              return (
                <span
                  className={`preloader-letter ${
                    displayProgress >= revealIndex * 10 ? "is-visible" : ""
                  }`}
                  key={`${word}-${letterIndex}`}
                  style={{ "--final-letter-index": revealIndex } as CSSProperties}
                >
                  {letter}
                </span>
              );
            })}
          </span>
        ))}
      </span>
      <div className="preloader-final-glow" aria-hidden="true" />
      {completionMediaVisible && (
        <>
          <LoaderJellyCanvas
            className="preloader-jelly"
            interactionRef={interactionRef}
            reducedMotion={reducedMotion}
            loader
            loaderProgress={normalizedProgress}
          />
          <span className="preloader-count">
            {String(displayProgress).padStart(3, "0")}<small>%</small>
          </span>
        </>
      )}
    </div>
  );
}

export function HomeExperience() {
  const [activeIndex, setActiveIndex] = useState(DEFAULT_APP_INDEX);
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] =
    useState<HeaderLanguageCode>("ko");
  const [darkPressKey, setDarkPressKey] = useState(0);
  const [headerUtilityHidden, setHeaderUtilityHidden] = useState(false);
  const [headerUtilityDragging, setHeaderUtilityDragging] = useState(false);
  const [headerUtilityDragX, setHeaderUtilityDragX] = useState(0);
  const [headerUtilityHideDistance, setHeaderUtilityHideDistance] = useState(0);
  const [headerUtilityHintKey, setHeaderUtilityHintKey] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loaderPhase, setLoaderPhase] = useState<LoaderPhase>("loading");
  const [loaderCompletionMediaVisible, setLoaderCompletionMediaVisible] = useState(true);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFastForwarding, setIsFastForwarding] = useState(false);
  const [wordmarkPulse, setWordmarkPulse] = useState({ key: 0, fast: false });
  const [activeSequencePhase, setActiveSequencePhase] =
    useState<ActiveSequencePhase>("idle");
  const [typedNameLength, setTypedNameLength] = useState(0);
  const [detailApp, setDetailApp] = useState<AppItem | null>(null);
  const [detailOverlayOpen, setDetailOverlayOpen] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const headerUtilityRef = useRef<HTMLDivElement>(null);
  const headerLanguageButtonRef = useRef<HTMLButtonElement>(null);
  const headerUtilityHandleRef = useRef<HTMLButtonElement>(null);
  const headerUtilityWasHiddenRef = useRef(false);
  const headerUtilitySuppressClickRef = useRef(false);
  const headerUtilityDragRef = useRef({
    id: -1,
    startX: 0,
    startY: 0,
    distanceX: 0,
    horizontal: false,
  });
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const progressRef = useRef(DEFAULT_APP_INDEX);
  const targetRef = useRef(DEFAULT_APP_INDEX);
  const transitionOriginRef = useRef(DEFAULT_APP_INDEX);
  const velocityRef = useRef(0);
  const activeIndexRef = useRef(DEFAULT_APP_INDEX);
  const pointerRef = useRef({
    id: -1,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastTime: 0,
    startProgress: DEFAULT_APP_INDEX,
    velocity: 0,
    dragging: false,
    horizontal: false,
  });
  const interactionRef = useRef<JellyInteraction>({
    phase: "idle",
    velocity: 0,
    direction: 1,
    stretch: 0,
    transition: 0,
    enterDirection: 1,
    exitDirection: -1,
    enterStrength: 0,
    exitStrength: 0,
    releaseDirection: 1,
    releaseStrength: 0,
    springResponse: 0,
    settleAmplitude: 0,
    settlePhase: 0,
    idleStrength: 1,
    fastForwarding: false,
    accent: apps[DEFAULT_APP_INDEX].accent,
    pointerX: 0,
    pointerY: 0,
    pointerStrength: 0,
  });
  const loaderInteractionRef = useRef<JellyInteraction>({
    phase: "idle",
    velocity: 0,
    direction: 1,
    stretch: 0.02,
    transition: 0,
    enterDirection: 1,
    exitDirection: -1,
    enterStrength: 0,
    exitStrength: 0,
    releaseDirection: 1,
    releaseStrength: 0,
    springResponse: 0,
    settleAmplitude: 0,
    settlePhase: 0,
    idleStrength: 1,
    fastForwarding: false,
    accent: "#a873ff",
    pointerX: 0,
    pointerY: 0,
    pointerStrength: 0,
  });
  const depthTargetRef = useRef({ x: 0, y: 0, strength: 0 });
  const depthCurrentRef = useRef({ x: 0, y: 0, strength: 0 });
  const depthBoundsRef = useRef({ left: 0, top: 0, width: 1, height: 1 });
  const depthEnabledRef = useRef(false);
  const requestDepthFrameRef = useRef<() => void>(() => {});
  const updatePointerTargetRef = useRef<
    (clientX: number, clientY: number, pointerType?: string) => void
  >(() => {});
  const autoplayTimerRef = useRef<number | null>(null);
  const fastForwardTimerRef = useRef<number | null>(null);
  const fastForwardPointerIdRef = useRef(-1);
  const fastForwardSnapPendingRef = useRef(false);
  const autoplayEnabledRef = useRef(false);
  const autoplayAdvancePendingRef = useRef(false);
  const autoplayResumeNotBeforeRef = useRef(0);
  const isPlayingRef = useRef(true);
  const isTransitioningRef = useRef(false);
  const isFastForwardingRef = useRef(false);
  const settledWordmarkIndexRef = useRef(DEFAULT_APP_INDEX);
  const lastWordmarkPulseAtRef = useRef(0);
  const autoplayPauseReasonsRef = useRef(
    new Set<"interaction" | "detail-hover" | "detail-focus">(),
  );
  const detailTriggerRef = useRef<HTMLButtonElement | null>(null);
  const detailWasPlayingRef = useRef(false);

  const activeApp = apps[activeIndex];

  const clearAutoplay = useCallback(() => {
    if (autoplayTimerRef.current === null) return;
    window.clearTimeout(autoplayTimerRef.current);
    autoplayTimerRef.current = null;
  }, []);

  const clearFastForwardTimer = useCallback(() => {
    if (fastForwardTimerRef.current === null) return;
    window.clearTimeout(fastForwardTimerRef.current);
    fastForwardTimerRef.current = null;
  }, []);

  const beginTransition = useCallback(() => {
    clearAutoplay();
    autoplayAdvancePendingRef.current = false;
    transitionOriginRef.current = progressRef.current;
    isTransitioningRef.current = true;
    setIsTransitioning(true);
    setActiveSequencePhase("idle");
    setTypedNameLength(0);
  }, [clearAutoplay]);

  const moveBy = useCallback(
    (offset: number) => {
      beginTransition();
      targetRef.current = Math.round(targetRef.current) + offset;
    },
    [beginTransition],
  );

  const moveToApp = useCallback(
    (appIndex: number) => {
      beginTransition();
      const progress = progressRef.current;
      const nearestCycle = Math.round((progress - appIndex) / apps.length);
      targetRef.current = appIndex + nearestCycle * apps.length;
    },
    [beginTransition],
  );

  const stopFastForward = useCallback(
    (pauseAfterSnap = false) => {
      if (!isFastForwardingRef.current) return;

      clearFastForwardTimer();
      fastForwardPointerIdRef.current = -1;
      fastForwardSnapPendingRef.current = true;
      isFastForwardingRef.current = false;
      setIsFastForwarding(false);

      beginTransition();
      targetRef.current = Math.round(progressRef.current);
      velocityRef.current *= 0.18;

      if (pauseAfterSnap) {
        isPlayingRef.current = false;
        setIsPlaying(false);
        clearAutoplay();
      }
    },
    [beginTransition, clearAutoplay, clearFastForwardTimer],
  );

  const queueAutoplayAdvance = useCallback(
    (minimumDelay = 0) => {
      clearAutoplay();
      autoplayAdvancePendingRef.current = true;
      if (
        !autoplayEnabledRef.current ||
        !isPlayingRef.current ||
        document.visibilityState === "hidden" ||
        autoplayPauseReasonsRef.current.size > 0
      ) {
        return;
      }

      const resumeDelay = Math.max(
        0,
        autoplayResumeNotBeforeRef.current - performance.now(),
      );
      autoplayTimerRef.current = window.setTimeout(() => {
        autoplayTimerRef.current = null;
        if (
          !autoplayEnabledRef.current ||
          !isPlayingRef.current ||
          document.visibilityState === "hidden" ||
          autoplayPauseReasonsRef.current.size > 0
        ) {
          return;
        }
        autoplayAdvancePendingRef.current = false;
        moveBy(1);
      }, Math.max(minimumDelay, resumeDelay));
    },
    [clearAutoplay, moveBy],
  );

  const pauseAutoplay = useCallback(
    (reason: "interaction" | "detail-hover" | "detail-focus") => {
      autoplayPauseReasonsRef.current.add(reason);
      clearAutoplay();
    },
    [clearAutoplay],
  );

  const resumeAutoplay = useCallback(
    (reason: "interaction" | "detail-hover" | "detail-focus") => {
      autoplayPauseReasonsRef.current.delete(reason);
      autoplayResumeNotBeforeRef.current =
        performance.now() + AUTOPLAY_RESUME_DELAY_MS;
      if (autoplayAdvancePendingRef.current) {
        queueAutoplayAdvance(AUTOPLAY_RESUME_DELAY_MS);
      }
    },
    [queueAutoplayAdvance],
  );

  const selectApp = useCallback(
    (appIndex: number) => {
      pauseAutoplay("interaction");
      moveToApp(appIndex);
      resumeAutoplay("interaction");
    },
    [moveToApp, pauseAutoplay, resumeAutoplay],
  );

  const toggleAutoplay = useCallback(() => {
    if (isFastForwardingRef.current) {
      stopFastForward(true);
      return;
    }
    if (isTransitioningRef.current) return;

    if (isPlayingRef.current) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      clearAutoplay();
      return;
    }

    isPlayingRef.current = true;
    setIsPlaying(true);
    autoplayResumeNotBeforeRef.current =
      performance.now() + PLAY_RESUME_DELAY_MS;
    if (autoplayAdvancePendingRef.current) {
      queueAutoplayAdvance(PLAY_RESUME_DELAY_MS);
    }
  }, [clearAutoplay, queueAutoplayAdvance, stopFastForward]);

  useEffect(() => {
    if (!isFastForwarding) {
      clearFastForwardTimer();
      return;
    }

    const transitionDuration = reducedMotion
      ? REDUCED_MOTION_FAST_FORWARD_TRANSITION_MS
      : FAST_FORWARD_TRANSITION_MS;
    const cycleDuration = transitionDuration + FAST_FORWARD_GAP_MS;

    const advance = () => {
      if (
        !isFastForwardingRef.current ||
        !isPlayingRef.current ||
        document.visibilityState === "hidden"
      ) {
        return;
      }

      moveBy(1);
      fastForwardTimerRef.current = window.setTimeout(advance, cycleDuration);
    };

    advance();
    return clearFastForwardTimer;
  }, [clearFastForwardTimer, isFastForwarding, moveBy, reducedMotion]);

  useEffect(() => clearFastForwardTimer, [clearFastForwardTimer]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    autoplayEnabledRef.current = !loaderVisible && !reducedMotion;
    if (reducedMotion && isFastForwardingRef.current) {
      stopFastForward(true);
    }
    if (reducedMotion && isPlayingRef.current) {
      isPlayingRef.current = false;
      setIsPlaying(false);
    }
    if (!autoplayEnabledRef.current) {
      clearAutoplay();
    } else if (autoplayAdvancePendingRef.current) {
      queueAutoplayAdvance();
    }
    return clearAutoplay;
  }, [
    clearAutoplay,
    loaderVisible,
    queueAutoplayAdvance,
    reducedMotion,
    stopFastForward,
  ]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stopFastForward();
        clearAutoplay();
        return;
      }
      autoplayResumeNotBeforeRef.current =
        performance.now() + AUTOPLAY_RESUME_DELAY_MS;
      if (autoplayAdvancePendingRef.current) {
        queueAutoplayAdvance(AUTOPLAY_RESUME_DELAY_MS);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [clearAutoplay, queueAutoplayAdvance, stopFastForward]);

  useEffect(() => {
    const handleWindowBlur = () => stopFastForward();
    window.addEventListener("blur", handleWindowBlur);
    return () => window.removeEventListener("blur", handleWindowBlur);
  }, [stopFastForward]);

  useEffect(() => {
    if (loaderVisible || isTransitioning) return;
    if (settledWordmarkIndexRef.current === activeIndex) return;

    settledWordmarkIndexRef.current = activeIndex;
    const now = performance.now();

    if (
      isFastForwarding &&
      now - lastWordmarkPulseAtRef.current < 300
    ) {
      return;
    }

    lastWordmarkPulseAtRef.current = now;
    setWordmarkPulse((current) => ({
      key: current.key + 1,
      fast: isFastForwarding,
    }));
  }, [activeIndex, isFastForwarding, isTransitioning, loaderVisible]);

  useEffect(() => {
    if (loaderVisible || isTransitioning) return;
    autoplayAdvancePendingRef.current = false;

    if (isFastForwarding) {
      return;
    }

    if (reducedMotion) {
      setTypedNameLength(activeApp.name.length);
      setActiveSequencePhase("complete");
      return;
    }

    const timers: number[] = [];
    const typingDuration = activeApp.name.length * TYPE_CHAR_INTERVAL_MS;
    setTypedNameLength(0);
    setActiveSequencePhase("typing");

    for (let length = 1; length <= activeApp.name.length; length += 1) {
      timers.push(
        window.setTimeout(
          () => setTypedNameLength(length),
          length * TYPE_CHAR_INTERVAL_MS,
        ),
      );
    }

    const nameEmphasisStart = typingDuration;
    const platformRevealStart = nameEmphasisStart + NAME_EMPHASIS_MS;
    const detailRevealStart = platformRevealStart + PLATFORM_REVEAL_MS;
    const holdStart = detailRevealStart + DETAIL_REVEAL_MS;
    const completeAt = holdStart + ACTIVE_COMPLETE_HOLD_MS;

    timers.push(
      window.setTimeout(
        () => setActiveSequencePhase("name-emphasis"),
        nameEmphasisStart,
      ),
      window.setTimeout(
        () => setActiveSequencePhase("platform-reveal"),
        platformRevealStart,
      ),
      window.setTimeout(
        () => setActiveSequencePhase("detail-reveal"),
        detailRevealStart,
      ),
      window.setTimeout(() => setActiveSequencePhase("hold"), holdStart),
      window.setTimeout(() => {
        setActiveSequencePhase("complete");
        queueAutoplayAdvance();
      }, completeAt),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [
    activeApp.id,
    activeApp.name,
    isFastForwarding,
    isTransitioning,
    loaderVisible,
    queueAutoplayAdvance,
    reducedMotion,
  ]);

  useEffect(() => {
    if (!menuOpen && !languageOpen) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setMenuOpen(false);
        setLanguageOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setLanguageOpen(false);
      }
    };

    window.addEventListener("pointerdown", closeOnOutsidePointer);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closeOnOutsidePointer);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [languageOpen, menuOpen]);

  useEffect(() => {
    if (!headerUtilityHidden || reducedMotion) return;

    let hintInterval: number | undefined;
    const firstHint = window.setTimeout(() => {
      setHeaderUtilityHintKey((key) => key + 1);
      hintInterval = window.setInterval(
        () => setHeaderUtilityHintKey((key) => key + 1),
        5500,
      );
    }, 1000);

    return () => {
      window.clearTimeout(firstHint);
      if (hintInterval !== undefined) window.clearInterval(hintInterval);
    };
  }, [headerUtilityHidden, reducedMotion]);

  useEffect(() => {
    if (headerUtilityHidden) {
      headerUtilityHandleRef.current?.focus({ preventScroll: true });
    } else if (headerUtilityWasHiddenRef.current) {
      headerLanguageButtonRef.current?.focus({ preventScroll: true });
    }
    headerUtilityWasHiddenRef.current = headerUtilityHidden;
  }, [headerUtilityHidden]);

  useEffect(() => {
    let loaded = 0;
    let done = false;
    let animationFrame = 0;
    const phaseTimers: number[] = [];
    const started = performance.now();
    let previousTick = started;
    let displayedProgress = 0;
    const assets = apps.map(
      (app) =>
        new Promise<void>((resolve) => {
          const image = new window.Image();
          let settled = false;
          const finish = () => {
            if (settled) return;
            settled = true;
            loaded += 1;
            resolve();
          };
          image.onload = finish;
          image.onerror = finish;
          image.src = app.icon;
          if (image.complete) finish();
        }),
    );
    Promise.all(assets).then(() => {
      done = true;
    });

    const tick = (now: number) => {
      const assetRatio = loaded / assets.length;
      const elapsed = now - started;
      const timelineProgress = presentationProgress(elapsed);
      const loadingCap = done ? 1 : 0.92 + assetRatio * 0.06;
      const targetProgress = Math.min(timelineProgress, loadingCap);
      const maxFrameStep = Math.max(0.002, (now - previousTick) * 0.0005);
      previousTick = now;
      displayedProgress = Math.min(
        targetProgress,
        displayedProgress + maxFrameStep,
      );
      const normalizedProgress = clamp(displayedProgress, 0, 1);
      setLoadProgress(normalizedProgress * 100);
      loaderInteractionRef.current.stretch =
        0.018 + Math.pow(normalizedProgress, 1.7) * 0.11;
      loaderInteractionRef.current.transition =
        normalizedProgress > 0.9 ? (normalizedProgress - 0.9) / 0.1 : 0;
      loaderInteractionRef.current.velocity = 0.16 + normalizedProgress * 0.2;
      if (
        done &&
        elapsed >= LOADER_DURATION &&
        normalizedProgress >= 0.999
      ) {
        setLoadProgress(100);
        setLoaderPhase("complete");

        const revealStart = LOADER_COMPLETE_HOLD_MS;
        const effectStart = revealStart + LOADER_LOGO_MOVE_MS;
        const finalStart = effectStart + LOADER_EFFECT_MS;
        const leavingStart = finalStart + FINAL_LOGO_HOLD_MS;

        phaseTimers.push(
          window.setTimeout(() => setLoaderPhase("revealing"), revealStart),
          window.setTimeout(
            () => setLoaderCompletionMediaVisible(false),
            revealStart + LOADER_JELLY_EXIT_MS,
          ),
          window.setTimeout(() => setLoaderPhase("effect"), effectStart),
          window.setTimeout(() => setLoaderPhase("final"), finalStart),
          window.setTimeout(() => setLoaderPhase("leaving"), leavingStart),
          window.setTimeout(
            () => setLoaderVisible(false),
            leavingStart + LOADER_EXIT_MS,
          ),
        );
        return;
      }
      animationFrame = requestAnimationFrame(tick);
    };
    animationFrame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animationFrame);
      phaseTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const decorationNodes = Array.from(
      hero.querySelectorAll<HTMLElement>(".decoration"),
    );
    let decorationCenters: Array<{
      element: HTMLElement;
      x: number;
      y: number;
      proximity: number;
    }> = [];
    let animationFrame = 0;

    const updateBounds = () => {
      const bounds = hero.getBoundingClientRect();
      depthBoundsRef.current = {
        left: bounds.left,
        top: bounds.top,
        width: Math.max(bounds.width, 1),
        height: Math.max(bounds.height, 1),
      };
      decorationCenters = decorationNodes
        .filter((element) => getComputedStyle(element).display !== "none")
        .map((element) => {
          const objectBounds = element.getBoundingClientRect();
          return {
            element,
            x: objectBounds.left + objectBounds.width * 0.5,
            y: objectBounds.top + objectBounds.height * 0.5,
            proximity: -1,
          };
        });
    };

    const applyDepth = (x: number, y: number, strength: number) => {
      // DOM transforms use screen coordinates: right/down are positive.
      hero.style.setProperty(
        "--hero-pointer-offset-x",
        `${x * depthBoundsRef.current.width * 0.5}px`,
      );
      hero.style.setProperty(
        "--hero-pointer-offset-y",
        `${y * depthBoundsRef.current.height * 0.5}px`,
      );
      hero.style.setProperty("--hero-pointer-strength", String(strength));
      hero.style.setProperty("--hero-depth-bg-x", `${x * 7}px`);
      hero.style.setProperty("--hero-depth-bg-y", `${y * 7}px`);
      hero.style.setProperty("--hero-depth-floor-x", `${x * 10}px`);
      hero.style.setProperty("--hero-depth-floor-y", `${y * 8}px`);
      hero.style.setProperty("--hero-depth-floor-z", `${strength * 10}px`);
      hero.style.setProperty("--hero-depth-far-x", `${x * 10}px`);
      hero.style.setProperty("--hero-depth-far-y", `${y * 10}px`);
      hero.style.setProperty("--hero-depth-far-z", `${strength * 8}px`);
      hero.style.setProperty("--hero-depth-near-x", `${x * 20}px`);
      hero.style.setProperty("--hero-depth-near-y", `${y * 18}px`);
      hero.style.setProperty("--hero-depth-near-z", `${strength * 22}px`);

      const pointerClientX = ((x + 1) * window.innerWidth) / 2;
      const pointerClientY = ((y + 1) * window.innerHeight) / 2;
      const proximityRadius = 160;
      decorationCenters.forEach((object) => {
        const distance = Math.hypot(
          pointerClientX - object.x,
          pointerClientY - object.y,
        );
        const objectProximity =
          strength *
          Math.pow(clamp(1 - distance / proximityRadius, 0, 1), 0.72);
        if (Math.abs(objectProximity - object.proximity) < 0.008) return;
        object.proximity = objectProximity;
        object.element.style.setProperty(
          "--object-scale",
          String(1 + objectProximity * 0.28),
        );
        object.element.style.setProperty(
          "--object-opacity-boost",
          String(objectProximity * 0.18),
        );
        object.element.style.setProperty(
          "--object-brightness",
          String(1 + objectProximity * 0.28),
        );
        object.element.style.setProperty(
          "--object-glow",
          `${objectProximity * 8}px`,
        );
      });

      const proximity = Math.pow(
        1 - smoothStep(clamp(Math.hypot(x, y) / 0.78, 0, 1)),
        0.75,
      );
      interactionRef.current.pointerX = x;
      // Three.js uses an upward-positive Y axis, unlike CSS transforms.
      interactionRef.current.pointerY = -y;
      interactionRef.current.pointerStrength = proximity * 0.095 * strength;
      loaderInteractionRef.current.pointerX = x;
      loaderInteractionRef.current.pointerY = -y;
      loaderInteractionRef.current.pointerStrength = proximity * 0.13 * strength;

      const loader = loaderRef.current;
      if (loader) {
        loader.style.setProperty(
          "--preloader-pointer-offset-x",
          `${x * window.innerWidth * 0.5}px`,
        );
        loader.style.setProperty(
          "--preloader-pointer-offset-y",
          `${y * window.innerHeight * 0.5}px`,
        );
        loader.style.setProperty("--preloader-pointer-strength", String(strength));
      }
    };

    const renderDepth = () => {
      const target = depthTargetRef.current;
      const current = depthCurrentRef.current;
      const distance = Math.hypot(target.x - current.x, target.y - current.y);
      const follow = distance > 0.3 ? 0.32 : 0.24;
      current.x += (target.x - current.x) * follow;
      current.y += (target.y - current.y) * follow;
      current.strength += (target.strength - current.strength) * 0.24;
      applyDepth(current.x, current.y, current.strength);

      const settling =
        Math.abs(target.x - current.x) > 0.002 ||
        Math.abs(target.y - current.y) > 0.002 ||
        Math.abs(target.strength - current.strength) > 0.002;
      animationFrame = settling ? requestAnimationFrame(renderDepth) : 0;
    };

    const requestDepthFrame = () => {
      if (!depthEnabledRef.current || animationFrame) return;
      animationFrame = requestAnimationFrame(renderDepth);
    };

    const updateEnabled = () => {
      depthEnabledRef.current = hoverQuery.matches && !reducedMotion;
      if (!depthEnabledRef.current) {
        depthTargetRef.current = { x: 0, y: 0, strength: 0 };
        depthCurrentRef.current = { x: 0, y: 0, strength: 0 };
        applyDepth(0, 0, 0);
      }
    };

    const updatePointerTarget = (
      clientX: number,
      clientY: number,
      pointerType = "mouse",
    ) => {
      if (!depthEnabledRef.current || pointerType === "touch") return;
      const insideHero =
        clientX >= depthBoundsRef.current.left &&
        clientX <= depthBoundsRef.current.left + depthBoundsRef.current.width &&
        clientY >= depthBoundsRef.current.top &&
        clientY <= depthBoundsRef.current.top + depthBoundsRef.current.height;
      if (!loaderRef.current && !insideHero) {
        depthTargetRef.current = { x: 0, y: 0, strength: 0 };
      } else {
        depthTargetRef.current = {
          x: clamp((clientX / Math.max(window.innerWidth, 1)) * 2 - 1, -1, 1),
          y: clamp((clientY / Math.max(window.innerHeight, 1)) * 2 - 1, -1, 1),
          strength: 1,
        };
      }
      requestDepthFrame();
    };

    const resetDepth = () => {
      if (!depthEnabledRef.current) return;
      depthTargetRef.current = { x: 0, y: 0, strength: 0 };
      requestDepthFrame();
    };

    updateBounds();
    updateEnabled();
    requestDepthFrameRef.current = requestDepthFrame;
    updatePointerTargetRef.current = updatePointerTarget;
    const observer = new ResizeObserver(updateBounds);
    observer.observe(hero);
    const onWindowPointerMove = (event: PointerEvent) =>
      updatePointerTarget(event.clientX, event.clientY, event.pointerType);
    window.addEventListener("pointermove", onWindowPointerMove, { passive: true });
    window.addEventListener("blur", resetDepth);
    hoverQuery.addEventListener("change", updateEnabled);

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      hoverQuery.removeEventListener("change", updateEnabled);
      window.removeEventListener("pointermove", onWindowPointerMove);
      window.removeEventListener("blur", resetDepth);
      requestDepthFrameRef.current = () => {};
      updatePointerTargetRef.current = () => {};
    };
  }, [loaderVisible, reducedMotion]);

  useEffect(() => {
    let frame = 0;
    let previousTime = performance.now();
    let settleStartedAt = -1;
    let settleWasFastForwarding = false;
    let lastMotionDirection = 1;
    let springDisplacement = 0;
    let springVelocity = 0;

    const render = (time: number) => {
      const width = window.innerWidth;
      const pointer = pointerRef.current;
      const transitionWasActive = isTransitioningRef.current;
      const delta = Math.min((time - previousTime) / 16.667, 2);
      previousTime = time;

      if (!pointer.dragging) {
        const stiffness = isFastForwardingRef.current
          ? reducedMotion
            ? 0.16
            : 0.24
          : reducedMotion
            ? 0.22
            : 0.105;
        const damping = isFastForwardingRef.current
          ? reducedMotion
            ? 0.72
            : 0.62
          : reducedMotion
            ? 0.62
            : 0.75;
        velocityRef.current +=
          (targetRef.current - progressRef.current) * stiffness * delta;
        velocityRef.current *= Math.pow(damping, delta);
        progressRef.current += velocityRef.current * delta;
        if (
          Math.abs(targetRef.current - progressRef.current) < 0.0008 &&
          Math.abs(velocityRef.current) < 0.0008
        ) {
          progressRef.current = targetRef.current;
          velocityRef.current = 0;
          if (isTransitioningRef.current) {
            isTransitioningRef.current = false;
            setIsTransitioning(false);
          }
        }
      }

      const progress = progressRef.current;
      const nearest = wrapIndex(Math.round(progress));
      if (nearest !== activeIndexRef.current) {
        activeIndexRef.current = nearest;
        setActiveIndex(nearest);
      }

      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const slot = getCircularSlot(index, progress);
        const absolute = Math.abs(slot);
        const visibleRadius = width < 768 ? 1.55 : width < 1024 ? 2.55 : 3.55;
        const x = easeSlot(slot, width);
        const scale = interpolateSlotValue(absolute, [1, 0.82, 0.67, 0.54, 0.46]);
        const opacity = interpolateSlotValue(absolute, [1, 0.84, 0.58, 0.36, 0]);
        const rotation =
          -Math.sign(slot) *
          (absolute <= 1
            ? absolute * 18
            : absolute <= 2
              ? 18 + (absolute - 1) * 10
              : 28 + Math.min(absolute - 2, 1) * 10);
        const depth = interpolateSlotValue(absolute, [100, 30, -45, -100, -125]);
        const pointerDepth = depthCurrentRef.current;
        const centerInfluence = 1 - smoothstep(0.15, 1.15, absolute);
        const parallaxX = pointerDepth.x * (8.5 - centerInfluence * 5.25);
        const parallaxY = pointerDepth.y * (7.5 - centerInfluence * 5);
        const parallaxZ = pointerDepth.strength * (9 - centerInfluence * 3.5);
        const parallaxRotation = pointerDepth.x * (1.15 - centerInfluence * 0.5);

        card.style.transform = `translate3d(calc(-50% + ${x + parallaxX}px), calc(-50% + ${parallaxY}px), ${depth + parallaxZ}px) rotateY(${rotation + parallaxRotation}deg) scale(${scale})`;
        card.style.opacity = String(absolute < visibleRadius ? opacity : 0);
        card.style.pointerEvents = absolute < visibleRadius ? "auto" : "none";
        card.setAttribute(
          "aria-hidden",
          absolute >= visibleRadius ? "true" : "false",
        );
        card.tabIndex = nearest === index ? 0 : -1;
      });

      const v = velocityRef.current;
      const distance = Math.abs(targetRef.current - progress);
      const direction =
        Math.abs(v) > 0.002
          ? Math.sign(v)
          : Math.sign(targetRef.current - progress) ||
            interactionRef.current.direction;
      interactionRef.current.velocity +=
        (v - interactionRef.current.velocity) * 0.18;
      interactionRef.current.direction = direction || 1;
      const origin = transitionOriginRef.current;
      const targetOffset = targetRef.current - origin;
      const progressOffset = progress - origin;
      const motionDirection =
        Math.sign(targetOffset) || Math.sign(progressOffset) || direction || 1;
      const travelDistance = Math.max(Math.abs(targetOffset), 1);
      const travel = clamp(Math.abs(progressOffset) / travelDistance, 0, 1);
      const moving = isTransitioningRef.current || pointer.dragging;
      const justArrived = transitionWasActive && !isTransitioningRef.current;
      if (moving) {
        lastMotionDirection = motionDirection;
        settleStartedAt = -1;
      } else if (justArrived) {
        settleStartedAt = time;
        settleWasFastForwarding =
          isFastForwardingRef.current || fastForwardSnapPendingRef.current;
        fastForwardSnapPendingRef.current = false;
        const arrivalImpulse = reducedMotion
          ? 0.035
          : settleWasFastForwarding
            ? 0.1
            : 0.14;
        springDisplacement = clamp(
          springDisplacement + lastMotionDirection * arrivalImpulse,
          -0.18,
          0.18,
        );
        springVelocity -= lastMotionDirection * arrivalImpulse * 0.08;
      }
      const exitEnvelope = moving
        ? sampleTensionCurve(travel, EXIT_TENSION_CURVE)
        : 0;
      const enterEnvelope = moving
        ? sampleTensionCurve(travel, ENTER_TENSION_CURVE)
        : 0;
      const releaseEnvelope = moving
        ? smoothstep(0.72, 0.86, travel) *
          (1 - smoothstep(0.96, 1, travel))
        : 0;
      let settleAmplitude = 0;
      let settlePhase = 0;
      let settling = false;

      if (!moving && settleStartedAt >= 0) {
        const settleDuration = settleWasFastForwarding
          ? 280
          : reducedMotion
            ? 620
            : 1250;
        const settleProgress = clamp(
          (time - settleStartedAt) / settleDuration,
          0,
          1,
        );
        settling = settleProgress < 1;

        if (settling && reducedMotion) {
          springDisplacement =
            lastMotionDirection *
            0.035 *
            (1 - settleProgress) *
            Math.cos(settleProgress * Math.PI);
        }

        if (!settling) {
          settleStartedAt = -1;
          springDisplacement = 0;
          springVelocity = 0;
        }
      }

      if (
        !reducedMotion &&
        (Math.abs(springDisplacement) > 0.0001 ||
          Math.abs(springVelocity) > 0.0001)
      ) {
        const springTimeScale = settleWasFastForwarding ? 1.75 : 1;
        const springDelta = delta * springTimeScale;
        const springForce = -6.4 * springDisplacement;
        springVelocity += springForce * 0.012 * springDelta;
        springVelocity *= Math.pow(0.84, springDelta / 8);
        springDisplacement += springVelocity * springDelta;
      }

      settleAmplitude = Math.abs(springDisplacement);
      settlePhase = time * 0.006;

      interactionRef.current.phase = moving
        ? travel < 0.52
          ? "exiting"
          : travel < 0.84
            ? "entering"
            : "release"
        : settling
          ? "settling"
          : "idle";
      interactionRef.current.enterDirection = motionDirection;
      interactionRef.current.exitDirection = -motionDirection;
      interactionRef.current.releaseDirection = lastMotionDirection;
      interactionRef.current.enterStrength = enterEnvelope;
      interactionRef.current.exitStrength = exitEnvelope;
      interactionRef.current.releaseStrength +=
        (releaseEnvelope - interactionRef.current.releaseStrength) *
        (releaseEnvelope > 0 ? 0.34 : 0.18);
      interactionRef.current.settleAmplitude = settleAmplitude;
      interactionRef.current.settlePhase = settlePhase;
      interactionRef.current.springResponse = springDisplacement;
      interactionRef.current.idleStrength = moving
        ? 0.58
        : settling
          ? 0.82
          : 1;
      interactionRef.current.stretch = Math.max(
        interactionRef.current.enterStrength,
        interactionRef.current.exitStrength,
      );
      interactionRef.current.transition = Math.max(
        enterEnvelope,
        exitEnvelope,
        releaseEnvelope,
        settleAmplitude,
      );
      interactionRef.current.fastForwarding = isFastForwardingRef.current;
      interactionRef.current.accent = apps[nearest].accent;

      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) return;
      event.preventDefault();
      pauseAutoplay("interaction");
      moveBy(event.key === "ArrowRight" ? 1 : -1);
      resumeAutoplay("interaction");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [moveBy, pauseAutoplay, resumeAutoplay]);

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse") return;
    if (
      event.target instanceof Element &&
      event.target.closest(".site-header, .app-info, .carousel-arrow")
    ) {
      return;
    }
    pauseAutoplay("interaction");
    const pointer = pointerRef.current;
    pointer.id = event.pointerId;
    pointer.startX = event.clientX;
    pointer.startY = event.clientY;
    pointer.lastX = event.clientX;
    pointer.lastTime = performance.now();
    pointer.startProgress = progressRef.current;
    pointer.velocity = 0;
    pointer.dragging = true;
    pointer.horizontal = false;
    heroRef.current?.setPointerCapture(event.pointerId);
  };

  const updateHeroDepth = (event: ReactPointerEvent<HTMLElement>) => {
    updatePointerTargetRef.current(
      event.clientX,
      event.clientY,
      event.pointerType,
    );
  };

  const resetHeroDepth = () => {
    if (!depthEnabledRef.current) return;
    depthTargetRef.current = { x: 0, y: 0, strength: 0 };
    requestDepthFrameRef.current();
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse") return;
    const pointer = pointerRef.current;
    if (!pointer.dragging || event.pointerId !== pointer.id) return;
    const dx = event.clientX - pointer.startX;
    const dy = event.clientY - pointer.startY;
    if (!pointer.horizontal) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (Math.abs(dy) > Math.abs(dx) * 1.15) {
        pointer.dragging = false;
        pointer.id = -1;
        resumeAutoplay("interaction");
        if (heroRef.current?.hasPointerCapture(event.pointerId)) {
          heroRef.current.releasePointerCapture(event.pointerId);
        }
        return;
      }
      pointer.horizontal = true;
    }
    event.preventDefault();
    if (!isTransitioningRef.current) beginTransition();
    const width = window.innerWidth;
    const step = width < 768 ? width * 0.59 : width < 1024 ? width * 0.23 : width * 0.16;
    const now = performance.now();
    const elapsed = Math.max(now - pointer.lastTime, 8);
    const next = pointer.startProgress - dx / step;
    pointer.velocity = (-(event.clientX - pointer.lastX) / step) * (16.667 / elapsed);
    pointer.lastX = event.clientX;
    pointer.lastTime = now;
    progressRef.current = next;
    targetRef.current = next;
    velocityRef.current = pointer.velocity;
  };

  const endPointer = (event: ReactPointerEvent<HTMLElement>) => {
    const pointer = pointerRef.current;
    if (event.pointerId !== pointer.id) return;
    pointer.dragging = false;
    pointer.id = -1;
    const projected = progressRef.current + pointer.velocity * 0.32;
    targetRef.current = Math.round(projected);
    velocityRef.current = pointer.velocity * 0.24;
    if (heroRef.current?.hasPointerCapture(event.pointerId)) {
      heroRef.current.releasePointerCapture(event.pointerId);
    }
    resumeAutoplay("interaction");
  };

  const onHeaderUtilityPointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (headerUtilityHidden || !event.isPrimary || event.button !== 0) return;

    const drag = headerUtilityDragRef.current;
    drag.id = event.pointerId;
    drag.startX = event.clientX;
    drag.startY = event.clientY;
    drag.distanceX = 0;
    drag.horizontal = false;
    headerUtilitySuppressClickRef.current = false;
    setHeaderUtilityDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onHeaderUtilityPointerMove = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    const drag = headerUtilityDragRef.current;
    if (drag.id !== event.pointerId) return;

    const distanceX = Math.max(0, event.clientX - drag.startX);
    const distanceY = Math.abs(event.clientY - drag.startY);

    if (!drag.horizontal) {
      if (distanceY > 8 && distanceY > distanceX) {
        drag.id = -1;
        setHeaderUtilityDragging(false);
        setHeaderUtilityDragX(0);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        return;
      }

      if (distanceX < 8 || distanceX <= distanceY * 1.2) return;
      drag.horizontal = true;
      headerUtilitySuppressClickRef.current = true;
    }

    drag.distanceX = distanceX;
    setHeaderUtilityDragX(distanceX);
  };

  const finishHeaderUtilityDrag = (
    event: ReactPointerEvent<HTMLDivElement>,
    cancelled = false,
  ) => {
    const drag = headerUtilityDragRef.current;
    if (drag.id !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const threshold = window.matchMedia("(max-width: 767px)").matches
      ? 40
      : 55;
    if (!cancelled && drag.horizontal && drag.distanceX >= threshold) {
      const rect = headerUtilityRef.current?.getBoundingClientRect();
      setHeaderUtilityHideDistance(
        rect
          ? Math.max(window.innerWidth - rect.left + 24, 0)
          : window.innerWidth,
      );
      setLanguageOpen(false);
      setHeaderUtilityHidden(true);
    }

    drag.id = -1;
    drag.distanceX = 0;
    drag.horizontal = false;
    setHeaderUtilityDragging(false);
    setHeaderUtilityDragX(0);
    window.setTimeout(() => {
      headerUtilitySuppressClickRef.current = false;
    }, 0);
  };

  const headerUtilityStyle = {
    "--header-utility-drag-x": `${headerUtilityDragX * 0.75}px`,
    "--header-utility-drag-opacity": String(
      1 - Math.min(headerUtilityDragX / 200, 0.35),
    ),
    "--header-utility-drag-scale": String(
      1 - Math.min(headerUtilityDragX / 2500, 0.02),
    ),
    "--header-utility-hide-x": `${headerUtilityHideDistance}px`,
  } as CSSProperties;

  const startFastForward = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (
      !isPlayingRef.current ||
      isTransitioningRef.current ||
      isFastForwardingRef.current
    ) {
      return;
    }

    fastForwardPointerIdRef.current = event.pointerId;
    fastForwardSnapPendingRef.current = false;
    clearAutoplay();
    autoplayAdvancePendingRef.current = false;
    isFastForwardingRef.current = true;
    setIsFastForwarding(true);
  };

  const releaseFastForward = (
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (fastForwardPointerIdRef.current !== event.pointerId) return;
    stopFastForward();
  };

  const openAppDetail = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!activeApp.appStoreUrl || detailApp) return;

    detailTriggerRef.current = event.currentTarget;
    detailWasPlayingRef.current = isPlayingRef.current;
    autoplayPauseReasonsRef.current.delete("detail-hover");
    autoplayPauseReasonsRef.current.delete("detail-focus");

    if (isFastForwardingRef.current) {
      stopFastForward(true);
    } else {
      isPlayingRef.current = false;
      setIsPlaying(false);
      clearAutoplay();
    }

    setDetailApp(activeApp);
    window.requestAnimationFrame(() => setDetailOverlayOpen(true));
  };

  const requestAppDetailClose = useCallback(() => {
    setDetailOverlayOpen(false);
  }, []);

  const finishAppDetailClose = useCallback(() => {
    setDetailApp(null);
    detailTriggerRef.current?.focus({ preventScroll: true });

    if (detailWasPlayingRef.current && !reducedMotion) {
      isPlayingRef.current = true;
      setIsPlaying(true);
      autoplayResumeNotBeforeRef.current = performance.now() + PLAY_RESUME_DELAY_MS;
      if (autoplayAdvancePendingRef.current) {
        queueAutoplayAdvance(PLAY_RESUME_DELAY_MS);
      }
    }
    detailWasPlayingRef.current = false;
  }, [queueAutoplayAdvance, reducedMotion]);

  const updateDetailMagnet = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const offsetX = clamp(
      ((event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5) * 6,
      -3,
      3,
    );
    const offsetY = clamp(
      ((event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5) * 6,
      -3,
      3,
    );
    event.currentTarget.style.setProperty("--detail-magnet-x", `${offsetX}px`);
    event.currentTarget.style.setProperty("--detail-magnet-y", `${offsetY}px`);
  };

  const resetDetailMagnet = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.currentTarget.style.setProperty("--detail-magnet-x", "0px");
    event.currentTarget.style.setProperty("--detail-magnet-y", "0px");
  };

  const accentStyle = useMemo(
    () =>
      ({
        "--active-accent": activeApp.accent,
        "--active-accent-rgb": activeApp.accentRgb,
      }) as CSSProperties,
    [activeApp],
  );

  return (
    <>
      {loaderVisible && (
        <Loader
          progress={loadProgress}
          interactionRef={loaderInteractionRef}
          reducedMotion={reducedMotion}
          phase={loaderPhase}
          completionMediaVisible={loaderCompletionMediaVisible}
          containerRef={loaderRef}
        />
      )}
      <main
        className={`site-shell ${loaderVisible && loaderPhase !== "leaving" ? "is-loading" : "is-ready"}`}
        style={accentStyle}
      >
        <section
          className="hero"
          id="apps"
          ref={heroRef}
          aria-label="SAME STUDIO app explorer"
          onPointerEnter={updateHeroDepth}
          onPointerLeave={resetHeroDepth}
          onPointerDown={(event) => {
            updateHeroDepth(event);
            onPointerDown(event);
          }}
          onPointerMove={(event) => {
            updateHeroDepth(event);
            onPointerMove(event);
          }}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
        >
          <header className="site-header" ref={headerRef}>
            <a href="#apps" className="wordmark" aria-label="SAME STUDIO home">
              <span className="wordmark-hover-layer">
                <span
                  key={wordmarkPulse.key}
                  className={`wordmark-change-layer${
                    wordmarkPulse.key > 0 ? " is-changing" : ""
                  }${wordmarkPulse.fast ? " is-fast-forward" : ""}`}
                  data-pulse-key={wordmarkPulse.key}
                >
                  SAME STUDIO
                </span>
              </span>
            </a>
            <div
              ref={headerUtilityRef}
              className={`header-utility${
                headerUtilityDragging ? " is-dragging" : ""
              }${headerUtilityHidden ? " is-hidden" : ""}`}
              style={headerUtilityStyle}
              aria-hidden={headerUtilityHidden}
              inert={headerUtilityHidden ? true : undefined}
              onPointerDown={onHeaderUtilityPointerDown}
              onPointerMove={onHeaderUtilityPointerMove}
              onPointerUp={(event) => finishHeaderUtilityDrag(event)}
              onPointerCancel={(event) =>
                finishHeaderUtilityDrag(event, true)
              }
              onClickCapture={(event) => {
                if (!headerUtilitySuppressClickRef.current) return;
                event.preventDefault();
                event.stopPropagation();
                headerUtilitySuppressClickRef.current = false;
              }}
            >
              <div className="header-utility-bar" aria-label="언어 및 테마 컨트롤">
                <button
                  ref={headerLanguageButtonRef}
                  type="button"
                  className="header-utility-segment language-control"
                  aria-label="언어 선택"
                  aria-expanded={languageOpen}
                  aria-controls="language-panel"
                  aria-haspopup="menu"
                  tabIndex={headerUtilityHidden ? -1 : 0}
                  onClick={() => {
                    setMenuOpen(false);
                    setLanguageOpen((open) => !open);
                  }}
                >
                  <svg
                    className="language-control-icon"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3.6 9h16.8M3.6 15h16.8M12 3c2.15 2.35 3.25 5.35 3.25 9S14.15 18.65 12 21M12 3c-2.15 2.35-3.25 5.35-3.25 9S9.85 18.65 12 21" />
                  </svg>
                  <span>LANG</span>
                </button>
                <span className="header-utility-divider" aria-hidden="true" />
                <button
                  type="button"
                  className="header-utility-segment dark-control"
                  aria-label="다크 모드 준비 중"
                  tabIndex={headerUtilityHidden ? -1 : 0}
                  onClick={() => setDarkPressKey((key) => key + 1)}
                >
                  <span
                    key={darkPressKey}
                    className={`dark-control-icon${darkPressKey > 0 ? " is-pressing" : ""}`}
                    aria-hidden="true"
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.1 15.25A8.25 8.25 0 0 1 8.75 3.9 8.25 8.25 0 1 0 20.1 15.25Z" />
                    </svg>
                  </span>
                </button>
              </div>
              <div
                id="language-panel"
                className={`language-panel${languageOpen ? " is-open" : ""}`}
                role="menu"
                aria-label="언어 선택 옵션"
                aria-hidden={!languageOpen}
              >
                {HEADER_LANGUAGES.map((language) => (
                  <button
                    key={language.code}
                    type="button"
                    role="menuitemradio"
                    aria-checked={selectedLanguage === language.code}
                    onClick={() => {
                      setSelectedLanguage(language.code);
                      setLanguageOpen(false);
                    }}
                  >
                    <span>{language.label}</span>
                    <i aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
            <button
              ref={headerUtilityHandleRef}
              type="button"
              className={`header-utility-handle${
                headerUtilityHidden ? " is-visible" : ""
              }`}
              aria-label="언어 및 테마 버튼 열기"
              aria-hidden={!headerUtilityHidden}
              tabIndex={headerUtilityHidden ? 0 : -1}
              onClick={() => {
                setLanguageOpen(false);
                setHeaderUtilityDragX(0);
                setHeaderUtilityHidden(false);
              }}
            >
              <span
                key={headerUtilityHintKey}
                className={headerUtilityHintKey > 0 ? "is-hinting" : ""}
                aria-hidden="true"
              >
                ‹
              </span>
            </button>
            <nav
              id="site-menu"
              className={menuOpen ? "is-open" : ""}
              aria-label="Primary navigation"
            >
              <a href="#about" onClick={() => setMenuOpen(false)}>ABOUT</a>
              <a href="#apps" onClick={() => setMenuOpen(false)}>APPS</a>
              <a href="#contact" onClick={() => setMenuOpen(false)}>CONTACT</a>
              <a href="/support/" onClick={() => setMenuOpen(false)}>SUPPORT</a>
              <a href="/terms/" onClick={() => setMenuOpen(false)}>TERMS</a>
              <a href="/privacy/" onClick={() => setMenuOpen(false)}>PRIVACY</a>
            </nav>
            <button
              type="button"
              className="menu-control"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-controls="site-menu"
              onClick={() => {
                setLanguageOpen(false);
                setMenuOpen((open) => !open);
              }}
            >
              <span />
              <span />
            </button>
          </header>

          <div className="ambient-glow" aria-hidden="true" />
          <div className="pointer-glow" aria-hidden="true" />
          <div className="perspective-floor" aria-hidden="true" />
          <div className="decorations" aria-hidden="true">
            <div className="decorations-far">
              {SPACE_OBJECTS.filter((object) => object.depth === "far").map(
                (object, index) => (
                  <i
                    key={`far-${index}`}
                    className={`decoration is-${object.type} motion-${object.motion}`}
                    style={getSpaceObjectStyle(object)}
                  />
                ),
              )}
            </div>
            <div className="decorations-near">
              {SPACE_OBJECTS.filter((object) => object.depth === "near").map(
                (object, index) => (
                  <i
                    key={`near-${index}`}
                    className={`decoration is-${object.type} motion-${object.motion}`}
                    style={getSpaceObjectStyle(object)}
                  />
                ),
              )}
            </div>
          </div>

          <div className="carousel-stage" aria-live="polite">
            <JellyCanvas
              interactionRef={interactionRef}
              reducedMotion={reducedMotion}
            />
            <div className="cards-space">
              {apps.map((app, index) => (
                <AppCard
                  key={app.id}
                  app={app}
                  index={index}
                  setRef={(node) => {
                    cardRefs.current[index] = node;
                  }}
                  onSelect={selectApp}
                />
              ))}
            </div>
          </div>

          <div className="app-info">
            <div className="autoplay-controls">
              <button
                className={`autoplay-control ${isPlaying ? "is-playing" : "is-paused"}`}
                type="button"
                aria-label={isPlaying ? "자동 재생 일시정지" : "자동 재생 시작"}
                disabled={(isTransitioning && !isFastForwarding) || reducedMotion}
                data-playing={isPlaying ? "true" : "false"}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={toggleAutoplay}
              >
                <span
                  className="autoplay-control-icon"
                  key={isPlaying ? "pause" : "play"}
                  aria-hidden="true"
                >
                  {isPlaying ? (
                    <svg viewBox="0 0 16 16" fill="currentColor">
                      <rect x="3.25" y="2.5" width="3.25" height="11" rx="1" />
                      <rect x="9.5" y="2.5" width="3.25" height="11" rx="1" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4.25 2.8a.9.9 0 0 1 1.36-.77l7.1 4.53a.9.9 0 0 1 0 1.52l-7.1 4.53a.9.9 0 0 1-1.36-.76V2.8Z" />
                    </svg>
                  )}
                </span>
              </button>
              {isPlaying && (
                <button
                  className="autoplay-control fast-forward-control"
                  type="button"
                  aria-label="앱 빠르게 넘기기"
                  aria-pressed={isFastForwarding}
                  disabled={(isTransitioning && !isFastForwarding) || reducedMotion}
                  onPointerDown={startFastForward}
                  onPointerUp={releaseFastForward}
                  onPointerCancel={releaseFastForward}
                  onPointerLeave={(event) => {
                    if (isFastForwardingRef.current) releaseFastForward(event);
                  }}
                  onContextMenu={(event) => event.preventDefault()}
                >
                  <span className="fast-forward-control-icon" aria-hidden="true">
                    <svg viewBox="0 0 18 16" fill="currentColor">
                      <path d="M1.8 2.65a.8.8 0 0 1 1.22-.68l5.8 4.68a.8.8 0 0 1 0 1.24l-5.8 4.68a.8.8 0 0 1-1.22-.68V2.65Z" />
                      <path d="M8.4 2.65a.8.8 0 0 1 1.22-.68l5.8 4.68a.8.8 0 0 1 0 1.24l-5.8 4.68a.8.8 0 0 1-1.22-.68V2.65Z" />
                    </svg>
                  </span>
                </button>
              )}
            </div>
            <div
              className={`app-info-content sequence-${activeSequencePhase}${isFastForwarding ? " is-fast-forwarding" : ""}`}
              key={activeApp.id}
              data-sequence-phase={activeSequencePhase}
              data-transitioning={isTransitioning ? "true" : "false"}
            >
              <span className="app-count">
                {String(activeIndex + 1).padStart(2, "0")} / {String(apps.length).padStart(2, "0")}
              </span>
              <h1 aria-label={activeApp.name}>
                {activeApp.name.slice(
                  0,
                  isFastForwarding ? activeApp.name.length : typedNameLength,
                )}
              </h1>
              <PlatformIcons app={activeApp} />
              <span className="view-app-sequence">
                {activeApp.appStoreUrl ? (
                  <button
                    className="view-app"
                    type="button"
                    onMouseEnter={() => pauseAutoplay("detail-hover")}
                    onMouseLeave={() => resumeAutoplay("detail-hover")}
                    onFocus={() => pauseAutoplay("detail-focus")}
                    onBlur={() => resumeAutoplay("detail-focus")}
                    onPointerMove={updateDetailMagnet}
                    onPointerLeave={resetDetailMagnet}
                    onClick={openAppDetail}
                  >
                    <span className="view-app-label">VIEW DETAIL</span>
                  </button>
                ) : (
                  <span className="view-app is-disabled" aria-disabled="true">
                    <span className="view-app-label">COMING SOON</span>
                  </span>
                )}
              </span>
            </div>
          </div>

          <button
            className="carousel-arrow arrow-left"
            type="button"
            aria-label="Previous app"
            onPointerDown={(event) => {
              event.stopPropagation();
              pauseAutoplay("interaction");
            }}
            onPointerUp={() => resumeAutoplay("interaction")}
            onPointerCancel={() => resumeAutoplay("interaction")}
            onClick={() => {
              moveBy(-1);
              resumeAutoplay("interaction");
            }}
          >
            ←
          </button>
          <button
            className="carousel-arrow arrow-right"
            type="button"
            aria-label="Next app"
            onPointerDown={(event) => {
              event.stopPropagation();
              pauseAutoplay("interaction");
            }}
            onPointerUp={() => resumeAutoplay("interaction")}
            onPointerCancel={() => resumeAutoplay("interaction")}
            onClick={() => {
              moveBy(1);
              resumeAutoplay("interaction");
            }}
          >
            →
          </button>

        </section>

        <TypeRevealGroup as="section" className="studio-about">
          <div>
            <TypeReveal
              as="span"
              className="section-label"
              text={ABOUT_REVEAL_STEPS[0].text}
              speed={ABOUT_REVEAL_STEPS[0].speed}
              delay={getTypeRevealDelay(ABOUT_REVEAL_STEPS, 0)}
            />
            <TypeReveal
              as="h2"
              text={ABOUT_REVEAL_STEPS[1].text}
              speed={ABOUT_REVEAL_STEPS[1].speed}
              delay={getTypeRevealDelay(ABOUT_REVEAL_STEPS, 1)}
            />
          </div>
          <div className="about-copy">
            <TypeReveal
              as="p"
              text={ABOUT_REVEAL_STEPS[2].text}
              speed={ABOUT_REVEAL_STEPS[2].speed}
              delay={getTypeRevealDelay(ABOUT_REVEAL_STEPS, 2)}
            />
            <TypeReveal
              as="p"
              text={ABOUT_REVEAL_STEPS[3].text}
              speed={ABOUT_REVEAL_STEPS[3].speed}
              delay={getTypeRevealDelay(ABOUT_REVEAL_STEPS, 3)}
            />
          </div>
        </TypeRevealGroup>

        <DeviceShowcase />

        <TypeRevealGroup
          as="section"
          className="contact-section"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div className="contact-inner">
            <TypeReveal
              as="span"
              className="contact-label"
              text={CONTACT_REVEAL_STEPS[0].text}
              speed={CONTACT_REVEAL_STEPS[0].speed}
              delay={getTypeRevealDelay(CONTACT_REVEAL_STEPS, 0)}
            />
            <TypeReveal
              as="h2"
              id="contact-title"
              text={CONTACT_REVEAL_STEPS[1].text}
              speed={CONTACT_REVEAL_STEPS[1].speed}
              delay={getTypeRevealDelay(CONTACT_REVEAL_STEPS, 1)}
            />
            <p className="contact-copy">
              <TypeReveal
                as="span"
                text={CONTACT_REVEAL_STEPS[2].text}
                speed={CONTACT_REVEAL_STEPS[2].speed}
                delay={getTypeRevealDelay(CONTACT_REVEAL_STEPS, 2)}
              />
              <TypeReveal
                as="span"
                text={CONTACT_REVEAL_STEPS[3].text}
                speed={CONTACT_REVEAL_STEPS[3].speed}
                delay={getTypeRevealDelay(CONTACT_REVEAL_STEPS, 3)}
              />
            </p>
            <div className="contact-email-wrap">
              <a
                className="contact-email-link"
                href="mailto:contact@samestudio.kr"
                aria-label="contact@samestudio.kr"
              >
                <TypeReveal
                  as="span"
                  text={CONTACT_REVEAL_STEPS[4].text}
                  speed={CONTACT_REVEAL_STEPS[4].speed}
                  delay={getTypeRevealDelay(CONTACT_REVEAL_STEPS, 4)}
                />
              </a>
              <span className="contact-star contact-star-one" aria-hidden="true" />
              <span className="contact-star contact-star-two" aria-hidden="true" />
              <span className="contact-star contact-star-three" aria-hidden="true" />
              <span className="contact-star contact-star-four" aria-hidden="true" />
            </div>
          </div>
        </TypeRevealGroup>

        <footer>
          <div className="footer-inner">
            <div className="footer-social" aria-label="SAME STUDIO social links">
              <a href="https://github.com/StuidoSame" target="_blank" rel="noopener noreferrer" aria-label="SAME STUDIO GitHub"><SocialIcon platform="github" /></a>
              <a href="https://x.com/samechan0412" target="_blank" rel="noopener noreferrer" aria-label="SAME STUDIO X"><SocialIcon platform="x" /></a>
              <a href="https://www.instagram.com/do.ob0909" target="_blank" rel="noopener noreferrer" aria-label="SAME STUDIO Instagram"><SocialIcon platform="instagram" /></a>
              <a href="https://www.threads.com/@do.ob0909?hl=ko" target="_blank" rel="noopener noreferrer" aria-label="SAME STUDIO Threads"><SocialIcon platform="threads" /></a>
            </div>
            <p className="footer-copyright">© 2026 SAME STUDIO</p>
            <div className="footer-business">
              <span>사업자명: 세임스튜디오 (SAME STUDIO)</span>
              <span>사업자등록번호: 272-08-03608</span>
              <span>대표자: 김동찬</span>
              <span>이메일: <a href="mailto:contact@samestudio.kr">contact@samestudio.kr</a></span>
            </div>
          </div>
        </footer>
      </main>
      {detailApp && (
        <AppDetailOverlay
          app={detailApp}
          open={detailOverlayOpen}
          onRequestClose={requestAppDetailClose}
          onExited={finishAppDetailClose}
        />
      )}
    </>
  );
}
