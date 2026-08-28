import type { Metadata } from "next";
import type { Locale } from "../i18n/types";

export const SITE_NAME = "SAME STUDIO";
export const SITE_URL = "https://samestudio.kr";
export const DEFAULT_LOCALE: Locale = "ko";
export const SOCIAL_IMAGE_PATH = "/assets/icons/Mapary_icon.png";

export type SeoPage =
  | "home"
  | "support"
  | "privacy"
  | "terms"
  | "delete-account";

type PageSeo = {
  title: string;
  description: string;
};

type SeoLocaleContent = {
  pages: Record<SeoPage, PageSeo>;
  home: {
    heading: string;
    introduction: string;
    appDescriptions: Record<string, string>;
  };
};

export const SEO_CONTENT: Record<Locale, SeoLocaleContent> = {
  ko: {
    pages: {
      home: {
        title: "SAME STUDIO | iOS·Android 인디 앱 개발 스튜디오",
        description:
          "SAME STUDIO는 지도 메모, 러닝 메트로놈, 하루 질문 기록, 다꾸 등 일상에 도움이 되는 iOS·Android 앱을 제작하는 인디 앱 개발 스튜디오입니다.",
      },
      support: {
        title: "앱 고객지원 및 문의 | SAME STUDIO",
        description:
          "SAME STUDIO 앱의 이용 방법, 오류, 결제, 계정 및 개인정보 관련 문의를 확인하고 고객지원 요청을 보낼 수 있습니다.",
      },
      privacy: {
        title: "개인정보처리방침 | SAME STUDIO",
        description:
          "SAME STUDIO 앱과 서비스에서 처리하는 개인정보, 이용 목적, 권한, 외부 서비스, 보관 및 삭제 기준을 안내합니다.",
      },
      terms: {
        title: "서비스 이용약관 | SAME STUDIO",
        description:
          "SAME STUDIO 앱과 웹사이트 이용에 적용되는 서비스 이용 조건, 사용자 책임, 결제, 콘텐츠 및 안전 관련 약관을 안내합니다.",
      },
      "delete-account": {
        title: "계정 및 데이터 삭제 요청 | SAME STUDIO",
        description:
          "EVRUNE 등 SAME STUDIO 앱 계정과 연결 데이터의 삭제를 요청하고 처리 절차를 확인할 수 있는 공식 페이지입니다.",
      },
    },
    home: {
      heading: "SAME STUDIO 인디 앱 개발 스튜디오",
      introduction:
        "세임 스튜디오는 지도 메모, 기록, 러닝, 사진과 다이어리를 위한 iOS 앱과 Android 앱을 정성껏 만듭니다.",
      appDescriptions: {
        mapary:
          "Mapary는 장소별 기록을 지도에 남기고 다시 찾는 iOS·Android 지도 메모 앱입니다.",
        runtronome:
          "Pulto는 달리기 템포와 케이던스를 일정하게 맞추는 iOS·Android 러닝 메트로놈 앱입니다.",
        evrune:
          "EVRUNE는 매일 하나의 질문에 답하며 하루를 기록하는 iOS 하루 질문 기록 앱이자 일기 앱입니다.",
        locaunt:
          "Lacaunt(LOCAUNT)는 중요한 장소와 알림을 지도에 남기는 iOS 위치 기반 메모 앱입니다.",
        pepesnap:
          "PepeSnap은 오늘의 모양을 주변에서 찾아 사진으로 기록하는 iOS 사진 미션 앱입니다.",
        tocklist:
          "Tocklist는 하루의 흐름을 계획하고 돌아보는 iOS 24시간 투두 앱입니다.",
        skkoo:
          "SKKOO는 일상을 꾸미고 기록하는 iOS 다꾸 앱이자 디지털 다이어리입니다.",
        terubozu:
          "Teru Bozu는 오늘의 날씨를 확인하고 작은 소원을 남기는 iOS 날씨 소원 앱입니다.",
        feeloo:
          "Feeloo는 하루의 감정을 기록하고 돌아보는 감정 위젯 앱으로 출시를 준비하고 있습니다.",
      },
    },
  },
  en: {
    pages: {
      home: {
        title: "SAME STUDIO | Independent iOS & Android App Studio",
        description:
          "SAME STUDIO is an independent app studio creating thoughtful iOS and Android apps for maps, running, daily reflection, photos, and digital journaling.",
      },
      support: {
        title: "App Support & Contact | SAME STUDIO",
        description:
          "Get help with SAME STUDIO apps, including usage, errors, payments, accounts, and privacy, or send a support request.",
      },
      privacy: {
        title: "Privacy Policy | SAME STUDIO",
        description:
          "Learn how SAME STUDIO apps and services handle personal data, permissions, third-party services, retention, and deletion.",
      },
      terms: {
        title: "Terms of Service | SAME STUDIO",
        description:
          "Review the terms covering SAME STUDIO apps and website, including user responsibilities, payments, content, and safety.",
      },
      "delete-account": {
        title: "Account & Data Deletion Request | SAME STUDIO",
        description:
          "Use this official page to request deletion of an EVRUNE or other supported SAME STUDIO app account and linked data.",
      },
    },
    home: {
      heading: "SAME STUDIO, an independent app studio",
      introduction:
        "We craft focused iOS and Android apps for map notes, personal records, running, photography, and digital journals.",
      appDescriptions: {
        mapary: "Mapary is an iOS and Android map-note app for saving meaningful places and finding them again.",
        runtronome: "Pulto is an iOS and Android running metronome that helps runners maintain tempo and cadence.",
        evrune: "EVRUNE is an iOS daily-question journal for capturing one thoughtful answer each day.",
        locaunt: "Lacaunt (LOCAUNT) is an iOS location-based memo app for attaching reminders to important places.",
        pepesnap: "PepeSnap is an iOS photo-mission app that invites you to find and capture the shape of the day.",
        tocklist: "Tocklist is an iOS 24-hour to-do app for planning the day and reviewing its rhythm.",
        skkoo: "SKKOO is an iOS digital diary and journal-decoration app for making everyday records your own.",
        terubozu: "Teru Bozu is an iOS weather-wish app for checking the day and leaving a small hope behind.",
        feeloo: "Feeloo is an upcoming emotion-widget app for recording and reflecting on how each day felt.",
      },
    },
  },
  ja: {
    pages: {
      home: {
        title: "SAME STUDIO | iOS・Androidインディーアプリ開発",
        description:
          "SAME STUDIOは、地図メモ、ランニング、毎日の記録、写真、デジタル日記など、暮らしに寄り添うiOS・Androidアプリを作るインディーアプリスタジオです。",
      },
      support: {
        title: "アプリのサポート・お問い合わせ | SAME STUDIO",
        description:
          "SAME STUDIOアプリの使い方、不具合、購入、アカウント、プライバシーに関する案内を確認し、サポートへ問い合わせできます。",
      },
      privacy: {
        title: "プライバシーポリシー | SAME STUDIO",
        description:
          "SAME STUDIOのアプリとサービスにおける個人情報、利用目的、権限、外部サービス、保存・削除方針をご案内します。",
      },
      terms: {
        title: "利用規約 | SAME STUDIO",
        description:
          "SAME STUDIOのアプリとウェブサイトに適用される利用条件、ユーザーの責任、決済、コンテンツ、安全に関する規約です。",
      },
      "delete-account": {
        title: "アカウントとデータの削除依頼 | SAME STUDIO",
        description:
          "EVRUNEなど対応するSAME STUDIOアプリのアカウントと関連データの削除を依頼し、手続きを確認できる公式ページです。",
      },
    },
    home: {
      heading: "SAME STUDIO インディーアプリスタジオ",
      introduction:
        "地図メモ、記録、ランニング、写真、デジタル日記のためのiOS・Androidアプリを丁寧に作っています。",
      appDescriptions: {
        mapary: "Maparyは、大切な場所を記録して見つけ直せるiOS・Android対応の地図メモアプリです。",
        runtronome: "Pultoは、走るテンポとケイデンスを整えるiOS・Android対応のランニングメトロノームです。",
        evrune: "EVRUNEは、毎日ひとつの質問に答えて一日を残すiOS向け日記アプリです。",
        locaunt: "Lacaunt（LOCAUNT）は、大切な場所にリマインダーを残すiOS向け位置メモアプリです。",
        pepesnap: "PepeSnapは、今日の形を見つけて写真に残すiOS向けフォトミッションアプリです。",
        tocklist: "Tocklistは、一日の流れを計画して振り返るiOS向け24時間ToDoアプリです。",
        skkoo: "SKKOOは、日々の記録を自分らしく飾るiOS向けデジタル日記・手帳デコアプリです。",
        terubozu: "Teru Bozuは、今日の天気を確認して小さな願いを残すiOS向け天気アプリです。",
        feeloo: "Feelooは、その日の感情を記録して振り返る感情ウィジェットアプリとして公開準備中です。",
      },
    },
  },
  "zh-CN": {
    pages: {
      home: {
        title: "SAME STUDIO | iOS 与 Android 独立应用工作室",
        description:
          "SAME STUDIO 是独立应用工作室，专注于地图笔记、跑步节奏、每日记录、摄影与数字日记等实用的 iOS 和 Android 应用。",
      },
      support: {
        title: "应用支持与联系 | SAME STUDIO",
        description:
          "查看 SAME STUDIO 应用的使用、故障、付款、账号及隐私帮助，或发送客户支持请求。",
      },
      privacy: {
        title: "隐私政策 | SAME STUDIO",
        description:
          "了解 SAME STUDIO 应用与服务如何处理个人信息、权限、第三方服务、保存期限及数据删除。",
      },
      terms: {
        title: "服务条款 | SAME STUDIO",
        description:
          "查看适用于 SAME STUDIO 应用与网站的使用条件、用户责任、付款、内容及安全条款。",
      },
      "delete-account": {
        title: "申请删除账号与数据 | SAME STUDIO",
        description:
          "通过官方页面申请删除 EVRUNE 等受支持的 SAME STUDIO 应用账号及关联数据，并了解处理流程。",
      },
    },
    home: {
      heading: "SAME STUDIO 独立应用工作室",
      introduction:
        "我们用心打造用于地图笔记、生活记录、跑步、摄影和数字日记的 iOS 与 Android 应用。",
      appDescriptions: {
        mapary: "Mapary 是一款 iOS 与 Android 地图笔记应用，用于保存重要地点并随时重新找到它们。",
        runtronome: "Pulto 是一款 iOS 与 Android 跑步节拍器，帮助跑者稳定节奏与步频。",
        evrune: "EVRUNE 是一款 iOS 每日提问日记应用，每天用一个回答记录自己的想法。",
        locaunt: "Lacaunt（LOCAUNT）是一款 iOS 位置笔记应用，可在重要地点留下提醒。",
        pepesnap: "PepeSnap 是一款 iOS 摄影任务应用，邀请你寻找并拍下当天的形状。",
        tocklist: "Tocklist 是一款 iOS 24 小时待办应用，用于规划并回顾一天的节奏。",
        skkoo: "SKKOO 是一款 iOS 手账装饰与数字日记应用，让日常记录更具个人风格。",
        terubozu: "Teru Bozu 是一款 iOS 天气愿望应用，可查看天气并留下小小心愿。",
        feeloo: "Feeloo 是一款正在准备推出的情绪小组件应用，用于记录并回顾每天的感受。",
      },
    },
  },
  "zh-TW": {
    pages: {
      home: {
        title: "SAME STUDIO | iOS 與 Android 獨立應用程式工作室",
        description:
          "SAME STUDIO 是獨立應用程式工作室，專注製作地圖筆記、跑步節奏、每日記錄、攝影與數位日記等實用的 iOS 與 Android 應用程式。",
      },
      support: {
        title: "應用程式支援與聯絡 | SAME STUDIO",
        description:
          "查看 SAME STUDIO 應用程式的使用、錯誤、付款、帳號與隱私協助，或傳送客戶支援請求。",
      },
      privacy: {
        title: "隱私權政策 | SAME STUDIO",
        description:
          "瞭解 SAME STUDIO 應用程式與服務如何處理個人資料、權限、第三方服務、保存期限與資料刪除。",
      },
      terms: {
        title: "服務條款 | SAME STUDIO",
        description:
          "查看適用於 SAME STUDIO 應用程式與網站的使用條件、使用者責任、付款、內容與安全條款。",
      },
      "delete-account": {
        title: "申請刪除帳號與資料 | SAME STUDIO",
        description:
          "透過官方頁面申請刪除 EVRUNE 等支援的 SAME STUDIO 應用程式帳號與關聯資料，並瞭解處理流程。",
      },
    },
    home: {
      heading: "SAME STUDIO 獨立應用程式工作室",
      introduction:
        "我們用心製作用於地圖筆記、生活記錄、跑步、攝影與數位日記的 iOS 與 Android 應用程式。",
      appDescriptions: {
        mapary: "Mapary 是一款 iOS 與 Android 地圖筆記應用程式，用於保存重要地點並隨時重新找到它們。",
        runtronome: "Pulto 是一款 iOS 與 Android 跑步節拍器，協助跑者穩定節奏與步頻。",
        evrune: "EVRUNE 是一款 iOS 每日提問日記應用程式，每天用一個回答記錄自己的想法。",
        locaunt: "Lacaunt（LOCAUNT）是一款 iOS 位置筆記應用程式，可在重要地點留下提醒。",
        pepesnap: "PepeSnap 是一款 iOS 攝影任務應用程式，邀請你尋找並拍下當天的形狀。",
        tocklist: "Tocklist 是一款 iOS 24 小時待辦應用程式，用於規劃並回顧一天的節奏。",
        skkoo: "SKKOO 是一款 iOS 手帳裝飾與數位日記應用程式，讓日常記錄更具個人風格。",
        terubozu: "Teru Bozu 是一款 iOS 天氣願望應用程式，可查看天氣並留下小小心願。",
        feeloo: "Feeloo 是一款正在準備推出的情緒小工具應用程式，用於記錄並回顧每天的感受。",
      },
    },
  },
};

export const PAGE_PATHS: Record<SeoPage, string> = {
  home: "/",
  support: "/support/",
  privacy: "/privacy/",
  terms: "/terms/",
  "delete-account": "/delete-account/",
};

const OPEN_GRAPH_LOCALES: Record<Locale, string> = {
  ko: "ko_KR",
  en: "en_US",
  ja: "ja_JP",
  "zh-CN": "zh_CN",
  "zh-TW": "zh_TW",
};

export const ROOT_METADATA: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  creator: SITE_NAME,
  publisher: SITE_NAME,
  manifest: "/site.webmanifest",
  icons: {
    icon: [{ url: "/assets/favicon/favicon.ico", type: "image/x-icon" }],
    shortcut: "/assets/favicon/favicon.ico",
    apple: [
      {
        url: "/assets/favicon/favicon.ico",
        sizes: "256x256",
        type: "image/x-icon",
      },
    ],
  },
};

export function absoluteUrl(pathname: string): string {
  return new URL(pathname, `${SITE_URL}/`).toString();
}

export function getPageSeo(
  page: SeoPage,
  locale: Locale = DEFAULT_LOCALE,
): PageSeo {
  return SEO_CONTENT[locale].pages[page];
}

export function getCanonicalUrl(page: SeoPage): string {
  return absoluteUrl(PAGE_PATHS[page]);
}

export function getOpenGraphLocale(locale: Locale): string {
  return OPEN_GRAPH_LOCALES[locale];
}

export function createPageMetadata(page: SeoPage): Metadata {
  const content = getPageSeo(page);
  const canonical = getCanonicalUrl(page);

  return {
    title: content.title,
    description: content.description,
    alternates: { canonical },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: SITE_NAME,
      locale: getOpenGraphLocale(DEFAULT_LOCALE),
      title: content.title,
      description: content.description,
      images: [
        {
          url: SOCIAL_IMAGE_PATH,
          width: 1254,
          height: 1254,
          alt: "SAME STUDIO featured app Mapary",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: content.title,
      description: content.description,
      images: [SOCIAL_IMAGE_PATH],
    },
  };
}

export function getSeoPageFromPathname(pathname: string): SeoPage {
  const normalized = pathname === "/" ? "/" : `${pathname.replace(/\/+$/, "")}/`;
  return (
    Object.entries(PAGE_PATHS).find(([, path]) => path === normalized)?.[0] ??
    "home"
  ) as SeoPage;
}
