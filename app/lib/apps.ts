export type AppPlatform = "apple" | "android";

export type AppItem = {
  id: string;
  name: string;
  eyebrow: string;
  tagline: string;
  platforms: readonly AppPlatform[];
  icon: string;
  accent: string;
  accentRgb: string;
  screenshotId?: string;
  appStoreUrl?: string;
  googlePlayUrl?: string;
  screen: "evrune" | "teru" | "runtronome" | "skkoo" | "mapary" | "tocklist" | "waesseum";
};

export const apps: AppItem[] = [
  {
    id: "mapary",
    name: "Mapary",
    eyebrow: "MEMORY MAP",
    tagline: "Map the moments that stay.",
    platforms: ["apple", "android"],
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
    name: "Pulto",
    eyebrow: "RUNNING RHYTHM",
    tagline: "Find your rhythm.",
    platforms: ["apple", "android"],
    // Refresh cached failures from before this replacement icon was available.
    icon: "/assets/icons/pulto_icon.png?v=aa92ad34",
    accent: "#ff5559",
    accentRgb: "255, 85, 89",
    screenshotId: "runtronome",
    appStoreUrl: "https://apps.apple.com/kr/app/runtronome/id6762429079",
    googlePlayUrl: "https://play.google.com/store/apps/details?id=com.samestudio.Runtronome",
    screen: "runtronome",
  },
  {
    id: "evrune",
    name: "EVRUNE",
    eyebrow: "ONE DAY · ONE WORD",
    tagline: "One day, one quiet answer.",
    platforms: ["apple", "android"],
    icon: "/assets/icons/evrune_icon.png",
    accent: "#8c89a5",
    accentRgb: "140, 137, 165",
    screenshotId: "evrune",
    appStoreUrl: "https://apps.apple.com/kr/app/odow/id6766725193",
    screen: "evrune",
  },
  {
    id: "tocklist",
    name: "TOCOBI",
    eyebrow: "PLAN · REVIEW",
    tagline: "Plan a day in your rhythm.",
    platforms: ["apple", "android"],
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
    platforms: ["apple", "android"],
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
    platforms: ["apple", "android"],
    icon: "/assets/icons/terubozu_icon.png",
    accent: "#8fcaf3",
    accentRgb: "143, 202, 243",
    screenshotId: "terubozu",
    appStoreUrl: "https://apps.apple.com/kr/app/terubozu/id6789223358",
    screen: "teru",
  },
  {
    id: "waesseum",
    name: "WAESSEUM",
    eyebrow: "DAILY ATTENDANCE",
    tagline: "Keep showing up, one day at a time.",
    platforms: ["apple", "android"],
    icon: "/assets/icons/waesseum_icon.png",
    accent: "#b3df28",
    accentRgb: "179, 223, 40",
    screenshotId: "waesseum",
    googlePlayUrl:
      "https://play.google.com/store/apps/details?id=com.samestudio.waesseum",
    screen: "waesseum",
  },
];

export const DEFAULT_APP_INDEX = 0;
