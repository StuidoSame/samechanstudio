import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { claimCosmicIntro, playCosmicIntro, cosmicIntroInitializationScript, COSMIC_INTRO_DURATION_MS } from "../app/components/cosmic-intro/introLifecycle.ts";

class TrackedTarget extends EventTarget {
  listeners = new Map();
  addEventListener(type, listener, options) {
    super.addEventListener(type, listener, options);
    this.listeners.set(listener, (this.listeners.get(listener) ?? 0) + 1);
  }
  removeEventListener(type, listener, options) {
    super.removeEventListener(type, listener, options);
    this.listeners.set(listener, (this.listeners.get(listener) ?? 0) - 1);
  }
  get listenerCount() {
    return [...this.listeners.values()].reduce((sum, count) => sum + count, 0);
  }
}

function fixture(storage = new Map()) {
  const view = new TrackedTarget();
  const document = new TrackedTarget();
  const motion = new TrackedTarget();
  const root = new TrackedTarget();
  const timers = new Map();
  const properties = new Map();
  document.documentElement = { dataset: {} };
  document.visibilityState = "visible";
  motion.matches = false;
  root.dataset = {};
  root.style = {
    setProperty: (name, value) => properties.set(name, value),
    removeProperty: (name) => properties.delete(name),
  };
  Object.assign(view, {
    document,
    sessionStorage: { getItem: (key) => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    matchMedia: () => motion,
    performance: { getEntriesByType: () => [{ type: "navigate" }], now: () => 0 },
    location: { hash: "", pathname: "/" },
    scrollY: 0,
    setTimeout: (callback, delay) => { timers.set(callback, delay); return callback; },
    clearTimeout: (callback) => timers.delete(callback),
  });
  return { view, root, motion, timers, properties, storage };
}

test("prepares the first paint before hydration and skips reloads and policy routes", () => {
  const { view } = fixture();
  const run = () => vm.runInNewContext(cosmicIntroInitializationScript, { window: view, document: view.document });
  run();
  assert.equal(view.document.documentElement.dataset.cosmicIntro, "true");
  assert.equal(claimCosmicIntro(view, false), true);
  delete view.document.documentElement.dataset.cosmicIntro;
  run();
  assert.equal(view.document.documentElement.dataset.cosmicIntro, undefined);
  const policy = fixture().view;
  policy.location.pathname = "/privacy/";
  vm.runInNewContext(cosmicIntroInitializationScript, { window: policy, document: policy.document });
  assert.equal(policy.document.documentElement.dataset.cosmicIntro, undefined);
});

test("late hydration keeps the original timeline instead of restarting an intro", () => {
  const { view, root, timers } = fixture();
  root.dataset.cosmicIntroStarted = "0";
  view.performance.now = () => 1900;
  const dispose = playCosmicIntro(root, view, () => {});
  assert.deepEqual([...timers.values()], [300]);
  dispose();
  assert.equal(root.dataset.cosmicIntroStarted, undefined);
});

test("plays once per tab session, including reloads and internal remounts", () => {
  const first = fixture();
  assert.equal(claimCosmicIntro(first.view, false), true);
  assert.equal(claimCosmicIntro(first.view, false), false);
  const reload = fixture(first.storage);
  assert.equal(claimCosmicIntro(reload.view, false), false);
  assert.equal(claimCosmicIntro(fixture().view, false), true);
});

test("storage restrictions cannot break the homepage or repeat internal entries", () => {
  const { view } = fixture();
  Object.defineProperty(view, "sessionStorage", { get() { throw new Error("Storage blocked"); } });
  assert.equal(claimCosmicIntro(view, false), true);
  assert.equal(claimCosmicIntro(view, false), false);
});

test("skips motion, hidden tabs, restored scroll, deep links and history returns", () => {
  const scenarios = [
    ({ motion }) => { motion.matches = true; },
    ({ view }) => { view.document.visibilityState = "hidden"; },
    ({ view }) => { view.scrollY = 120; },
    ({ view }) => { view.location.hash = "#contact"; },
    ({ view }) => { view.performance.getEntriesByType = () => [{ type: "back_forward" }]; },
  ];
  for (const setup of scenarios) {
    const context = fixture();
    setup(context);
    assert.equal(claimCosmicIntro(context.view, false), false);
  }
  assert.equal(claimCosmicIntro(fixture().view, true), false);
});

test("all input dismisses immediately without cancelling the original action", () => {
  for (const type of ["pointerdown", "keydown", "wheel", "touchstart", "focusin", "scroll", "pagehide"]) {
    const { view, root, timers, motion, properties } = fixture();
    let finished = 0;
    playCosmicIntro(root, view, () => finished++);
    assert.equal(root.dataset.cosmicIntro, "true");
    const event = new Event(type, { cancelable: true });
    view.dispatchEvent(event);
    assert.equal(event.defaultPrevented, false);
    assert.equal(finished, 1);
    assert.equal(root.dataset.cosmicIntro, undefined);
    assert.equal(timers.size, 0);
    assert.equal(properties.size, 0);
    assert.equal(view.listenerCount + view.document.listenerCount + root.listenerCount + motion.listenerCount, 0);
    view.dispatchEvent(new Event(type));
    assert.equal(finished, 1);
  }
});

test("animation completion and the CSS failure deadline release every resource", () => {
  for (const complete of ["animation", "deadline", "motion", "hidden"]) {
    const { view, root, timers, motion } = fixture();
    let finished = 0;
    const dispose = playCosmicIntro(root, view, () => finished++);
    assert.deepEqual([...timers.values()], [COSMIC_INTRO_DURATION_MS + 100]);
    if (complete === "animation") {
      const unrelated = new Event("animationend");
      Object.assign(unrelated, { animationName: "apps-galaxy-twinkle" });
      root.dispatchEvent(unrelated);
      assert.equal(finished, 0);
      const event = new Event("animationend");
      Object.assign(event, { animationName: "cosmic-entry-logo" });
      root.dispatchEvent(event);
    } else if (complete === "deadline") {
      [...timers.keys()][0]();
    } else if (complete === "motion") {
      motion.matches = true;
      motion.dispatchEvent(new Event("change"));
    } else {
      view.document.visibilityState = "hidden";
      view.document.dispatchEvent(new Event("visibilitychange"));
    }
    dispose();
    assert.equal(finished, 1);
    assert.equal(root.dataset.cosmicIntro, undefined);
    assert.equal(timers.size, 0);
    assert.equal(view.listenerCount + view.document.listenerCount + root.listenerCount + motion.listenerCount, 0);
  }
});

test("unmount cleanup is idempotent and permits React's effect setup replay", () => {
  const { view, root, timers } = fixture();
  let finished = 0;
  const dispose = playCosmicIntro(root, view, () => finished++);
  dispose();
  dispose();
  assert.equal(finished, 0);
  assert.equal(timers.size, 0);
  const disposeReplay = playCosmicIntro(root, view, () => finished++);
  assert.equal(root.dataset.cosmicIntro, "true");
  assert.equal(timers.size, 1);
  disposeReplay();
  assert.equal(finished, 0);
  assert.equal(timers.size, 0);
});
