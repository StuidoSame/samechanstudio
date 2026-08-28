import assert from "node:assert/strict";
import test from "node:test";
import {
  APP_CAROUSEL_TIMING,
  getAppNameCharacters,
  getAppNameSequenceDurationMs,
  getAppNameSequenceSnapshot,
} from "../app/components/app-carousel/appCarouselTiming.ts";

test("types Teru Bozu from an empty title and preserves its space", () => {
  const characters = getAppNameCharacters("Teru Bozu");
  assert.deepEqual(characters, ["T", "e", "r", "u", " ", "B", "o", "z", "u"]);

  assert.deepEqual(getAppNameSequenceSnapshot("Teru Bozu", 0), {
    phase: "typing",
    visibleCharacterCount: 0,
  });
  assert.equal(
    getAppNameSequenceSnapshot(
      "Teru Bozu",
      APP_CAROUSEL_TIMING.typeCharacterIntervalMs * 5,
    ).visibleCharacterCount,
    5,
  );
});

test("starts emphasis only after the complete app name is visible", () => {
  const appName = "Teru Bozu";
  const typingEnd =
    getAppNameCharacters(appName).length *
    APP_CAROUSEL_TIMING.typeCharacterIntervalMs;

  assert.deepEqual(getAppNameSequenceSnapshot(appName, typingEnd), {
    phase: "name-emphasis",
    visibleCharacterCount: getAppNameCharacters(appName).length,
  });
  assert.equal(
    getAppNameSequenceSnapshot(
      appName,
      typingEnd + APP_CAROUSEL_TIMING.nameEmphasisMs,
    ).phase,
    "platform-reveal",
  );
});

test("uses the shared timeline for short and long app names", () => {
  for (const appName of ["EVRUNE", "Teru Bozu", "A Longer App Name"]) {
    const duration = getAppNameSequenceDurationMs(appName);
    assert.equal(getAppNameSequenceSnapshot(appName, duration - 1).phase, "hold");
    assert.equal(getAppNameSequenceSnapshot(appName, duration).phase, "complete");
  }
});
