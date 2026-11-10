import type { AppItem, AppPlatform } from "./apps";

export type DetailStore = "apple" | "google";

const DETAIL_STORES: Record<string, Record<DetailStore, boolean>> = {
  mapary: { apple: true, google: true },
  runtronome: { apple: true, google: true },
  evrune: { apple: true, google: true },
  tocklist: { apple: true, google: true },
  skkoo: { apple: true, google: true },
  terubozu: { apple: true, google: true },
  waesseum: { apple: true, google: true },
};

// Platform support comes from the catalog; a store link is optional.
export function getAppDetailPlatforms(app: AppItem) {
  const order: readonly [AppPlatform, DetailStore][] = [
    ["apple", "apple"],
    ["android", "google"],
  ];
  return order
    .filter(([platform]) => app.platforms.includes(platform))
    .map(([platform, store]) => ({
      platform,
      store,
      url: DETAIL_STORES[app.id]?.[store]
        ? store === "apple" ? app.appStoreUrl : app.googlePlayUrl
        : undefined,
    }));
}
