import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import { apps } from "../app/lib/apps.ts";
import { getAvailableDetailDevices } from "../app/lib/appDetailCapabilities.ts";
import {
  getAppScreenshots,
  SCREENSHOT_MANIFEST,
} from "../app/lib/appScreenshots.ts";

test("uses the current official app names and icon files", async () => {
  const expected = {
    evrune: ["EVRUNE", "/assets/icons/evrune_icon.png"],
    pini: ["PINI", "/assets/icons/pini_icon.png"],
    pepesnap: ["PEPESNAP", "/assets/icons/pepsnap.png"],
    waesseum: ["WAESSEUM", "/assets/icons/waesseum_icon.png"],
  };

  for (const [id, [name, icon]] of Object.entries(expected)) {
    const app = apps.find((candidate) => candidate.id === id);
    assert.ok(app, id);
    assert.equal(app.name, name);
    assert.equal(app.icon, icon);
    await access(new URL(`../public${icon}`, import.meta.url));
  }
});

test("adds WAESSEUM last without changing the existing app order", () => {
  assert.deepEqual(
    apps.map((app) => app.id),
    [
      "mapary",
      "runtronome",
      "evrune",
      "pini",
      "pepesnap",
      "tocklist",
      "skkoo",
      "terubozu",
      "feeloo",
      "waesseum",
    ],
  );
  assert.equal(apps.length, 10);
  assert.equal(
    apps.at(-1)?.googlePlayUrl,
    "https://play.google.com/store/apps/details?id=com.samestudio.waesseum",
  );
});

test("connects WAESSEUM detail devices and localized screenshots", () => {
  assert.deepEqual(getAvailableDetailDevices("waesseum"), [
    "iphone",
    "ipad",
    "androidPhone",
  ]);
  const screenshots = getAppScreenshots({
    appId: "waesseum",
    device: "iphone",
    locale: "ko",
  });
  assert.equal(screenshots.length, 6);
  assert.ok(screenshots.every((path) => path.includes("/waesseum/")));
});

test("uses app platform data as the platform-logo source of truth", () => {
  for (const app of apps) {
    assert.deepEqual(
      app.platforms,
      app.id === "tocklist" || app.id === "skkoo"
        ? ["apple"]
        : ["apple", "android"],
      app.id,
    );
  }
});

test("keeps every app icon and screenshot manifest path loadable", async () => {
  const assetPaths = apps.map((app) => app.icon);

  for (const manifest of Object.values(SCREENSHOT_MANIFEST)) {
    for (const device of [manifest.phone, manifest.ipad]) {
      for (const screenshots of Object.values(device ?? {})) {
        assetPaths.push(...screenshots);
      }
    }
    assetPaths.push(...(manifest.watch ?? []));
  }

  await Promise.all(
    assetPaths.map((assetPath) =>
      access(new URL(`../public${assetPath}`, import.meta.url)),
    ),
  );
});
