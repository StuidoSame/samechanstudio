import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import { apps } from "../app/lib/apps.ts";
import {
  DETAIL_SCREEN_ORDER,
  getAvailableDetailScreens,
} from "../app/lib/appDetailCapabilities.ts";
import {
  createLocalizedScreenshotManifest,
  getAppScreenshotSet,
  getAppScreenshots,
  resolveLocalizedScreenshotSet,
  SCREENSHOT_MANIFEST,
} from "../app/lib/appScreenshots.ts";

test("builds explicit localized manifests in natural filename order", () => {
  const manifest = createLocalizedScreenshotManifest("sample", "phone", {
    en: ["10.png", "2.png", "1.png"],
  });

  assert.deepEqual(manifest.en, [
    "/assets/screenshot/sample/phone/en/1.png",
    "/assets/screenshot/sample/phone/en/2.png",
    "/assets/screenshot/sample/phone/en/10.png",
  ]);
  assert.equal(manifest.ko, undefined);
});

test("falls back from the requested locale to English, then the first available locale", () => {
  assert.deepEqual(
    resolveLocalizedScreenshotSet(
      { en: ["/en.png"], ja: ["/ja.png"] },
      "ko",
    ),
    { locale: "en", screenshots: ["/en.png"] },
  );
  assert.deepEqual(
    resolveLocalizedScreenshotSet({ ja: ["/ja.png"] }, "zh-CN"),
    { locale: "ja", screenshots: ["/ja.png"] },
  );
});

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

test("connects WAESSEUM detail screens and localized screenshots", () => {
  assert.deepEqual(getAvailableDetailScreens("waesseum"), ["phone", "pad"]);
  const screenshots = getAppScreenshots({
    appId: "waesseum",
    screen: "phone",
    locale: "ko",
  });
  assert.equal(screenshots.length, 6);
  assert.ok(screenshots.every((path) => path.includes("/waesseum/")));
});

test("connects EVRUNE to its actual localized Phone and Pad assets", () => {
  const localeFolders = {
    ko: "ko",
    en: "en",
    ja: "ja",
    "zh-CN": "zhg",
    "zh-TW": "zhb",
  };

  for (const [locale, folder] of Object.entries(localeFolders)) {
    const phone = getAppScreenshotSet({
      appId: "evrune",
      screen: "phone",
      locale,
    });
    assert.equal(phone.locale, folder);
    assert.equal(phone.screenshots.length, 5);
    assert.ok(
      phone.screenshots.every((path) =>
        path.includes(`/screenshot/evrune/phone/${folder}/`),
      ),
    );

    const pad = getAppScreenshotSet({
      appId: "evrune",
      screen: "pad",
      locale,
    });
    const expectedPadFolder = locale === "ko" ? "en" : folder;
    assert.equal(pad.locale, expectedPadFolder);
    assert.equal(pad.screenshots.length, 4);
    assert.ok(
      pad.screenshots.every((path) =>
        path.includes(`/screenshot/evrune/pad/${expectedPadFolder}/`),
      ),
    );
    assert.ok(pad.screenshots.every((path) => !path.includes("/ipad/")));
  }
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
    for (const screen of [manifest.phone, manifest.pad]) {
      for (const screenshots of Object.values(screen ?? {})) {
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

test("exposes detail screenshots by screen form with Phone first", () => {
  assert.deepEqual(DETAIL_SCREEN_ORDER, ["phone", "pad"]);
  assert.equal(SCREENSHOT_MANIFEST.runtronome.watch?.length, 4);

  const padApps = new Set([
    "mapary",
    "evrune",
    "pepesnap",
    "tocklist",
    "skkoo",
    "waesseum",
  ]);

  for (const app of apps) {
    assert.deepEqual(
      getAvailableDetailScreens(app.id),
      padApps.has(app.id) ? ["phone", "pad"] : ["phone"],
      app.id,
    );

    for (const screen of ["phone", "pad"]) {
      const screenshots = getAppScreenshots({
        appId: app.screenshotId ?? app.id,
        screen,
        locale: "ko",
      });
      assert.equal(screenshots.length, new Set(screenshots).size, app.id);
      assert.ok(
        screenshots.every((path) =>
          path.includes(`/${app.screenshotId ?? app.id}/`),
        ),
        `${app.id}:${screen}`,
      );
    }
  }
});
