export type AppItem = {
  id: string;
  name: string;
  eyebrow: string;
  tagline: string;
  platforms: string;
  icon: string;
  accent: string;
  accentRgb: string;
  screenshotId?: string;
  appStoreUrl?: string;
  googlePlayUrl?: string;
  screen: "odow" | "teru" | "feeloo" | "runtronome" | "skkoo" | "locaunt" | "pepesnap" | "mapary" | "tocklist";
};

export const apps: AppItem[] = [
  {
    id: "mapary",
    name: "Mapary",
    eyebrow: "MEMORY MAP",
    tagline: "Map the moments that stay.",
    platforms: "iOS · Android",
    icon: "/assets/icons/Mapary_icon.png",
    accent: "#70b7e7",
    accentRgb: "112, 183, 231",
    screenshotId: "mapary",
    appStoreUrl:
      "https://apps.apple.com/kr/app/mapary-%EC%A7%80%EB%8F%84-%EA%B8%B0%EB%B0%98-%EB%A9%94%EB%AA%A8%EC%95%B1/id6760998507",
    googlePlayUrl: "https://play.google.com/store/apps/details?id=com.samechan.Locary",
    screen: "mapary",
  },
  {
    id: "runtronome",
    name: "Runtronome",
    eyebrow: "RUNNING RHYTHM",
    tagline: "Find your rhythm.",
    platforms: "iOS · watchOS · Android · Wear OS",
    icon: "/assets/icons/Runtronome_icon.png",
    accent: "#ff5559",
    accentRgb: "255, 85, 89",
    screenshotId: "runtronome",
    appStoreUrl: "https://apps.apple.com/kr/app/runtronome/id6762429079",
    googlePlayUrl: "https://play.google.com/store/apps/details?id=com.samestudio.Runtronome",
    screen: "runtronome",
  },
  {
    id: "odow",
    name: "ODOW",
    eyebrow: "ONE DAY · ONE WORD",
    tagline: "One day, one quiet answer.",
    platforms: "iOS",
    icon: "/assets/icons/ODOW_icon.png",
    accent: "#8c89a5",
    accentRgb: "140, 137, 165",
    screenshotId: "odow",
    appStoreUrl: "https://apps.apple.com/kr/app/odow/id6766725193",
    screen: "odow",
  },
  {
    id: "locaunt",
    name: "Lacaunt",
    eyebrow: "MEMORY MAPPED",
    tagline: "Remember where it matters.",
    platforms: "iOS",
    icon: "/assets/icons/Locaunt_icon.png",
    accent: "#ff9d74",
    accentRgb: "255, 157, 116",
    screenshotId: "lacaunt",
    appStoreUrl:
      "https://apps.apple.com/kr/app/locaunt-%EC%A7%80%EB%8F%84-%EC%9C%84%EC%97%90-%EB%82%A8%EA%B8%B0%EB%8A%94-%EB%82%98%EB%A7%8C%EC%9D%98-%EC%95%8C%EB%A6%BC/id6769651582",
    screen: "locaunt",
  },
  {
    id: "pepesnap",
    name: "PepeSnap",
    eyebrow: "FIND · SNAP",
    tagline: "Find shapes around you.",
    platforms: "iOS",
    icon: "/assets/icons/pepesnap_icon.png",
    accent: "#9b73e9",
    accentRgb: "155, 115, 233",
    screenshotId: "pepesnap",
    appStoreUrl:
      "https://apps.apple.com/kr/app/pepesnap-%EC%98%A4%EB%8A%98%EC%9D%98-%EB%8F%84%ED%98%95-%EB%AF%B8%EC%85%98/id6781632351",
    screen: "pepesnap",
  },
  {
    id: "tocklist",
    name: "Tocklist",
    eyebrow: "PLAN · REVIEW",
    tagline: "Plan a day in your rhythm.",
    platforms: "iOS",
    icon: "/assets/icons/tocklist_icon.png",
    accent: "#a98cff",
    accentRgb: "169, 140, 255",
    screenshotId: "tocklist",
    appStoreUrl: "https://apps.apple.com/kr/app/tocklist/id6782831874",
    screen: "tocklist",
  },
  {
    id: "skkoo",
    name: "SKKOO",
    eyebrow: "TODAY'S DIARY",
    tagline: "Make every day yours.",
    platforms: "iOS",
    icon: "/assets/icons/skkoo_icon.png",
    accent: "#ff83bc",
    accentRgb: "255, 131, 188",
    screenshotId: "skkoo",
    appStoreUrl: "https://apps.apple.com/kr/app/skkoo/id6791977588",
    screen: "skkoo",
  },
  {
    id: "terubozu",
    name: "Teru Bozu",
    eyebrow: "TODAY · SUNNY",
    tagline: "Make a wish with the weather.",
    platforms: "iOS",
    icon: "/assets/icons/terubozu_icon.png",
    accent: "#8fcaf3",
    accentRgb: "143, 202, 243",
    screenshotId: "terubozu",
    appStoreUrl: "https://apps.apple.com/kr/app/terubozu/id6789223358",
    screen: "teru",
  },
  {
    id: "feeloo",
    name: "Feeloo",
    eyebrow: "TODAY I FEEL",
    tagline: "Record the feeling.",
    platforms: "Coming soon",
    icon: "/assets/icons/feeloo_icon.png",
    accent: "#b590f4",
    accentRgb: "181, 144, 244",
    screen: "feeloo",
  },
];

export const DEFAULT_APP_INDEX = 0;
