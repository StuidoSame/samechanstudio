import { COSMIC_INTRO_TIMING } from "./introTiming.mjs";

export const SPACE_FLIGHT_DURATION_MS = COSMIC_INTRO_TIMING.durationMs;
export const FLIGHT_START_MS = COSMIC_INTRO_TIMING.flightStartMs;
export const FLIGHT_CRUISE_MS = COSMIC_INTRO_TIMING.cruiseMs;
export const FLIGHT_REVEAL_MS = COSMIC_INTRO_TIMING.revealMs;
const MAX_SPEED = COSMIC_INTRO_TIMING.maxSpeed;
const STAR_SPAN = 6500;
const NEAR_PLANE = 16;
const FOCAL_FACTOR = 1 / (2 * Math.tan(55 * Math.PI / 360));

export type WorldPoint = { x: number; y: number; z: number };
export type FlightCamera = WorldPoint & { speed: number };
export type FlightBody = WorldPoint & { id: string; diameter: number; enabled: boolean };

// Integrate a cosine velocity ramp: acceleration, cruise, then deceleration.
// Every object shares this camera. World coordinates never follow CSS keyframes.
export function getFlightCamera(elapsedMs: number): FlightCamera {
  const seconds = Math.max(0, Math.min(SPACE_FLIGHT_DURATION_MS, elapsedMs) - FLIGHT_START_MS) / 1000;
  const acceleration = (FLIGHT_CRUISE_MS - FLIGHT_START_MS) / 1000;
  const cruise = (FLIGHT_REVEAL_MS - FLIGHT_CRUISE_MS) / 1000;
  const deceleration = (SPACE_FLIGHT_DURATION_MS - FLIGHT_REVEAL_MS) / 1000;
  const cruiseZ = MAX_SPEED * acceleration / 2;
  const revealZ = cruiseZ + MAX_SPEED * cruise;
  let z = 0;
  let speed = 0;
  if (seconds <= acceleration) {
    speed = MAX_SPEED * (1 - Math.cos(Math.PI * seconds / acceleration)) / 2;
    z = MAX_SPEED * (seconds / 2 - acceleration * Math.sin(Math.PI * seconds / acceleration) / (2 * Math.PI));
  } else if (seconds <= acceleration + cruise) {
    speed = MAX_SPEED;
    z = cruiseZ + MAX_SPEED * (seconds - acceleration);
  } else {
    const t = Math.min(deceleration, seconds - acceleration - cruise);
    speed = MAX_SPEED * (1 + Math.cos(Math.PI * t / deceleration)) / 2;
    z = revealZ + MAX_SPEED * (t / 2 + deceleration * Math.sin(Math.PI * t / deceleration) / (2 * Math.PI));
  }
  return { x: 26 * Math.sin(z / 1800), y: 14 * Math.sin(z / 2300), z, speed };
}

export function projectWorldPoint(point: WorldPoint, camera: FlightCamera, width: number, height: number) {
  const depth = point.z - camera.z;
  if (depth <= NEAR_PLANE) return null;
  const scale = height * FOCAL_FACTOR / depth;
  return { x: width / 2 + (point.x - camera.x) * scale, y: height / 2 + (point.y - camera.y) * scale, scale, depth };
}

export function getFlightBodies(width: number): FlightBody[] {
  // Resolve scheduled passes to fixed world depths once, never per frame.
  const depthAt = (id: keyof typeof COSMIC_INTRO_TIMING.planetPassMs) =>
    getFlightCamera(COSMIC_INTRO_TIMING.planetPassMs[id]).z;
  const bodies = [
    { id: "rocky", x: -260, y: 180, z: depthAt("rocky"), diameter: 220, enabled: true },
    { id: "gas", x: 400, y: -180, z: depthAt("gas"), diameter: 310, enabled: true },
    { id: "atmosphere", x: -220, y: -230, z: depthAt("atmosphere"), diameter: 180, enabled: true },
    { id: "ice", x: 370, y: 180, z: depthAt("ice"), diameter: 210, enabled: width >= 768 },
    { id: "moon", x: -200, y: 90, z: depthAt("moon"), diameter: 150, enabled: width >= 768 },
    { id: "distant", x: 180, y: -160, z: depthAt("distant"), diameter: 200, enabled: width >= 1024 },
  ];
  if (width < 768) {
    Object.assign(bodies[0], { x: -130, y: 90, diameter: 170 });
    Object.assign(bodies[1], { x: 170, y: -150, z: getFlightCamera(COSMIC_INTRO_TIMING.mobilePassMs.gas).z, diameter: 240 });
    Object.assign(bodies[2], { x: -130, y: 100, z: getFlightCamera(COSMIC_INTRO_TIMING.mobilePassMs.atmosphere).z, diameter: 170 });
  }
  return bodies;
}

export const FLIGHT_CONSTELLATIONS = [
  { id: "north", x: -30, y: -20, z: getFlightCamera(COSMIC_INTRO_TIMING.constellationPassMs.north).z, points: [[-295, 50], [-140, -145], [20, -90], [215, -170], [290, 0], [100, 150]] },
  { id: "south", x: 40, y: 25, z: getFlightCamera(COSMIC_INTRO_TIMING.constellationPassMs.south).z, points: [[-280, -130], [-150, 100], [0, -40], [200, 140], [290, -20], [130, -155]] },
] as const;

const random = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};

export function getFlightStar(index: number, cameraZ: number, width: number, height: number) {
  const initialZ = 450 + random(index + 1) * (STAR_SPAN - 450);
  const cycle = Math.max(0, Math.floor((cameraZ + NEAR_PLANE - initialZ) / STAR_SPAN) + 1);
  const spread = cycle === 0 ? initialZ : STAR_SPAN;
  const focal = height * FOCAL_FACTOR;
  return {
    x: (random(index * 3 + cycle * 271 + 9) * 2 - 1) * width * spread / (2 * focal),
    y: (random(index * 5 + cycle * 317 + 17) * 2 - 1) * height * spread / (2 * focal),
    z: initialZ + cycle * STAR_SPAN,
    cycle,
  };
}

export function startSpaceFlight(scene: HTMLElement, view: Window, development = false) {
  const root = view.document.documentElement;
  if (root.dataset.cosmicIntroMotion !== "full" || root.dataset.cosmicIntro !== "true") return () => {};
  let animation: Animation | undefined;
  try {
    animation = view.document.querySelector(".cosmic-intro")?.getAnimations?.().find((a) =>
      "animationName" in a && a.animationName === "cosmic-entry-logo");
  } catch { return () => {}; }
  if (!animation) return () => {};
  const planets = [...scene.querySelectorAll<HTMLElement>("[data-flight-planet]")];
  const stars = [...scene.querySelectorAll<SVGLineElement>(".cosmic-flight-star")];
  const constellations = [...scene.querySelectorAll<SVGGElement>("[data-flight-constellation]")].map((group, i) => ({
    group, spec: FLIGHT_CONSTELLATIONS[i], line: group.querySelector("polyline")!, dots: [...group.querySelectorAll("circle")],
  }));
  const svg = [...scene.querySelectorAll<SVGSVGElement>("svg")];
  let width = 1;
  let height = 1;
  let worldWidth = 1;
  let worldHeight = 1;
  let bodies: FlightBody[] = [];
  let count = 0;
  let frameId = 0;
  let disposed = false;
  let previousTime = 0;
  let frames = 0;
  let cpuTime = 0;
  let cpuMax = 0;
  const intervals: number[] = [];

  const resize = () => {
    width = Math.max(1, scene.clientWidth);
    height = Math.max(1, scene.clientHeight);
    if (bodies.length === 0) {
      // Resizing changes the lens/frustum, never the world being traversed.
      worldWidth = width;
      worldHeight = height;
      bodies = getFlightBodies(width);
      count = width < 768 ? 56 : width < 1024 ? 88 : 144;
    }
    svg.forEach((element) => element.setAttribute("viewBox", `0 0 ${width} ${height}`));
  };
  resize();
  view.addEventListener("resize", resize, { passive: true });

  const stop = () => {
    if (disposed) return;
    disposed = true;
    view.cancelAnimationFrame(frameId);
    view.removeEventListener("resize", resize);
    if (development) {
      scene.dataset.flightRunning = "false";
      scene.dataset.flightFrames = String(frames);
      scene.dataset.flightCpuMean = (cpuTime / Math.max(1, frames)).toFixed(3);
      scene.dataset.flightCpuMax = cpuMax.toFixed(3);
      intervals.sort((a, b) => a - b);
      const mean = intervals.reduce((sum, n) => sum + n, 0) / Math.max(1, intervals.length);
      scene.dataset.flightFps = (1000 / Math.max(1, mean)).toFixed(1);
      scene.dataset.flightFrameP95 = (intervals[Math.floor(intervals.length * 0.95)] ?? 0).toFixed(2);
    }
  };
  const render = (timestamp: number) => {
    if (disposed) return;
    if (root.dataset.cosmicIntro !== "true") { stop(); return; }
    const cpuStart = development ? view.performance.now() : 0;
    const elapsed = Number(animation.currentTime) || 0;
    const camera = getFlightCamera(elapsed);
    const previous = getFlightCamera(Math.max(0, elapsed - 32));
    if (development) {
      scene.dataset.flightRunning = "true";
      scene.dataset.flightElapsed = elapsed.toFixed(0);
      scene.dataset.flightCameraZ = camera.z.toFixed(1);
      scene.dataset.flightSpeed = camera.speed.toFixed(1);
    }
    planets.forEach((element, i) => {
      const body = bodies[i];
      const projected = body.enabled ? projectWorldPoint(body, camera, width, height) : null;
      const radius = projected ? body.diameter * projected.scale * (body.id === "gas" ? 0.9 : 0.5) : 0;
      const inView = projected && projected.x + radius >= 0 && projected.x - radius <= width && projected.y + radius >= 0 && projected.y - radius <= height;
      element.style.visibility = inView ? "visible" : "hidden";
      if (development) {
        element.dataset.flightDepth = (body.z - camera.z).toFixed(1);
        element.dataset.flightStatus = !body.enabled ? "disabled" : !projected ? "passed" : inView ? "in-view" : "offscreen";
      }
      if (!projected) return;
      element.style.width = `${body.diameter}px`;
      element.style.height = `${body.diameter}px`;
      element.style.zIndex = String(Math.round(10000 - projected.depth));
      element.style.transform = `translate3d(${projected.x}px,${projected.y}px,0) scale(${projected.scale}) translate(-50%,-50%)`;
    });
    constellations.forEach(({ group, spec, line, dots }) => {
      const mobileScale = worldWidth < 768 ? 0.55 : 1;
      const center = projectWorldPoint(spec, camera, width, height);
      group.style.visibility = center ? "visible" : "hidden";
      if (development) {
        group.dataset.flightDepth = (spec.z - camera.z).toFixed(1);
        group.dataset.flightStatus = center ? "ahead" : "passed";
      }
      if (!center) return;
      group.ownerSVGElement!.style.zIndex = String(Math.round(10000 - center.depth));
      const points = spec.points.map(([x, y]) => projectWorldPoint({ x: spec.x + x * mobileScale, y: spec.y + y * mobileScale, z: spec.z }, camera, width, height)!);
      line.setAttribute("points", points.map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" "));
      dots.forEach((dot, index) => {
        dot.setAttribute("cx", points[index].x.toFixed(1));
        dot.setAttribute("cy", points[index].y.toFixed(1));
        dot.setAttribute("r", String(Math.min(9, 2.4 * center.scale)));
      });
    });
    stars.forEach((line, index) => {
      if (index >= count) { line.style.visibility = "hidden"; return; }
      const point = getFlightStar(index, camera.z, worldWidth, worldHeight);
      const head = projectWorldPoint(point, camera, width, height)!;
      const tail = projectWorldPoint(point, previous, width, height)!;
      const visible = Math.max(head.x, tail.x) >= -10 && Math.min(head.x, tail.x) <= width + 10 && Math.max(head.y, tail.y) >= -10 && Math.min(head.y, tail.y) <= height + 10;
      line.style.visibility = visible ? "visible" : "hidden";
      if (!visible) return;
      line.setAttribute("x1", tail.x.toFixed(1));
      line.setAttribute("y1", tail.y.toFixed(1));
      line.setAttribute("x2", head.x.toFixed(1));
      line.setAttribute("y2", head.y.toFixed(1));
      line.setAttribute("stroke-opacity", String(Math.min(0.95, 0.25 + head.scale * 0.5)));
    });
    frames++;
    if (development) {
      const cost = view.performance.now() - cpuStart;
      cpuTime += cost;
      cpuMax = Math.max(cpuMax, cost);
      if (previousTime > 0) intervals.push(timestamp - previousTime);
      previousTime = timestamp;
    }
    frameId = view.requestAnimationFrame(render);
  };
  frameId = view.requestAnimationFrame(render);
  return stop;
}
