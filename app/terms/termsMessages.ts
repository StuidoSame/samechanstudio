import type { Locale } from "../i18n/types";

export type TermsSection = {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  paragraphs: readonly string[];
};

export type TermsMessages = {
  hero: { label: string; title: string; description: string; updated: string; archiveAriaLabel: string };
  summary: { ariaLabel: string; items: readonly { label: string; title: string; text: string }[] };
  contents: { label: string; navigationLabel: string; detailLabel: string };
  sections: readonly TermsSection[];
  quotes: readonly { eyebrow: string; text: string }[];
  actions: {
    privacyPolicy: string;
    privacyPolicyAriaLabel: string;
    emailSupport: string;
    emailSupportAriaLabel: string;
    emailSubject: string;
    emailBody: string;
    back: string;
    backAriaLabel: string;
  };
};

const ko: TermsMessages = {
  hero: {
    label: "LEGAL ARCHIVE",
    title: "TERMS",
    description: "SAME STUDIO의 앱과 서비스를 이용하기 전에 알아두어야 할 약속을 정리했습니다.\n작은 기록과 소중한 순간이 안전하게 이어질 수 있도록 아래 내용을 확인해주세요.",
    updated: "최종 업데이트 · 2026.07.28",
    archiveAriaLabel: "법적 문서 보관함 섹션 02",
  },
  summary: {
    ariaLabel: "이용약관 핵심 요약",
    items: [
      { label: "SERVICE", title: "서비스 이용", text: "SAME STUDIO의 작은 앱들을 안전하고 올바른 방식으로 이용하기 위한 기본 원칙입니다." },
      { label: "YOUR CONTENT", title: "사용자의 콘텐츠", text: "앱에 기록하거나 저장한 콘텐츠의 권리와 책임은 사용자에게 있습니다." },
      { label: "SAFETY", title: "안전과 보호", text: "개인정보와 서비스의 안정성을 지키기 위해 필요한 범위에서 보호 조치를 적용합니다." },
    ],
  },
  contents: { label: "목차", navigationLabel: "이용약관 목차", detailLabel: "이용약관 상세 내용" },
  sections: [
    { id: "using-service", number: "01", eyebrow: "USING THE SERVICE", title: "서비스 이용", paragraphs: [
      "SAME STUDIO가 제공하는 앱과 서비스는 개인적이고 적법한 목적 안에서 이용할 수 있습니다. 사용자는 각 앱에서 안내하는 기능과 이용 방법을 존중해야 합니다.",
      "서비스의 정상적인 운영을 방해하거나 다른 사용자의 권리를 침해하는 행위, 관련 법령에 위반되는 방식의 이용은 허용되지 않습니다. 앱의 기능이나 보안을 부당하게 우회하거나 악용해서도 안 됩니다.",
    ] },
    { id: "account", number: "02", eyebrow: "ACCOUNT", title: "계정", paragraphs: [
      "일부 앱은 스토어 계정, 기기 계정 또는 앱 안에서 생성한 계정을 이용할 수 있습니다. 사용자는 정확한 정보를 제공하고 자신의 계정과 인증 정보를 안전하게 관리해야 합니다.",
      "계정의 분실이나 무단 사용이 의심되는 경우 즉시 관련 플랫폼의 보호 절차를 이용하고 SAME STUDIO에 알려주세요. 계정 기능과 지원 범위는 앱에 따라 다를 수 있습니다.",
    ] },
    { id: "content", number: "03", eyebrow: "CONTENT", title: "콘텐츠", paragraphs: [
      "사용자가 앱에서 작성하거나 저장한 사진, 기록, 텍스트 등 콘텐츠에 대한 권리는 사용자에게 유지됩니다. 사용자는 자신이 저장하는 콘텐츠를 적법하게 사용할 권한이 있어야 합니다.",
      "SAME STUDIO는 기능 제공에 필요한 범위에서만 콘텐츠를 처리합니다. 타인의 권리나 개인정보를 침해하는 콘텐츠를 입력하거나 공유해서는 안 되며, 콘텐츠의 보관과 백업 책임은 각 앱의 안내를 따릅니다.",
    ] },
    { id: "payments", number: "04", eyebrow: "PAYMENTS", title: "결제", paragraphs: [
      "유료 기능, 구독 또는 앱 내 구매는 Apple App Store나 Google Play 등 해당 스토어의 결제 정책과 이용 조건에 따라 처리됩니다. 표시되는 가격과 결제 통화는 스토어 또는 지역 설정에 따라 달라질 수 있습니다.",
      "구매 복원은 결제에 사용한 동일한 스토어 계정으로 진행해야 합니다. 환불, 결제 취소와 구독 관리는 각 스토어가 제공하는 절차를 따르며, 중복 결제 전에 구매 내역을 먼저 확인해주세요.",
    ] },
    { id: "privacy", number: "05", eyebrow: "PRIVACY", title: "개인정보", paragraphs: [
      "개인정보는 SAME STUDIO의 개인정보처리방침과 각 앱 안의 안내에 따라 처리됩니다. 앱 권한은 사진 저장, 알림 등 사용자가 선택한 기능을 제공하는 데 필요한 범위에서 요청합니다.",
      "사용자는 기기 설정에서 권한을 언제든 변경할 수 있지만, 필수 권한을 제한하면 일부 기능이 정상적으로 동작하지 않을 수 있습니다. 개인정보 관련 문의와 삭제 요청은 지원 이메일로 접수할 수 있습니다.",
    ] },
    { id: "liability", number: "06", eyebrow: "LIABILITY", title: "책임", paragraphs: [
      "SAME STUDIO는 서비스를 안정적으로 제공하기 위해 노력합니다. 다만 유지보수, 네트워크 장애, 스토어 또는 운영체제 변경과 같이 합리적으로 통제하기 어려운 사유로 서비스가 일시 중단될 수 있습니다.",
      "사용자의 설정이나 오용, 외부 서비스의 문제로 발생한 손해에 대해서는 관련 법령이 허용하는 범위에서 책임이 제한될 수 있습니다. 소비자에게 반드시 적용되는 법적 권리는 이 약관보다 우선합니다.",
    ] },
    { id: "contact", number: "07", eyebrow: "LEGAL CONTACT", title: "문의", paragraphs: [
      "약관이나 앱 이용에 관한 문의는 contact@samestudio.kr로 보내주세요. 앱 이름, 사용 기기, 운영체제 버전과 문의 내용을 함께 알려주시면 확인에 도움이 됩니다.",
      "약관이 변경되는 경우 사이트 또는 앱에서 적용 시점과 주요 내용을 안내합니다. 변경된 약관은 별도로 정한 시행일부터 적용됩니다.",
    ] },
  ],
  quotes: [
    { eyebrow: "USING SAME STUDIO", text: "작은 앱 하나에도 많은 정성을 담습니다." },
    { eyebrow: "YOUR MOMENTS", text: "모든 기록은 작은 순간에서 시작됩니다." },
  ],
  actions: {
    privacyPolicy: "개인정보처리방침 보기 →", privacyPolicyAriaLabel: "SAME STUDIO 개인정보처리방침으로 이동",
    emailSupport: "이메일 문의 →", emailSupportAriaLabel: "이메일로 이용약관 문의하기",
    emailSubject: "[SAME STUDIO] 이용약관 문의", emailBody: "앱 이름:\n\n사용 기기:\n\n운영체제 버전:\n\n문의 내용:\n",
    back: "홈으로", backAriaLabel: "SAME STUDIO 홈으로 이동",
  },
};

const en: TermsMessages = {
  hero: {
    label: "LEGAL ARCHIVE", title: "TERMS",
    description: "These terms set out the commitments to understand before using SAME STUDIO apps and services.\nPlease review them so your small records and meaningful moments can continue safely.",
    updated: "LAST UPDATED · 2026.07.28", archiveAriaLabel: "Legal archive section 02",
  },
  summary: { ariaLabel: "Key terms summary", items: [
    { label: "SERVICE", title: "Using the service", text: "The basic principles for using SAME STUDIO’s small apps safely and appropriately." },
    { label: "YOUR CONTENT", title: "Your content", text: "You retain the rights and responsibilities for content you record or save in an app." },
    { label: "SAFETY", title: "Safety and protection", text: "We apply reasonable safeguards to protect personal information and service stability." },
  ] },
  contents: { label: "CONTENTS", navigationLabel: "Terms of service contents", detailLabel: "Detailed terms of service" },
  sections: [
    { id: "using-service", number: "01", eyebrow: "USING THE SERVICE", title: "Using the service", paragraphs: [
      "SAME STUDIO apps and services may be used for personal and lawful purposes. You should follow the features and usage guidance provided in each app.",
      "You may not interfere with normal service operation, infringe another person’s rights, use a service unlawfully, or improperly bypass or misuse app features or security.",
    ] },
    { id: "account", number: "02", eyebrow: "ACCOUNT", title: "Accounts", paragraphs: [
      "Some apps may use a store account, device account, or an account created in the app. You are responsible for providing accurate information and keeping your account and credentials secure.",
      "If you suspect loss or unauthorized use, promptly use the relevant platform’s protection process and notify SAME STUDIO. Account features and support may vary by app.",
    ] },
    { id: "content", number: "03", eyebrow: "CONTENT", title: "Content", paragraphs: [
      "You retain rights in photos, records, text, and other content you create or save in an app. You must have the lawful right to use any content you store.",
      "SAME STUDIO handles content only as needed to provide features. Do not enter or share content that infringes another person’s rights or privacy. Follow each app’s guidance for storage and backup responsibilities.",
    ] },
    { id: "payments", number: "04", eyebrow: "PAYMENTS", title: "Payments", paragraphs: [
      "Paid features, subscriptions, and in-app purchases are processed under the payment policies and terms of the applicable store, such as Apple App Store or Google Play. Prices and currencies may vary by store or region.",
      "Restore purchases using the same store account used for payment. Refunds, cancellations, and subscription management follow the store’s procedures. Check your purchase history before attempting another payment.",
    ] },
    { id: "privacy", number: "05", eyebrow: "PRIVACY", title: "Privacy", paragraphs: [
      "Personal information is handled under the SAME STUDIO Privacy Policy and notices in each app. Permissions are requested only as needed for features you choose, such as saving photos or receiving notifications.",
      "You can change permissions in device settings at any time, though restricting a required permission may prevent a feature from working properly. Privacy inquiries and deletion requests may be sent by support email.",
    ] },
    { id: "liability", number: "06", eyebrow: "LIABILITY", title: "Liability", paragraphs: [
      "SAME STUDIO works to provide stable services. A service may nevertheless be temporarily interrupted by maintenance, network failures, store changes, operating-system changes, or other circumstances outside reasonable control.",
      "To the extent permitted by law, liability may be limited for losses caused by user settings or misuse, or by third-party services. Mandatory consumer rights take priority over these terms.",
    ] },
    { id: "contact", number: "07", eyebrow: "LEGAL CONTACT", title: "Contact", paragraphs: [
      "Send questions about these terms or app usage to contact@samestudio.kr. Including the app name, device, operating-system version, and details of your question will help us review it.",
      "If these terms change, the effective date and material changes will be announced on the website or in the relevant app. Revised terms apply from the separately stated effective date.",
    ] },
  ],
  quotes: [
    { eyebrow: "USING SAME STUDIO", text: "Small apps, made with a lot of care." },
    { eyebrow: "YOUR MOMENTS", text: "Every record begins with a small moment." },
  ],
  actions: {
    privacyPolicy: "VIEW PRIVACY POLICY →", privacyPolicyAriaLabel: "Open the SAME STUDIO Privacy Policy",
    emailSupport: "EMAIL SUPPORT →", emailSupportAriaLabel: "Ask about the terms by email",
    emailSubject: "[SAME STUDIO] Terms Inquiry", emailBody: "App name:\n\nDevice:\n\nOperating-system version:\n\nQuestion:\n",
    back: "HOME", backAriaLabel: "Go to the SAME STUDIO home page",
  },
};

const ja: TermsMessages = {
  hero: {
    label: "LEGAL ARCHIVE", title: "TERMS",
    description: "SAME STUDIOのアプリとサービスをご利用になる前に、ご確認いただきたい事項をまとめています。\n小さな記録と大切な瞬間を安心して残せるよう、以下の内容をご確認ください。",
    updated: "最終更新 · 2026.07.28", archiveAriaLabel: "法的文書アーカイブ セクション02",
  },
  summary: { ariaLabel: "利用規約の要約", items: [
    { label: "SERVICE", title: "サービスの利用", text: "SAME STUDIOの小さなアプリを安全かつ適切に利用するための基本原則です。" },
    { label: "YOUR CONTENT", title: "利用者のコンテンツ", text: "アプリに記録または保存したコンテンツの権利と責任は利用者に帰属します。" },
    { label: "SAFETY", title: "安全と保護", text: "個人情報とサービスの安定性を守るため、必要な範囲で保護措置を講じます。" },
  ] },
  contents: { label: "目次", navigationLabel: "利用規約の目次", detailLabel: "利用規約の詳細" },
  sections: [
    { id: "using-service", number: "01", eyebrow: "USING THE SERVICE", title: "サービスの利用", paragraphs: [
      "SAME STUDIOが提供するアプリとサービスは、個人的かつ適法な目的で利用できます。各アプリで案内する機能と利用方法を遵守してください。",
      "サービスの正常な運営を妨げる行為、他者の権利を侵害する行為、法令に反する利用、アプリの機能やセキュリティを不当に回避または悪用する行為は禁止します。",
    ] },
    { id: "account", number: "02", eyebrow: "ACCOUNT", title: "アカウント", paragraphs: [
      "一部のアプリでは、ストアアカウント、端末アカウント、またはアプリ内で作成したアカウントを利用します。正確な情報を提供し、アカウントと認証情報を安全に管理してください。",
      "紛失や不正利用が疑われる場合は、直ちに該当プラットフォームの保護手続きを行い、SAME STUDIOへご連絡ください。アカウント機能とサポート範囲はアプリにより異なります。",
    ] },
    { id: "content", number: "03", eyebrow: "CONTENT", title: "コンテンツ", paragraphs: [
      "アプリで作成または保存した写真、記録、文章などのコンテンツに関する権利は利用者に保持されます。保存するコンテンツを適法に利用する権限が必要です。",
      "SAME STUDIOは機能提供に必要な範囲でのみコンテンツを取り扱います。他者の権利やプライバシーを侵害する内容を入力または共有せず、保存とバックアップについては各アプリの案内に従ってください。",
    ] },
    { id: "payments", number: "04", eyebrow: "PAYMENTS", title: "決済", paragraphs: [
      "有料機能、サブスクリプション、アプリ内購入は、Apple App StoreやGoogle Playなど該当ストアの決済方針と利用条件に従って処理されます。価格と通貨はストアや地域により異なる場合があります。",
      "購入の復元は決済時と同じストアアカウントで行ってください。返金、取消し、サブスクリプション管理は各ストアの手続きに従い、再購入の前に購入履歴をご確認ください。",
    ] },
    { id: "privacy", number: "05", eyebrow: "PRIVACY", title: "プライバシー", paragraphs: [
      "個人情報はSAME STUDIOのプライバシーポリシーと各アプリの案内に従って取り扱います。写真の保存や通知など、選択した機能に必要な範囲で権限を求めます。",
      "端末設定からいつでも権限を変更できますが、必要な権限を制限すると一部機能が正常に動作しない場合があります。個人情報に関するお問い合わせと削除依頼はサポートメールで受け付けます。",
    ] },
    { id: "liability", number: "06", eyebrow: "LIABILITY", title: "責任", paragraphs: [
      "SAME STUDIOは安定したサービス提供に努めます。ただし、保守、通信障害、ストアやOSの変更など、合理的に管理できない事情により一時的に中断する場合があります。",
      "利用者の設定や誤用、外部サービスに起因する損害については、法令で認められる範囲で責任が制限される場合があります。消費者に強制的に適用される権利は本規約に優先します。",
    ] },
    { id: "contact", number: "07", eyebrow: "LEGAL CONTACT", title: "お問い合わせ", paragraphs: [
      "本規約またはアプリの利用に関するお問い合わせはcontact@samestudio.krへお送りください。アプリ名、端末、OSのバージョン、質問内容を添えると確認が円滑になります。",
      "本規約を変更する場合は、適用日と重要な変更内容をウェブサイトまたはアプリ内でお知らせします。改定後の規約は別途定める適用日から効力を有します。",
    ] },
  ],
  quotes: [
    { eyebrow: "USING SAME STUDIO", text: "小さなアプリにも、たくさんの心を込めて。" },
    { eyebrow: "YOUR MOMENTS", text: "すべての記録は、小さな瞬間から始まります。" },
  ],
  actions: {
    privacyPolicy: "プライバシーポリシーを見る →", privacyPolicyAriaLabel: "SAME STUDIOのプライバシーポリシーへ移動",
    emailSupport: "メールで問い合わせる →", emailSupportAriaLabel: "メールで利用規約について問い合わせる",
    emailSubject: "[SAME STUDIO] 利用規約に関するお問い合わせ", emailBody: "アプリ名：\n\n使用端末：\n\nOSバージョン：\n\nお問い合わせ内容：\n",
    back: "ホームへ", backAriaLabel: "SAME STUDIOのホームへ移動",
  },
};

const zhCN: TermsMessages = {
  hero: {
    label: "LEGAL ARCHIVE", title: "TERMS",
    description: "本页面说明使用 SAME STUDIO 应用与服务前需要了解的约定。\n请阅读以下内容，以便安全地保存每一份小记录与珍贵时刻。",
    updated: "最后更新 · 2026.07.28", archiveAriaLabel: "法律文件存档第 02 部分",
  },
  summary: { ariaLabel: "服务条款核心摘要", items: [
    { label: "SERVICE", title: "服务使用", text: "安全、适当地使用 SAME STUDIO 小型应用的基本原则。" },
    { label: "YOUR CONTENT", title: "您的内容", text: "您对在应用中记录或保存的内容保留相应权利并承担责任。" },
    { label: "SAFETY", title: "安全与保护", text: "我们会在必要范围内采取措施，保护个人信息与服务稳定性。" },
  ] },
  contents: { label: "目录", navigationLabel: "服务条款目录", detailLabel: "服务条款详细内容" },
  sections: [
    { id: "using-service", number: "01", eyebrow: "USING THE SERVICE", title: "服务使用", paragraphs: [
      "SAME STUDIO 提供的应用与服务可用于个人且合法的目的。请遵守各应用所说明的功能和使用方式。",
      "不得干扰服务正常运行、侵犯他人权利、以违法方式使用服务，或不当绕过、滥用应用功能与安全措施。",
    ] },
    { id: "account", number: "02", eyebrow: "ACCOUNT", title: "账号", paragraphs: [
      "部分应用可能使用商店账号、设备账号或在应用内创建的账号。您应提供准确信息，并妥善保护账号与验证信息。",
      "如怀疑账号遗失或被擅自使用，请立即使用相关平台的保护流程并通知 SAME STUDIO。账号功能与支持范围可能因应用而异。",
    ] },
    { id: "content", number: "03", eyebrow: "CONTENT", title: "内容", paragraphs: [
      "您保留对在应用中创建或保存的照片、记录、文字等内容的权利，并应拥有合法使用所存内容的权限。",
      "SAME STUDIO 仅在提供功能所需范围内处理内容。请勿输入或分享侵犯他人权利或隐私的内容，并按照各应用说明管理保存与备份。",
    ] },
    { id: "payments", number: "04", eyebrow: "PAYMENTS", title: "付款", paragraphs: [
      "付费功能、订阅和应用内购买依据 Apple App Store、Google Play 等适用商店的付款政策和使用条件处理。价格与币种可能因商店或地区而异。",
      "请使用付款时的同一商店账号恢复购买。退款、取消与订阅管理遵循各商店流程；再次付款前请先核对购买记录。",
    ] },
    { id: "privacy", number: "05", eyebrow: "PRIVACY", title: "隐私", paragraphs: [
      "个人信息按照 SAME STUDIO 隐私政策和各应用内说明处理。仅在提供您选择的照片保存、通知等功能所需范围内请求权限。",
      "您可以随时在设备设置中更改权限，但限制必要权限可能使部分功能无法正常运行。隐私咨询与删除请求可通过支持邮箱提交。",
    ] },
    { id: "liability", number: "06", eyebrow: "LIABILITY", title: "责任", paragraphs: [
      "SAME STUDIO 致力于稳定提供服务，但维护、网络故障、商店或操作系统变更等超出合理控制的情况可能导致服务暂时中断。",
      "在法律允许范围内，因用户设置、误用或第三方服务造成的损失，责任可能受到限制。依法必须适用的消费者权利优先于本条款。",
    ] },
    { id: "contact", number: "07", eyebrow: "LEGAL CONTACT", title: "联系我们", paragraphs: [
      "有关本条款或应用使用的问题，请发送至 contact@samestudio.kr。请附上应用名称、设备、操作系统版本与问题详情，以便我们核实。",
      "条款变更时，我们会通过网站或应用说明生效日期和重要变更。修订后的条款自另行说明的生效日期起适用。",
    ] },
  ],
  quotes: [
    { eyebrow: "USING SAME STUDIO", text: "小小的应用，也倾注许多用心。" },
    { eyebrow: "YOUR MOMENTS", text: "每一份记录，都始于一个微小的瞬间。" },
  ],
  actions: {
    privacyPolicy: "查看隐私政策 →", privacyPolicyAriaLabel: "前往 SAME STUDIO 隐私政策",
    emailSupport: "发送咨询邮件 →", emailSupportAriaLabel: "通过电子邮件咨询服务条款",
    emailSubject: "[SAME STUDIO] 服务条款咨询", emailBody: "应用名称：\n\n使用设备：\n\n操作系统版本：\n\n咨询内容：\n",
    back: "返回首页", backAriaLabel: "前往 SAME STUDIO 首页",
  },
};

const zhTW: TermsMessages = {
  hero: {
    label: "LEGAL ARCHIVE", title: "TERMS",
    description: "本頁面說明使用 SAME STUDIO 應用程式與服務前需要瞭解的約定。\n請閱讀以下內容，以便安心保存每一份小記錄與珍貴時刻。",
    updated: "最後更新 · 2026.07.28", archiveAriaLabel: "法律文件封存第 02 部分",
  },
  summary: { ariaLabel: "服務條款核心摘要", items: [
    { label: "SERVICE", title: "服務使用", text: "安全且適當地使用 SAME STUDIO 小型應用程式的基本原則。" },
    { label: "YOUR CONTENT", title: "您的內容", text: "您對在應用程式中記錄或保存的內容保留相應權利並承擔責任。" },
    { label: "SAFETY", title: "安全與保護", text: "我們會在必要範圍內採取措施，保護個人資訊與服務穩定性。" },
  ] },
  contents: { label: "目錄", navigationLabel: "服務條款目錄", detailLabel: "服務條款詳細內容" },
  sections: [
    { id: "using-service", number: "01", eyebrow: "USING THE SERVICE", title: "服務使用", paragraphs: [
      "SAME STUDIO 提供的應用程式與服務可用於個人且合法的目的。請遵守各應用程式所說明的功能與使用方式。",
      "不得干擾服務正常運作、侵犯他人權利、以違法方式使用服務，或不當繞過、濫用應用程式功能與安全措施。",
    ] },
    { id: "account", number: "02", eyebrow: "ACCOUNT", title: "帳號", paragraphs: [
      "部分應用程式可能使用商店帳號、裝置帳號或在應用程式內建立的帳號。您應提供正確資訊，並妥善保護帳號與驗證資訊。",
      "如懷疑帳號遺失或遭未授權使用，請立即使用相關平台的保護流程並通知 SAME STUDIO。帳號功能與支援範圍可能因應用程式而異。",
    ] },
    { id: "content", number: "03", eyebrow: "CONTENT", title: "內容", paragraphs: [
      "您保留對在應用程式中建立或保存的照片、記錄、文字等內容的權利，並應擁有合法使用所存內容的權限。",
      "SAME STUDIO 僅在提供功能所需範圍內處理內容。請勿輸入或分享侵犯他人權利或隱私的內容，並依照各應用程式說明管理保存與備份。",
    ] },
    { id: "payments", number: "04", eyebrow: "PAYMENTS", title: "付款", paragraphs: [
      "付費功能、訂閱與應用程式內購買依據 Apple App Store、Google Play 等適用商店的付款政策與使用條件處理。價格與幣別可能因商店或地區而異。",
      "請使用付款時的同一商店帳號復原購買。退款、取消與訂閱管理遵循各商店流程；再次付款前請先核對購買記錄。",
    ] },
    { id: "privacy", number: "05", eyebrow: "PRIVACY", title: "隱私權", paragraphs: [
      "個人資訊依照 SAME STUDIO 隱私權政策與各應用程式內說明處理。僅在提供您選擇的照片保存、通知等功能所需範圍內要求權限。",
      "您可以隨時在裝置設定中變更權限，但限制必要權限可能使部分功能無法正常運作。隱私諮詢與刪除要求可透過支援電子郵件提交。",
    ] },
    { id: "liability", number: "06", eyebrow: "LIABILITY", title: "責任", paragraphs: [
      "SAME STUDIO 致力於穩定提供服務，但維護、網路故障、商店或作業系統變更等超出合理控制的情況可能導致服務暫時中斷。",
      "在法律允許範圍內，因使用者設定、誤用或第三方服務造成的損失，責任可能受到限制。依法必須適用的消費者權利優先於本條款。",
    ] },
    { id: "contact", number: "07", eyebrow: "LEGAL CONTACT", title: "聯絡我們", paragraphs: [
      "有關本條款或應用程式使用的問題，請傳送至 contact@samestudio.kr。請附上應用程式名稱、裝置、作業系統版本與問題詳情，以便我們確認。",
      "條款變更時，我們會透過網站或應用程式說明生效日期與重要變更。修訂後的條款自另行說明的生效日期起適用。",
    ] },
  ],
  quotes: [
    { eyebrow: "USING SAME STUDIO", text: "小小的應用程式，也傾注許多用心。" },
    { eyebrow: "YOUR MOMENTS", text: "每一份記錄，都始於一個微小的瞬間。" },
  ],
  actions: {
    privacyPolicy: "查看隱私權政策 →", privacyPolicyAriaLabel: "前往 SAME STUDIO 隱私權政策",
    emailSupport: "傳送諮詢郵件 →", emailSupportAriaLabel: "透過電子郵件諮詢服務條款",
    emailSubject: "[SAME STUDIO] 服務條款諮詢", emailBody: "應用程式名稱：\n\n使用裝置：\n\n作業系統版本：\n\n諮詢內容：\n",
    back: "返回首頁", backAriaLabel: "前往 SAME STUDIO 首頁",
  },
};

export const TERMS_MESSAGES: Record<Locale, TermsMessages> = {
  ko,
  en,
  ja,
  "zh-CN": zhCN,
  "zh-TW": zhTW,
};
