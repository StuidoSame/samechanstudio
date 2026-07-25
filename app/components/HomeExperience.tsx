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

function Loader({
  progress,
  interactionRef,
  reducedMotion,
  leaving,
}: {
  progress: number;
  interactionRef: React.MutableRefObject<JellyInteraction>;
  reducedMotion: boolean;
  leaving: boolean;
}) {
  const normalizedProgress = clamp(progress / 100, 0, 1);

  return (
    <div
      className={`preloader ${leaving ? "is-leaving" : ""}`}
      role="status"
      aria-live="polite"
      aria-label={`Loading ${progress}%`}
      data-loader-progress={normalizedProgress.toFixed(2)}
      style={
        {
          "--loader-progress": normalizedProgress,
        } as CSSProperties
      }
    >
      <LoaderJellyCanvas
        className="preloader-jelly"
        interactionRef={interactionRef}
        reducedMotion={reducedMotion}
        loader
        loaderProgress={normalizedProgress}
      />
      <span className="preloader-count">
        {String(progress).padStart(3, "0")}<small>%</small>
      </span>
      <span className="preloader-line">
        <i style={{ width: `${normalizedProgress * 100}%` }} />
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
  });
  const loaderInteractionRef = useRef<JellyInteraction>({
    velocity: 0,
    direction: 1,
    stretch: 0.02,
    transition: 0,
    accent: "#a873ff",
  });

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
    let loaded = 0;
    let done = false;
    let animationFrame = 0;
    const started = performance.now();
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
      const minTime = reducedMotion ? 260 : 900;
      const timeRatio = clamp((now - started) / minTime, 0, 1);
      const normalizedProgress = Math.min(assetRatio, timeRatio);
      const next = Math.min(100, Math.floor(normalizedProgress * 100));
      setLoadProgress(next);
      loaderInteractionRef.current.stretch =
        0.02 + Math.pow(normalizedProgress, 2) * 0.2;
      loaderInteractionRef.current.transition =
        normalizedProgress > 0.88 ? (normalizedProgress - 0.88) / 0.12 : 0;
      loaderInteractionRef.current.velocity = normalizedProgress / 2.2;
      if (done && timeRatio >= 1) {
        setLoadProgress(100);
        window.setTimeout(() => setLoaderLeaving(true), reducedMotion ? 40 : 260);
        window.setTimeout(() => setLoaderVisible(false), reducedMotion ? 140 : 820);
        return;
      }
      animationFrame = requestAnimationFrame(tick);
    };
    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [reducedMotion]);

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

        card.style.transform = `translate3d(calc(-50% + ${x}px), -50%, ${depth}px) rotateY(${rotation}deg) scale(${scale})`;
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
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
        >
          <header className="site-header">
            <a href="#apps" className="wordmark" aria-label="SAME STUDIO home">
              SAME STUDIO
            </a>
            <nav className={menuOpen ? "is-open" : ""} aria-label="Primary navigation">
              <a href="#about" onClick={() => setMenuOpen(false)}>ABOUT</a>
              <a href="#apps" onClick={() => setMenuOpen(false)}>APPS</a>
              <a href="#contact" onClick={() => setMenuOpen(false)}>CONTACT</a>
            </nav>
            <button
              type="button"
              className="menu-control"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={(event) => {
                event.stopPropagation();
                setMenuOpen((open) => !open);
              }}
            >
              {menuOpen ? "CLOSE" : "MENU"}
            </button>
          </header>

          <div className="ambient-glow" aria-hidden="true" />
          <div className="perspective-floor" aria-hidden="true" />
          <div className="decorations" aria-hidden="true">
            {Array.from({ length: 14 }, (_, index) => (
              <i key={index} className={`decoration decoration-${index + 1}`} />
            ))}
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

          <div className="app-info" key={activeApp.id}>
            <span className="app-count">
              {String(activeIndex + 1).padStart(2, "0")} / {String(apps.length).padStart(2, "0")}
            </span>
            <h1>{activeApp.name}</h1>
            <p>{activeApp.tagline}</p>
            <span className="platforms">{activeApp.platforms}</span>
            {activeApp.appStoreUrl ? (
              <a
                className="view-app"
                href={activeApp.appStoreUrl}
                target="_blank"
                rel="noreferrer"
              >
                VIEW APP <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <span className="view-app is-disabled">COMING SOON</span>
            )}
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

          <div className="interaction-hint" aria-hidden="true">
            <span />
            DRAG · SWIPE · SCROLL
          </div>
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
          <a className="footer-contact" href="mailto:contact@samestudio.kr">
            contact@samestudio.kr ↗
          </a>
          <div className="footer-links">
            <a href="/support/">SUPPORT</a>
            <a href="/privacy/">PRIVACY</a>
            <a href="/terms/">TERMS</a>
            <a href="https://github.com/Kingdongchan" target="_blank" rel="noreferrer">GITHUB</a>
          </div>
          <small>© 2026 SAME STUDIO · DAEJEON, KOREA</small>
        </footer>
      </main>
    </>
  );
}
