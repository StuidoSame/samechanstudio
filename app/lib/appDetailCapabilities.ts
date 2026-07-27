export type DetailStore = "apple" | "google";
export type DetailDevice = "iphone" | "ipad" | "appleWatch" | "androidPhone";

export type AppDetailCapability = {
  devices: Record<DetailDevice, boolean>;
  stores: Record<DetailStore, boolean>;
};

const devices = (
  iphone: boolean,
  ipad: boolean,
  appleWatch: boolean,
  androidPhone: boolean,
): Record<DetailDevice, boolean> => ({
  iphone,
  ipad,
  appleWatch,
  androidPhone,
});

const stores = (
  apple: boolean,
  google: boolean,
): Record<DetailStore, boolean> => ({ apple, google });

const iphoneOnly = (): Record<DetailDevice, boolean> =>
  devices(true, false, false, false);

export const APP_DETAIL_CAPABILITIES: Record<string, AppDetailCapability> = {
  mapary: {
    devices: devices(true, true, true, true),
    stores: stores(true, true),
  },
  runtronome: {
    devices: devices(true, false, true, true),
    stores: stores(true, true),
  },
  odow: {
    devices: devices(true, true, false, true),
    stores: stores(true, true),
  },
  locaunt: {
    devices: iphoneOnly(),
    stores: stores(true, false),
  },
  pepesnap: {
    devices: devices(true, true, false, false),
    stores: stores(true, false),
  },
  tocklist: {
    devices: devices(true, true, false, false),
    stores: stores(true, false),
  },
  skkoo: {
    devices: devices(true, true, false, false),
    stores: stores(true, false),
  },
  terubozu: {
    devices: iphoneOnly(),
    stores: stores(true, false),
  },
  feeloo: {
    devices: iphoneOnly(),
    stores: stores(false, false),
  },
};

const DETAIL_DEVICE_ORDER: DetailDevice[] = [
  "iphone",
  "ipad",
  "appleWatch",
  "androidPhone",
];

export const HERO_ANDROID_APP_IDS = new Set(
  Object.entries(APP_DETAIL_CAPABILITIES)
    .filter(([, capability]) => capability.devices.androidPhone)
    .map(([appId]) => appId),
);

export function isDetailStoreAvailable(
  appId: string,
  store: DetailStore,
): boolean {
  const capability = APP_DETAIL_CAPABILITIES[appId];
  return capability?.stores[store] ?? false;
}

export function getAvailableDetailDevices(
  appId: string,
): DetailDevice[] {
  const capability = APP_DETAIL_CAPABILITIES[appId];
  if (!capability) return [];

  return DETAIL_DEVICE_ORDER.filter((device) => capability.devices[device]);
}
