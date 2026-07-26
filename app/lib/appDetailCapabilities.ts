export type DetailStore = "apple" | "google";
export type AppleDetailDevice = "iphone" | "ipad" | "appleWatch";
export type GoogleDetailDevice =
  | "androidPhone"
  | "androidTablet"
  | "wearOsWatch";
export type DetailDevice = AppleDetailDevice | GoogleDetailDevice;

type StoreDeviceCapabilities = {
  apple: Record<AppleDetailDevice, boolean>;
  google: Record<GoogleDetailDevice, boolean>;
};

export type AppDetailCapability = {
  devices: StoreDeviceCapabilities;
};

const applePhoneOnly = (): StoreDeviceCapabilities["apple"] => ({
  iphone: true,
  ipad: false,
  appleWatch: false,
});

const googlePhoneOnly = (): StoreDeviceCapabilities["google"] => ({
  androidPhone: true,
  androidTablet: false,
  wearOsWatch: false,
});

const noGoogleDevices = (): StoreDeviceCapabilities["google"] => ({
  androidPhone: false,
  androidTablet: false,
  wearOsWatch: false,
});

export const APP_DETAIL_CAPABILITIES: Record<string, AppDetailCapability> = {
  mapary: {
    devices: { apple: applePhoneOnly(), google: googlePhoneOnly() },
  },
  runtronome: {
    devices: {
      apple: { iphone: true, ipad: false, appleWatch: true },
      google: { androidPhone: true, androidTablet: false, wearOsWatch: true },
    },
  },
  odow: {
    devices: { apple: applePhoneOnly(), google: googlePhoneOnly() },
  },
  locaunt: {
    devices: { apple: applePhoneOnly(), google: noGoogleDevices() },
  },
  pepesnap: {
    devices: { apple: applePhoneOnly(), google: googlePhoneOnly() },
  },
  tocklist: {
    devices: { apple: applePhoneOnly(), google: googlePhoneOnly() },
  },
  skkoo: {
    devices: { apple: applePhoneOnly(), google: googlePhoneOnly() },
  },
  terubozu: {
    devices: { apple: applePhoneOnly(), google: googlePhoneOnly() },
  },
  feeloo: {
    devices: { apple: applePhoneOnly(), google: noGoogleDevices() },
  },
};

const STORE_DEVICE_ORDER: Record<DetailStore, DetailDevice[]> = {
  apple: ["iphone", "ipad", "appleWatch"],
  google: ["androidPhone", "androidTablet", "wearOsWatch"],
};

export const HERO_ANDROID_APP_IDS = new Set(
  Object.entries(APP_DETAIL_CAPABILITIES)
    .filter(([, capability]) =>
      Object.values(capability.devices.google).some(Boolean),
    )
    .map(([appId]) => appId),
);

export function getAvailableDetailStores(appId: string): DetailStore[] {
  const capability = APP_DETAIL_CAPABILITIES[appId];
  if (!capability) return [];

  return (["apple", "google"] as const).filter((store) =>
    Object.values(capability.devices[store]).some(Boolean),
  );
}

export function getAvailableDetailDevices(
  appId: string,
  store: DetailStore,
): DetailDevice[] {
  const capability = APP_DETAIL_CAPABILITIES[appId];
  if (!capability) return [];

  const deviceFlags = capability.devices[store] as Record<string, boolean>;
  return STORE_DEVICE_ORDER[store].filter((device) => deviceFlags[device]);
}

export type AppDetailDeviceContent = {
  screenshots: string[];
  description: string;
};

export type AppDetailContentMap = Partial<
  Record<
    string,
    Partial<
      Record<
        DetailStore,
        Partial<Record<DetailDevice, AppDetailDeviceContent>>
      >
    >
  >
>;

export const APP_DETAIL_CONTENT: AppDetailContentMap = {};

export function getAppDetailContent(
  appId: string,
  store: DetailStore,
  device: DetailDevice,
): AppDetailDeviceContent {
  return (
    APP_DETAIL_CONTENT[appId]?.[store]?.[device] ?? {
      screenshots: [],
      description: "Device-specific experience description will appear here.",
    }
  );
}
