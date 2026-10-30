import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import test from "node:test";
import { apps } from "../app/lib/apps.ts";
import {
  APP_DETAIL_CAPABILITIES,
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
import { APP_TRANSLATION_IDS } from "../app/i18n/types.ts";
import { SEO_CONTENT } from "../app/lib/seo.ts";
import { ko } from "../app/i18n/locales/ko.ts";
import { en } from "../app/i18n/locales/en.ts";
import { ja } from "../app/i18n/locales/ja.ts";
import { zhCN } from "../app/i18n/locales/zh-CN.ts";
import { zhTW } from "../app/i18n/locales/zh-TW.ts";

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
    tocklist: ["TOCOBI", "/assets/icons/tocklist_icon.png"],
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

test("keeps the seven remaining apps in their original relative order", () => {
  assert.deepEqual(
    apps.map((app) => app.id),
    [
      "mapary",
      "runtronome",
      "evrune",
      "tocklist",
      "skkoo",
      "terubozu",
      "waesseum",
    ],
  );
  assert.equal(apps.length, 7);
  assert.equal(
    apps.at(-1)?.googlePlayUrl,
    "https://play.google.com/store/apps/details?id=com.samestudio.waesseum",
  );
});

test("Pulto keeps its original PNG with a content version that refreshes cached failures", async () => {
  const app = apps.find(({ id }) => id === "runtronome");
  const icon = new URL(app.icon, "https://samestudio.kr");
  assert.equal(icon.pathname, "/assets/icons/pulto_icon.png");
  const bytes = await readFile(new URL(`../public${icon.pathname}`, import.meta.url));
  assert.equal(icon.searchParams.get("v"), createHash("sha256").update(bytes).digest("hex").slice(0, 8));
  assert.equal(app.name, "Pulto");
});

test("connects WAESSEUM detail screens and localized screenshots", () => {
  assert.deepEqual(getAvailableDetailScreens("waesseum"), ["phone", "pad"]);
  const localeFolders = {
    ko: "ko",
    en: "en",
    ja: "ja",
    "zh-CN": "zhg",
    "zh-TW": "zhb",
  };

  for (const [locale, folder] of Object.entries(localeFolders)) {
    const phone = getAppScreenshotSet({
      appId: "waesseum",
      screen: "phone",
      locale,
    });
    assert.equal(phone.locale, folder);
    assert.equal(phone.screenshots.length, 6);
    assert.ok(
      phone.screenshots.every((path) =>
        path.includes(`/screenshot/waesseum/phone/${folder}/`),
      ),
    );

    const pad = getAppScreenshotSet({
      appId: "waesseum",
      screen: "pad",
      locale,
    });
    assert.equal(pad.locale, folder);
    assert.equal(pad.screenshots.length, 5);
    assert.ok(
      pad.screenshots.every((path) =>
        path.includes(`/screenshot/waesseum/ipad/${folder}/`),
      ),
    );
  }
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

test("connects Teru Bozu to its canonical localized Phone assets without inventing Pad captures", () => {
  const localeFolders = {
    ko: "ko",
    en: "en",
    ja: "ja",
    "zh-CN": "zhg",
    "zh-TW": "zhb",
  };

  assert.deepEqual(getAvailableDetailScreens("terubozu"), ["phone"]);

  for (const [locale, folder] of Object.entries(localeFolders)) {
    const phone = getAppScreenshotSet({
      appId: "terubozu",
      screen: "phone",
      locale,
    });
    assert.equal(phone.locale, folder);
    assert.equal(phone.screenshots.length, 5);
    assert.ok(
      phone.screenshots.every((path) =>
        path.includes(`/screenshot/terubozu/phone/${folder}/`),
      ),
    );

    assert.deepEqual(
      getAppScreenshotSet({ appId: "terubozu", screen: "pad", locale }),
      { locale: null, screenshots: [] },
    );
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

const REMOVED_APP_IDS = ["pini", "pepesnap", "feeloo"];
test("removed apps have no catalog records, detail capability, screenshots or icons", async () => {
  const icons = { pini: "pini_icon.png", pepesnap: "pepsnap.png", feeloo: "feeloo_icon.png" };
  for (const id of REMOVED_APP_IDS) {
    assert.equal(apps.some((app) => app.id === id), false, id);
    assert.equal(Object.hasOwn(SCREENSHOT_MANIFEST, id), false, id);
    assert.equal(Object.hasOwn(APP_DETAIL_CAPABILITIES, id), false, id);
    assert.deepEqual(getAvailableDetailScreens(id), [], id);
    for (const screen of ["phone", "pad"]) {
      assert.deepEqual(getAppScreenshots({ appId: id, screen, locale: "ko" }), [], id);
    }
    await assert.rejects(access(new URL(`../public/assets/icons/${icons[id]}`, import.meta.url)));
  }
});

test("TOCOBI preserves its identity, icon, store URL and localized Phone/Pad captures", () => {
  const app = apps.find((candidate) => candidate.id === "tocklist");
  assert.equal(app.name, "TOCOBI");
  assert.equal(app.icon, "/assets/icons/tocklist_icon.png");
  assert.equal(app.screenshotId, "tocklist");
  assert.equal(app.screen, "tocklist");
  assert.equal(app.appStoreUrl, "https://apps.apple.com/kr/app/tocklist/id6782831874");
  assert.equal(app.googlePlayUrl, undefined);
  for (const locale of ["ko", "en", "ja", "zh-CN", "zh-TW"]) {
    assert.equal(getAppScreenshots({ appId: app.id, screen: "phone", locale }).length, 6);
    assert.equal(getAppScreenshots({ appId: app.id, screen: "pad", locale }).length, 5);
  }
});

test("all five locale detail and SEO catalogs match the remaining apps", () => {
  const expected = apps.map((app) => app.id).sort();
  assert.deepEqual([...APP_TRANSLATION_IDS].sort(), expected);
  for (const messages of [ko, en, ja, zhCN, zhTW]) {
    assert.deepEqual(Object.keys(messages.appDetail.apps).sort(), expected);
  }
  for (const seo of Object.values(SEO_CONTENT)) {
    assert.deepEqual(Object.keys(seo.home.appDescriptions).sort(), expected);
    assert.match(seo.home.appDescriptions.tocklist, /TOCOBI/);
    assert.doesNotMatch(JSON.stringify(seo), /PINI|PEPESNAP|Feeloo|Tocklist/);
  }
});
