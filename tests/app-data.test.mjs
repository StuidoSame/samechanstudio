import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import { apps } from "../app/lib/apps.ts";
import { getAvailableDetailDevices } from "../app/lib/appDetailCapabilities.ts";
import { getAppScreenshots } from "../app/lib/appScreenshots.ts";

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
