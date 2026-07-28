import type { Locale } from "../i18n/types";

export type PrivacyItem = {
  label: string;
  title: string;
  text: string;
};

export type PrivacySection = {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  intro: string;
  paragraphs?: readonly string[];
  items?: readonly PrivacyItem[];
};

export type PrivacyMessages = {
  hero: { label: string; title: string; description: string; updated: string };
  summary: readonly { label: string; title: string; text: string }[];
  contents: { label: string; navigationLabel: string; mobileLabel: string };
  sections: readonly PrivacySection[];
  deletion: { label: string; ariaLabel: string; subject: string; body: string };
  rights: readonly string[];
  contact: {
    heading: string;
    businessLabel: string;
    business: string;
    representativeLabel: string;
    representative: string;
    emailLabel: string;
    websiteLabel: string;
    button: string;
    buttonAriaLabel: string;
    emailAriaLabel: string;
    subject: string;
    changeNotice: string;
  };
};

const ko = {
  hero: {
    label: "PRIVACY ARCHIVE",
    title: "PRIVACY",
    description: "SAME STUDIO가 어떤 정보를 다루고,\n어떻게 이용하고 보호하는지 안내합니다.",
    updated: "LAST UPDATED · 2026.07.28",
  },
  summary: [
    { label: "MINIMUM DATA", title: "필요한 만큼만", text: "서비스 제공에 필요한 범위에서 정보를 처리합니다." },
    { label: "YOUR CONTROL", title: "사용자의 선택", text: "권한과 개인정보 관련 설정은 기기 또는 앱에서 변경할 수 있습니다." },
    { label: "SAFE HANDLING", title: "안전한 처리", text: "처리 목적이 끝난 정보는 관련 기준에 따라 삭제하거나 익명화합니다." },
  ],
  contents: { label: "CONTENTS", navigationLabel: "개인정보처리방침 목차", mobileLabel: "개인정보처리방침 섹션 선택" },
  sections: [
    {
      id: "information", number: "01", eyebrow: "INFORMATION WE HANDLE", title: "처리하는 정보",
      intro: "앱마다 제공하는 기능이 달라 실제로 처리되는 정보도 다릅니다. 사용한 기능과 허용한 권한 범위 안에서 필요한 정보만 처리합니다.",
      items: [
        { label: "USER PROVIDED", title: "사용자가 제공한 정보", text: "기록, 메모, 사진, 할 일, 답변과 일부 앱의 프로필 이름·사진 등 사용자가 직접 입력하거나 선택한 정보가 해당 기능에서 처리될 수 있습니다." },
        { label: "APP ACTIVITY", title: "앱 이용 중 생성되는 정보", text: "사용자 설정, 저장 기록, 알림 설정, 앱 버전 및 기능 이용 과정에서 생성되는 정보가 기기 또는 앱이 사용하는 저장소에 남을 수 있습니다." },
        { label: "SUPPORT", title: "문의와 오류 확인 정보", text: "고객지원 요청 시 앱 이름, 기기 종류, OS·앱 버전, 오류 재현 과정과 사용자가 첨부한 스크린샷을 처리할 수 있습니다." },
        { label: "ACCOUNT", title: "소셜 로그인 정보", text: "로그인을 제공하는 일부 앱은 Apple, Google, Kakao 또는 LINE에서 제공하는 최소 식별 정보와 로그인 상태를 처리할 수 있습니다." },
        { label: "PERMISSION DATA", title: "선택 권한 관련 정보", text: "위치, 사진, 카메라, 알림은 해당 기능을 사용하는 앱에서 사용자가 허용한 경우에만 처리됩니다. 거부하면 관련 기능이 제한될 수 있습니다." },
        { label: "STORE & ADS", title: "구매와 광고 관련 정보", text: "구매 상태·복원에 필요한 앱 마켓 정보와, 광고가 포함된 일부 앱에서 광고 제공 및 빈도 관리에 필요한 제한된 정보가 처리될 수 있습니다." },
      ],
    },
    {
      id: "purpose", number: "02", eyebrow: "HOW WE USE IT", title: "이용 목적",
      intro: "처리한 정보는 사용자가 선택한 기능을 제공하고 앱을 안전하게 운영하는 목적에 한정해 이용합니다.",
      items: [
        { label: "CORE EXPERIENCE", title: "핵심 기능과 기록 유지", text: "앱 기능 제공, 사용자가 작성한 기록과 설정 유지, 기기 간 지원 기능을 위해 이용합니다." },
        { label: "LOCATION & NOTICE", title: "위치와 알림", text: "지도 기록, 장소 기반 알림, 일정·리마인더 등 사용자가 선택한 기능을 제공하는 데 이용합니다." },
        { label: "MEDIA", title: "사진 기능", text: "사진 촬영, 선택, 첨부와 저장을 지원하는 앱에서 해당 작업을 수행하는 데 이용합니다." },
        { label: "ACCOUNT & STORE", title: "로그인과 구매", text: "계정 식별, 로그인 유지, 구매 확인, 구독 관리와 구매 복원을 위해 이용합니다." },
        { label: "QUALITY", title: "안정성과 고객지원", text: "오류 분석, 성능 개선, 부정 이용 방지와 고객 문의 응대를 위해 필요한 범위에서 이용합니다." },
        { label: "SERVICE PROTECTION", title: "광고·법적 의무·보호", text: "광고가 있는 앱의 광고 제공과 빈도 관리, 법적 의무 이행 및 서비스와 이용자 보호를 위해 이용할 수 있습니다." },
      ],
    },
    {
      id: "permissions", number: "03", eyebrow: "PERMISSIONS", title: "기기 권한",
      intro: "권한은 관련 기능을 사용할 때 요청되며 기기 설정에서 언제든 변경할 수 있습니다. 거부하더라도 관련 기능을 제외한 나머지 기능은 가능한 범위에서 계속 이용할 수 있습니다.",
      items: [
        { label: "LOCATION", title: "위치", text: "Mapary·Lacaunt처럼 장소 기반 기록, 지도 또는 위치 알림을 제공하는 기능에서 사용될 수 있습니다." },
        { label: "CAMERA", title: "카메라", text: "PepeSnap 등 사진 촬영 기능을 제공하는 앱에서 촬영을 시작할 때 사용될 수 있습니다." },
        { label: "PHOTOS", title: "사진", text: "사진 선택, 기록 첨부, 저장 또는 복원을 지원하는 앱에서 사용자가 고른 항목을 처리하는 데 사용될 수 있습니다." },
        { label: "NOTIFICATIONS", title: "알림", text: "장소 알림, 일정, 리마인더와 사용자가 설정한 시각의 안내를 전달하는 데 사용될 수 있습니다." },
      ],
    },
    {
      id: "services", number: "04", eyebrow: "THIRD-PARTY SERVICES", title: "외부 서비스",
      intro: "적용 서비스는 앱과 사용 기능에 따라 다르며, 외부 서비스가 직접 처리하는 정보에는 각 제공자의 개인정보처리방침이 적용될 수 있습니다.",
      items: [
        { label: "APPLE · GOOGLE · KAKAO · LINE", title: "소셜 로그인", text: "ODOW 등 로그인을 지원하는 일부 앱에서 계정 인증과 최소 식별 정보 제공을 위해 사용될 수 있습니다." },
        { label: "APPLE MAPS", title: "지도 기능", text: "Mapary 등 지도 기반 기능에서 위치 표시와 장소 기록 경험을 제공하는 데 사용됩니다." },
        { label: "ICLOUD", title: "백업과 복원", text: "Mapary처럼 iCloud 백업을 지원하는 앱에서 사용자가 직접 기록을 백업하고 복원할 때 사용됩니다." },
        { label: "APP STORE · GOOGLE PLAY", title: "배포와 결제", text: "앱 설치, 결제, 구독 관리, 구매 확인과 구매 복원에 사용됩니다. 적용 스토어는 앱과 기기에 따라 다릅니다." },
        { label: "CLOUDFLARE", title: "웹사이트 제공", text: "SAME STUDIO 웹사이트 전송, 보안과 안정적인 접속 제공에 사용됩니다. 모든 앱 데이터가 Cloudflare에서 처리된다는 의미는 아닙니다." },
        { label: "ADVERTISING SERVICES", title: "일부 앱의 광고", text: "광고가 포함된 일부 앱에서는 적용된 광고 제공자가 광고 표시와 빈도 관리를 위해 제한된 정보를 처리할 수 있으며, 구체적인 적용 범위는 앱별 안내를 따릅니다." },
      ],
    },
    {
      id: "storage", number: "05", eyebrow: "STORAGE & DELETION", title: "보관 및 삭제",
      intro: "개인정보는 처리 목적에 필요한 기간 동안만 보관하고, 목적이 끝나면 관련 기준에 따라 지체 없이 삭제하거나 익명화합니다.",
      paragraphs: [
        "법령상 보관 의무가 있는 정보는 해당 의무가 유지되는 동안 보관될 수 있습니다. 확인되지 않은 일률적인 보관 기간은 적용하지 않습니다.",
        "일부 기록과 설정은 사용자 기기에만 저장될 수 있습니다. 앱을 삭제하면 로컬 데이터가 사라질 수 있지만, 계정·동기화·백업 기능이 있는 서비스의 서버 또는 외부 플랫폼 데이터가 자동으로 삭제되는 것은 아닐 수 있습니다.",
        "계정 또는 서버 데이터 삭제는 앱 내부 기능이나 고객지원 이메일로 요청할 수 있습니다. 백업, 보안 로그와 외부 플랫폼 데이터는 각 서비스 정책과 기술적 보관 주기에 따라 일정 기간 남을 수 있습니다.",
      ],
    },
    {
      id: "rights", number: "06", eyebrow: "YOUR RIGHTS", title: "이용자의 권리",
      intro: "이용자는 자신의 개인정보에 대해 열람, 수정, 삭제, 처리 정지와 동의 철회를 요청할 수 있습니다.",
      paragraphs: [
        "기기 권한은 운영체제 설정에서 직접 변경할 수 있으며, 계정과 서버 데이터 관련 요청은 앱 내부 기능 또는 이메일을 통해 접수할 수 있습니다.",
        "요청 처리에 필요한 최소한의 본인 확인 정보를 요청할 수 있고, 법령상 보관 의무가 있는 정보는 즉시 삭제되지 않을 수 있습니다.",
      ],
    },
    {
      id: "children", number: "07", eyebrow: "CHILDREN", title: "아동의 개인정보",
      intro: "SAME STUDIO는 관련 법령과 앱 마켓의 연령 및 개인정보 보호 정책을 준수합니다.",
      paragraphs: [
        "아동을 주 대상으로 하지 않는 앱에서도 법정대리인 동의가 필요한 연령의 이용자는 보호자와 함께 서비스를 이용해야 할 수 있습니다.",
        "아동의 개인정보가 보호자 동의 없이 처리된 사실을 알게 된 경우 고객지원 이메일로 삭제 또는 조치를 요청할 수 있습니다. 특정 앱의 연령 등급과 별도 안내가 우선 적용될 수 있습니다.",
      ],
    },
    {
      id: "contact", number: "08", eyebrow: "PRIVACY CONTACT", title: "개인정보 문의",
      intro: "개인정보 열람·삭제 요청, 처리방침 또는 앱별 개인정보 처리에 관한 문의를 아래 연락처로 보내주세요.",
      paragraphs: ["요청을 확인하기 위해 앱 이름과 계정 식별에 필요한 최소한의 정보를 추가로 요청할 수 있습니다."],
    },
  ],
  deletion: {
    label: "REQUEST DATA DELETION →", ariaLabel: "이메일로 개인정보 삭제 요청하기", subject: "[SAME STUDIO] 개인정보 삭제 요청",
    body: "앱 이름:\n\n계정 또는 식별 정보:\n\n요청 내용:\n\n추가 확인 사항:\n",
  },
  rights: ["개인정보 열람 요청", "개인정보 수정 요청", "개인정보 삭제 요청", "개인정보 처리 정지 요청", "동의 철회", "앱 권한 변경", "계정 탈퇴 또는 데이터 삭제 요청"],
  contact: {
    heading: "개인정보 보호 문의", businessLabel: "사업자명", business: "세임스튜디오", representativeLabel: "대표자", representative: "김동찬",
    emailLabel: "이메일", websiteLabel: "웹사이트", button: "EMAIL PRIVACY SUPPORT →", buttonAriaLabel: "이메일로 개인정보 보호 문의하기",
    emailAriaLabel: "contact@samestudio.kr로 개인정보 문의하기", subject: "[SAME STUDIO] 개인정보 문의",
    changeNotice: "개인정보처리방침은 법령, 서비스 기능 또는 운영 정책 변경에 따라 수정될 수 있으며, 중요한 변경 사항은 웹사이트 또는 앱 내 공지를 통해 안내할 수 있습니다.",
  },
} satisfies PrivacyMessages;

const en: PrivacyMessages = {
  ...ko,
  hero: { label: "PRIVACY ARCHIVE", title: "PRIVACY", description: "Learn what information SAME STUDIO handles,\nhow it is used, and how it is protected.", updated: "LAST UPDATED · 2026.07.28" },
  summary: [
    { label: "MINIMUM DATA", title: "Only what is needed", text: "We handle information only as needed to provide each service." },
    { label: "YOUR CONTROL", title: "Your choices", text: "You can change permissions and privacy settings in your device or the app." },
    { label: "SAFE HANDLING", title: "Handled with care", text: "When the purpose ends, information is deleted or anonymized under applicable standards." },
  ],
  contents: { label: "CONTENTS", navigationLabel: "Privacy policy contents", mobileLabel: "Select a privacy policy section" },
  sections: [
    { ...ko.sections[0], title: "Information we handle", intro: "The information handled varies by app. We process only what is needed for the features you use and permissions you grant.", items: [
      { label: "USER PROVIDED", title: "Information you provide", text: "Entries, notes, photos, tasks, answers, and—where offered—profile names or images may be handled when you submit or select them." },
      { label: "APP ACTIVITY", title: "Information created in the app", text: "Settings, saved records, notification preferences, app version, and data created while using features may remain on your device or in storage used by the app." },
      { label: "SUPPORT", title: "Support and diagnostics", text: "When you contact us, we may handle the app name, device, OS and app version, reproduction steps, and screenshots you choose to attach." },
      { label: "ACCOUNT", title: "Social sign-in", text: "Some apps with sign-in may handle the minimum identifier and sign-in status provided by Apple, Google, Kakao, or LINE." },
      { label: "PERMISSION DATA", title: "Optional permission data", text: "Location, photos, camera, and notifications are handled only in apps that use those features and when you allow access. Refusing may limit the related feature." },
      { label: "STORE & ADS", title: "Purchases and ads", text: "Store information needed for purchase status or restoration, and limited information needed to serve and manage ad frequency in some ad-supported apps, may be handled." },
    ]},
    { ...ko.sections[1], title: "How we use it", intro: "We use information only to provide the features you choose and operate our apps safely.", items: [
      { label: "CORE EXPERIENCE", title: "Features and saved records", text: "To provide app features, retain your records and settings, and support available device-to-device functions." },
      { label: "LOCATION & NOTICE", title: "Location and notifications", text: "To provide map records, place-based alerts, schedules, and reminders you choose." },
      { label: "MEDIA", title: "Photo features", text: "To capture, select, attach, and save photos in apps that provide those features." },
      { label: "ACCOUNT & STORE", title: "Sign-in and purchases", text: "To identify accounts, maintain sign-in, verify purchases, manage subscriptions, and restore purchases." },
      { label: "QUALITY", title: "Reliability and support", text: "To analyze errors, improve performance, prevent misuse, and respond to support requests." },
      { label: "SERVICE PROTECTION", title: "Ads, legal duties, and safety", text: "To serve and limit ad frequency in apps with ads, meet legal duties, and protect services and users." },
    ]},
    { ...ko.sections[2], title: "Device permissions", intro: "Permissions are requested when a related feature is used and can be changed in device settings. Other features remain available where possible if access is denied.", items: [
      { label: "LOCATION", title: "Location", text: "May be used for place records, maps, or location alerts in features such as Mapary and Lacaunt." },
      { label: "CAMERA", title: "Camera", text: "May be used when starting photo capture in apps with camera features, such as PepeSnap." },
      { label: "PHOTOS", title: "Photos", text: "May be used to process items you select in apps that support photo selection, attachments, saving, or restoration." },
      { label: "NOTIFICATIONS", title: "Notifications", text: "May be used to deliver place alerts, schedules, reminders, and notices at times you set." },
    ]},
    { ...ko.sections[3], title: "Third-party services", intro: "Services vary by app and feature. A provider’s own privacy policy may apply to information it processes directly.", items: [
      { label: "APPLE · GOOGLE · KAKAO · LINE", title: "Social sign-in", text: "May be used for authentication and minimum account identifiers in ODOW and other apps that offer sign-in." },
      { label: "APPLE MAPS", title: "Map features", text: "Used to provide map display and place-recording experiences in Mapary and related map features." },
      { label: "ICLOUD", title: "Backup and restore", text: "Used when a user backs up or restores records in apps that support iCloud backup, such as Mapary." },
      { label: "APP STORE · GOOGLE PLAY", title: "Distribution and payments", text: "Used for installation, payments, subscription management, purchase verification, and restoration. The applicable store varies by app and device." },
      { label: "CLOUDFLARE", title: "Website delivery", text: "Used to deliver and protect the SAME STUDIO website. This does not mean that all app data is handled by Cloudflare." },
      { label: "ADVERTISING SERVICES", title: "Ads in some apps", text: "An ad provider configured in an ad-supported app may handle limited information for ad delivery and frequency management. App-specific notices define the scope." },
    ]},
    { ...ko.sections[4], title: "Storage and deletion", intro: "We retain personal information only for the period needed for its purpose, then delete or anonymize it without undue delay under applicable standards.", paragraphs: [
      "Information subject to a legal retention duty may be kept while that duty applies. We do not state a single retention period where none has been verified.",
      "Some records and settings may be stored only on your device. Deleting an app may remove local data, but may not automatically remove account, synced, backup, or third-party platform data.",
      "You may request deletion of account or server data through an in-app feature or support email. Backups, security logs, and third-party data may remain for a limited period under each service’s policy and technical cycle.",
    ]},
    { ...ko.sections[5], title: "Your rights", intro: "You may request access, correction, deletion, restriction of processing, or withdrawal of consent for your personal information.", paragraphs: [
      "Device permissions can be changed directly in operating-system settings. Requests about accounts or server data may be submitted through the app or by email.",
      "We may request the minimum information needed to verify identity. Information subject to a legal retention duty may not be deleted immediately.",
    ]},
    { ...ko.sections[6], title: "Children’s privacy", intro: "SAME STUDIO follows applicable law and app-store age and privacy policies.", paragraphs: [
      "For apps not directed primarily to children, users below the age requiring guardian consent may need to use the service with a parent or guardian.",
      "If you learn that a child’s information was handled without required guardian consent, contact support to request deletion or other action. App-specific age ratings and notices may apply first.",
    ]},
    { ...ko.sections[7], title: "Privacy contact", intro: "Contact us below about access or deletion requests, this policy, or privacy practices for a specific app.", paragraphs: ["We may ask for the app name and the minimum information needed to identify the relevant account or request."] },
  ],
  deletion: { label: "REQUEST DATA DELETION →", ariaLabel: "Request deletion of personal data by email", subject: "[SAME STUDIO] Personal Data Deletion Request", body: "App name:\n\nAccount or identifier:\n\nRequest details:\n\nAdditional information:\n" },
  rights: ["Request access", "Request correction", "Request deletion", "Request restriction of processing", "Withdraw consent", "Change app permissions", "Close an account or request data deletion"],
  contact: { heading: "Privacy inquiries", businessLabel: "Business", business: "SAME STUDIO", representativeLabel: "Representative", representative: "Kim Dongchan", emailLabel: "Email", websiteLabel: "Website", button: "EMAIL PRIVACY SUPPORT →", buttonAriaLabel: "Contact privacy support by email", emailAriaLabel: "Send a privacy inquiry to contact@samestudio.kr", subject: "[SAME STUDIO] Privacy Inquiry", changeNotice: "This policy may be revised when laws, service features, or operating policies change. Important changes may be announced on the website or inside the relevant app." },
};

const ja: PrivacyMessages = {
  ...en,
  hero: { label: "PRIVACY ARCHIVE", title: "PRIVACY", description: "SAME STUDIOが取り扱う情報と、\nその利用・保護の方法をご案内します。", updated: "最終更新 · 2026.07.28" },
  summary: [
    { label: "MINIMUM DATA", title: "必要な範囲のみ", text: "サービス提供に必要な範囲で情報を取り扱います。" },
    { label: "YOUR CONTROL", title: "利用者の選択", text: "権限やプライバシー設定は端末またはアプリで変更できます。" },
    { label: "SAFE HANDLING", title: "安全な取扱い", text: "利用目的を終えた情報は、適用基準に従って削除または匿名化します。" },
  ],
  contents: { label: "CONTENTS", navigationLabel: "プライバシーポリシー目次", mobileLabel: "プライバシーポリシーの項目を選択" },
  sections: en.sections.map((section, index) => ({
    ...section,
    title: ["取り扱う情報", "利用目的", "端末の権限", "外部サービス", "保存と削除", "利用者の権利", "子どものプライバシー", "プライバシーに関するお問い合わせ"][index],
    intro: [
      "アプリごとに機能が異なるため、取り扱う情報も異なります。利用した機能と許可した権限の範囲で、必要な情報のみを取り扱います。",
      "選択された機能を提供し、アプリを安全に運営する目的に限って情報を利用します。",
      "権限は関連機能の利用時に求められ、端末設定からいつでも変更できます。拒否した場合も、関連機能以外は可能な範囲で利用できます。",
      "適用されるサービスはアプリや機能によって異なり、外部事業者が直接取り扱う情報には各社のプライバシーポリシーが適用される場合があります。",
      "個人情報は利用目的に必要な期間のみ保存し、目的終了後は適用基準に従い速やかに削除または匿名化します。",
      "利用者は、個人情報の開示、訂正、削除、取扱いの停止、同意の撤回を求めることができます。",
      "SAME STUDIOは、適用法令およびアプリストアの年齢・プライバシー方針を遵守します。",
      "開示・削除の依頼、本方針、または各アプリの個人情報の取扱いについて、以下へお問い合わせください。",
    ][index],
    items: section.items?.map((item, itemIndex) => ({ ...item, title: ({
      "Information you provide":"利用者が提供する情報", "Information created in the app":"アプリ利用中に生成される情報", "Support and diagnostics":"お問い合わせと不具合確認", "Social sign-in":"ソーシャルログイン", "Optional permission data":"選択権限に関する情報", "Purchases and ads":"購入と広告に関する情報",
      "Features and saved records":"主要機能と記録の保持", "Location and notifications":"位置情報と通知", "Photo features":"写真機能", "Sign-in and purchases":"ログインと購入", "Reliability and support":"安定性とサポート", "Ads, legal duties, and safety":"広告・法的義務・保護",
      "Location":"位置情報", "Camera":"カメラ", "Photos":"写真", "Notifications":"通知", "Map features":"地図機能", "Backup and restore":"バックアップと復元", "Distribution and payments":"配信と決済", "Website delivery":"ウェブサイト提供", "Ads in some apps":"一部アプリの広告",
    } as Record<string,string>)[item.title] ?? item.title, text: ([
      [
        "記録、メモ、写真、タスク、回答、および一部アプリのプロフィール名・画像など、利用者が入力または選択した情報を該当機能で取り扱う場合があります。",
        "設定、保存した記録、通知設定、アプリのバージョン、機能の利用中に作成された情報が、端末またはアプリが使用する保存領域に残る場合があります。",
        "お問い合わせの際、アプリ名、端末、OS・アプリのバージョン、再現手順、および利用者が添付したスクリーンショットを取り扱う場合があります。",
        "ログインを提供する一部アプリでは、Apple、Google、Kakao、LINEが提供する最小限の識別情報とログイン状態を取り扱う場合があります。",
        "位置情報、写真、カメラ、通知は、該当機能を利用するアプリで利用者が許可した場合にのみ取り扱います。拒否すると関連機能が制限される場合があります。",
        "購入状態・復元に必要なストア情報と、広告を含む一部アプリで広告配信や表示頻度の管理に必要な限定情報を取り扱う場合があります。",
      ],
      [
        "アプリ機能の提供、作成した記録や設定の保持、利用可能な端末間機能の支援に利用します。",
        "地図上の記録、場所に基づく通知、スケジュール、リマインダーなど、利用者が選択した機能の提供に利用します。",
        "写真の撮影、選択、添付、保存を提供するアプリで、その操作を実行するために利用します。",
        "アカウントの識別、ログイン状態の保持、購入確認、サブスクリプション管理、購入復元に利用します。",
        "不具合分析、性能改善、不正利用の防止、お問い合わせ対応に必要な範囲で利用します。",
        "広告を含むアプリでの広告配信・頻度管理、法的義務の履行、サービスと利用者の保護に利用する場合があります。",
      ],
      [
        "MaparyやLacauntなど、場所の記録、地図、位置通知を提供する機能で利用される場合があります。",
        "PepeSnapなど、写真撮影機能を提供するアプリで撮影開始時に利用される場合があります。",
        "写真の選択、記録への添付、保存または復元を提供するアプリで、利用者が選んだ項目の処理に利用される場合があります。",
        "場所の通知、スケジュール、リマインダー、利用者が設定した時刻の案内を届けるために利用される場合があります。",
      ],
      [
        "ODOWなどログインを提供する一部アプリで、認証と最小限のアカウント識別情報の取得に利用される場合があります。",
        "Maparyなどの地図機能で、位置表示と場所の記録体験を提供するために利用します。",
        "MaparyなどiCloudバックアップに対応するアプリで、利用者が記録をバックアップまたは復元するときに利用します。",
        "アプリのインストール、決済、サブスクリプション管理、購入確認、購入復元に利用します。適用ストアはアプリと端末により異なります。",
        "SAME STUDIOウェブサイトの配信、保護、安定した接続の提供に利用します。すべてのアプリデータをCloudflareが取り扱うという意味ではありません。",
        "広告を含むアプリでは、設定された広告事業者が広告配信と表示頻度管理のために限定情報を取り扱う場合があります。範囲はアプリごとの案内に従います。",
      ],
    ][index]?.[itemIndex] ?? item.text) })),
    paragraphs: ([
      undefined, undefined, undefined, undefined,
      [
        "法令上の保存義務がある情報は、その義務が続く間保存される場合があります。確認されていない一律の保存期間は記載しません。",
        "一部の記録や設定は端末内だけに保存される場合があります。アプリを削除するとローカルデータは消えることがありますが、アカウント、同期、バックアップ、外部プラットフォームのデータまで自動的に削除されるとは限りません。",
        "アカウントまたはサーバーデータの削除は、アプリ内機能またはサポートメールから依頼できます。バックアップ、セキュリティログ、外部サービスのデータは、各サービスの方針と技術的な保存周期により一定期間残る場合があります。",
      ],
      [
        "端末権限はOS設定から直接変更できます。アカウントやサーバーデータに関する依頼は、アプリ内機能またはメールから受け付けます。",
        "依頼処理に必要な最小限の本人確認情報を求める場合があります。法令上の保存義務がある情報は直ちに削除できないことがあります。",
      ],
      [
        "子どもを主な対象としないアプリでも、法定代理人の同意が必要な年齢の利用者は、保護者とともにサービスを利用する必要がある場合があります。",
        "必要な保護者の同意なく子どもの情報が取り扱われたと分かった場合は、サポートへ削除などを依頼できます。アプリ固有の年齢区分や案内が優先される場合があります。",
      ],
      ["該当するアカウントや依頼を確認するため、アプリ名と必要最小限の識別情報を追加でお願いする場合があります。"],
    ][index] ?? section.paragraphs),
  })),
  deletion: { label: "データ削除を依頼 →", ariaLabel: "メールで個人データの削除を依頼", subject: "[SAME STUDIO] 個人情報削除依頼", body: "アプリ名：\n\nアカウントまたは識別情報：\n\n依頼内容：\n\n追加確認事項：\n" },
  rights: ["個人情報の開示請求", "訂正請求", "削除請求", "取扱い停止の請求", "同意の撤回", "アプリ権限の変更", "退会またはデータ削除の依頼"],
  contact: { heading: "プライバシーに関するお問い合わせ", businessLabel: "事業者名", business: "SAME STUDIO", representativeLabel: "代表者", representative: "Kim Dongchan", emailLabel: "メール", websiteLabel: "ウェブサイト", button: "プライバシー窓口へメール →", buttonAriaLabel: "メールでプライバシー窓口に問い合わせる", emailAriaLabel: "contact@samestudio.krへプライバシーについて問い合わせる", subject: "[SAME STUDIO] プライバシーに関するお問い合わせ", changeNotice: "本方針は、法令、サービス機能または運営方針の変更に伴い改定される場合があります。重要な変更はウェブサイトまたはアプリ内でお知らせすることがあります。" },
};

const zhCN: PrivacyMessages = {
  ...en,
  hero: { label: "PRIVACY ARCHIVE", title: "PRIVACY", description: "了解 SAME STUDIO 会处理哪些信息，\n以及我们如何使用和保护这些信息。", updated: "最后更新 · 2026.07.28" },
  summary: [
    { label: "MINIMUM DATA", title: "仅处理必要信息", text: "我们仅在提供服务所需的范围内处理信息。" },
    { label: "YOUR CONTROL", title: "由您掌控", text: "您可以在设备或应用中更改权限和隐私设置。" },
    { label: "SAFE HANDLING", title: "安全处理", text: "处理目的完成后，我们会按照适用标准删除信息或进行匿名化处理。" },
  ],
  contents: { label: "CONTENTS", navigationLabel: "隐私政策目录", mobileLabel: "选择隐私政策章节" },
  sections: en.sections.map((section, index) => ({
    ...section,
    title: ["我们处理的信息", "信息使用目的", "设备权限", "第三方服务", "保存与删除", "您的权利", "儿童隐私", "隐私咨询"][index],
    intro: [
      "不同应用提供的功能不同，实际处理的信息也会有所不同。我们仅在您使用的功能和授权范围内处理必要信息。",
      "我们仅将信息用于提供您选择的功能并安全运营应用。",
      "相关功能使用时才会请求权限，您可以随时在设备设置中更改。拒绝授权时，除相关功能外的其他功能会尽可能保持可用。",
      "适用服务因应用和功能而异。第三方直接处理的信息可能受其自身隐私政策约束。",
      "个人信息仅在实现处理目的所需期间保存，目的完成后会依据适用标准及时删除或匿名化。",
      "您可以请求访问、更正、删除、停止处理个人信息或撤回同意。",
      "SAME STUDIO 遵守适用法律以及应用商店的年龄与隐私政策。",
      "如需申请访问或删除信息，或对本政策及具体应用的隐私处理有疑问，请通过以下方式联系我们。",
    ][index],
    items: section.items?.map((item, itemIndex) => ({ ...item, title: ({
      "Information you provide":"您提供的信息", "Information created in the app":"使用应用时生成的信息", "Support and diagnostics":"支持与故障确认", "Social sign-in":"第三方登录", "Optional permission data":"可选权限相关信息", "Purchases and ads":"购买与广告信息",
      "Features and saved records":"核心功能与记录保存", "Location and notifications":"位置与通知", "Photo features":"照片功能", "Sign-in and purchases":"登录与购买", "Reliability and support":"稳定性与客户支持", "Ads, legal duties, and safety":"广告、法律义务与保护",
      "Location":"位置", "Camera":"相机", "Photos":"照片", "Notifications":"通知", "Map features":"地图功能", "Backup and restore":"备份与恢复", "Distribution and payments":"分发与支付", "Website delivery":"网站提供", "Ads in some apps":"部分应用中的广告",
    } as Record<string,string>)[item.title] ?? item.title, text: ([
      [
        "记录、备忘、照片、任务、回答以及部分应用中的个人资料名称和图片等由您输入或选择的信息，可能会在相关功能中被处理。",
        "用户设置、已保存记录、通知设置、应用版本以及使用功能时生成的信息，可能保留在您的设备或应用使用的存储空间中。",
        "当您联系我们时，我们可能会处理应用名称、设备、OS 与应用版本、问题复现步骤，以及您选择附上的截图。",
        "提供登录功能的部分应用可能会处理 Apple、Google、Kakao 或 LINE 提供的最少识别信息和登录状态。",
        "位置、照片、相机和通知仅会在使用相关功能的应用中，并且获得您的授权后处理。拒绝授权可能会限制相关功能。",
        "我们可能会处理确认或恢复购买所需的应用商店信息，以及部分含广告应用用于广告投放和频次管理的有限信息。",
      ],
      [
        "用于提供应用功能、保存您创建的记录与设置，以及支持可用的跨设备功能。",
        "用于提供地图记录、基于位置的提醒、日程和您选择的通知功能。",
        "用于在提供照片功能的应用中完成拍摄、选择、附加和保存照片。",
        "用于识别账号、保持登录状态、确认购买、管理订阅和恢复购买。",
        "在必要范围内用于分析错误、改善性能、防止滥用和回应客户支持请求。",
        "可能用于含广告应用的广告投放和频次管理、履行法律义务，以及保护服务与用户。",
      ],
      [
        "可能用于 Mapary、Lacaunt 等功能中的地点记录、地图或位置提醒。",
        "可能在 PepeSnap 等提供拍照功能的应用开始拍摄时使用。",
        "可能用于支持照片选择、记录附加、保存或恢复的应用，以处理您选择的项目。",
        "可能用于发送地点提醒、日程、提醒事项以及您设定时间的通知。",
      ],
      [
        "可能用于 ODOW 等提供登录功能的应用，以完成账号认证并取得最少识别信息。",
        "用于在 Mapary 等地图功能中提供位置显示和地点记录体验。",
        "用于 Mapary 等支持 iCloud 备份的应用，在您主动备份或恢复记录时提供服务。",
        "用于应用安装、付款、订阅管理、购买确认和恢复购买。适用的商店因应用和设备而异。",
        "用于传输和保护 SAME STUDIO 网站并提供稳定访问。这并不表示所有应用数据都由 Cloudflare 处理。",
        "在含广告的部分应用中，所配置的广告服务商可能为广告投放和频次管理处理有限信息，具体范围以各应用说明为准。",
      ],
    ][index]?.[itemIndex] ?? item.text) })),
    paragraphs: ([
      undefined, undefined, undefined, undefined,
      [
        "法律要求保存的信息可能会在该义务持续期间保留。对于尚未确认的情况，我们不会声明统一的固定保存期限。",
        "部分记录和设置可能只保存在您的设备上。删除应用可能会移除本地数据，但不一定会自动删除账号、同步、备份或第三方平台中的数据。",
        "您可以通过应用内功能或客户支持邮箱申请删除账号或服务器数据。备份、安全日志和第三方数据可能会依据各服务政策与技术保存周期保留一段有限时间。",
      ],
      [
        "您可以直接在操作系统设置中更改设备权限。账号或服务器数据相关请求可通过应用内功能或电子邮件提交。",
        "我们可能会要求提供核实身份所需的最少信息。受法律保存义务约束的信息可能无法立即删除。",
      ],
      [
        "对于并非主要面向儿童的应用，未达到可独立同意年龄的用户也可能需要在父母或监护人陪同下使用服务。",
        "如果您发现儿童信息在未取得所需监护人同意的情况下被处理，请联系支持申请删除或采取其他措施。具体应用的年龄分级和说明可能优先适用。",
      ],
      ["为确认相关账号或请求，我们可能会要求提供应用名称以及识别所需的最少信息。"],
    ][index] ?? section.paragraphs),
  })),
  deletion: { label: "申请删除数据 →", ariaLabel: "通过电子邮件申请删除个人数据", subject: "[SAME STUDIO] 个人信息删除申请", body: "应用名称：\n\n账号或识别信息：\n\n申请内容：\n\n补充确认事项：\n" },
  rights: ["申请访问个人信息", "申请更正", "申请删除", "申请停止处理", "撤回同意", "更改应用权限", "注销账号或申请删除数据"],
  contact: { heading: "隐私保护咨询", businessLabel: "企业名称", business: "SAME STUDIO", representativeLabel: "负责人", representative: "Kim Dongchan", emailLabel: "电子邮箱", websiteLabel: "网站", button: "发送隐私咨询邮件 →", buttonAriaLabel: "通过电子邮件联系隐私支持", emailAriaLabel: "发送隐私咨询至 contact@samestudio.kr", subject: "[SAME STUDIO] 隐私咨询", changeNotice: "本政策可能会因法律、服务功能或运营政策的变化而修订。重要变更可能会通过网站或相关应用内公告进行说明。" },
};

const zhTW: PrivacyMessages = {
  ...zhCN,
  hero: { label: "PRIVACY ARCHIVE", title: "PRIVACY", description: "瞭解 SAME STUDIO 會處理哪些資訊，\n以及我們如何使用與保護這些資訊。", updated: "最後更新 · 2026.07.28" },
  summary: [
    { label: "MINIMUM DATA", title: "僅處理必要資訊", text: "我們僅在提供服務所需的範圍內處理資訊。" },
    { label: "YOUR CONTROL", title: "由您掌控", text: "您可以在裝置或應用程式中變更權限與隱私設定。" },
    { label: "SAFE HANDLING", title: "安全處理", text: "處理目的完成後，我們會依適用標準刪除資訊或進行匿名化處理。" },
  ],
  contents: { label: "CONTENTS", navigationLabel: "隱私權政策目錄", mobileLabel: "選擇隱私權政策章節" },
  sections: zhCN.sections.map((section, index) => ({
    ...section,
    title: ["我們處理的資訊", "資訊使用目的", "裝置權限", "第三方服務", "保存與刪除", "您的權利", "兒童隱私", "隱私諮詢"][index],
    intro: [
      "不同應用程式提供的功能不同，實際處理的資訊也會有所差異。我們僅在您使用的功能與授權範圍內處理必要資訊。",
      "我們僅將資訊用於提供您選擇的功能並安全營運應用程式。",
      "相關功能使用時才會要求權限，您可以隨時在裝置設定中變更。拒絕授權時，除相關功能外的其他功能會盡可能維持可用。",
      "適用服務因應用程式與功能而異。第三方直接處理的資訊可能受其自身隱私權政策約束。",
      "個人資訊僅在達成處理目的所需期間保存，目的完成後會依適用標準及時刪除或匿名化。",
      "您可以要求查閱、更正、刪除、停止處理個人資訊或撤回同意。",
      "SAME STUDIO 遵守適用法律以及應用程式商店的年齡與隱私政策。",
      "如需申請查閱或刪除資訊，或對本政策與特定應用程式的隱私處理有疑問，請透過以下方式與我們聯絡。",
    ][index],
    items: section.items?.map((item, itemIndex) => ({
      ...item,
      title: ([
        ["您提供的資訊", "使用應用程式時產生的資訊", "支援與問題確認", "第三方登入", "可選權限相關資訊", "購買與廣告資訊"],
        ["核心功能與記錄保存", "位置與通知", "照片功能", "登入與購買", "穩定性與客戶支援", "廣告、法律義務與保護"],
        ["位置", "相機", "照片", "通知"],
        ["第三方登入", "地圖功能", "備份與復原", "發布與付款", "網站提供", "部分應用程式中的廣告"],
      ][index]?.[itemIndex] ?? item.title),
      text: ([
        [
          "記錄、備忘、照片、任務、回答，以及部分應用程式中的個人資料名稱與圖片等由您輸入或選擇的資訊，可能會在相關功能中被處理。",
          "使用者設定、已保存記錄、通知設定、應用程式版本，以及使用功能時產生的資訊，可能保留在您的裝置或應用程式使用的儲存空間中。",
          "當您聯絡我們時，我們可能會處理應用程式名稱、裝置、OS 與應用程式版本、問題重現步驟，以及您選擇附上的螢幕截圖。",
          "提供登入功能的部分應用程式可能會處理 Apple、Google、Kakao 或 LINE 提供的最少識別資訊與登入狀態。",
          "位置、照片、相機與通知僅會在使用相關功能的應用程式中，並且獲得您的授權後處理。拒絕授權可能會限制相關功能。",
          "我們可能會處理確認或復原購買所需的應用程式商店資訊，以及部分含廣告應用程式用於廣告投放與頻次管理的有限資訊。",
        ],
        [
          "用於提供應用程式功能、保存您建立的記錄與設定，以及支援可用的跨裝置功能。",
          "用於提供地圖記錄、基於位置的提醒、日程與您選擇的通知功能。",
          "用於在提供照片功能的應用程式中完成拍攝、選擇、附加與保存照片。",
          "用於識別帳號、保持登入狀態、確認購買、管理訂閱與復原購買。",
          "在必要範圍內用於分析錯誤、改善效能、防止濫用與回應客戶支援要求。",
          "可能用於含廣告應用程式的廣告投放與頻次管理、履行法律義務，以及保護服務與使用者。",
        ],
        [
          "可能用於 Mapary、Lacaunt 等功能中的地點記錄、地圖或位置提醒。",
          "可能在 PepeSnap 等提供拍照功能的應用程式開始拍攝時使用。",
          "可能用於支援照片選擇、記錄附加、保存或復原的應用程式，以處理您選擇的項目。",
          "可能用於傳送地點提醒、日程、提醒事項，以及您設定時間的通知。",
        ],
        [
          "可能用於 ODOW 等提供登入功能的應用程式，以完成帳號驗證並取得最少識別資訊。",
          "用於在 Mapary 等地圖功能中提供位置顯示與地點記錄體驗。",
          "用於 Mapary 等支援 iCloud 備份的應用程式，在您主動備份或復原記錄時提供服務。",
          "用於應用程式安裝、付款、訂閱管理、購買確認與復原購買。適用的商店因應用程式與裝置而異。",
          "用於傳輸與保護 SAME STUDIO 網站並提供穩定存取。這並不表示所有應用程式資料都由 Cloudflare 處理。",
          "在含廣告的部分應用程式中，所設定的廣告服務商可能為廣告投放與頻次管理處理有限資訊，具體範圍以各應用程式說明為準。",
        ],
      ][index]?.[itemIndex] ?? item.text),
    })),
    paragraphs: ([
      undefined, undefined, undefined, undefined,
      [
        "法律要求保存的資訊可能會在該義務持續期間保留。對於尚未確認的情況，我們不會聲明統一的固定保存期限。",
        "部分記錄與設定可能只保存在您的裝置上。刪除應用程式可能會移除本機資料，但不一定會自動刪除帳號、同步、備份或第三方平台中的資料。",
        "您可以透過應用程式內功能或客戶支援電子郵件申請刪除帳號或伺服器資料。備份、安全記錄與第三方資料可能會依據各服務政策與技術保存週期保留一段有限時間。",
      ],
      [
        "您可以直接在作業系統設定中變更裝置權限。帳號或伺服器資料相關要求可透過應用程式內功能或電子郵件提交。",
        "我們可能會要求提供核實身分所需的最少資訊。受法律保存義務約束的資訊可能無法立即刪除。",
      ],
      [
        "對於並非主要面向兒童的應用程式，未達可獨立同意年齡的使用者也可能需要在父母或監護人陪同下使用服務。",
        "如果您發現兒童資訊在未取得所需監護人同意的情況下被處理，請聯絡支援申請刪除或採取其他措施。特定應用程式的年齡分級與說明可能優先適用。",
      ],
      ["為確認相關帳號或要求，我們可能會要求提供應用程式名稱以及識別所需的最少資訊。"],
    ][index] ?? section.paragraphs),
  })),
  deletion: { label: "申請刪除資料 →", ariaLabel: "透過電子郵件申請刪除個人資料", subject: "[SAME STUDIO] 個人資訊刪除申請", body: "應用程式名稱：\n\n帳號或識別資訊：\n\n申請內容：\n\n補充確認事項：\n" },
  rights: ["申請查閱個人資訊", "申請更正", "申請刪除", "申請停止處理", "撤回同意", "變更應用程式權限", "註銷帳號或申請刪除資料"],
  contact: { heading: "隱私保護諮詢", businessLabel: "商業名稱", business: "SAME STUDIO", representativeLabel: "負責人", representative: "Kim Dongchan", emailLabel: "電子郵件", websiteLabel: "網站", button: "傳送隱私諮詢郵件 →", buttonAriaLabel: "透過電子郵件聯絡隱私支援", emailAriaLabel: "傳送隱私諮詢至 contact@samestudio.kr", subject: "[SAME STUDIO] 隱私諮詢", changeNotice: "本政策可能因法律、服務功能或營運政策變更而修訂。重要變更可能會透過網站或相關應用程式內公告說明。" },
};

export const PRIVACY_MESSAGES: Record<Locale, PrivacyMessages> = {
  ko,
  en,
  ja,
  "zh-CN": zhCN,
  "zh-TW": zhTW,
};
