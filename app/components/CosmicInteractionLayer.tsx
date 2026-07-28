"use client";

import { useEffect, useRef } from "react";

const METEOR_MIN_DELAY_MS = 5_000;
const METEOR_MAX_DELAY_MS = 15_000;
const MAX_ACTIVE_METEORS = 2;
const MAX_TRAIL_PARTICLES = 32;
const TRAIL_MIN_DISTANCE = 11;
const TRAIL_MIN_INTERVAL_MS = 24;
const TRAIL_COLORS = ["205, 178, 255", "244, 190, 225", "255, 255, 255"] as const;

const randomBetween = (minimum: number, maximum: number) =>
  minimum + Math.random() * (maximum - minimum);

type CosmicInteractionLayerProps = {
  enablePointerTrail?: boolean;
  reducedMotion: boolean;
};

export function CosmicInteractionLayer({
  enablePointerTrail = true,
  reducedMotion,
}: CosmicInteractionLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const main = layer?.parentElement;
    if (!layer || !main || reducedMotion) return;

    let spawnTimeout = 0;
    const activeMeteors = new Set<HTMLElement>();
    const removalTimeouts = new Map<HTMLElement, number>();

    const removeMeteor = (meteor: HTMLElement) => {
      const removalTimeout = removalTimeouts.get(meteor);
      if (removalTimeout) window.clearTimeout(removalTimeout);
      removalTimeouts.delete(meteor);
      activeMeteors.delete(meteor);
      meteor.remove();
    };

    const createMeteor = () => {
      if (document.hidden || activeMeteors.size >= MAX_ACTIVE_METEORS) return;

      const mainRect = main.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const spawnMode = Math.floor(Math.random() * 3);
      let viewportX: number;
      let viewportY: number;

      if (spawnMode === 0) {
        viewportX = randomBetween(viewportWidth * 0.04, viewportWidth * 0.72);
        viewportY = randomBetween(-28, viewportHeight * 0.08);
      } else if (spawnMode === 1) {
        viewportX = randomBetween(-48, viewportWidth * 0.12);
        viewportY = randomBetween(viewportHeight * 0.04, viewportHeight * 0.3);
      } else {
        viewportX = randomBetween(viewportWidth * 0.48, viewportWidth * 0.82);
        viewportY = randomBetween(-18, viewportHeight * 0.16);
      }

      const length = randomBetween(
        Math.min(88, viewportWidth * 0.18),
        Math.min(164, viewportWidth * 0.3),
      );
      const duration = randomBetween(920, 1_480);
      const angle = randomBetween(25, 40);
      const travel = randomBetween(
        Math.max(360, viewportWidth * 0.36),
        Math.max(620, viewportWidth * 0.68),
      );
      const brightness = randomBetween(0.48, 0.76);

      const meteor = document.createElement("span");
      const streak = document.createElement("span");
      meteor.className = "cosmic-meteor";
      streak.className = "cosmic-meteor-streak";
      meteor.dataset.cosmicMeteor = "";
      meteor.dataset.angle = angle.toFixed(2);
      meteor.dataset.durationMs = Math.round(duration).toString();
      meteor.dataset.travelPx = Math.round(travel).toString();
      meteor.style.setProperty("--meteor-x", `${viewportX - mainRect.left}px`);
      meteor.style.setProperty("--meteor-y", `${viewportY - mainRect.top}px`);
      meteor.style.setProperty("--meteor-angle", `${angle}deg`);
      meteor.style.setProperty("--meteor-length", `${length}px`);
      meteor.style.setProperty("--meteor-travel", `${travel}px`);
      meteor.style.setProperty("--meteor-duration", `${duration}ms`);
      meteor.style.setProperty("--meteor-brightness", `${brightness}`);
      meteor.appendChild(streak);
      layer.appendChild(meteor);
      activeMeteors.add(meteor);

      streak.addEventListener("animationend", () => removeMeteor(meteor), {
        once: true,
      });
      removalTimeouts.set(
        meteor,
        window.setTimeout(() => removeMeteor(meteor), duration + 160),
      );
    };

    const scheduleMeteor = () => {
      window.clearTimeout(spawnTimeout);
      if (document.hidden) return;
      const delay = randomBetween(METEOR_MIN_DELAY_MS, METEOR_MAX_DELAY_MS);
      layer.dataset.nextMeteorDelayMs = Math.round(delay).toString();
      spawnTimeout = window.setTimeout(() => {
        createMeteor();
        scheduleMeteor();
      }, delay);
    };

    const onVisibilityChange = () => {
      window.clearTimeout(spawnTimeout);
      if (document.hidden) {
        activeMeteors.forEach(removeMeteor);
        return;
      }
      scheduleMeteor();
    };

    scheduleMeteor();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearTimeout(spawnTimeout);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      activeMeteors.forEach(removeMeteor);
      removalTimeouts.forEach((timeout) => window.clearTimeout(timeout));
      removalTimeouts.clear();
    };
  }, [reducedMotion]);

  useEffect(() => {
    const layer = layerRef.current;
    const main = layer?.parentElement;
    if (!layer || !main || reducedMotion || !enablePointerTrail) return;

    const finePointerQuery = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (min-width: 769px)",
    );
    let enabled = finePointerQuery.matches;
    let animationFrame = 0;
    let latestPointer: PointerEvent | null = null;
    let lastCreatedAt = 0;
    let lastX = Number.NaN;
    let lastY = Number.NaN;
    const activeParticles = new Set<HTMLElement>();
    const removalTimeouts = new Map<HTMLElement, number>();

    const removeParticle = (particle: HTMLElement) => {
      const removalTimeout = removalTimeouts.get(particle);
      if (removalTimeout) window.clearTimeout(removalTimeout);
      removalTimeouts.delete(particle);
      activeParticles.delete(particle);
      particle.remove();
    };

    const clearParticles = () => {
      activeParticles.forEach(removeParticle);
    };

    const createParticle = (event: PointerEvent) => {
      if (
        !enabled ||
        document.hidden ||
        event.pointerType === "touch" ||
        activeParticles.size >= MAX_TRAIL_PARTICLES
      ) {
        return;
      }

      const now = performance.now();
      const distance = Number.isFinite(lastX)
        ? Math.hypot(event.clientX - lastX, event.clientY - lastY)
        : Number.POSITIVE_INFINITY;
      if (now - lastCreatedAt < TRAIL_MIN_INTERVAL_MS || distance < TRAIL_MIN_DISTANCE) {
        return;
      }

      const mainRect = main.getBoundingClientRect();
      const duration = randomBetween(500, 900);
      const size = randomBetween(2.2, 5.2);
      const jitterX = randomBetween(-2.5, 2.5);
      const jitterY = randomBetween(-2.5, 2.5);
      const particle = document.createElement("span");
      particle.className = "cosmic-trail-particle";
      particle.dataset.cosmicTrailParticle = "";
      particle.dataset.durationMs = Math.round(duration).toString();
      particle.style.setProperty(
        "--trail-x",
        `${event.clientX - mainRect.left + jitterX}px`,
      );
      particle.style.setProperty(
        "--trail-y",
        `${event.clientY - mainRect.top + jitterY}px`,
      );
      particle.style.setProperty("--trail-size", `${size}px`);
      particle.style.setProperty("--trail-duration", `${duration}ms`);
      particle.style.setProperty("--trail-drift-x", `${randomBetween(-5, 5)}px`);
      particle.style.setProperty("--trail-drift-y", `${randomBetween(-8, -2)}px`);
      particle.style.setProperty(
        "--trail-color",
        TRAIL_COLORS[Math.floor(Math.random() * TRAIL_COLORS.length)],
      );
      layer.appendChild(particle);
      activeParticles.add(particle);
      lastCreatedAt = now;
      lastX = event.clientX;
      lastY = event.clientY;

      particle.addEventListener("animationend", () => removeParticle(particle), {
        once: true,
      });
      removalTimeouts.set(
        particle,
        window.setTimeout(() => removeParticle(particle), duration + 120),
      );
    };

    const flushPointer = () => {
      animationFrame = 0;
      if (!latestPointer) return;
      createParticle(latestPointer);
      latestPointer = null;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!enabled || event.pointerType === "touch") return;
      latestPointer = event;
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(flushPointer);
      }
    };

    const stopPendingTrail = () => {
      latestPointer = null;
      lastX = Number.NaN;
      lastY = Number.NaN;
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const onVisibilityChange = () => {
      if (!document.hidden) return;
      stopPendingTrail();
      clearParticles();
    };

    const updateEnabled = () => {
      enabled = finePointerQuery.matches;
      if (enabled) return;
      stopPendingTrail();
      clearParticles();
    };

    main.addEventListener("pointermove", onPointerMove, { passive: true });
    main.addEventListener("pointerleave", stopPendingTrail);
    window.addEventListener("blur", stopPendingTrail);
    document.addEventListener("visibilitychange", onVisibilityChange);
    finePointerQuery.addEventListener("change", updateEnabled);

    return () => {
      stopPendingTrail();
      clearParticles();
      removalTimeouts.forEach((timeout) => window.clearTimeout(timeout));
      removalTimeouts.clear();
      main.removeEventListener("pointermove", onPointerMove);
      main.removeEventListener("pointerleave", stopPendingTrail);
      window.removeEventListener("blur", stopPendingTrail);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      finePointerQuery.removeEventListener("change", updateEnabled);
    };
  }, [enablePointerTrail, reducedMotion]);

  return (
    <div
      ref={layerRef}
      className="cosmic-interaction-layer"
      data-cosmic-interactions=""
      aria-hidden="true"
    />
  );
}
