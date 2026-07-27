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
  keywords: string[];
  description: string;
};

export type AppDetailContentMap = Partial<
  Record<string, Partial<Record<DetailDevice, AppDetailDeviceContent>>>
>;

const detail = (
  keywords: string[],
  description: string,
): AppDetailDeviceContent => ({ screenshots: [], keywords, description });

export const APP_DETAIL_CONTENT: AppDetailContentMap = {
  mapary: {
    iphone: detail(
      ["지도 기록", "장소 메모", "빠른 탐색"],
      "기억하고 싶은 장소와 메모를 지도 위에 바로 남기고, 이동 중에도 가까운 기록을 빠르게 다시 찾아볼 수 있습니다.",
    ),
    ipad: detail(
      ["넓은 지도", "기록 정리", "상세 탐색"],
      "넓은 화면에서 지도와 장소 기록의 흐름을 한눈에 살피고, 쌓인 메모를 여유 있게 열어보며 정리할 수 있습니다.",
    ),
    appleWatch: detail(
      ["손목 확인", "주변 기록", "빠른 접근"],
      "휴대폰을 꺼내지 않고도 손목에서 가까운 장소 기록을 간결하게 확인해 이동 중의 흐름을 이어갈 수 있습니다.",
    ),
    androidPhone: detail(
      ["지도 기록", "장소 메모", "Android 최적화"],
      "Android 스마트폰에서도 장소와 메모를 지도 중심으로 기록하고, 필요한 순간에 익숙한 모바일 흐름으로 확인할 수 있습니다.",
    ),
  },
  runtronome: {
    iphone: detail(
      ["러닝 리듬", "템포 설정", "집중 운동"],
      "달리기 전에 원하는 리듬을 맞추고, 운동 중에는 간결한 화면으로 템포에 집중하며 일정한 페이스를 이어갈 수 있습니다.",
    ),
    appleWatch: detail(
      ["손목 템포", "즉시 시작", "러닝 집중"],
      "달리는 동안 휴대폰 조작을 줄이고 Apple Watch에서 리듬을 바로 시작하고 확인해 운동 흐름을 유지할 수 있습니다.",
    ),
    androidPhone: detail(
      ["러닝 리듬", "템포 설정", "Android 실행"],
      "Android 스마트폰에서 달리기 리듬을 빠르게 설정하고, 운동 중 필요한 정보만 확인하며 페이스에 집중할 수 있습니다.",
    ),
    wearOsWatch: detail(
      ["손목 템포", "빠른 실행", "러닝 집중"],
      "Wear OS 시계에서 달리기 리듬을 손쉽게 시작하고 확인해 스마트폰을 꺼내지 않고 운동을 이어갈 수 있습니다.",
    ),
  },
  odow: {
    iphone: detail(
      ["하루 한 단어", "조용한 기록", "간결한 답변"],
      "하루에 하나의 단어와 질문을 마주하고, 부담 없는 짧은 답변으로 그날의 생각을 차분하게 남길 수 있습니다.",
    ),
    ipad: detail(
      ["넓은 기록", "차분한 집중", "지난 답변"],
      "넓은 화면에서 오늘의 질문에 집중하고, 여유 있는 문장 폭으로 답변을 적으며 이전 기록을 돌아볼 수 있습니다.",
    ),
    androidPhone: detail(
      ["하루 한 단어", "짧은 답변", "Android 기록"],
      "Android 스마트폰에서도 매일 하나의 질문을 확인하고, 그날의 생각을 짧고 조용하게 기록할 수 있습니다.",
    ),
  },
  locaunt: {
    iphone: detail(
      ["장소 기억", "지도 기록", "나만의 알림"],
      "잊고 싶지 않은 장소와 필요한 내용을 지도 위에 남겨두고, 장소를 중심으로 개인적인 기록을 다시 확인할 수 있습니다.",
    ),
  },
  pepesnap: {
    iphone: detail(
      ["도형 찾기", "오늘의 미션", "사진 기록"],
      "주변에서 오늘의 도형을 발견하고 사진으로 남기며, 일상 속 익숙한 장면을 새로운 시선으로 바라볼 수 있습니다.",
    ),
    ipad: detail(
      ["큰 사진", "미션 모아보기", "도형 관찰"],
      "더 큰 화면으로 촬영한 도형과 미션 기록을 살펴보고, 일상에서 발견한 형태를 여유 있게 비교해 볼 수 있습니다.",
    ),
  },
  tocklist: {
    iphone: detail(
      ["오늘 계획", "리듬 관리", "하루 회고"],
      "하루의 할 일을 내 리듬에 맞춰 계획하고, 진행 상황을 간단히 확인한 뒤 하루를 차분하게 돌아볼 수 있습니다.",
    ),
    ipad: detail(
      ["넓은 계획", "일정 정리", "기록 회고"],
      "넓은 화면에서 하루 계획과 진행 흐름을 함께 살피고, 할 일과 회고를 보다 여유롭게 정리할 수 있습니다.",
    ),
  },
  skkoo: {
    iphone: detail(
      ["오늘의 일기", "간편 기록", "일상 보관"],
      "그날의 이야기를 부담 없이 적고, 매일의 작은 순간을 나만의 기록으로 차곡차곡 남길 수 있습니다.",
    ),
    ipad: detail(
      ["넓은 일기", "기록 정리", "하루 돌아보기"],
      "넓은 화면에서 하루의 이야기를 편안하게 풀어 쓰고, 지나온 일기와 일상의 흐름을 여유 있게 돌아볼 수 있습니다.",
    ),
  },
  terubozu: {
    iphone: detail(
      ["오늘의 날씨", "작은 소원", "간편 확인"],
      "오늘의 날씨를 가볍게 확인하고 테루테루보즈와 함께 작은 소원을 남기며 하루를 기분 좋게 시작할 수 있습니다.",
    ),
  },
  feeloo: {
    iphone: detail(
      ["감정 기록", "오늘의 기분", "차분한 회고"],
      "오늘 느낀 감정을 짧게 기록하고, 쌓인 기분의 흐름을 돌아보며 하루를 차분하게 정리할 수 있습니다.",
    ),
  },
};

const FALLBACK_DEVICE_CONTENT = detail(
  ["핵심 경험", "간결한 흐름", "기기 최적화"],
  "선택한 기기에서 앱의 핵심 기능을 간결한 흐름으로 확인하고 사용할 수 있습니다.",
);

export function getAppDetailContent(
  appId: string,
  device: DetailDevice,
): AppDetailDeviceContent {
  const content = APP_DETAIL_CONTENT[appId]?.[device];
  if (!content && process.env.NODE_ENV !== "production") {
    console.warn(`Missing app detail content: ${appId}/${device}`);
  }
  return content ?? FALLBACK_DEVICE_CONTENT;
}
