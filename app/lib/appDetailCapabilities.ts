export type DetailStore = "apple" | "google";
export type DetailScreen = "phone" | "pad";

export type AppDetailCapability = {
  screens: Record<DetailScreen, boolean>;
  stores: Record<DetailStore, boolean>;
};

const screens = (phone: boolean, pad: boolean): Record<DetailScreen, boolean> =>
  ({ phone, pad });

const stores = (
  apple: boolean,
  google: boolean,
): Record<DetailStore, boolean> => ({ apple, google });

const phoneOnly = (): Record<DetailScreen, boolean> => screens(true, false);

export const APP_DETAIL_CAPABILITIES: Record<string, AppDetailCapability> = {
  mapary: {
    screens: screens(true, true),
    stores: stores(true, true),
  },
  runtronome: {
    screens: phoneOnly(),
    stores: stores(true, true),
  },
  evrune: {
    screens: screens(true, true),
    stores: stores(true, true),
  },
  pini: {
    screens: phoneOnly(),
    stores: stores(true, false),
  },
  pepesnap: {
    screens: screens(true, true),
    stores: stores(true, true),
  },
  tocklist: {
    screens: screens(true, true),
    stores: stores(true, true),
  },
  skkoo: {
    screens: screens(true, true),
    stores: stores(true, true),
  },
  terubozu: {
    screens: phoneOnly(),
    stores: stores(true, true),
  },
  feeloo: {
    screens: phoneOnly(),
    stores: stores(false, false),
  },
  waesseum: {
    screens: screens(true, true),
    stores: stores(true, true),
  },
};

export const DETAIL_SCREEN_ORDER = ["phone", "pad"] as const;

export function isDetailStoreAvailable(
  appId: string,
  store: DetailStore,
): boolean {
  const capability = APP_DETAIL_CAPABILITIES[appId];
  return capability?.stores[store] ?? false;
}

export function getAvailableDetailScreens(
  appId: string,
): DetailScreen[] {
  const capability = APP_DETAIL_CAPABILITIES[appId];
  if (!capability) return [];

  return DETAIL_SCREEN_ORDER.filter((screen) => capability.screens[screen]);
}
