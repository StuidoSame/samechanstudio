import assert from "node:assert/strict";
import test from "node:test";
import {
  getFlightCamera, projectWorldPoint, getFlightBodies, getFlightStar,
  FLIGHT_CONSTELLATIONS, SPACE_FLIGHT_DURATION_MS, startSpaceFlight,
} from "../app/components/cosmic-intro/spaceFlight.ts";
import { COSMIC_INTRO_DURATION_MS } from "../app/components/cosmic-intro/introLifecycle.ts";

const closeTo = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} ≈ ${expected}`);

test("one camera accelerates, cruises and decelerates continuously over the eight-second intro", () => {
  assert.equal(SPACE_FLIGHT_DURATION_MS, COSMIC_INTRO_DURATION_MS);
  assert.equal(getFlightCamera(2300).z, 0);
  assert.equal(getFlightCamera(3500).z, 900);
  closeTo(getFlightCamera(7100).z, 6300);
  assert.equal(getFlightCamera(8000).z, 6975);
  assert.equal(getFlightCamera(8000).speed, 0);
  let previous = getFlightCamera(0);
  for (let t = 5; t <= 8000; t += 5) {
    const camera = getFlightCamera(t);
    assert.ok(camera.z >= previous.z);
    assert.ok(camera.speed >= 0 && camera.speed <= 1500);
    assert.ok(Math.abs(camera.speed - previous.speed) < 15);
    previous = camera;
  }
});

test("projection follows focal length over camera-relative depth and clips the camera plane", () => {
  const point = { x: 240, y: -160, z: 1000 };
  const far = projectWorldPoint(point, { x: 0, y: 0, z: 0 }, 1280, 720);
  const near = projectWorldPoint(point, { x: 0, y: 0, z: 500 }, 1280, 720);
  assert.equal(near.scale, far.scale * 2);
  closeTo(near.x - 640, (far.x - 640) * 2);
  closeTo(near.y - 360, (far.y - 360) * 2);
  assert.equal(projectWorldPoint(point, { x: 0, y: 0, z: 985 }, 1280, 720), null);
  assert.equal(projectWorldPoint(point, { x: 0, y: 0, z: 1200 }, 1280, 720), null);
});

test("six fixed world bodies and two constellation planes pass at distinct times", () => {
  const bodies = getFlightBodies(1280);
  const passTime = ({ z }) => {
    for (let t = 2300; t <= 8000; t += 10) if (z - getFlightCamera(t).z <= 16) return t;
    return null;
  };
  const times = bodies.map(passTime);
  assert.equal(new Set(times).size, 6);
  assert.ok(times.every((t) => t > 3500 && t < 8000));
  assert.ok(times[0] < 4500 && times.at(-1) > 7100);
  assert.ok(passTime(FLIGHT_CONSTELLATIONS[0]) < 5500);
  assert.ok(passTime(FLIGHT_CONSTELLATIONS[1]) > 5500 && passTime(FLIGHT_CONSTELLATIONS[1]) < 7100);
  assert.deepEqual(getFlightBodies(390).filter((body) => body.enabled).map((body) => body.id), ["rocky", "gas", "atmosphere"]);
  assert.equal(getFlightBodies(820).filter((body) => body.enabled).length, 5);
  assert.ok(passTime(getFlightBodies(390)[2]) > 7100);
});

test("stars recycle behind the camera to a new distant position without repeating the same placement", () => {
  for (let i = 0; i < 144; i++) {
    const first = getFlightStar(i, 0, 1280, 720);
    const recycled = getFlightStar(i, first.z + 20, 1280, 720);
    assert.equal(recycled.cycle, 1);
    assert.equal(recycled.z, first.z + 6500);
    assert.notEqual(recycled.x, first.x);
    assert.ok(projectWorldPoint(recycled, { x: 0, y: 0, z: first.z + 20 }, 1280, 720));
  }
});

test("the flight loop stops and removes its resize listener on completion or disposal", () => {
  const root = { dataset: { cosmicIntro: "true", cosmicIntroMotion: "full" } };
  const animation = { animationName: "cosmic-entry-logo", currentTime: 0 };
  const callbacks = new Map();
  const listeners = new Set();
  let nextId = 1;
  const view = {
    document: { documentElement: root, querySelector: () => ({ getAnimations: () => [animation] }) },
    performance: { now: () => 0 },
    addEventListener: (_type, callback) => listeners.add(callback),
    removeEventListener: (_type, callback) => listeners.delete(callback),
    requestAnimationFrame: (callback) => { const id = nextId++; callbacks.set(id, callback); return id; },
    cancelAnimationFrame: (id) => callbacks.delete(id),
  };
  const planets = Array.from({ length: 6 }, () => ({ style: {}, dataset: {} }));
  const scene = { dataset: {}, clientWidth: 1280, clientHeight: 720,
    querySelectorAll: (selector) => selector === "[data-flight-planet]" ? planets : [] };
  const stop = startSpaceFlight(scene, view, true);
  assert.equal(callbacks.size, 1);
  const tick = (t) => {
    const [id, callback] = callbacks.entries().next().value;
    callbacks.delete(id);
    animation.currentTime = t;
    callback(t);
  };
  tick(4000);
  assert.equal(scene.dataset.flightCameraZ, getFlightCamera(4000).z.toFixed(1));
  assert.equal(callbacks.size, 1);
  scene.clientWidth = 390;
  scene.clientHeight = 844;
  for (const listener of listeners) listener();
  tick(4100);
  assert.equal(planets[1].style.width, "310px", "resizing preserves world body size");
  assert.equal(planets[1].dataset.flightDepth, (2850 - getFlightCamera(4100).z).toFixed(1));
  delete root.dataset.cosmicIntro;
  tick(8000);
  assert.equal(callbacks.size + listeners.size, 0);
  assert.equal(scene.dataset.flightRunning, "false");
  stop();
  root.dataset.cosmicIntro = "true";
  const dispose = startSpaceFlight(scene, view);
  dispose();
  dispose();
  assert.equal(callbacks.size + listeners.size, 0);
  root.dataset.cosmicIntroMotion = "reduced";
  startSpaceFlight(scene, view)();
  assert.equal(callbacks.size + listeners.size, 0);
});
