export type DetailStore = "apple" | "google";

export const HERO_ANDROID_APP_IDS = new Set([
  "mapary",
  "runtronome",
  "odow",
  "pepesnap",
  "tocklist",
  "skkoo",
  "terubozu",
]);

export function getAvailableDetailStores(appId: string): DetailStore[] {
  return HERO_ANDROID_APP_IDS.has(appId) ? ["apple", "google"] : ["apple"];
}
