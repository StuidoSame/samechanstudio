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
import { apps, DEFAULT_APP_INDEX, type AppItem } from "../lib/apps";

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

const LOADER_WORDS = ["SAME", "STUDIO"] as const;
const LOADER_DURATION = 2400;
const LOADER_COMPLETE_HOLD = 320;

const smoothStep = (value: number) => value * value * (3 - 2 * value);

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
      ? [0, width * 0.23, width * 0.4, width * 0.52]
      : [0, width * 0.16, width * 0.29, width * 0.38, width * 0.48];
  const lower = Math.min(Math.floor(absolute), anchors.length - 1);
  const upper = Math.min(lower + 1, anchors.length - 1);
  const mix = absolute - Math.floor(absolute);
  return sign * (anchors[lower] + (anchors[upper] - anchors[lower]) * mix);
};

function CardScreen({ app }: { app: AppItem }) {
  return (
    <>
      <div className="card-eyebrow">{app.eyebrow}</div>
      <Image
        className="card-app-icon"
        src={app.icon}
        alt=""
        width={22}
        height={22}
        draggable={false}
        unoptimized
      />
      {app.screen === "runtronome" && (
        <div className="screen-runtronome">
          <strong>180</strong>
          <span>BPM</span>
          <i className="play-mark">▶</i>
          <b className="progress-mark" />
        </div>
      )}
      {app.screen === "odow" && (
        <div className="screen-odow">
          <span>JUL 26</span>
          <strong>quiet</strong>
          <p>rain on the window<br />tea gone cold<br />day slowly folds away.</p>
          <b>day 214</b>
        </div>
      )}
      {app.screen === "teru" && (
        <div className="screen-teru">
          <span className="teru-head"><i /><i /></span>
          <b />
          <p>Sunny · 26°</p>
        </div>
      )}
      {app.screen === "feeloo" && (
        <div className="screen-feeloo">
          <p>calm · warm</p>
          <div>{["🙂", "😌", "🥹", "🌱"].map((face) => <span key={face}>{face}</span>)}</div>
        </div>
      )}
      {app.screen === "skkoo" && (
        <div className="screen-skkoo">
          <span>Morning<br /><strong>Coffee Ritual</strong></span>
          <i>💗</i>
          <b>02 / 09</b>
        </div>
      )}
      {app.screen === "locaunt" && (
        <div className="screen-locaunt">
          <span className="map-line line-a" />
          <span className="map-line line-b" />
          <span className="map-line line-c" />
          <i />
          <p>Home visited</p>
        </div>
      )}
      {app.screen === "pepesnap" && (
        <div className="screen-pepe">
          <span />
          <i />
          <p>W11.8 · 24mm</p>
        </div>
      )}
      {app.screen === "mapary" && (
        <div className="screen-mapary">
          <span className="map-route" />
          <i className="map-pin a" />
          <i className="map-pin b" />
          <p>DAEJEON<br /><b>3 memories</b></p>
        </div>
      )}
      {app.screen === "tocklist" && (
        <div className="screen-tocklist">
          <strong>24</strong>
          <p>today’s rhythm</p>
          <span /><span /><span />
        </div>
      )}
    </>
  );
}

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
      className={`app-card card-${app.screen}`}
      type="button"
      aria-label={`Select ${app.name}`}
      onClick={() => onSelect(index)}
      style={
        {
          "--card-accent": app.accent,
          "--card-accent-rgb": app.accentRgb,
        } as CSSProperties
      }
    >
      <CardScreen app={app} />
    </button>
  );
}

function PlatformIcon({ platform }: { platform: "apple" | "android" }) {
  if (platform === "apple") {
    return (
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
    );
  }

  return (
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
  );
}

function PlatformIcons({ app }: { app: AppItem }) {
  const supportsApple = Boolean(app.appStoreUrl);
  const supportsAndroid = Boolean(app.googlePlayUrl);
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
  return <svg className="footer-social-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true"><path d="M12 3.3c4.65 0 7.5 2.66 7.5 6.61 0 4.02-2.7 7.2-7.27 7.2-3.2 0-5.42-1.7-5.42-4.25 0-2.34 1.83-4.03 4.41-4.03 2.75 0 4.36 1.74 4.36 4.31 0 2.75-1.46 4.93-4.17 6.72" strokeLinecap="round" strokeLinejoin="round" /><path d="M8.1 13c0-1.3 1.08-2.18 2.76-2.18 1.95 0 2.97 1.03 2.97 2.56 0 1.31-.73 2.2-1.94 2.2-1.07 0-1.62-.7-1.62-1.62" strokeLinecap="round" /></svg>;
}

function Loader({
  progress,
  interactionRef,
  reducedMotion,
  leaving,
  containerRef,
}: {
  progress: number;
  interactionRef: React.MutableRefObject<JellyInteraction>;
  reducedMotion: boolean;
  leaving: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const normalizedProgress = clamp(progress / 100, 0, 1);
  const displayProgress = Math.floor(progress);

  return (
    <div
      ref={containerRef}
      className={`preloader ${leaving ? "is-leaving" : ""}`}
      role="status"
      aria-live="polite"
      aria-label={`Loading ${displayProgress}%`}
      data-loader-progress={normalizedProgress.toFixed(3)}
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
                >
                  {letter}
                </span>
              );
            })}
          </span>
        ))}
      </span>
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
    </div>
  );
}

export function HomeExperience() {
  const [activeIndex, setActiveIndex] = useState(DEFAULT_APP_INDEX);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loaderLeaving, setLoaderLeaving] = useState(false);
  const [loaderVisible, setLoaderVisible] = useState(true);

  const heroRef = useRef<HTMLElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const progressRef = useRef(DEFAULT_APP_INDEX);
  const targetRef = useRef(DEFAULT_APP_INDEX);
  const velocityRef = useRef(0);
  const activeIndexRef = useRef(DEFAULT_APP_INDEX);
  const wheelRef = useRef({ amount: 0, lastMove: 0 });
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
    velocity: 0,
    direction: 1,
    stretch: 0,
    transition: 0,
    accent: apps[DEFAULT_APP_INDEX].accent,
    pointerX: 0,
    pointerY: 0,
    pointerStrength: 0,
  });
  const loaderInteractionRef = useRef<JellyInteraction>({
    velocity: 0,
    direction: 1,
    stretch: 0.02,
    transition: 0,
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

  const activeApp = apps[activeIndex];

  const moveTo = useCallback((index: number) => {
    targetRef.current = clamp(index, 0, apps.length - 1);
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("pointerdown", closeOnOutsidePointer);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closeOnOutsidePointer);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  useEffect(() => {
    let loaded = 0;
    let done = false;
    let animationFrame = 0;
    let leavingTimer = 0;
    let removalTimer = 0;
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
        leavingTimer = window.setTimeout(
          () => setLoaderLeaving(true),
          LOADER_COMPLETE_HOLD,
        );
        removalTimer = window.setTimeout(
          () => setLoaderVisible(false),
          LOADER_COMPLETE_HOLD + (reducedMotion ? 80 : 580),
        );
        return;
      }
      animationFrame = requestAnimationFrame(tick);
    };
    animationFrame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.clearTimeout(leavingTimer);
      window.clearTimeout(removalTimer);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    let animationFrame = 0;

    const updateBounds = () => {
      const bounds = hero.getBoundingClientRect();
      depthBoundsRef.current = {
        left: bounds.left,
        top: bounds.top,
        width: Math.max(bounds.width, 1),
        height: Math.max(bounds.height, 1),
      };
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

    const render = (time: number) => {
      const width = window.innerWidth;
      const pointer = pointerRef.current;
      const delta = Math.min((time - previousTime) / 16.667, 2);
      previousTime = time;

      if (!pointer.dragging) {
        const stiffness = reducedMotion ? 0.22 : 0.105;
        const damping = reducedMotion ? 0.62 : 0.79;
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
        }
      }

      const progress = progressRef.current;
      const nearest = clamp(Math.round(progress), 0, apps.length - 1);
      if (nearest !== activeIndexRef.current) {
        activeIndexRef.current = nearest;
        setActiveIndex(nearest);
      }

      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const slot = index - progress;
        const absolute = Math.abs(slot);
        const x = easeSlot(slot, width);
        const scale =
          absolute <= 1
            ? 1 - absolute * 0.12
            : absolute <= 2
              ? 0.88 - (absolute - 1) * 0.13
              : 0.75 - Math.min(absolute - 2, 1.2) * 0.1;
        const opacity =
          absolute <= 1
            ? 1 - absolute * 0.09
            : absolute <= 2
              ? 0.91 - (absolute - 1) * 0.23
              : Math.max(0, 0.68 - (absolute - 2) * 0.27);
        const rotation =
          -Math.sign(slot) *
          (absolute <= 1
            ? absolute * 18
            : absolute <= 2
              ? 18 + (absolute - 1) * 10
              : 28 + Math.min(absolute - 2, 1) * 10);
        const depth = -Math.min(absolute, 3.4) * 82;
        const pointerDepth = depthCurrentRef.current;
        const activeCard = absolute < 0.5;
        const parallaxX = pointerDepth.x * (activeCard ? 3.25 : 8.5);
        const parallaxY = pointerDepth.y * (activeCard ? 2.5 : 7.5);
        const parallaxZ = pointerDepth.strength * (activeCard ? 5.5 : 9);
        const parallaxRotation = pointerDepth.x * (activeCard ? 0.65 : 1.15);

        card.style.transform = `translate3d(calc(-50% + ${x + parallaxX}px), calc(-50% + ${parallaxY}px), ${depth + parallaxZ}px) rotateY(${rotation + parallaxRotation}deg) scale(${scale})`;
        card.style.opacity = String(opacity);
        card.style.zIndex = String(50 - Math.round(absolute * 8));
        card.style.pointerEvents = absolute < 3.45 ? "auto" : "none";
        card.setAttribute("aria-hidden", absolute > 3.45 ? "true" : "false");
        card.tabIndex = Math.round(progress) === index ? 0 : -1;
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
      interactionRef.current.stretch +=
        (clamp(Math.abs(v) * 0.85 + distance * 0.18, 0, 0.48) -
          interactionRef.current.stretch) *
        0.12;
      interactionRef.current.transition +=
        (clamp(distance * 1.25 + Math.abs(v) * 1.7, 0, 1) -
          interactionRef.current.transition) *
        0.1;
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
      moveTo(
        Math.round(targetRef.current) + (event.key === "ArrowRight" ? 1 : -1),
      );
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [moveTo]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onWheel = (event: globalThis.WheelEvent) => {
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY;
      const atStart = targetRef.current <= 0.001 && delta < 0;
      const atEnd = targetRef.current >= apps.length - 1.001 && delta > 0;
      if (atStart || atEnd) return;
      event.preventDefault();
      const now = performance.now();
      const wheel = wheelRef.current;
      if (now - wheel.lastMove > 260) wheel.amount = 0;
      wheel.amount += delta;
      if (Math.abs(wheel.amount) < 42 || now - wheel.lastMove < 280) return;
      moveTo(Math.round(targetRef.current) + Math.sign(wheel.amount));
      wheel.lastMove = now;
      wheel.amount = 0;
    };
    hero.addEventListener("wheel", onWheel, { passive: false });
    return () => hero.removeEventListener("wheel", onWheel);
  }, [moveTo]);

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (
      event.target instanceof Element &&
      event.target.closest(".site-header, .app-info, .carousel-arrow")
    ) {
      return;
    }
    const pointer = pointerRef.current;
    pointer.id = event.pointerId;
    pointer.startX = event.clientX;
    pointer.startY = event.clientY;
    pointer.lastX = event.clientX;
    pointer.lastTime = performance.now();
    pointer.startProgress = progressRef.current;
    pointer.velocity = 0;
    pointer.dragging = true;
    pointer.horizontal = event.pointerType === "mouse";
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
    const pointer = pointerRef.current;
    if (!pointer.dragging || event.pointerId !== pointer.id) return;
    const dx = event.clientX - pointer.startX;
    const dy = event.clientY - pointer.startY;
    if (!pointer.horizontal) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (Math.abs(dy) > Math.abs(dx) * 1.15) {
        pointer.dragging = false;
        return;
      }
      pointer.horizontal = true;
    }
    event.preventDefault();
    const width = window.innerWidth;
    const step = width < 768 ? width * 0.59 : width < 1024 ? width * 0.23 : width * 0.16;
    const now = performance.now();
    const elapsed = Math.max(now - pointer.lastTime, 8);
    const next = clamp(pointer.startProgress - dx / step, 0, apps.length - 1);
    pointer.velocity = (-(event.clientX - pointer.lastX) / step) * (16.667 / elapsed);
    pointer.lastX = event.clientX;
    pointer.lastTime = now;
    progressRef.current = next;
    targetRef.current = next;
    velocityRef.current = pointer.velocity;
  };

  const endPointer = (event: ReactPointerEvent<HTMLElement>) => {
    const pointer = pointerRef.current;
    if (!pointer.dragging || event.pointerId !== pointer.id) return;
    pointer.dragging = false;
    const projected = progressRef.current + pointer.velocity * 0.32;
    targetRef.current = clamp(Math.round(projected), 0, apps.length - 1);
    velocityRef.current = pointer.velocity * 0.24;
    if (heroRef.current?.hasPointerCapture(event.pointerId)) {
      heroRef.current.releasePointerCapture(event.pointerId);
    }
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
          leaving={loaderLeaving}
          containerRef={loaderRef}
        />
      )}
      <main
        className={`site-shell ${loaderVisible ? "is-loading" : "is-ready"}`}
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
              SAME STUDIO
            </a>
            <nav
              id="site-menu"
              className={menuOpen ? "is-open" : ""}
              aria-label="Primary navigation"
            >
              <a href="#about" onClick={() => setMenuOpen(false)}>ABOUT</a>
              <a href="#apps" onClick={() => setMenuOpen(false)}>APPS</a>
              <a href="#contact" onClick={() => setMenuOpen(false)}>CONTACT</a>
            </nav>
            <button
              type="button"
              className="menu-control"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-controls="site-menu"
              onClick={() => setMenuOpen((open) => !open)}
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
              {Array.from({ length: 8 }, (_, index) => (
                <i key={index} className={`decoration decoration-${index + 1}`} />
              ))}
            </div>
            <div className="decorations-near">
              {Array.from({ length: 6 }, (_, index) => (
                <i key={index} className={`decoration decoration-${index + 9}`} />
              ))}
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
                  onSelect={moveTo}
                />
              ))}
            </div>
          </div>

          <div className="app-info">
            <div className="interaction-hint" aria-hidden="true">
              <span />
              DRAG · SWIPE · SCROLL
            </div>
            <div className="app-info-content" key={activeApp.id}>
              <span className="app-count">
                {String(activeIndex + 1).padStart(2, "0")} / {String(apps.length).padStart(2, "0")}
              </span>
              <h1>{activeApp.name}</h1>
              <PlatformIcons app={activeApp} />
              {activeApp.appStoreUrl ? (
                <a
                  className="view-app"
                  href={activeApp.appStoreUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  VIEW DETAIL
                </a>
              ) : (
                <span className="view-app is-disabled">VIEW DETAIL</span>
              )}
            </div>
          </div>

          <button
            className="carousel-arrow arrow-left"
            type="button"
            aria-label="Previous app"
            disabled={activeIndex === 0}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => moveTo(Math.round(targetRef.current) - 1)}
          >
            ←
          </button>
          <button
            className="carousel-arrow arrow-right"
            type="button"
            aria-label="Next app"
            disabled={activeIndex === apps.length - 1}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => moveTo(Math.round(targetRef.current) + 1)}
          >
            →
          </button>

        </section>

        <section className="studio-about" id="about">
          <div>
            <span className="section-label">SAME STUDIO / ABOUT</span>
            <h2>Small apps, made with a lot of care.</h2>
          </div>
          <div className="about-copy">
            <p>
              SAME STUDIO is an independent mobile app studio based in Daejeon,
              Korea. We build gentle tools for records, places, rhythm, and focus.
            </p>
            <p>
              Soft on first impression, dependable in daily use. Each app is
              designed to make a small recurring moment feel a little clearer.
            </p>
          </div>
        </section>

        <footer id="contact">
          <div className="footer-inner">
            <div className="footer-social" aria-label="SAME STUDIO social links">
              <a href="https://github.com/Kingdongchan" target="_blank" rel="noopener noreferrer" aria-label="SAME STUDIO GitHub"><SocialIcon platform="github" /></a>
              <a href="https://x.com/samechan0412" target="_blank" rel="noopener noreferrer" aria-label="SAME STUDIO X"><SocialIcon platform="x" /></a>
              <a href="https://www.instagram.com/do.ob0909" target="_blank" rel="noopener noreferrer" aria-label="SAME STUDIO Instagram"><SocialIcon platform="instagram" /></a>
              <span className="is-unlinked" aria-label="SAME STUDIO Threads — URL required"><SocialIcon platform="threads" /></span>
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
    </>
  );
}
