import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { access, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import test from "node:test";
import { apps } from "../app/lib/apps.ts";
import { getAppDetailPlatforms } from "../app/lib/appDetailCapabilities.ts";
import {
  DETAIL_SCREEN_ORDER,
  getAppScreenshotSet,
  getAvailableDetailScreens,
  resolveScreenshotLocale,
} from "../app/lib/appScreenshots.ts";
import screenshotFiles from "../app/lib/screenshotFiles.json" with { type: "json" };
import { APP_TRANSLATION_IDS } from "../app/i18n/types.ts";
import { SEO_CONTENT } from "../app/lib/seo.ts";
import { ko } from "../app/i18n/locales/ko.ts";
import { en } from "../app/i18n/locales/en.ts";
import { ja } from "../app/i18n/locales/ja.ts";
import { zhCN } from "../app/i18n/locales/zh-CN.ts";
import { zhTW } from "../app/i18n/locales/zh-TW.ts";

test("keeps the screenshot manifest in sync with the actual numbered PNGs", () => {
  execFileSync(process.execPath, [
    fileURLToPath(new URL("../scripts/screenshot-manifest.mjs", import.meta.url)),
    "--check",
  ]);
});

test("prefers the requested screenshot locale, then English, then the first available locale", () => {
  assert.equal(resolveScreenshotLocale("ja", (locale) => ["en", "ja"].includes(locale)), "ja");
  assert.equal(resolveScreenshotLocale("ko", (locale) => ["en", "ja"].includes(locale)), "en");
  assert.equal(resolveScreenshotLocale("zh-CN", (locale) => locale === "ja"), "ja");
  assert.equal(resolveScreenshotLocale("ko", () => false), null);
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

test("cosmic showcase reuses two independent background materials without app-planet mappings", async () => {
  const css = await readFile(new URL("../app/components/app-carousel/cosmic-showcase.css", import.meta.url), "utf8");
  const paths = [...css.matchAll(/background-image: url\("([^"]+)"\)/g)].map(([, path]) => path);
  assert.deepEqual(paths, ["/assets/cosmic-planets/moon.svg", "/assets/cosmic-planets/gas.svg"]);
  assert.doesNotMatch(css, /data-planet|showcase-planets\//);
  const hashes = new Set();
  let totalBytes = 0;
  for (const path of paths) {
    const svg = await readFile(new URL(`../public${path}`, import.meta.url), "utf8");
    assert.match(svg, /^<svg[^>]+viewBox="0 0 320 320">/);
    assert.match(svg, /<feDistantLight azimuth="225" elevation="48"\/>/);
    assert.match(svg, /<\/svg>\s*$/);
    assert.doesNotMatch(svg, /<script|<animate|<foreignObject|\bhref=|url\((?!#)/i);
    hashes.add(createHash("sha256").update(svg).digest("hex"));
    totalBytes += Buffer.byteLength(svg);
  }
  assert.equal(hashes.size, 2);
  assert.ok(totalBytes < 32_000, `background material budget: ${totalBytes}`);
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

test("resolves the exact assets for every app, locale and device", () => {
  const counts = {
    evrune: { phone: 5, ipad: 5, watch: 0 },
    mapary: { phone: 6, ipad: 6, watch: 5 },
    runtronome: { phone: 6, ipad: 0, watch: 4 },
    skkoo: { phone: 6, ipad: 5, watch: 0 },
    terubozu: { phone: 6, ipad: 6, watch: 0 },
    tocklist: { phone: 5, ipad: 5, watch: 0 },
    waesseum: { phone: 6, ipad: 5, watch: 0 },
  };
  const localeFolders = { ko: "ko", en: "en", ja: "ja", "zh-CN": "zhg", "zh-TW": "zhb" };

  assert.deepEqual(DETAIL_SCREEN_ORDER, ["phone", "ipad", "watch"]);

  for (const { id, screenshotId = id } of apps) {
    assert.deepEqual(
      getAvailableDetailScreens(screenshotId, "apple"),
      DETAIL_SCREEN_ORDER.filter((screen) => counts[id][screen] > 0),
      id,
    );
    assert.deepEqual(getAvailableDetailScreens(screenshotId, "android"), [], id);

    for (const [locale, folder] of Object.entries(localeFolders)) {
      for (const screen of DETAIL_SCREEN_ORDER) {
        const label = `${id}/${folder}/${screen}`;
        const count = counts[id][screen];
        const apple = getAppScreenshotSet({ appId: screenshotId, platform: "apple", screen, locale });
        assert.equal(apple.locale, count ? locale : null, label);
        assert.deepEqual(
          apple.screenshots.map(({ src }) => src),
          Array.from({ length: count }, (_, index) => `/assets/screenshot/${label}/${index + 1}.png`),
          label,
        );
        assert.deepEqual(
          getAppScreenshotSet({ appId: screenshotId, platform: "android", screen, locale }),
          { locale: null, screenshots: [] },
          label,
        );
        if (id === "terubozu") {
          assert.ok(apple.screenshots.every(({ width, height }) => width > height), label);
        }
      }
    }
  }
});

test("uses app platform data as the platform-logo source of truth", () => {
  for (const app of apps) {
    assert.deepEqual(
      app.platforms,
      ["apple", "android"],
      app.id,
    );
  }
});

test("detail platform badges follow catalog support without inventing store links", () => {
  for (const app of apps) {
    const platforms = getAppDetailPlatforms(app);
    assert.deepEqual(platforms.map(({ platform }) => platform), app.platforms, app.id);
    assert.equal(platforms[0].url, app.appStoreUrl, app.id);
    assert.equal(platforms[1].url, app.googlePlayUrl, app.id);
  }
  for (const id of ["tocklist", "skkoo"]) {
    const app = apps.find((candidate) => candidate.id === id);
    assert.equal(app.googlePlayUrl, undefined);
    assert.equal(getAppDetailPlatforms(app)[1].url, undefined);
  }
  const sample = apps[0];
  assert.deepEqual(getAppDetailPlatforms({ ...sample, platforms: ["android", "apple", "android"] })
    .map(({ platform }) => platform), ["apple", "android"]);
  assert.deepEqual(getAppDetailPlatforms({ ...sample, platforms: ["apple"] })
    .map(({ platform }) => platform), ["apple"]);
  assert.ok(getAppDetailPlatforms({ ...sample, id: "unknown" }).every(({ url }) => url === undefined));
});

test("keeps every app icon loadable", async () => {
  await Promise.all(apps.map(({ icon }) => access(new URL(`../public${icon}`, import.meta.url))));
});

const REMOVED_APP_IDS = ["pini", "pepesnap", "feeloo"];
test("removed apps have no catalog records, screenshots or icons", async () => {
  const icons = { pini: "pini_icon.png", pepesnap: "pepsnap.png", feeloo: "feeloo_icon.png" };
  for (const id of REMOVED_APP_IDS) {
    assert.equal(apps.some((app) => app.id === id), false, id);
    assert.equal(Object.keys(screenshotFiles).some((key) => key.startsWith(`${id}/`)), false, id);
    assert.deepEqual(getAvailableDetailScreens(id), [], id);
    await assert.rejects(access(new URL(`../public/assets/icons/${icons[id]}`, import.meta.url)));
  }
});

test("TOCOBI preserves its identity, icon and store URL", () => {
  const app = apps.find((candidate) => candidate.id === "tocklist");
  assert.equal(app.name, "TOCOBI");
  assert.equal(app.icon, "/assets/icons/tocklist_icon.png");
  assert.equal(app.screenshotId, "tocklist");
  assert.equal(app.screen, "tocklist");
  assert.equal(app.appStoreUrl, "https://apps.apple.com/kr/app/tocklist/id6782831874");
  assert.equal(app.googlePlayUrl, undefined);
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
