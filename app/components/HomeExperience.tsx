"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
} from "react";
import type { JellyInteraction } from "./JellyCanvas";
import { AppDetailOverlay } from "./app-detail/AppDetailOverlay";
import { CosmicInteractionLayer } from "./CosmicInteractionLayer";
import { DeviceShowcase } from "./device-showcase/DeviceShowcase";
import { PageSectionNavigation } from "./PageSectionNavigation";
import { SectionCosmos } from "./SectionCosmos";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import {
  TypeReveal,
  TypeRevealGroup,
} from "./type-reveal/TypeReveal";
import { getTypeRevealDelay } from "./type-reveal/typeRevealTiming";
import { useI18n } from "../i18n/I18nProvider";
import { apps, DEFAULT_APP_INDEX, type AppItem } from "../lib/apps";
import { HERO_ANDROID_APP_IDS } from "../lib/appDetailCapabilities";
import {
  consumeInternalHomeNavigation,
  usePageTransition,
} from "../navigation/PageTransitionProvider";

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
const getAutoplayDelayMs = (appName: string) =>
  appName.length * TYPE_CHAR_INTERVAL_MS +
  NAME_EMPHASIS_MS +
  PLATFORM_REVEAL_MS +
  DETAIL_REVEAL_MS +
  ACTIVE_COMPLETE_HOLD_MS;
const PLAY_RESUME_DELAY_MS = 400;
const FAST_FORWARD_TRANSITION_MS = 280;
const FAST_FORWARD_GAP_MS = 70;
const REDUCED_MOTION_FAST_FORWARD_TRANSITION_MS = 360;
const ABOUT_REVEAL_STEPS = [
  { text: "SAME STUDIO / ABOUT", speed: 32 },
  { text: "Small apps, made\nwith a lot of care.", speed: 45 },
] as const;
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
type GalaxyLayer = "far" | "mid" | "near";
type GalaxyStar = {
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
  shape: "dot" | "cross";
  twinkle: boolean;
  floating: boolean;
  twinkleDuration: number;
  twinkleDelay: number;
  floatDuration: number;
  floatDelay: number;
};

const GALAXY_LAYER_CONFIG = {
  far: { count: 44, seed: 404, size: [1, 2], opacity: [0.18, 0.34] },
  mid: { count: 16, seed: 808, size: [2, 4], opacity: [0.3, 0.5] },
  near: { count: 6, seed: 1212, size: [4, 7], opacity: [0.42, 0.62] },
} as const satisfies Record<
  GalaxyLayer,
  {
    count: number;
    seed: number;
    size: readonly [number, number];
    opacity: readonly [number, number];
  }
>;

const GALAXY_COLORS = ["#ffffff", "#e7dcff", "#f2d6f5", "#d2beff"] as const;

const createGalaxyStars = (layer: GalaxyLayer): GalaxyStar[] => {
  const config = GALAXY_LAYER_CONFIG[layer];
  let state = config.seed;
  const next = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const stars: GalaxyStar[] = [];

  while (stars.length < config.count) {
    const x = next() * 100;
    const followsGalaxyBand = next() < 0.72;
    const y = followsGalaxyBand
      ? Math.min(96, Math.max(4, 8 + x * 0.76 + (next() - 0.5) * 26))
      : 4 + next() * 92;
    const insideIconSafeArea = x > 31 && x < 69 && y > 12 && y < 68;
    const insideInformationSafeArea = x > 26 && x < 74 && y >= 64;

    if (insideIconSafeArea || insideInformationSafeArea) continue;

    const index = stars.length;
    const size = config.size[0] + next() * (config.size[1] - config.size[0]);
    const opacity =
      config.opacity[0] + next() * (config.opacity[1] - config.opacity[0]);
    const twinkle =
      layer === "far"
        ? index % 6 === 2
        : layer === "mid"
          ? index % 3 === 1
          : index % 3 === 0;

    stars.push({
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      size: Number(size.toFixed(2)),
      opacity: Number(opacity.toFixed(3)),
      color: GALAXY_COLORS[Math.floor(next() * GALAXY_COLORS.length)],
      shape:
        layer === "far" || index % (layer === "mid" ? 4 : 3) !== 0
          ? "dot"
          : "cross",
      twinkle,
      floating: layer === "near" && (index === 1 || index === 4),
      twinkleDuration: Number((4.8 + next() * 4.1).toFixed(2)),
      twinkleDelay: Number((next() * 8.4).toFixed(2)),
      floatDuration: Number((9 + next() * 5).toFixed(2)),
      floatDelay: Number((next() * 7).toFixed(2)),
    });
  }

  return stars;
};

const APPS_GALAXY_STARS = {
  far: createGalaxyStars("far"),
  mid: createGalaxyStars("mid"),
  near: createGalaxyStars("near"),
} as const;

const getGalaxyStarStyle = (star: GalaxyStar) =>
  ({
    left: `${star.x}%`,
    top: `${star.y}%`,
    width: `${star.size}px`,
    height: `${star.size}px`,
    color: star.color,
    "--galaxy-opacity": star.opacity,
    "--galaxy-twinkle-opacity": Math.min(star.opacity + 0.14, 0.68),
    "--galaxy-twinkle-duration": `${star.twinkleDuration}s`,
    "--galaxy-twinkle-delay": `-${star.twinkleDelay}s`,
    "--galaxy-float-duration": `${star.floatDuration}s`,
    "--galaxy-float-delay": `-${star.floatDelay}s`,
  }) as CSSProperties;

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

const interpolateSlotValue = (absoluteSlot: number, anchors: readonly number[]) => {
  const lower = Math.min(Math.floor(absoluteSlot), anchors.length - 1);
  const upper = Math.min(lower + 1, anchors.length - 1);
  const progress = smoothstep(0, 1, absoluteSlot - Math.floor(absoluteSlot));
  return anchors[lower] + (anchors[upper] - anchors[lower]) * progress;
};

const CAROUSEL_SCALE_ANCHORS = [1.18, 0.93, 0.77, 0.63, 0.52] as const;
const CAROUSEL_OPACITY_ANCHORS = [1, 0.9, 0.7, 0.5, 0.34] as const;
const CAROUSEL_BRIGHTNESS_ANCHORS = [1, 0.92, 0.82, 0.74, 0.68] as const;
const CAROUSEL_SATURATION_ANCHORS = [1, 0.9, 0.72, 0.58, 0.48] as const;
const CAROUSEL_BLUR_ANCHORS = [0, 0, 0.35, 0.7, 1] as const;

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

const getCarouselPositionAnchors = (width: number) => {
  if (width < 768) {
    const first = clamp(width * 0.58, 185, 235);
    const second = first + clamp(width * 0.34, 105, 145);
    const third = second + clamp(width * 0.25, 80, 110);
    return [0, first, second, third, third + 75];
  }

  if (width < 1024) {
    const first = clamp(width * 0.31, 250, 280);
    const second = first + clamp(width * 0.18, 140, 175);
    const third = second + clamp(width * 0.13, 105, 135);
    return [0, first, second, third, third + 95];
  }

  const first = clamp(width * 0.2, 290, 330);
  const second = first + clamp(width * 0.13, 180, 220);
  const third = second + clamp(width * 0.095, 135, 165);
  return [0, first, second, third, third + clamp(width * 0.075, 105, 135)];
};

const easeSlot = (slot: number, width: number) => {
  const sign = Math.sign(slot);
  const absolute = Math.abs(slot);
  const anchors = getCarouselPositionAnchors(width);
  const lower = Math.min(Math.floor(absolute), anchors.length - 1);
  const upper = Math.min(lower + 1, anchors.length - 1);
  const mix = smoothstep(0, 1, absolute - Math.floor(absolute));
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
  const { messages } = useI18n();
  const { pageTransitionActive } = usePageTransition();
  const contactRevealSteps = useMemo(
    () => [
      { text: "Contact", speed: 45 },
      { text: "contact@samestudio.kr", speed: 32 },
      { text: messages.contact.description, speed: 18 },
    ],
    [messages.contact.description],
  );
  const [activeIndex, setActiveIndex] = useState(DEFAULT_APP_INDEX);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loaderPhase, setLoaderPhase] = useState<LoaderPhase>("loading");
  const [loaderCompletionMediaVisible, setLoaderCompletionMediaVisible] = useState(true);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFastForwarding, setIsFastForwarding] = useState(false);
  const [activeSequencePhase, setActiveSequencePhase] =
    useState<ActiveSequencePhase>("idle");
  const [detailApp, setDetailApp] = useState<AppItem | null>(null);
  const [detailOverlayOpen, setDetailOverlayOpen] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const mainPointerGlowRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
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
  const autoplayPauseReasonsRef = useRef(
    new Set<"interaction" | "detail-hover" | "detail-focus">(),
  );
  const detailTriggerRef = useRef<HTMLButtonElement | null>(null);
  const detailWasPlayingRef = useRef(false);

  const activeApp = apps[activeIndex];

  useLayoutEffect(() => {
    if (pageTransitionActive || consumeInternalHomeNavigation()) {
      window.queueMicrotask(() => {
        setLoaderVisible(false);
        window.requestAnimationFrame(() => {
          delete document.documentElement.dataset.internalHomeNavigation;
        });
      });
    }
  }, [pageTransitionActive]);

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
  }, [clearAutoplay]);

  const moveBy = useCallback(
    (offset: number) => {
      if (
        isTransitioningRef.current &&
        !isFastForwardingRef.current
      ) {
        return false;
      }
      beginTransition();
      targetRef.current = Math.round(targetRef.current) + offset;
      return true;
    },
    [beginTransition],
  );

  const moveToApp = useCallback(
    (appIndex: number) => {
      if (isTransitioningRef.current) return false;
      beginTransition();
      const progress = progressRef.current;
      const nearestCycle = Math.round((progress - appIndex) / apps.length);
      targetRef.current = appIndex + nearestCycle * apps.length;
      return true;
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
    (minimumDelay = AUTOPLAY_RESUME_DELAY_MS) => {
      clearAutoplay();
      autoplayAdvancePendingRef.current = true;
      if (
        !autoplayEnabledRef.current ||
        !isPlayingRef.current ||
        document.visibilityState !== "visible" ||
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
          isTransitioningRef.current ||
          isFastForwardingRef.current ||
          document.visibilityState !== "visible" ||
          autoplayPauseReasonsRef.current.size > 0
        ) {
          return;
        }
        if (moveBy(1)) {
          autoplayAdvancePendingRef.current = false;
        }
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
      if (!autoplayPauseReasonsRef.current.delete(reason)) return;
      autoplayResumeNotBeforeRef.current =
        performance.now() + AUTOPLAY_RESUME_DELAY_MS;
      if (autoplayAdvancePendingRef.current) {
        queueAutoplayAdvance(AUTOPLAY_RESUME_DELAY_MS);
      }
    },
    [queueAutoplayAdvance],
  );

  const resumeTransientAutoplay = useCallback(() => {
    autoplayPauseReasonsRef.current.delete("interaction");
    autoplayPauseReasonsRef.current.delete("detail-hover");
    autoplayPauseReasonsRef.current.delete("detail-focus");
    autoplayResumeNotBeforeRef.current =
      performance.now() + AUTOPLAY_RESUME_DELAY_MS;
    if (autoplayAdvancePendingRef.current) {
      queueAutoplayAdvance(AUTOPLAY_RESUME_DELAY_MS);
    }
  }, [queueAutoplayAdvance]);

  const resetPointerInteraction = useCallback(() => {
    const pointer = pointerRef.current;
    const pointerId = pointer.id;
    pointer.dragging = false;
    pointer.horizontal = false;
    pointer.id = -1;
    targetRef.current = Math.round(progressRef.current);
    velocityRef.current *= 0.24;

    if (
      pointerId >= 0 &&
      heroRef.current?.hasPointerCapture(pointerId)
    ) {
      heroRef.current.releasePointerCapture(pointerId);
    }
  }, []);

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
        document.visibilityState !== "visible"
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
    const main = mainRef.current;
    if (!main) return;

    const sectionEntries = Array.from(
      main.querySelectorAll<HTMLElement>("[data-parallax-section]"),
    ).map((section) => ({
      items: Array.from(
        section.querySelectorAll<HTMLElement>("[data-parallax-item]"),
      ),
      section,
    }));
    if (sectionEntries.length === 0) return;

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const coarsePointerQuery = window.matchMedia(
      "(hover: none), (pointer: coarse)",
    );
    const activeSections = new Set<HTMLElement>();
    const currentOffsets = new WeakMap<HTMLElement, number>();
    const initialProgress = new WeakMap<HTMLElement, number>();
    let frameId: number | null = null;

    const getSectionProgress = (section: HTMLElement) => {
      const rect = section.getBoundingClientRect();
      return clamp(
        (window.innerHeight - rect.top) / (window.innerHeight + rect.height),
        0,
        1,
      );
    };

    sectionEntries.forEach(({ section }) => {
      const rect = section.getBoundingClientRect();
      initialProgress.set(
        section,
        rect.top <= 0 && rect.bottom > 0 ? getSectionProgress(section) : 0,
      );
    });

    const getViewportScale = (kind: string) => {
      const responsiveScale =
        window.innerWidth < 768 ? 0.34 : window.innerWidth < 1200 ? 0.7 : 1;

      if (!coarsePointerQuery.matches) return responsiveScale;
      if (kind === "star" || kind === "dot" || kind === "diamond") return 0;
      return Math.min(responsiveScale, 0.3);
    };

    const resetParallax = () => {
      sectionEntries.forEach(({ items }) => {
        items.forEach((item) => {
          currentOffsets.set(item, 0);
          item.style.setProperty("--parallax-y", "0px");
        });
      });
    };

    const updateParallax = () => {
      frameId = null;

      if (reducedMotionQuery.matches) {
        resetParallax();
        return;
      }

      const viewportHeight = window.innerHeight;
      let needsAnotherFrame = false;

      sectionEntries.forEach(({ items, section }) => {
        if (!activeSections.has(section)) return;

        const rect = section.getBoundingClientRect();
        if (
          rect.bottom < -viewportHeight * 0.2 ||
          rect.top > viewportHeight * 1.2
        ) {
          return;
        }

        const progress = getSectionProgress(section);
        const relativeProgress = progress - (initialProgress.get(section) ?? 0);

        items.forEach((item) => {
          const speed = Number(item.dataset.parallaxSpeed ?? 0.08);
          const maxOffset = Number(item.dataset.parallaxMax ?? 16);
          const direction = Number(item.dataset.parallaxDirection ?? 1);
          const viewportScale = getViewportScale(
            item.dataset.parallaxKind ?? "dot",
          );
          const target = relativeProgress * maxOffset * viewportScale * direction;
          const previous = currentOffsets.get(item);
          const current = previous ?? target;
          const next = current + (target - current) * speed;

          currentOffsets.set(item, next);
          item.style.setProperty("--parallax-y", `${next.toFixed(3)}px`);
          if (Math.abs(target - next) > 0.05) needsAnotherFrame = true;
        });
      });

      if (needsAnotherFrame) {
        frameId = window.requestAnimationFrame(updateParallax);
      }
    };

    const requestParallaxUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateParallax);
    };

    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                const section = entry.target as HTMLElement;
                if (entry.isIntersecting) {
                  activeSections.add(section);
                  section.classList.add("is-parallax-active");
                } else {
                  activeSections.delete(section);
                  section.classList.remove("is-parallax-active");
                }
              });
              requestParallaxUpdate();
            },
            { rootMargin: "20% 0px 20% 0px", threshold: 0 },
          )
        : null;

    sectionEntries.forEach(({ section }) => {
      if (observer) {
        observer.observe(section);
      } else {
        activeSections.add(section);
        section.classList.add("is-parallax-active");
      }
    });

    requestParallaxUpdate();
    window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
    window.addEventListener("resize", requestParallaxUpdate);
    reducedMotionQuery.addEventListener("change", requestParallaxUpdate);
    coarsePointerQuery.addEventListener("change", requestParallaxUpdate);

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", requestParallaxUpdate);
      window.removeEventListener("resize", requestParallaxUpdate);
      reducedMotionQuery.removeEventListener("change", requestParallaxUpdate);
      coarsePointerQuery.removeEventListener("change", requestParallaxUpdate);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      resetParallax();
    };
  }, []);

  useEffect(() => {
    // Reduced motion changes transition presentation, not autoplay intent.
    autoplayEnabledRef.current = !loaderVisible;
    if (reducedMotion && isFastForwardingRef.current) {
      stopFastForward();
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
      if (document.visibilityState !== "visible") {
        stopFastForward();
        resetPointerInteraction();
        clearAutoplay();
        autoplayPauseReasonsRef.current.delete("interaction");
        autoplayPauseReasonsRef.current.delete("detail-hover");
        autoplayPauseReasonsRef.current.delete("detail-focus");
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
  }, [clearAutoplay, queueAutoplayAdvance, resetPointerInteraction, stopFastForward]);

  useEffect(() => {
    const handleWindowBlur = () => {
      stopFastForward();
      resetPointerInteraction();
      clearAutoplay();
      autoplayPauseReasonsRef.current.delete("interaction");
      autoplayPauseReasonsRef.current.delete("detail-hover");
      autoplayPauseReasonsRef.current.delete("detail-focus");
    };
    const handleWindowResume = () => {
      if (document.visibilityState === "visible") {
        resumeTransientAutoplay();
      }
    };
    const handlePointerRelease = (event: PointerEvent) => {
      if (pointerRef.current.id === event.pointerId) {
        resetPointerInteraction();
      }
      resumeAutoplay("interaction");
    };

    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowResume);
    window.addEventListener("pageshow", handleWindowResume);
    window.addEventListener("pointerup", handlePointerRelease);
    window.addEventListener("pointercancel", handlePointerRelease);
    return () => {
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowResume);
      window.removeEventListener("pageshow", handleWindowResume);
      window.removeEventListener("pointerup", handlePointerRelease);
      window.removeEventListener("pointercancel", handlePointerRelease);
    };
  }, [
    clearAutoplay,
    resetPointerInteraction,
    resumeAutoplay,
    resumeTransientAutoplay,
    stopFastForward,
  ]);

  useEffect(() => {
    if (loaderVisible || isTransitioning || isFastForwarding) return;

    queueAutoplayAdvance(getAutoplayDelayMs(activeApp.name));

    return clearAutoplay;
  }, [
    activeApp.id,
    activeApp.name,
    clearAutoplay,
    isFastForwarding,
    isTransitioning,
    loaderVisible,
    queueAutoplayAdvance,
  ]);

  useEffect(() => {
    if (loaderVisible || isTransitioning || isFastForwarding) return;

    const timers: number[] = [];
    const sequenceFrame = window.requestAnimationFrame(() => {
      if (reducedMotion) {
        setActiveSequencePhase("complete");
        return;
      }

      const typingDuration = activeApp.name.length * TYPE_CHAR_INTERVAL_MS;
      setActiveSequencePhase("typing");

      const nameEmphasisStart = typingDuration;
      const platformRevealStart = nameEmphasisStart + NAME_EMPHASIS_MS;
      const detailRevealStart = platformRevealStart + PLATFORM_REVEAL_MS;
      const holdStart = detailRevealStart + DETAIL_REVEAL_MS;
      const completeAt = getAutoplayDelayMs(activeApp.name);

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
        window.setTimeout(
          () => setActiveSequencePhase("complete"),
          completeAt,
        ),
      );
    });

    return () => {
      window.cancelAnimationFrame(sequenceFrame);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [
    activeApp.id,
    activeApp.name,
    isFastForwarding,
    isTransitioning,
    loaderVisible,
    reducedMotion,
  ]);

  useEffect(() => {
    if (!loaderVisible) return;

    let loaded = 0;
    let done = false;
    let animationFrame = 0;
    const phaseTimers: number[] = [];
    const started = performance.now();
    let previousTick = started;
    let displayedProgress = 0;
    // Only warm the icons that can appear in the first carousel viewport.
    // Remaining app icons keep the browser's native lazy-loading behavior.
    const initialViewportApps = apps.slice(0, Math.min(5, apps.length));
    const assets = initialViewportApps.map(
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
  }, [loaderVisible]);

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
    const main = mainRef.current;
    const glow = mainPointerGlowRef.current;
    if (!main || !glow) return;
    const header = main.querySelector<HTMLElement>(".site-header");
    const footer = main.nextElementSibling?.matches("footer")
      ? main.nextElementSibling as HTMLElement
      : null;

    const pointerQuery = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    let animationFrame = 0;
    let enabled = pointerQuery.matches && !reducedMotion;
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2, opacity: 0 };
    const current = { ...target };

    const applyGlow = () => {
      glow.style.setProperty("--main-pointer-x", `${current.x}px`);
      glow.style.setProperty("--main-pointer-y", `${current.y}px`);
      glow.style.setProperty("--main-pointer-strength", String(current.opacity));
    };

    const renderGlow = () => {
      const distance = Math.hypot(target.x - current.x, target.y - current.y);
      const follow = distance > 180 ? 0.52 : distance > 70 ? 0.42 : 0.34;
      current.x += (target.x - current.x) * follow;
      current.y += (target.y - current.y) * follow;
      current.opacity += (target.opacity - current.opacity) * 0.28;
      applyGlow();

      const settling =
        Math.abs(target.x - current.x) > 0.35 ||
        Math.abs(target.y - current.y) > 0.35 ||
        Math.abs(target.opacity - current.opacity) > 0.008;
      animationFrame = settling ? window.requestAnimationFrame(renderGlow) : 0;
    };

    const requestGlowFrame = () => {
      if (!enabled || animationFrame) return;
      animationFrame = window.requestAnimationFrame(renderGlow);
    };

    const hideGlow = () => {
      target.opacity = 0;
      requestGlowFrame();
    };

    const onMainPointerMove = (event: PointerEvent) => {
      if (!enabled || event.pointerType === "touch") return;
      const eventTarget = event.target;
      if (
        eventTarget instanceof Element &&
        eventTarget.closest(".site-header, #site-menu")
      ) {
        hideGlow();
        return;
      }

      target.x = event.clientX;
      target.y = event.clientY;
      target.opacity = 1;
      requestGlowFrame();
    };

    const updateEnabled = () => {
      enabled = pointerQuery.matches && !reducedMotion;
      if (enabled) return;
      target.opacity = 0;
      current.opacity = 0;
      applyGlow();
    };

    applyGlow();
    main.addEventListener("pointermove", onMainPointerMove, { passive: true });
    main.addEventListener("pointerleave", hideGlow);
    header?.addEventListener("pointerenter", hideGlow);
    footer?.addEventListener("pointerenter", hideGlow);
    footer?.addEventListener("pointermove", hideGlow, { passive: true });
    window.addEventListener("blur", hideGlow);
    pointerQuery.addEventListener("change", updateEnabled);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      main.removeEventListener("pointermove", onMainPointerMove);
      main.removeEventListener("pointerleave", hideGlow);
      header?.removeEventListener("pointerenter", hideGlow);
      footer?.removeEventListener("pointerenter", hideGlow);
      footer?.removeEventListener("pointermove", hideGlow);
      window.removeEventListener("blur", hideGlow);
      pointerQuery.removeEventListener("change", updateEnabled);
    };
  }, [reducedMotion]);

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

      const carouselMoving =
        transitionWasActive ||
        pointer.dragging ||
        Math.abs(velocityRef.current) > 0.001;

      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const slot = getCircularSlot(index, progress);
        const absolute = Math.abs(slot);
        const visibleRadius = width < 768 ? 1.65 : width < 1024 ? 2.75 : 4.45;
        const x = easeSlot(slot, width);
        const scale = interpolateSlotValue(absolute, CAROUSEL_SCALE_ANCHORS);
        const opacity = interpolateSlotValue(absolute, CAROUSEL_OPACITY_ANCHORS);
        const brightness = interpolateSlotValue(
          absolute,
          CAROUSEL_BRIGHTNESS_ANCHORS,
        );
        const saturation = interpolateSlotValue(
          absolute,
          CAROUSEL_SATURATION_ANCHORS,
        );
        const blur = interpolateSlotValue(absolute, CAROUSEL_BLUR_ANCHORS);
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
        card.style.filter = `brightness(${brightness}) saturate(${saturation}) blur(${blur}px)`;
        card.style.zIndex = String(100 - Math.round(absolute * 10));
        card.style.willChange =
          carouselMoving || absolute < 1.6
            ? "transform, opacity, filter"
            : "auto";
        card.style.pointerEvents = absolute < visibleRadius ? "auto" : "none";
        card.setAttribute(
          "aria-hidden",
          absolute >= visibleRadius ? "true" : "false",
        );
        if (nearest === index) {
          card.setAttribute("aria-current", "true");
        } else {
          card.removeAttribute("aria-current");
        }
        card.dataset.carouselDistance = absolute.toFixed(3);
        card.tabIndex = nearest === index ? 0 : -1;
      });

      const v = velocityRef.current;
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
    const step = getCarouselPositionAnchors(window.innerWidth)[1];
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
        ref={mainRef}
        className={`site-shell ${loaderVisible && loaderPhase !== "leaving" ? "is-loading" : "is-ready"}`}
        style={accentStyle}
      >
        <div
          ref={mainPointerGlowRef}
          className="main-pointer-glow"
          aria-hidden="true"
        />
        <CosmicInteractionLayer reducedMotion={reducedMotion} />
        <PageSectionNavigation
          hidden={loaderVisible || menuOpen || Boolean(detailApp)}
        />
        <section
          className="hero"
          id="apps"
          data-cursor="drag"
          ref={heroRef}
          aria-label={messages.sectionNavigation.summaries.apps}
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
          <SiteHeader
            homePage
            onMenuOpenChange={setMenuOpen}
          />

          <div className="ambient-glow" aria-hidden="true" />
          <div className="perspective-floor" aria-hidden="true" />
          <div
            className="apps-galaxy"
            aria-hidden="true"
            data-parallax-section=""
          >
            <div className="apps-galaxy-layer apps-galaxy-far">
              {APPS_GALAXY_STARS.far.map((star, index) => (
                <i
                  key={`galaxy-far-${index}`}
                  className={`apps-galaxy-star is-${star.shape}${star.twinkle ? " is-twinkle" : ""}`}
                  style={getGalaxyStarStyle(star)}
                />
              ))}
            </div>
            <div
              className="decoration-parallax-wrapper apps-galaxy-parallax"
              data-parallax-item=""
              data-parallax-kind="dot"
              data-parallax-speed="0.08"
              data-parallax-max="5"
              data-parallax-direction="1"
            >
              <div className="apps-galaxy-layer apps-galaxy-mid">
                {APPS_GALAXY_STARS.mid.map((star, index) => (
                  <i
                    key={`galaxy-mid-${index}`}
                    className={`apps-galaxy-star is-${star.shape}${star.twinkle ? " is-twinkle" : ""}`}
                    style={getGalaxyStarStyle(star)}
                  />
                ))}
              </div>
            </div>
            <div
              className="decoration-parallax-wrapper apps-galaxy-parallax"
              data-parallax-item=""
              data-parallax-kind="star"
              data-parallax-speed="0.11"
              data-parallax-max="8"
              data-parallax-direction="-1"
            >
              <div className="apps-galaxy-layer apps-galaxy-near">
                {APPS_GALAXY_STARS.near.map((star, index) => (
                  <i
                    key={`galaxy-near-${index}`}
                    className={`apps-galaxy-star is-${star.shape}${star.twinkle ? " is-twinkle" : ""}${star.floating ? " is-floating" : ""}`}
                    style={getGalaxyStarStyle(star)}
                  />
                ))}
              </div>
            </div>
          </div>
          <div
            className="decorations"
            aria-hidden="true"
            data-parallax-section=""
          >
            <div
              className="decoration-parallax-wrapper hero-space-parallax"
              data-parallax-item=""
              data-parallax-kind="dot"
              data-parallax-speed="0.08"
              data-parallax-max="14"
              data-parallax-direction="1"
            >
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
            </div>
            <div
              className="decoration-parallax-wrapper hero-space-parallax"
              data-parallax-item=""
              data-parallax-kind="star"
              data-parallax-speed="0.14"
              data-parallax-max="22"
              data-parallax-direction="1"
            >
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
          </div>
          <SectionCosmos variant="hero" />

          <div className="carousel-stage" aria-live="polite">
            <div key={activeApp.id} className="focus-halo" aria-hidden="true">
              <span className="focus-halo-ambient" />
              <span className="focus-halo-core" />
              <span className="focus-halo-shadow" />
            </div>
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
                aria-label={
                  isPlaying
                    ? messages.carousel.pauseAutoplay
                    : messages.carousel.startAutoplay
                }
                disabled={isTransitioning && !isFastForwarding}
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
                  aria-label={messages.carousel.fastForward}
                  aria-pressed={isFastForwarding}
                  disabled={isTransitioning && !isFastForwarding}
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
              <h2 aria-label={activeApp.name}>{activeApp.name}</h2>
              <PlatformIcons app={activeApp} />
              <span className="view-app-sequence">
                {activeApp.appStoreUrl ? (
                  <button
                    className="view-app"
                    type="button"
                    onPointerEnter={(event) => {
                      if (event.pointerType === "mouse") {
                        pauseAutoplay("detail-hover");
                      }
                    }}
                    onPointerLeave={(event) => {
                      resetDetailMagnet(event);
                      resumeAutoplay("detail-hover");
                    }}
                    onFocus={() => pauseAutoplay("detail-focus")}
                    onBlur={() => resumeAutoplay("detail-focus")}
                    onPointerMove={updateDetailMagnet}
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

        <TypeRevealGroup as="section" className="studio-about" id="about">
          <SectionCosmos variant="about" />
          <div className="studio-about-content">
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
              preserveLineBreaks
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
          <SectionCosmos variant="contact" />
          <div className="contact-stage">
            <div className="contact-layout">
              <div className="contact-inner">
                <TypeReveal
                  as="h2"
                  id="contact-title"
                  text={contactRevealSteps[0].text}
                  speed={contactRevealSteps[0].speed}
                  delay={getTypeRevealDelay(contactRevealSteps, 0)}
                />
                <div className="contact-email-wrap">
                  <a
                    className="contact-email-link"
                    href="mailto:contact@samestudio.kr"
                    aria-label="contact@samestudio.kr"
                  >
                    <TypeReveal
                      as="span"
                      text={contactRevealSteps[1].text}
                      speed={contactRevealSteps[1].speed}
                      delay={getTypeRevealDelay(contactRevealSteps, 1)}
                    />
                  </a>
                </div>
                <p className="contact-copy">
                  <TypeReveal
                    as="span"
                    text={contactRevealSteps[2].text}
                    speed={contactRevealSteps[2].speed}
                    delay={getTypeRevealDelay(contactRevealSteps, 2)}
                  />
                </p>
              </div>
              <div
                className="contact-scene"
                aria-hidden="true"
                data-parallax-section=""
              >
                <div
                  className="decoration-parallax-wrapper"
                  data-parallax-item=""
                  data-parallax-kind="constellation"
                  data-parallax-speed="0.08"
                  data-parallax-max="36"
                  data-parallax-direction="1"
                >
                  <svg
                    className="contact-constellation"
                    viewBox="0 0 220 118"
                    fill="none"
                    focusable="false"
                  >
                    <path d="M12 91 52 58 96 70 134 30 177 48 210 12" />
                    <circle cx="12" cy="91" r="2.5" />
                    <circle cx="52" cy="58" r="2" />
                    <circle cx="96" cy="70" r="2.5" />
                    <circle cx="134" cy="30" r="2" />
                    <circle cx="177" cy="48" r="2.4" />
                    <circle cx="210" cy="12" r="2" />
                  </svg>
                </div>
                <div
                  className="decoration-parallax-wrapper"
                  data-parallax-item=""
                  data-parallax-kind="orbit"
                  data-parallax-speed="0.14"
                  data-parallax-max="46"
                  data-parallax-direction="1"
                >
                  <span className="contact-orb"><i /></span>
                </div>
                <div
                  className="decoration-parallax-wrapper"
                  data-parallax-item=""
                  data-parallax-kind="dot"
                  data-parallax-speed="0.08"
                  data-parallax-max="12"
                  data-parallax-direction="1"
                >
                  <span className="contact-scene-particle contact-scene-particle--one" />
                  <span className="contact-scene-particle contact-scene-particle--four" />
                </div>
                <div
                  className="decoration-parallax-wrapper"
                  data-parallax-item=""
                  data-parallax-kind="diamond"
                  data-parallax-speed="0.11"
                  data-parallax-max="16"
                  data-parallax-direction="-1"
                >
                  <span className="contact-scene-particle contact-scene-particle--two" />
                  <span className="contact-scene-particle contact-scene-particle--five" />
                </div>
                <div
                  className="decoration-parallax-wrapper"
                  data-parallax-item=""
                  data-parallax-kind="dot"
                  data-parallax-speed="0.14"
                  data-parallax-max="10"
                  data-parallax-direction="1"
                >
                  <span className="contact-scene-particle contact-scene-particle--three" />
                  <span className="contact-scene-particle contact-scene-particle--six" />
                </div>
                <div
                  className="decoration-parallax-wrapper"
                  data-parallax-item=""
                  data-parallax-kind="flight"
                  data-parallax-speed="0.08"
                  data-parallax-max="18"
                  data-parallax-direction="1"
                >
                  <div className="contact-flight">
                    <svg
                      className="contact-flight-trail"
                      viewBox="0 0 190 90"
                      fill="none"
                      focusable="false"
                    >
                      <path d="M5 78C42 72 52 38 91 43c28 4 41 27 76 6" />
                    </svg>
                    <div className="contact-paper-plane-decoration">
                      <svg viewBox="0 0 68 56" fill="none" focusable="false">
                        <path d="M62 8 7 27l23 7 9 16L62 8Z" />
                        <path d="m30 34 32-26-23 31" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TypeRevealGroup>

      </main>
      <SiteFooter currentPage="home" />
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
