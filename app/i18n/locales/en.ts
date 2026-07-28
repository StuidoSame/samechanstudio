import type { TranslationMessages } from "../types";

export const en = {
  header: {
    controlsLabel: "Language and theme controls",
    languageButtonLabel: "Select language",
    languageOptionsLabel: "Language options",
    languageNames: {
      ko: "한국어",
      en: "English",
      ja: "日本語",
      "zh-CN": "简体中文",
      "zh-TW": "繁體中文",
    },
    controlsButtonLabel: "Open language and theme controls",
    switchToDarkMode: "Switch to dark mode",
    switchToLightMode: "Switch to light mode",
  },
  carousel: {
    pauseAutoplay: "Pause autoplay",
    startAutoplay: "Start autoplay",
    fastForward: "Browse apps quickly",
  },
  sectionNavigation: {
    navigationLabel: "Navigate main page sections",
    moveToSection: "Go to the {section} section",
    summaries: {
      apps: "Explore apps made by SAME STUDIO.",
      about: "The story of SAME STUDIO, where small apps are made with care.",
      device: "Small wins shaped by moments, reflection, and rhythm.",
      contact: "Email us about app support, partnerships, or bug reports.",
    },
  },
  devicePhilosophy: {
    phone: {
      category: "MOMENT",
      title: "So small moments\ndon’t slip away.",
      body: "What changes a day is often not a grand resolution,\nbut a single line written down.\nThe small win of recording how you feel today\nbrings tomorrow’s self into clearer focus.",
    },
    tablet: {
      category: "REFLECTION",
      title: "So you can pause\nand make room to think.",
      body: "Even a busy day needs a little breathing room.\nTake your time with one small puzzle,\nfind the moment when your thoughts fall into place,\nand complete one more small win.",
    },
    watch: {
      category: "RHYTHM",
      title: "So you can find\nyour own rhythm.",
      body: "What matters more than a perfect performance\nis the small act of tapping out a beat.\nThree tiny screens come together as one rhythm,\nand that single beat becomes a small win.",
    },
  },
  dailyQuestion: {
    questions: [
      "What would you like to tell yourself next week?",
      "What is one thing you really want to achieve this week?",
      "What made you feel a little more at ease today?",
      "What is something new you learned recently?",
      "What moment were you grateful for today?",
      "What do you think you did best this week?",
      "What would you like to enjoy slowly today?",
    ],
    examples: [
      [
        "You did more than enough this week",
        "It’s okay to take it one day at a time",
        "I hope you remember to take a break",
        "Let’s begin with one small plan",
      ],
      [
        "Finish the book I’ve been putting off",
        "Take a light ten-minute walk every day",
        "Tidy up one corner of the room",
        "Set a date for something long postponed",
      ],
      [
        "Taking my time over a warm cup of coffee",
        "Walking while listening to a favorite song",
        "Finishing one thing I needed to do",
        "A short chat with a friend after a long time",
      ],
      [
        "Going to bed early makes mornings easier",
        "Reading slowly helps things stay with me",
        "It’s okay to ask right away when I don’t know",
        "A short break really helps me focus",
      ],
      [
        "A message from a friend who checked in first",
        "A warm word from someone in the middle of a busy day",
        "An evening when I made it home on time",
        "A moment spent looking up at the clear sky",
      ],
      [
        "Starting something today that I had put off",
        "Remembering to eat well on a busy day",
        "Listening all the way through a difficult story",
        "Finishing my tasks calmly, one by one",
      ],
      [
        "Having a slow breakfast by the window",
        "Watching an episode of a show I left unfinished",
        "Taking an unhurried walk around the neighborhood",
        "Listening to a favorite album from the beginning",
      ],
    ],
    dateLocale: "en-US",
    stageLabel: "SAME STUDIO daily question",
    todayFallback: "Today",
    examplesLabel: "Today’s answer ideas",
    savedStatus: "Saved",
    inputLabel: "Enter today’s answer",
    completedPlaceholder: "Today’s notes are complete",
    inputPlaceholder: "Today’s answer",
    saveButtonLabel: "Save today’s answer",
  },
  puzzle: {
    stageLabel: "THINK SPACE daily puzzle",
    boardLabel: "3 by 3 daily pattern puzzle",
    tileLabel: "Row {row}, column {column} tile, {state}",
    tileOn: "on",
    tileOff: "off",
    resetButtonLabel: "Reset today’s puzzle",
  },
  drum: {
    kickLabel: "Play kick drum",
    snareLabel: "Play snare drum",
    hiHatLabel: "Play hi-hat",
    padShortcutLabel: "{pad}, shortcut {shortcut}",
  },
  contact: {
    description: "Email us with app questions, partnership inquiries, or bug reports.",
  },
  appDetail: {
    appIconAlt: "{app} app icon",
    closeLabel: "Close app details",
    storeSelectorLabel: "Select a store",
    storeLinkLabel: "View {app} on {store}",
    previewRegionLabel: "{app} {device} preview gallery",
    previewAlt: "{app} {device} preview {current} of {total}",
    previewLoadingLabel: "Loading preview...",
    previewUnavailableLabel: "Preview coming soon.",
    previousScreenshotLabel: "Previous {app} preview",
    nextScreenshotLabel: "Next {app} preview",
    screenshotPositionLabel: "{app} preview {current} of {total}",
    deviceSelectorLabel: "Select a device",
    fallback: {
      keywords: ["Core experience", "Simple flow", "Device optimized"],
      description: "Explore and use the app’s essential features through a simple flow on the selected device.",
    },
    apps: {
      mapary: {
        iphone: { keywords: ["Map journal", "Place notes", "Quick discovery"], description: "Save memorable places and notes directly on the map, then quickly rediscover nearby entries while you are on the move." },
        ipad: { keywords: ["Expansive map", "Organized entries", "Detailed discovery"], description: "See the full flow of your map and place journal on a larger screen, then browse and organize saved notes at an easy pace." },
        watch: { keywords: ["At a glance", "Nearby entries", "Quick access"], description: "Keep moving while checking nearby place entries at a glance from your wrist, without reaching for your phone." },
        android: { keywords: ["Map journal", "Place notes", "Android ready"], description: "Record places and notes around the map on an Android phone, then find them again through a familiar mobile flow whenever you need them." },
      },
      runtronome: {
        iphone: { keywords: ["Running rhythm", "Tempo control", "Focused workout"], description: "Choose your rhythm before a run, then stay focused on a steady pace with a simple screen while you exercise." },
        watch: { keywords: ["Wrist tempo", "Instant start", "Run focused"], description: "Use your Apple Watch to start and check the rhythm right away, reducing phone interaction so your run stays uninterrupted." },
        android: { keywords: ["Running rhythm", "Tempo control", "Android workout"], description: "Set a running rhythm quickly on Android and focus on your pace with only the information you need during a workout." },
      },
      odow: {
        iphone: { keywords: ["One word a day", "Quiet journal", "Simple answers"], description: "Meet one word and one question each day, then gently capture your thoughts in a short, pressure-free answer." },
        ipad: { keywords: ["Room to write", "Calm focus", "Past answers"], description: "Focus on today’s question on a larger screen, write with a more generous line length, and revisit earlier entries." },
        android: { keywords: ["One word a day", "Short answers", "Android journal"], description: "Check one daily question and quietly record the thoughts of the day in a short answer on Android." },
      },
      locaunt: {
        iphone: { keywords: ["Place memory", "Map journal", "Personal reminders"], description: "Leave important places and useful details on the map, then return to your personal notes through the places connected to them." },
      },
      pepesnap: {
        iphone: { keywords: ["Find shapes", "Daily mission", "Photo journal"], description: "Discover the shape of the day around you and save it as a photo, seeing familiar everyday scenes from a fresh perspective." },
        ipad: { keywords: ["Larger photos", "Mission gallery", "Shape discovery"], description: "Review captured shapes and mission entries on a larger screen, and compare everyday forms at a more relaxed pace." },
      },
      tocklist: {
        iphone: { keywords: ["Today’s plan", "Rhythm planning", "Daily reflection"], description: "Plan the day around your own rhythm, check progress simply, and look back on the day with a calm sense of closure." },
        ipad: { keywords: ["Expanded planning", "Schedule clarity", "Thoughtful review"], description: "See the day’s plan and progress together on a larger screen, with more room to organize tasks and reflections." },
      },
      skkoo: {
        iphone: { keywords: ["Daily journal", "Easy writing", "Everyday archive"], description: "Write about the day without pressure and build a personal record from the small moments of everyday life." },
        ipad: { keywords: ["Spacious journal", "Organized entries", "Review the day"], description: "Let the day unfold naturally in writing on a larger screen, then revisit past entries and the flow of everyday life." },
      },
      terubozu: {
        iphone: { keywords: ["Today’s weather", "Small wish", "Quick check"], description: "Check today’s weather at a glance and begin the day on a bright note by leaving a small wish with Teru Teru Bozu." },
      },
      feeloo: {
        iphone: { keywords: ["Emotion journal", "Today’s mood", "Calm reflection"], description: "Briefly record how you felt today, look back at the flow of your moods, and bring the day to a calm close." },
      },
    },
  },
  footer: {
    businessNameLabel: "Business name",
    businessRegistrationLabel: "Business registration number",
    representativeLabel: "Representative",
    emailLabel: "Email",
  },
} satisfies TranslationMessages;
