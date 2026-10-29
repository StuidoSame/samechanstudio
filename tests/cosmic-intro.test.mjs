import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import {
  claimCosmicIntro, playCosmicIntro, getCosmicIntroDecision,
  createCosmicIntroInitializationScript, COSMIC_INTRO_DURATION_MS,
  COSMIC_INTRO_REDUCED_DURATION_MS,
} from "../app/components/cosmic-intro/introLifecycle.ts";

const SESSION_KEY = "same-studio-cosmic-intro-v2";
class TrackedTarget extends EventTarget {
  listeners = new Map();
  addEventListener(type, listener, options) {
    super.addEventListener(type, listener, options);
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(listener);
  }
  removeEventListener(type, listener, options) {
    super.removeEventListener(type, listener, options);
    this.listeners.get(type)?.delete(listener);
  }
  emitTrusted(type) {
    const event = { type, isTrusted: true, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
    for (const listener of [...(this.listeners.get(type) ?? [])]) listener(event);
    return event;
  }
  get listenerCount() {
    return [...this.listeners.values()].reduce((sum, listeners) => sum + listeners.size, 0);
  }
}

function fixture(storage = new Map()) {
  const view = new TrackedTarget();
  const document = new TrackedTarget();
  const motion = new TrackedTarget();
  const root = new TrackedTarget();
  const timers = new Map();
  const properties = new Map();
  const animations = [{ animationName: "cosmic-entry-logo", currentTime: 0 }];
  document.documentElement = root;
  document.visibilityState = "visible";
  document.querySelector = () => ({ getAnimations: () => animations });
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
    location: { hash: "", pathname: "/", search: "" },
    scrollY: 0,
    setTimeout: (callback, delay) => { timers.set(callback, delay); return callback; },
    clearTimeout: (callback) => timers.delete(callback),
  });
  return { view, root, motion, timers, properties, storage, animations };
}

function initialize(view, development = false) {
  vm.runInNewContext(createCosmicIntroInitializationScript(development), {
    window: view, document: view.document, URLSearchParams,
  });
}

test("first-paint preparation does not consume a session before playback", () => {
  const { view, root, storage } = fixture();
  initialize(view);
  assert.equal(root.dataset.cosmicIntro, "true");
  assert.equal(root.dataset.cosmicIntroMotion, "full");
  assert.equal(storage.size, 0);
  assert.equal(root.dataset.cosmicIntroSeen, undefined);
  assert.equal(root.dataset.cosmicIntroStarted, undefined);
  assert.equal(root.dataset.cosmicIntroState, undefined);
});

test("only an accepted playback consumes the visit, including storage-restricted contexts", () => {
  for (const blocked of [false, true]) {
    const { view, root, storage } = fixture();
    if (blocked) Object.defineProperty(view, "sessionStorage", { get() { throw new Error("Storage blocked"); } });
    assert.equal(claimCosmicIntro(view, false), true);
    assert.equal(root.dataset.cosmicIntroSeen, undefined);
    const dispose = playCosmicIntro(root, view, () => {});
    assert.equal(root.dataset.cosmicIntroSeen, "true");
    assert.equal(claimCosmicIntro(view, false), false);
    dispose();
    if (!blocked) assert.equal(claimCosmicIntro(fixture(storage).view, false), false);
  }
});

test("skipped mounts do not consume future visible visits", () => {
  const scenarios = [
    ({ view }) => { view.document.visibilityState = "hidden"; },
    ({ view }) => { view.scrollY = 120; },
    ({ view }) => { view.location.hash = "#contact"; },
    ({ view }) => { view.location.pathname = "/privacy/"; },
    ({ view }) => { view.performance.getEntriesByType = () => [{ type: "back_forward" }]; },
  ];
  for (const setup of scenarios) {
    const context = fixture();
    setup(context);
    initialize(context.view);
    assert.equal(claimCosmicIntro(context.view, false), false);
    assert.equal(context.storage.size, 0);
    assert.equal(context.root.dataset.cosmicIntroSeen, undefined);
  }
  const { view, storage } = fixture();
  assert.equal(claimCosmicIntro(view, true), false);
  assert.equal(storage.size, 0);
});

test("an unreliable legacy completion marker cannot suppress the repaired intro", () => {
  const legacy = "same-studio-cosmic-intro-v1";
  const { view, root, storage } = fixture(new Map([[legacy, "1"], ["unrelated", "keep"]]));
  assert.equal(claimCosmicIntro(view, false), true);
  const dispose = playCosmicIntro(root, view, () => {});
  assert.deepEqual([...storage], [[legacy, "1"], ["unrelated", "keep"], [SESSION_KEY, "1"]]);
  dispose();
  assert.equal(claimCosmicIntro(fixture(storage).view, false), false);
});

test("reduced motion shows the brand without moving the starfield", () => {
  const { view, root, motion, timers } = fixture();
  motion.matches = true;
  initialize(view, true);
  assert.equal(root.dataset.cosmicIntroMotion, "reduced");
  assert.equal(root.dataset.cosmicIntroPreference, "reduce");
  assert.equal(claimCosmicIntro(view, false), true);
  const dispose = playCosmicIntro(root, view, () => {});
  assert.deepEqual([...timers.values()], [COSMIC_INTRO_REDUCED_DURATION_MS + 200]);
  dispose();
});

test("development replay bypasses seen state without changing session data", () => {
  for (const request of ["replay", "full"]) {
    const { view, root, motion, storage } = fixture(new Map([[SESSION_KEY, "1"], ["unrelated", "keep"]]));
    motion.matches = true;
    view.location.search = `?intro=${request}`;
    initialize(view, true);
    assert.equal(root.dataset.cosmicIntroMotion, request === "full" ? "full" : "reduced");
    assert.equal(claimCosmicIntro(view, false, true), true);
    const dispose = playCosmicIntro(root, view, () => {}, true);
    assert.deepEqual([...storage], [[SESSION_KEY, "1"], ["unrelated", "keep"]]);
    assert.equal(root.dataset.cosmicIntroSeen, undefined);
    dispose();
    assert.equal(getCosmicIntroDecision(view, true, true).mode, null);
  }
});

test("production ignores preview parameters and omits diagnostic state", () => {
  const { view, root } = fixture(new Map([[SESSION_KEY, "1"]]));
  view.location.search = "?intro=full";
  initialize(view, false);
  assert.equal(root.dataset.cosmicIntro, undefined);
  assert.equal(root.dataset.cosmicIntroState, undefined);
  assert.equal(root.dataset.cosmicIntroPreview, undefined);
  assert.equal(claimCosmicIntro(view, false, false), false);
  const reduced = fixture();
  reduced.motion.matches = true;
  reduced.view.location.search = "?intro=full";
  initialize(reduced.view, false);
  assert.equal(reduced.root.dataset.cosmicIntroMotion, "reduced");
});

test("resource loading before first paint cannot exhaust the CSS animation deadline", () => {
  const { view, root, timers, animations } = fixture();
  view.performance.now = () => 9000;
  animations[0].currentTime = 150;
  const dispose = playCosmicIntro(root, view, () => {});
  assert.deepEqual([...timers.values()], [COSMIC_INTRO_DURATION_MS + 200 - 150]);
  dispose();
});

test("automatic focus, scroll and synthetic inputs cannot instantly skip the logo", () => {
  const { view, root } = fixture();
  let finished = 0;
  const dispose = playCosmicIntro(root, view, () => finished++);
  for (const type of ["focusin", "scroll", "keydown", "pointerdown"]) view.dispatchEvent(new Event(type));
  assert.equal(finished, 0);
  assert.equal(root.dataset.cosmicIntro, "true");
  dispose();
});

test("real pointer, keyboard and touch input dismisses without cancelling the action", () => {
  for (const type of ["pointerdown", "keydown", "wheel", "touchstart"]) {
    const { view, root, timers, motion, properties } = fixture();
    let finished = 0;
    playCosmicIntro(root, view, () => finished++, true);
    assert.equal(view.emitTrusted(type).defaultPrevented, false);
    assert.equal(finished, 1);
    assert.equal(root.dataset.cosmicIntro, undefined);
    assert.equal(root.dataset.cosmicIntroState, "finished-input");
    assert.equal(timers.size + properties.size, 0);
    assert.equal(view.listenerCount + view.document.listenerCount + root.listenerCount + motion.listenerCount, 0);
  }
});

test("animation end, CSS failure, motion changes and hidden tabs clean up once", () => {
  for (const complete of ["animation", "deadline", "motion", "hidden", "pagehide"]) {
    const { view, root, timers, motion } = fixture();
    let finished = 0;
    const dispose = playCosmicIntro(root, view, () => finished++);
    if (complete === "animation") {
      const unrelated = Object.assign(new Event("animationend"), { animationName: "apps-galaxy-twinkle" });
      root.dispatchEvent(unrelated);
      assert.equal(finished, 0);
      root.dispatchEvent(Object.assign(new Event("animationend"), { animationName: "cosmic-entry-logo" }));
    } else if (complete === "deadline") {
      [...timers.keys()][0]();
    } else if (complete === "motion") {
      motion.matches = true;
      motion.dispatchEvent(new Event("change"));
    } else if (complete === "hidden") {
      view.document.visibilityState = "hidden";
      view.document.dispatchEvent(new Event("visibilitychange"));
    } else {
      view.dispatchEvent(new Event("pagehide"));
    }
    dispose();
    assert.equal(finished, 1);
    assert.equal(root.dataset.cosmicIntro, undefined);
    assert.equal(timers.size, 0);
    assert.equal(view.listenerCount + view.document.listenerCount + root.listenerCount + motion.listenerCount, 0);
  }
});

test("unmount cleanup is idempotent and supports React effect setup replay", () => {
  const { view, root, timers } = fixture();
  let finished = 0;
  const dispose = playCosmicIntro(root, view, () => finished++);
  dispose();
  dispose();
  assert.equal(finished, 0);
  assert.equal(timers.size, 0);
  const disposeReplay = playCosmicIntro(root, view, () => finished++);
  assert.equal(root.dataset.cosmicIntro, "true");
  disposeReplay();
  assert.equal(timers.size, 0);
  assert.equal(finished, 0);
});
