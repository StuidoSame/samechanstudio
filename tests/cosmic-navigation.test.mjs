import assert from "node:assert/strict";
import test from "node:test";
import { createWarpLifecycle, getWarpTiming, navigationKind, warpPreviewEnabled } from "../app/navigation/cosmicNavigation.ts";
import { createScrollRecorder, persistRouterScroll } from "../app/navigation/routerScrollPosition.ts";

const activation = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, target: "", download: false };
const origin = new URL("https://samestudio.kr/");

test("latest history scroll coordinates preserve router metadata without adding an entry", () => {
  const original = { previousNextUrl: "/privacy/", custom: "retained", __vinext_scrollY: 2200 };
  const writes = [];
  const history = { state: original, replaceState: (...args) => writes.push(args) };
  persistRouterScroll(history, 0, 0);
  assert.deepEqual(writes, [[{ ...original, __vinext_scrollX: 0, __vinext_scrollY: 0 }, ""]]);
  assert.equal(original.__vinext_scrollY, 2200, "do not mutate popstate's captured object");
  persistRouterScroll({ ...history, state: writes[0][0] }, 0, 0);
  assert.equal(writes.length, 1, "unchanged coordinates need no history serialization");
});

test("restricted or nonstandard history cannot block navigation scroll handling", () => {
  persistRouterScroll({ state: null, replaceState: () => { throw new Error("restricted"); } }, 0, 0);
  const writes = [];
  const history = { state: "foreign state", replaceState: (...args) => writes.push(args) };
  persistRouterScroll(history, 0, 0);
  persistRouterScroll({ ...history, state: {} }, 0, NaN);
  assert.equal(writes.length, 0);
});

test("full-motion QA is development-only and production always respects the motion preference", () => {
  assert.equal(warpPreviewEnabled("?warp=full", true, false), true);
  assert.equal(warpPreviewEnabled("", true, true), true);
  assert.equal(warpPreviewEnabled("?warp=reduced", true, true), false);
  assert.equal(warpPreviewEnabled("?warp=full", false, true), false);
});

test("only plain internal route changes receive a warp; anchors remain same-document navigation", () => {
  const kind = (href, event = {}) => navigationKind(origin, new URL(href, origin), { ...activation, ...event });
  assert.equal(kind("/support/"), "route");
  assert.equal(kind("/#apps"), "anchor");
  assert.equal(kind("/"), "anchor");
  assert.equal(kind("/?lang=en"), "route");
  for (const href of ["mailto:contact@samestudio.kr", "https://apps.apple.com/app/123", "https://example.com/"]) assert.equal(kind(href), "native");
  for (const event of [{ button: 1 }, { ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { target: "_blank" }, { target: "_parent" }, { download: true }]) assert.equal(kind("/support/", event), "native");
  assert.equal(kind("/support/", { target: "_self" }), "route");
  assert.equal(navigationKind(new URL("https://samestudio.kr/support"), new URL("https://samestudio.kr/support/#faq"), activation), "anchor");
});

test("route profiles shorten legal, subpage, mobile and reduced-motion transitions", () => {
  assert.equal(getWarpTiming("/", "/support/", false, false).duration, 740);
  assert.equal(getWarpTiming("/support/", "/", false, false).duration, 740);
  for (const route of ["/privacy/", "/terms/", "/delete-account/"]) assert.equal(getWarpTiming("/", route, false, false).duration, 560);
  assert.equal(getWarpTiming("/support/", "/privacy/", false, false).duration, 460);
  assert.equal(getWarpTiming("/", "/support/", false, true).duration, 622);
  assert.equal(getWarpTiming("/", "/support/", true, false).duration, 120);
  assert.deepEqual(getWarpTiming("/support/", "/", false, false, true), { duration: 0, departure: 0, arrival: 0, reduced: true });
});

function fixture() {
  let now = 0;
  let serial = 0;
  let ready = true;
  const timers = new Map();
  const phases = [];
  const destinations = [];
  const finishes = [];
  const options = {
    now: () => now,
    setTimer: (callback, delay) => { const id = ++serial; timers.set(id, { callback, at: now + delay }); return id; },
    clearTimer: (id) => timers.delete(id),
    isReady: () => ready,
    onPhase: (state) => phases.push({ ...state, at: now }),
    onReady: (href) => destinations.push({ href, at: now }),
    onFinish: (reason) => finishes.push({ reason, at: now }),
  };
  const lifecycle = createWarpLifecycle(options);
  const advance = (milliseconds) => {
    const target = now + milliseconds;
    for (let guard = 0; guard < 10000; guard++) {
      const next = [...timers.entries()].sort((a, b) => a[1].at - b[1].at)[0];
      if (!next || next[1].at > target) { now = target; return; }
      now = next[1].at;
      timers.delete(next[0]);
      next[1].callback();
    }
    throw new Error("unbounded navigation timer loop");
  };
  return { lifecycle, options, timers, phases, destinations, finishes, advance, setReady: (value) => { ready = value; } };
}

const normal = getWarpTiming("/", "/support/", false, false);

test("scroll bursts serialize one settled position and flush or cancel without leaking timers", () => {
  const f = fixture();
  let saves = 0;
  const recorder = createScrollRecorder({ ...f.options, save: () => { saves++; } });
  for (let i = 0; i < 100; i++) recorder.schedule();
  assert.equal(f.timers.size, 1);
  f.advance(149);
  assert.equal(saves, 0);
  f.advance(1);
  assert.equal(saves, 1);
  recorder.schedule();
  recorder.flush();
  f.advance(500);
  assert.equal(saves, 2);
  recorder.schedule();
  recorder.cancel();
  recorder.cancel();
  assert.equal(f.timers.size, 0);
});

test("navigation starts synchronously while arrival and cleanup follow one visual clock", () => {
  const f = fixture();
  let navigated = false;
  f.lifecycle.start("/support/", normal, () => { navigated = true; });
  assert.equal(navigated, true, "no fixed departure delay before router.push");
  f.advance(0);
  assert.deepEqual(f.destinations, [{ href: "/support/", at: 0 }], "ready content receives scroll/focus immediately");
  f.advance(160);
  assert.equal(f.phases.at(-1).phase, "arriving");
  f.advance(580);
  assert.equal(f.lifecycle.active, false);
  assert.deepEqual(f.finishes, [{ reason: "complete", at: 740 }]);
  assert.equal(f.timers.size, 0);
});

test("slow destinations keep the old route available and receive a complete arrival", () => {
  const f = fixture();
  f.setReady(false);
  f.lifecycle.start("/support/", normal, () => {});
  f.advance(2400);
  assert.equal(f.lifecycle.active, true);
  assert.equal(f.phases.at(-1).phase, "travelling");
  assert.equal(f.destinations.length, 0);
  f.setReady(true);
  f.advance(30);
  assert.equal(f.phases.at(-1).phase, "arriving");
  f.advance(220);
  assert.equal(f.finishes.at(-1).reason, "complete");
  assert.equal(f.timers.size, 0);
});

test("an unready route releases every visual timer at the safety deadline", () => {
  const f = fixture();
  f.setReady(false);
  f.lifecycle.start("/missing/", normal, () => {});
  f.advance(2500);
  assert.deepEqual(f.finishes, [{ reason: "timeout", at: 2500 }]);
  assert.equal(f.lifecycle.active, false);
  assert.equal(f.timers.size, 0);
  assert.equal(f.destinations.length, 0);
});

test("latest navigation wins and obsolete callbacks never focus a previous destination", () => {
  const f = fixture();
  f.setReady(false);
  f.lifecycle.start("/support/", normal, () => {});
  f.advance(90);
  const obsolete = [...f.timers.values()].map(({ callback }) => callback);
  f.setReady(true);
  f.lifecycle.start("/privacy/", getWarpTiming("/", "/privacy/", false, false), () => {});
  for (const callback of obsolete) callback();
  assert.equal(f.lifecycle.active, true, "already queued obsolete callbacks cannot end the newer run");
  f.advance(3000);
  assert.deepEqual(f.destinations.map(({ href }) => href), ["/privacy/"]);
  assert.deepEqual(f.finishes.map(({ reason }) => reason), ["cancelled", "complete"]);
  assert.equal(f.timers.size, 0);
});

test("history, hidden tabs and unmount may cancel repeatedly without stale callbacks", () => {
  const f = fixture();
  f.setReady(false);
  f.lifecycle.start("/support/", normal, () => {});
  f.advance(40);
  f.lifecycle.cancel();
  f.lifecycle.cancel();
  f.advance(3000);
  assert.equal(f.finishes.length, 1);
  assert.equal(f.destinations.length, 0);
  assert.equal(f.timers.size, 0);
});

test("router, readiness and settlement exceptions release the transition", () => {
  for (const failure of ["router", "isReady", "onReady"]) {
    const f = fixture();
    if (failure !== "router") f.options[failure] = () => { throw new Error("test failure"); };
    f.lifecycle.start("/support/", normal, () => { if (failure === "router") throw new Error("test failure"); });
    f.advance(3000);
    assert.equal(f.finishes.at(-1).reason, "error", failure);
    assert.equal(f.lifecycle.active, false, failure);
    assert.equal(f.timers.size, 0, failure);
  }
});

test("intro handoff adds no animation wait and reduced motion uses only its short clock", () => {
  for (const handoff of [true, false]) {
    const f = fixture();
    const timing = getWarpTiming("/support/", "/", true, false, handoff);
    f.lifecycle.start("/", timing, () => {});
    f.advance(handoff ? 0 : 120);
    assert.equal(f.lifecycle.active, false);
    assert.equal(f.finishes.at(-1).reason, "complete");
    assert.equal(f.timers.size, 0);
  }
});
