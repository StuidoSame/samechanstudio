import type { TranslationMessages } from "../types";

export const zhCN = {
  header: {
    controlsLabel: "语言与主题控件",
    languageButtonLabel: "选择语言",
    languageOptionsLabel: "语言选项",
    languageNames: {
      ko: "한국어",
      en: "English",
      ja: "日本語",
      "zh-CN": "简体中文",
      "zh-TW": "繁體中文",
    },
    controlsButtonLabel: "打开语言与主题按钮",
    switchToDarkMode: "切换到深色模式",
    switchToLightMode: "切换到浅色模式",
  },
  carousel: {
    pauseAutoplay: "暂停自动播放",
    startAutoplay: "开始自动播放",
    fastForward: "快速浏览应用",
  },
  sectionNavigation: {
    navigationLabel: "前往页面主要区域",
    moveToSection: "前往{section}区域",
    summaries: {
      apps: "浏览由SAME STUDIO打造的应用。",
      about: "了解SAME STUDIO用心打造小应用的故事。",
      device: "由瞬间、思考与节奏串联而成的小小成就。",
      contact: "如需应用咨询、合作或反馈错误，请发送邮件联系我们。",
    },
  },
  devicePhilosophy: {
    phone: {
      category: "瞬间",
      title: "不让微小的瞬间\n悄然溜走。",
      body: "改变一天的，往往不是宏大的决心，\n而是随手写下的一句话。\n记录今天心情的这份小小成就，\n会让明天的自己变得更清晰。",
    },
    tablet: {
      category: "思考",
      title: "暂时停下脚步，\n为思考留一点空间。",
      body: "再忙碌的一天，也需要片刻留白。\n慢慢解开一道小题，\n遇见思绪逐渐清晰的瞬间，\n再完成一次小小的成就。",
    },
    watch: {
      category: "节奏",
      title: "找到属于自己的\n独特节奏。",
      body: "比完美演奏更重要的，\n是亲手敲下第一拍。\n三块小小的屏幕汇成一段节奏，\n这一拍也将成为一次小小的成就。",
    },
  },
  dailyQuestion: {
    questions: [
      "你想给下周的自己留下一句什么话？",
      "这周最想完成的一件事是什么？",
      "今天是什么让你感到更放松了一点？",
      "最近新了解到的事情是什么？",
      "今天哪个瞬间让你心怀感谢？",
      "这周你觉得自己做得最好的一件事是什么？",
      "今天你想慢慢享受什么？",
    ],
    examples: [
      [
        "这周你也已经做得很好了",
        "一天一步，慢慢来就好",
        "希望你不要忘记留点时间休息",
        "从一个小计划开始吧",
      ],
      [
        "读完那本一直搁置的书",
        "每天轻松散步十分钟",
        "整理干净房间的一个角落",
        "敲定一件拖了很久的约定",
      ],
      [
        "慢慢喝完一杯热咖啡的时光",
        "听着喜欢的歌散步的瞬间",
        "完成了一件该做的事",
        "久违地和朋友聊了几句",
      ],
      [
        "早点睡，早晨真的会轻松很多",
        "读得越慢，记得越久",
        "不懂的事情马上问也没关系",
        "短暂休息有助于重新集中注意力",
      ],
      [
        "朋友主动发来的问候消息",
        "忙碌中依然收到的一句暖心关怀",
        "没有太晚回到家的傍晚",
        "抬头看了一会儿晴朗天空的瞬间",
      ],
      [
        "今天开始做那件一直拖延的事",
        "忙碌的一天里也认真吃了饭",
        "把一段不容易的话听到了最后",
        "平静地一件件完成了要做的事",
      ],
      [
        "坐在窗边慢慢吃早餐",
        "看一集没追完的剧",
        "在附近慢悠悠地散步",
        "从头再听一次喜欢的音乐",
      ],
    ],
    dateLocale: "zh-CN",
    stageLabel: "SAME STUDIO每日一问",
    todayFallback: "今天",
    examplesLabel: "今日回答示例",
    savedStatus: "已保存",
    inputLabel: "输入今天的回答",
    completedPlaceholder: "今天的记录已完成",
    inputPlaceholder: "今天的回答",
    saveButtonLabel: "保存今天的回答",
  },
  puzzle: {
    stageLabel: "THINK SPACE每日谜题",
    boardLabel: "3×3每日图案谜题",
    tileLabel: "第{row}行第{column}列方块，{state}",
    tileOn: "开启",
    tileOff: "关闭",
    resetButtonLabel: "重置今天的谜题",
  },
  drum: {
    kickLabel: "演奏底鼓",
    snareLabel: "演奏军鼓",
    hiHatLabel: "演奏踩镲",
    padShortcutLabel: "{pad}，快捷键{shortcut}",
  },
  contact: {
    description: "如需应用咨询、商务合作或反馈错误，请发送邮件联系我们。",
  },
  appDetail: {
    appIconAlt: "{app}应用图标",
    closeLabel: "关闭应用详情",
    storeSelectorLabel: "选择应用商店",
    storeLinkLabel: "在{store}中查看{app}",
    previewAlt: "{app} {device}预览",
    previewLoadingLabel: "正在加载预览...",
    previewUnavailableLabel: "预览正在准备中。",
    deviceSelectorLabel: "选择设备",
    fallback: {
      keywords: ["核心体验", "简洁流程", "设备优化"],
      description: "在所选设备上通过简洁的流程了解并使用应用的核心功能。",
    },
    apps: {
      mapary: {
        iphone: { keywords: ["地图记录", "地点备忘", "快速查找"], description: "把想记住的地点和备忘直接留在地图上，移动途中也能快速找回附近的记录。" },
        ipad: { keywords: ["宽广地图", "整理记录", "详细浏览"], description: "在更宽广的屏幕上一览地图与地点记录，自在地查看并整理积累的备忘。" },
        watch: { keywords: ["腕上查看", "附近记录", "快速访问"], description: "无需拿出手机，便可在手腕上简洁查看附近的地点记录，让移动中的节奏不中断。" },
        android: { keywords: ["地图记录", "地点备忘", "Android优化"], description: "在Android手机上也能以地图为中心记录地点与备忘，并在需要时通过熟悉的移动操作快速查看。" },
      },
      runtronome: {
        iphone: { keywords: ["跑步节奏", "速度设置", "专注训练"], description: "跑步前设定理想节奏，运动时通过简洁画面专注于速度，保持稳定步频。" },
        watch: { keywords: ["腕上节拍", "即刻开始", "专注跑步"], description: "跑步时减少手机操作，直接在Apple Watch上开始并查看节奏，让运动过程保持连贯。" },
        android: { keywords: ["跑步节奏", "速度设置", "Android训练"], description: "在Android手机上快速设置跑步节奏，运动时只查看必要信息，更专注地保持步频。" },
      },
      odow: {
        iphone: { keywords: ["每日一词", "安静记录", "简短回答"], description: "每天遇见一个词和一个问题，用轻松简短的回答，静静留下当天的想法。" },
        ipad: { keywords: ["宽屏记录", "静心专注", "过往回答"], description: "在宽广屏幕上专注于今天的问题，用舒展的行宽写下回答，也可回顾之前的记录。" },
        android: { keywords: ["每日一词", "简短回答", "Android记录"], description: "在Android手机上也能每天查看一个问题，用简短而安静的方式记录当天的想法。" },
      },
      locaunt: {
        iphone: { keywords: ["地点记忆", "地图记录", "专属提醒"], description: "把不想忘记的地点和所需内容留在地图上，再以地点为线索查看自己的专属记录。" },
      },
      pepesnap: {
        iphone: { keywords: ["寻找形状", "今日任务", "照片记录"], description: "在身边发现今天的形状并拍照记录，以全新的视角观察熟悉的日常景象。" },
        ipad: { keywords: ["大图浏览", "任务合集", "观察形状"], description: "在更大的屏幕上查看拍摄的形状与任务记录，从容比较日常生活中发现的不同形态。" },
      },
      tocklist: {
        iphone: { keywords: ["今日计划", "节奏管理", "每日回顾"], description: "按照自己的节奏安排每日事项，轻松确认进度，再平静地回顾这一天。" },
        ipad: { keywords: ["宽屏计划", "日程整理", "记录回顾"], description: "在宽广屏幕上同时查看一天的计划与进度，更从容地整理待办事项和回顾。" },
      },
      skkoo: {
        iphone: { keywords: ["今日日记", "轻松记录", "保存日常"], description: "没有负担地写下当天的故事，把每天的微小瞬间一点点珍藏为自己的记录。" },
        ipad: { keywords: ["宽屏日记", "整理记录", "回顾一天"], description: "在宽广屏幕上自在书写一天的故事，从容回顾过往日记和日常生活的轨迹。" },
      },
      terubozu: {
        iphone: { keywords: ["今日天气", "小小心愿", "快速查看"], description: "轻松查看今天的天气，和晴天娃娃一起留下一个小小心愿，愉快地开启新一天。" },
      },
      feeloo: {
        iphone: { keywords: ["情绪记录", "今日心情", "平静回顾"], description: "简短记录今天的感受，回望累积的情绪轨迹，平静地为一天收尾。" },
      },
    },
  },
  footer: {
    businessNameLabel: "企业名称",
    businessRegistrationLabel: "营业执照注册号",
    representativeLabel: "负责人",
    emailLabel: "电子邮箱",
  },
} satisfies TranslationMessages;
