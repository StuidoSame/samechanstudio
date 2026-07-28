import type { TranslationMessages } from "../types";

export const zhTW = {
  header: {
    controlsLabel: "語言與主題控制項",
    languageButtonLabel: "選擇語言",
    languageOptionsLabel: "語言選項",
    languageNames: {
      ko: "한국어",
      en: "English",
      ja: "日本語",
      "zh-CN": "简体中文",
      "zh-TW": "繁體中文",
    },
    controlsButtonLabel: "開啟語言與主題按鈕",
    switchToDarkMode: "切換至深色模式",
    switchToLightMode: "切換至淺色模式",
  },
  carousel: {
    pauseAutoplay: "暫停自動播放",
    startAutoplay: "開始自動播放",
    fastForward: "快速瀏覽應用程式",
  },
  sectionNavigation: {
    navigationLabel: "前往頁面主要區段",
    moveToSection: "前往{section}區段",
    summaries: {
      apps: "瀏覽由SAME STUDIO打造的應用程式。",
      about: "認識SAME STUDIO用心打造小型應用程式的故事。",
      device: "由瞬間、思考與節奏串起的小小成就。",
      contact: "應用程式諮詢、合作或錯誤回報，請以電子郵件聯絡我們。",
    },
  },
  devicePhilosophy: {
    phone: {
      index: "01",
      label: "瞬間",
      titleLines: ["不讓微小的瞬間", "悄悄溜走。"],
      descriptionLines: [
        "改變一天的，往往不是宏大的決心，",
        "而是隨手寫下的一句話。",
        "記錄今天心情的這份小小成就，",
        "會讓明天的自己更加清晰。",
      ],
    },
    tablet: {
      index: "02",
      label: "思考",
      titleLines: ["暫時停下腳步，", "為思考留一點空間。"],
      descriptionLines: [
        "再忙碌的一天，也需要片刻留白。",
        "慢慢解開一道小題，",
        "遇見思緒逐漸清晰的瞬間，",
        "再完成一次小小的成就。",
      ],
    },
    watch: {
      index: "03",
      label: "節奏",
      titleLines: ["找到屬於自己的", "獨特節奏。"],
      descriptionLines: [
        "比完美演奏更重要的，",
        "是親手敲下第一拍。",
        "三個小小的畫面匯成一段節奏，",
        "這一拍也將成為一次小小的成就。",
      ],
    },
  },
  dailyQuestion: {
    questions: [
      "你想為下週的自己留下一句什麼話？",
      "這週最想完成的一件事是什麼？",
      "今天是什麼讓你感到更放鬆了一點？",
      "最近新發現的事情是什麼？",
      "今天哪個瞬間讓你心懷感謝？",
      "這週你覺得自己做得最好的一件事是什麼？",
      "今天你想慢慢享受什麼？",
    ],
    examples: [
      [
        "這週你也已經做得很好了",
        "一天一步，慢慢來就好",
        "希望你別忘了留點時間休息",
        "從一個小計畫開始吧",
      ],
      [
        "讀完那本一直擱著的書",
        "每天輕鬆散步十分鐘",
        "把房間的一個角落整理乾淨",
        "敲定一件拖了很久的約定",
      ],
      [
        "慢慢喝完一杯熱咖啡的時光",
        "聽著喜歡的歌散步的瞬間",
        "完成了一件該做的事",
        "久違地和朋友聊了幾句",
      ],
      [
        "早點睡，早晨真的會輕鬆許多",
        "讀得越慢，記得越久",
        "不懂的事情馬上問也沒關係",
        "短暫休息有助於重新專注",
      ],
      [
        "朋友主動傳來的問候訊息",
        "忙碌中依然收到的一句暖心關懷",
        "沒有太晚回到家的傍晚",
        "抬頭看了一會晴朗天空的瞬間",
      ],
      [
        "今天開始做那件一直拖延的事",
        "忙碌的一天裡也有好好吃飯",
        "把一段不容易的話聽到最後",
        "平靜地一件件完成該做的事",
      ],
      [
        "坐在窗邊慢慢吃早餐",
        "看一集還沒追完的影集",
        "在住家附近慢慢散步",
        "從頭再聽一次喜歡的音樂",
      ],
    ],
    dateLocale: "zh-TW",
    stageLabel: "SAME STUDIO每日一問",
    todayFallback: "今天",
    examplesLabel: "今日回答範例",
    savedStatus: "已儲存",
    inputLabel: "輸入今天的回答",
    completedPlaceholder: "今天的記錄已完成",
    inputPlaceholder: "今天的回答",
    saveButtonLabel: "儲存今天的回答",
  },
  puzzle: {
    stageLabel: "THINK SPACE每日謎題",
    boardLabel: "3×3每日圖樣謎題",
    tileLabel: "第{row}列第{column}欄方塊，{state}",
    tileOn: "開啟",
    tileOff: "關閉",
    resetButtonLabel: "重設今天的謎題",
  },
  drum: {
    kickLabel: "演奏大鼓",
    snareLabel: "演奏小鼓",
    hiHatLabel: "演奏腳踏鈸",
    padShortcutLabel: "{pad}，快速鍵{shortcut}",
  },
  contact: {
    description: "應用程式諮詢、商務合作或錯誤回報，請以電子郵件聯絡我們。",
  },
  appDetail: {
    appIconAlt: "{app}應用程式圖示",
    closeLabel: "關閉應用程式詳細資訊",
    storeSelectorLabel: "選擇應用程式商店",
    storeLinkLabel: "在{store}查看{app}",
    previewRegionLabel: "{app} {device}預覽圖庫",
    previewAlt: "{app} {device}預覽 {current}/{total}",
    previewLoadingLabel: "正在載入預覽...",
    previewUnavailableLabel: "預覽正在準備中。",
    previousScreenshotLabel: "{app}上一張預覽",
    nextScreenshotLabel: "{app}下一張預覽",
    screenshotPositionLabel: "{app}預覽 {current}/{total}",
    deviceSelectorLabel: "選擇裝置",
    fallback: {
      keywords: ["核心體驗", "簡潔流程", "裝置最佳化"],
      description: "在所選裝置上，透過簡潔的流程瞭解並使用應用程式的核心功能。",
    },
    apps: {
      mapary: {
        iphone: { keywords: ["地圖記錄", "地點備忘", "快速尋找"], description: "把想記住的地點和備忘直接留在地圖上，移動途中也能快速找回附近的記錄。" },
        ipad: { keywords: ["寬廣地圖", "整理記錄", "詳細瀏覽"], description: "在更寬廣的畫面上一覽地圖與地點記錄，從容地查看並整理累積的備忘。" },
        watch: { keywords: ["腕上查看", "附近記錄", "快速取用"], description: "不必拿出手機，就能在手腕上簡潔查看附近的地點記錄，讓移動中的節奏不中斷。" },
        android: { keywords: ["地圖記錄", "地點備忘", "Android最佳化"], description: "在Android手機上也能以地圖為中心記錄地點與備忘，並在需要時透過熟悉的行動操作快速查看。" },
      },
      runtronome: {
        iphone: { keywords: ["跑步節奏", "速度設定", "專注訓練"], description: "跑步前設定理想節奏，運動時透過簡潔畫面專注於速度，維持穩定步頻。" },
        watch: { keywords: ["腕上節拍", "立即開始", "專注跑步"], description: "跑步時減少手機操作，直接在Apple Watch上開始並查看節奏，讓運動過程保持連貫。" },
        android: { keywords: ["跑步節奏", "速度設定", "Android訓練"], description: "在Android手機上快速設定跑步節奏，運動時只查看必要資訊，更專注地維持步頻。" },
      },
      odow: {
        iphone: { keywords: ["每日一詞", "安靜記錄", "簡短回答"], description: "每天遇見一個詞和一個問題，用輕鬆簡短的回答，靜靜留下當天的想法。" },
        ipad: { keywords: ["寬屏記錄", "靜心專注", "過往回答"], description: "在寬廣畫面上專注於今天的問題，用舒展的行寬寫下回答，也能回顧先前的記錄。" },
        android: { keywords: ["每日一詞", "簡短回答", "Android記錄"], description: "在Android手機上也能每天查看一個問題，用簡短而安靜的方式記錄當天的想法。" },
      },
      locaunt: {
        iphone: { keywords: ["地點記憶", "地圖記錄", "專屬提醒"], description: "把不想忘記的地點和所需內容留在地圖上，再以地點為線索查看自己的專屬記錄。" },
      },
      pepesnap: {
        iphone: { keywords: ["尋找形狀", "今日任務", "照片記錄"], description: "在身邊發現今天的形狀並拍照記錄，以全新的視角觀察熟悉的日常景象。" },
        ipad: { keywords: ["大圖瀏覽", "任務合集", "觀察形狀"], description: "在更大的畫面上查看拍攝的形狀與任務記錄，從容比較日常生活中發現的不同形態。" },
      },
      tocklist: {
        iphone: { keywords: ["今日計畫", "節奏管理", "每日回顧"], description: "按照自己的節奏安排每日事項，輕鬆確認進度，再平靜地回顧這一天。" },
        ipad: { keywords: ["寬屏計畫", "行程整理", "記錄回顧"], description: "在寬廣畫面上同時查看一天的計畫與進度，更從容地整理待辦事項和回顧。" },
      },
      skkoo: {
        iphone: { keywords: ["今日日記", "輕鬆記錄", "保存日常"], description: "沒有負擔地寫下當天的故事，把每天的微小瞬間一點點珍藏為自己的記錄。" },
        ipad: { keywords: ["寬屏日記", "整理記錄", "回顧一天"], description: "在寬廣畫面上自在書寫一天的故事，從容回顧過往日記和日常生活的軌跡。" },
      },
      terubozu: {
        iphone: { keywords: ["今日天氣", "小小心願", "快速查看"], description: "輕鬆查看今天的天氣，和晴天娃娃一起留下一個小小心願，愉快地展開新的一天。" },
      },
      feeloo: {
        iphone: { keywords: ["情緒記錄", "今日心情", "平靜回顧"], description: "簡短記錄今天的感受，回望累積的情緒軌跡，平靜地為一天收尾。" },
      },
    },
  },
  footer: {
    businessNameLabel: "商業名稱",
    businessRegistrationLabel: "商業登記號碼",
    representativeLabel: "負責人",
    emailLabel: "電子郵件",
  },
} satisfies TranslationMessages;
