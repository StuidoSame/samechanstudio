import type { Locale } from "../i18n/types";

export const ACCOUNT_DELETION_APPS = [
  {
    id: "odow",
    name: "ODOW",
    accountDeletionSupported: true,
    loginMethods: ["apple", "google", "kakao", "line"] as const,
    deletionDataItems: ["account", "identifier", "linkedData"] as const,
    retentionNotes: ["legal", "security", "backup"] as const,
    inAppDeletionInstructions: null,
  },
] as const;

type Faq = { question: string; answer: string };

export type DeleteAccountMessages = {
  metadataTitle: string;
  metadataDescription: string;
  hero: { label: string; title: string; description: string; privacy: string };
  notices: readonly { eyebrow: string; title: string; text: string }[];
  steps: { eyebrow: string; title: string; items: readonly { title: string; text: string }[] };
  form: {
    eyebrow: string; title: string; intro: string;
    app: string; email: string; emailPlaceholder: string; login: string; loginPlaceholder: string;
    loginNames: Record<string, string>; requestType: string; fullDeletion: string;
    message: string; messagePlaceholder: string; consent: string;
    privacyNotice: string; privacyLink: string; submit: string; submitting: string;
    errors: { app: string; email: string; login: string; consent: string; required: string; submitFailed: string; retry: string };
    draftReady: string; draftInstruction: string; reference: string; maskedEmail: string;
    directEmail: string; mailAria: string; subject: string;
  };
  scope: {
    eyebrow: string; title: string; deletedTitle: string; deleted: readonly string[];
    retainedTitle: string; retained: readonly string[]; localTitle: string; localText: string;
  };
  verification: { eyebrow: string; title: string; items: readonly string[]; relay: string };
  inApp: { eyebrow: string; title: string; text: string };
  faq: { eyebrow: string; title: string; items: readonly Faq[] };
  links: { privacy: string; support: string; home: string; ariaLabel: string };
};

const ko: DeleteAccountMessages = {
  metadataTitle: "계정 및 데이터 삭제 | SAME STUDIO",
  metadataDescription: "SAME STUDIO 앱 계정과 연결 데이터의 삭제를 요청하는 공식 페이지입니다.",
  hero: { label: "DATA CONTROL", title: "계정 및 데이터 삭제", description: "SAME STUDIO 앱 계정과 계정에 연결된 데이터의 삭제를 요청할 수 있습니다. 앱을 기기에서 삭제하는 것만으로는 계정이 삭제되지 않습니다.", privacy: "개인정보처리방침 보기" },
  notices: [
    { eyebrow: "ACCOUNT & DATA", title: "계정과 연결 데이터 삭제", text: "확인된 계정과 SAME STUDIO가 관리하는 계정 연결 데이터를 삭제 대상으로 처리합니다." },
    { eyebrow: "VERIFICATION", title: "최소한의 본인 확인", text: "다른 사람의 계정 삭제를 막기 위해 가입 이메일과 로그인 방식 등 필요한 최소 정보만 확인합니다." },
    { eyebrow: "IRREVERSIBLE", title: "복구되지 않을 수 있음", text: "삭제가 완료된 계정과 관련 데이터는 복구되지 않을 수 있습니다. 제출 전 범위를 확인해주세요." },
  ],
  steps: { eyebrow: "REQUEST FLOW", title: "삭제 요청 절차", items: [
    { title: "앱 선택", text: "계정 삭제를 지원하는 앱을 선택합니다." },
    { title: "가입 정보 입력", text: "가입 이메일과 실제 사용한 로그인 방식을 입력합니다." },
    { title: "범위 확인 및 동의", text: "삭제 대상과 보관 가능 항목을 읽고 최종 동의합니다." },
    { title: "메일 전송 및 결과 안내", text: "메일 앱에서 요청을 전송하면 본인 확인 후 순차 처리하고 결과를 이메일로 안내합니다." },
  ]},
  form: {
    eyebrow: "DELETE REQUEST", title: "삭제 요청 작성", intro: "현재 웹사이트에서 확인된 계정 삭제 지원 앱은 ODOW입니다. 비밀번호, 인증번호 또는 신분증 정보는 입력하지 마세요.",
    app: "앱", email: "가입 이메일", emailPlaceholder: "example@email.com", login: "로그인 방식", loginPlaceholder: "선택해주세요",
    loginNames: { apple: "Apple", google: "Google", kakao: "Kakao", line: "LINE" }, requestType: "요청 유형", fullDeletion: "계정 및 연결 데이터 전체 삭제",
    message: "추가 확인 사항 (선택)", messagePlaceholder: "계정을 확인하는 데 필요한 내용만 입력해주세요. 비밀번호나 인증번호는 입력하지 마세요.",
    consent: "계정 삭제가 완료되면 관련 데이터가 복구되지 않을 수 있음을 이해했으며, 위 계정의 삭제를 요청합니다.",
    privacyNotice: "입력한 이메일, 앱, 로그인 방식과 요청 내용은 삭제 요청 처리와 본인 확인 목적으로만 사용합니다. 요청 기록의 보관은 개인정보처리방침과 적용 법령에 따릅니다.", privacyLink: "개인정보처리방침",
    submit: "삭제 요청 메일 작성", submitting: "메일 앱을 여는 중…", errors: { app: "삭제를 요청할 앱을 선택해주세요.", email: "올바른 이메일 주소를 입력해주세요.", login: "실제로 사용한 로그인 방식을 선택해주세요.", consent: "삭제 및 복구 제한 안내에 동의해야 합니다.", required: "필수 입력 항목입니다.", submitFailed: "요청을 제출하지 못했습니다.", retry: "다시 시도해주세요." },
    draftReady: "삭제 요청 메일 초안을 준비했습니다.", draftInstruction: "메일 앱에서 전송을 완료해야 요청이 접수됩니다. 이 화면만으로는 삭제 요청이 전송되거나 완료되지 않습니다.", reference: "참조 번호", maskedEmail: "확인 이메일", directEmail: "메일 앱이 열리지 않나요? contact@samestudio.kr", mailAria: "contact@samestudio.kr로 계정 삭제 요청 이메일 보내기", subject: "[SAME STUDIO] 계정 삭제 요청",
  },
  scope: {
    eyebrow: "DATA SCOPE", title: "삭제 및 보관 범위", deletedTitle: "삭제 대상으로 처리하는 정보", deleted: ["ODOW 계정 기록", "Apple, Google, Kakao 또는 LINE에서 제공된 최소 계정 식별 정보와 로그인 상태", "SAME STUDIO 서버에 보관된 계정 연결 ODOW 기록과 설정(있는 경우)"],
    retainedTitle: "즉시 삭제되지 않을 수 있는 정보", retained: ["법령에 따라 보관 의무가 있는 기록", "부정 이용 방지와 보안에 필요한 제한된 기록", "기술적 백업 주기에 따라 한시적으로 남는 복사본"],
    localTitle: "기기 및 외부 서비스 데이터", localText: "기기에만 저장된 데이터는 앱 삭제 또는 기기 설정에서 별도로 지워야 할 수 있습니다. 계정 삭제는 Apple, Google, Kakao, LINE 계정 자체나 App Store·Google Play의 구매 기록을 삭제하지 않습니다.",
  },
  verification: { eyebrow: "IDENTITY CHECK", title: "본인 확인과 처리", items: ["메일을 전송하면 삭제 요청이 접수됩니다.", "가입 이메일과 선택한 로그인 방식으로 계정을 확인합니다.", "필요한 경우 등록 이메일 등으로 추가 확인을 요청할 수 있습니다.", "확인 후 삭제를 순차 처리하고 결과를 이메일로 안내합니다."], relay: "Apple로 로그인하며 이메일 가리기를 사용했다면 Apple 비공개 릴레이 이메일을 입력해주세요. 처리 시간은 확인 범위와 적용 의무에 따라 달라질 수 있습니다." },
  inApp: { eyebrow: "REQUEST CHANNEL", title: "웹에서 요청", text: "현재 별도로 확인된 ODOW 앱 내부 삭제 경로는 안내하지 않습니다. 이 공개 페이지에서 요청 메일을 작성해 전송해주세요." },
  faq: { eyebrow: "FAQ", title: "자주 묻는 질문", items: [
    { question: "앱을 삭제하면 계정도 삭제되나요?", answer: "아닙니다. 앱 삭제는 기기의 앱과 일부 로컬 데이터를 제거할 수 있지만 서버 계정은 남을 수 있으므로 이 페이지에서 별도로 요청해야 합니다." },
    { question: "어떤 정보가 삭제되나요?", answer: "확인된 ODOW 계정, 최소 로그인 식별 정보와 SAME STUDIO 서버의 계정 연결 기록을 대상으로 합니다. 실제 보유 정보에 따라 범위가 달라질 수 있습니다." },
    { question: "일부 데이터만 삭제할 수 있나요?", answer: "현재 확인된 절차는 계정 및 연결 데이터 전체 삭제입니다. 별도 범위가 필요하면 추가 확인 사항에 적어 문의해주세요." },
    { question: "소셜 로그인 계정도 삭제되나요?", answer: "아닙니다. ODOW 연결 정보만 대상으로 하며 Apple, Google, Kakao 또는 LINE 계정 자체는 삭제하지 않습니다." },
    { question: "구매 기록도 삭제되나요?", answer: "스토어 결제와 구매 기록은 Apple 또는 Google이 관리하며 이 요청으로 삭제되지 않습니다. 해당 스토어 정책을 확인해주세요." },
    { question: "처리에는 얼마나 걸리나요?", answer: "본인 확인과 요청 범위에 따라 순차 처리합니다. 확인이 더 필요하거나 법적 보관 의무가 있으면 시간이 달라질 수 있어 임의의 고정 기간을 안내하지 않습니다." },
    { question: "삭제한 데이터를 복구할 수 있나요?", answer: "삭제가 완료된 계정과 관련 데이터는 복구되지 않을 수 있습니다. 요청 전에 필요한 기록을 직접 확인해주세요." },
    { question: "메일 앱이 열리지 않으면 어떻게 하나요?", answer: "contact@samestudio.kr로 앱 이름, 가입 이메일, 로그인 방식과 계정 삭제 요청을 직접 보내주세요. 비밀번호나 인증번호는 보내지 마세요." },
  ]},
  links: { privacy: "PRIVACY", support: "SUPPORT", home: "HOME", ariaLabel: "관련 페이지" },
};

const en: DeleteAccountMessages = {
  ...ko,
  metadataTitle: "Account & Data Deletion | SAME STUDIO",
  metadataDescription: "The official page for requesting deletion of a SAME STUDIO app account and linked data.",
  hero: { label: "DATA CONTROL", title: "Account & Data Deletion", description: "Request deletion of your SAME STUDIO app account and data linked to it. Uninstalling an app does not by itself delete an account.", privacy: "View Privacy Policy" },
  notices: [
    { eyebrow: "ACCOUNT & DATA", title: "Delete account and linked data", text: "The verified account and account-linked data managed by SAME STUDIO are processed for deletion." },
    { eyebrow: "VERIFICATION", title: "Minimum identity check", text: "We check only the minimum information needed, such as sign-up email and login method, to prevent unauthorized deletion." },
    { eyebrow: "IRREVERSIBLE", title: "May not be recoverable", text: "A deleted account and related data may not be recoverable. Review the scope before submitting." },
  ],
  steps: { eyebrow: "REQUEST FLOW", title: "How the request works", items: [
    { title: "Choose the app", text: "Select an app that supports account deletion." }, { title: "Enter sign-up details", text: "Enter the sign-up email and login method actually used." }, { title: "Review and consent", text: "Review deletion and possible retention, then provide final consent." }, { title: "Send and receive the result", text: "Send the draft in your mail app. We verify the account, process requests in order, and reply by email." },
  ]},
  form: { ...ko.form, eyebrow: "DELETE REQUEST", title: "Prepare a deletion request", intro: "ODOW is currently the only account-deletion app confirmed on this website. Never enter a password, one-time code, or identity document.", app: "App", email: "Sign-up email", emailPlaceholder: "example@email.com", login: "Login method", loginPlaceholder: "Select one", requestType: "Request type", fullDeletion: "Delete account and all linked data", message: "Additional details (optional)", messagePlaceholder: "Enter only details needed to identify the account. Do not enter passwords or verification codes.", consent: "I understand that the account and related data may not be recoverable after deletion, and I request deletion of the account above.", privacyNotice: "The email, app, login method, and request details are used only to process the deletion request and verify identity. Request records are retained according to the Privacy Policy and applicable law.", privacyLink: "Privacy Policy", submit: "Prepare deletion email", submitting: "Opening your mail app…", errors: { app: "Select an app.", email: "Enter a valid email address.", login: "Select the login method you actually used.", consent: "You must agree to the deletion and recovery notice.", required: "This field is required.", submitFailed: "We could not submit your request.", retry: "Please try again." }, draftReady: "Your deletion-request email draft is ready.", draftInstruction: "You must send it from your mail app for the request to be received. This page alone does not send or complete deletion.", reference: "Reference", maskedEmail: "Email", directEmail: "Mail app did not open? contact@samestudio.kr", mailAria: "Email an account deletion request to contact@samestudio.kr", subject: "[SAME STUDIO] Account Deletion Request" },
  scope: { eyebrow: "DATA SCOPE", title: "Deletion and retention scope", deletedTitle: "Processed for deletion", deleted: ["ODOW account record", "Minimum account identifier and sign-in status supplied by Apple, Google, Kakao, or LINE", "Account-linked ODOW records and settings held on SAME STUDIO servers, if any"], retainedTitle: "May not be deleted immediately", retained: ["Records that must be retained by law", "Limited records needed for fraud prevention and security", "Copies temporarily remaining within technical backup cycles"], localTitle: "Device and third-party data", localText: "Data stored only on your device may need to be removed by uninstalling the app or using device settings. This request does not delete your Apple, Google, Kakao, or LINE account itself, nor App Store or Google Play purchase records." },
  verification: { eyebrow: "IDENTITY CHECK", title: "Verification and processing", items: ["The request is received after you send the email.", "We match the sign-up email and selected login method.", "If needed, we may ask for additional confirmation through the registered email or similar channel.", "After verification, we process deletion in order and notify you by email."], relay: "If you used Sign in with Apple and Hide My Email, enter your Apple private relay address. Processing time varies with verification needs and applicable obligations." },
  inApp: { eyebrow: "REQUEST CHANNEL", title: "Request on the web", text: "No separate verified ODOW in-app deletion path is currently listed. Prepare and send the request from this public page." },
  faq: { eyebrow: "FAQ", title: "Frequently asked questions", items: [
    { question: "Does uninstalling the app delete my account?", answer: "No. Uninstalling may remove the app and some local data, but a server account may remain. Submit a separate request here." }, { question: "What will be deleted?", answer: "The verified ODOW account, minimum sign-in identifiers, and account-linked records held by SAME STUDIO are covered, depending on what is actually held." }, { question: "Can I delete only some data?", answer: "The confirmed flow covers full account and linked-data deletion. Describe a different scope in the optional details for review." }, { question: "Will my social login account be deleted?", answer: "No. Only the ODOW connection is covered; your Apple, Google, Kakao, or LINE account itself is not deleted." }, { question: "Are purchase records deleted?", answer: "Store payments and purchase records are managed by Apple or Google and are not deleted by this request." }, { question: "How long does it take?", answer: "Requests are handled after identity verification. Timing varies with verification and legal retention duties, so we do not state an unverified fixed period." }, { question: "Can deleted data be recovered?", answer: "A deleted account and related data may not be recoverable. Review any records you need before requesting deletion." }, { question: "What if my mail app does not open?", answer: "Email contact@samestudio.kr directly with the app, sign-up email, login method, and deletion request. Never send a password or one-time code." },
  ]},
  links: { privacy: "PRIVACY", support: "SUPPORT", home: "HOME", ariaLabel: "Related pages" },
};

const ja: DeleteAccountMessages = {
  ...en,
  metadataTitle: "アカウントとデータの削除 | SAME STUDIO",
  metadataDescription: "SAME STUDIOアプリのアカウントと関連データの削除を依頼する公式ページです。",
  hero: { label: "DATA CONTROL", title: "アカウントとデータの削除", description: "SAME STUDIOアプリのアカウントと関連データの削除を依頼できます。アプリをアンインストールしただけではアカウントは削除されません。", privacy: "プライバシーポリシーを見る" },
  notices: [
    { eyebrow: "ACCOUNT & DATA", title: "アカウントと関連データを削除", text: "確認されたアカウントとSAME STUDIOが管理する関連データを削除対象として処理します。" },
    { eyebrow: "VERIFICATION", title: "必要最小限の本人確認", text: "第三者による削除を防ぐため、登録メールとログイン方法など必要最小限の情報のみ確認します。" },
    { eyebrow: "IRREVERSIBLE", title: "復元できない場合があります", text: "削除済みのアカウントと関連データは復元できない場合があります。送信前に範囲をご確認ください。" },
  ],
  steps: { eyebrow: "REQUEST FLOW", title: "削除依頼の手順", items: [ { title: "アプリを選択", text: "アカウント削除に対応するアプリを選びます。" }, { title: "登録情報を入力", text: "登録メールと実際に使用したログイン方法を入力します。" }, { title: "範囲を確認して同意", text: "削除対象と保管される可能性を確認し、最終同意をします。" }, { title: "メール送信と結果案内", text: "メールアプリから送信後、本人確認を行い、順次処理して結果をメールでご案内します。" } ] },
  form: { ...en.form, title: "削除依頼を作成", intro: "現在このサイトで確認できる対象アプリはODOWです。パスワード、認証コード、身分証情報は入力しないでください。", app: "アプリ", email: "登録メール", login: "ログイン方法", loginPlaceholder: "選択してください", requestType: "依頼の種類", fullDeletion: "アカウントと関連データをすべて削除", message: "追加確認事項（任意）", messagePlaceholder: "アカウント確認に必要な内容のみ入力してください。パスワードや認証コードは入力しないでください。", consent: "削除完了後は関連データを復元できない場合があることを理解し、上記アカウントの削除を依頼します。", privacyNotice: "メール、アプリ、ログイン方法、依頼内容は削除処理と本人確認の目的にのみ使用します。依頼記録はプライバシーポリシーと適用法令に従って保管します。", privacyLink: "プライバシーポリシー", submit: "削除依頼メールを作成", submitting: "メールアプリを開いています…", errors: { app: "アプリを選択してください。", email: "正しいメールアドレスを入力してください。", login: "実際に使用したログイン方法を選択してください。", consent: "削除と復元制限の案内への同意が必要です。", required: "必須入力項目です。", submitFailed: "依頼を送信できませんでした。", retry: "もう一度お試しください。" }, draftReady: "削除依頼メールの下書きを用意しました。", draftInstruction: "依頼を受け付けるにはメールアプリから送信してください。この画面だけでは送信も削除も完了しません。", reference: "参照番号", maskedEmail: "確認メール", directEmail: "メールアプリが開かない場合：contact@samestudio.kr", mailAria: "contact@samestudio.krへアカウント削除を依頼する", subject: "[SAME STUDIO] アカウント削除依頼" },
  scope: { ...en.scope, title: "削除と保管の範囲", deletedTitle: "削除対象として処理する情報", deleted: ["ODOWアカウント記録", "Apple、Google、Kakao、LINEから提供された最小限のアカウント識別情報とログイン状態", "SAME STUDIOサーバーに保存されたアカウント関連のODOW記録と設定（存在する場合）"], retainedTitle: "直ちに削除されない場合がある情報", retained: ["法令上保管が必要な記録", "不正利用防止とセキュリティに必要な限定的記録", "技術的なバックアップ周期により一時的に残るコピー"], localTitle: "端末と外部サービスのデータ", localText: "端末内だけのデータは、アプリの削除または端末設定で別途消去が必要な場合があります。この依頼はApple、Google、Kakao、LINEのアカウント自体やストアの購入履歴を削除しません。" },
  verification: { ...en.verification, title: "本人確認と処理", items: ["メールを送信すると依頼が受け付けられます。", "登録メールと選択したログイン方法でアカウントを確認します。", "必要な場合は登録メールなどで追加確認をお願いすることがあります。", "確認後、順次削除を処理し、結果をメールでお知らせします。"], relay: "Appleでサインインし「メールを非公開」を使用した場合は、Appleのプライベートリレーアドレスを入力してください。処理時間は確認内容と適用義務により異なります。" },
  inApp: { eyebrow: "REQUEST CHANNEL", title: "ウェブから依頼", text: "現在、確認済みのODOWアプリ内削除経路は別途案内していません。この公開ページでメールを作成して送信してください。" },
  faq: { ...en.faq, title: "よくある質問", items: [ { question: "アプリを削除するとアカウントも削除されますか？", answer: "いいえ。アプリと一部の端末内データは消えても、サーバーのアカウントが残る場合があります。このページから別途依頼してください。" }, { question: "どの情報が削除されますか？", answer: "確認されたODOWアカウント、最小限のログイン識別情報、SAME STUDIOが保有する関連記録が対象です。実際の保有状況により異なります。" }, { question: "一部のデータだけ削除できますか？", answer: "確認済みの手順はアカウントと関連データの全削除です。別の範囲は任意欄に記載してください。" }, { question: "ソーシャルログインのアカウントも削除されますか？", answer: "いいえ。ODOWとの接続情報だけが対象で、Apple、Google、Kakao、LINEのアカウント自体は削除されません。" }, { question: "購入履歴も削除されますか？", answer: "ストアの決済・購入履歴はAppleまたはGoogleが管理し、この依頼では削除されません。" }, { question: "処理にはどのくらいかかりますか？", answer: "本人確認後に順次処理します。確認内容や法的保管義務により異なるため、未確認の固定期間は案内しません。" }, { question: "削除したデータは復元できますか？", answer: "削除済みのアカウントと関連データは復元できない場合があります。必要な記録は依頼前に確認してください。" }, { question: "メールアプリが開かない場合は？", answer: "contact@samestudio.krへアプリ名、登録メール、ログイン方法、削除依頼を直接送ってください。パスワードや認証コードは送らないでください。" } ] },
  links: { privacy: "PRIVACY", support: "SUPPORT", home: "HOME", ariaLabel: "関連ページ" },
};

const zhCN: DeleteAccountMessages = {
  ...en,
  metadataTitle: "删除账号与数据 | SAME STUDIO",
  metadataDescription: "用于申请删除 SAME STUDIO 应用账号及关联数据的官方页面。",
  hero: { label: "DATA CONTROL", title: "删除账号与数据", description: "您可以申请删除 SAME STUDIO 应用账号及其关联数据。仅卸载应用并不会删除账号。", privacy: "查看隐私政策" },
  notices: [ { eyebrow: "ACCOUNT & DATA", title: "删除账号与关联数据", text: "经确认的账号及 SAME STUDIO 管理的账号关联数据将进入删除流程。" }, { eyebrow: "VERIFICATION", title: "最低限度身份验证", text: "为防止他人擅自删除，我们仅核对注册邮箱和登录方式等必要信息。" }, { eyebrow: "IRREVERSIBLE", title: "可能无法恢复", text: "删除完成后的账号和相关数据可能无法恢复，请在提交前确认范围。" } ],
  steps: { eyebrow: "REQUEST FLOW", title: "删除申请流程", items: [ { title: "选择应用", text: "选择支持账号删除的应用。" }, { title: "填写注册信息", text: "填写注册邮箱和实际使用的登录方式。" }, { title: "确认范围并同意", text: "阅读删除范围及可能保留的项目后进行最终确认。" }, { title: "发送邮件并等待结果", text: "在邮件应用中发送后，我们将核验身份、依次处理并通过邮件告知结果。" } ] },
  form: { ...en.form, title: "填写删除申请", intro: "目前本网站确认支持账号删除的应用仅为 ODOW。请勿输入密码、验证码或身份证件信息。", app: "应用", email: "注册邮箱", login: "登录方式", loginPlaceholder: "请选择", requestType: "申请类型", fullDeletion: "删除账号及全部关联数据", message: "补充信息（可选）", messagePlaceholder: "仅填写核验账号所需的信息，请勿输入密码或验证码。", consent: "我已了解账号删除完成后相关数据可能无法恢复，并申请删除上述账号。", privacyNotice: "填写的邮箱、应用、登录方式和申请内容仅用于处理删除申请及身份核验。申请记录依照隐私政策和适用法律保留。", privacyLink: "隐私政策", submit: "提交删除请求", submitting: "正在打开邮件应用…", errors: { app: "请选择应用。", email: "请输入有效的邮箱地址。", login: "请选择实际使用的登录方式。", consent: "必须同意删除及无法恢复提示。", required: "此项为必填项。", submitFailed: "无法提交您的申请。", retry: "请重试。" }, draftReady: "删除申请邮件草稿已准备好。", draftInstruction: "必须在邮件应用中完成发送，申请才会被接收。仅停留在此页面不会发送申请或完成删除。", reference: "参考编号", maskedEmail: "确认邮箱", directEmail: "邮件应用未打开？contact@samestudio.kr", mailAria: "向 contact@samestudio.kr 发送账号删除申请", subject: "[SAME STUDIO] 账号删除申请" },
  scope: { ...en.scope, title: "删除与保留范围", deletedTitle: "进入删除流程的信息", deleted: ["ODOW 账号记录", "Apple、Google、Kakao 或 LINE 提供的最低限度账号标识与登录状态", "SAME STUDIO 服务器中与账号关联的 ODOW 记录和设置（如有）"], retainedTitle: "可能不会立即删除的信息", retained: ["依法必须保留的记录", "防止滥用与保障安全所需的有限记录", "在技术备份周期内暂时保留的副本"], localTitle: "设备及第三方数据", localText: "仅保存在设备上的数据可能需要通过卸载应用或设备设置另行删除。本申请不会删除 Apple、Google、Kakao、LINE 账号本身，也不会删除应用商店购买记录。" },
  verification: { ...en.verification, title: "身份核验与处理", items: ["发送邮件后，删除申请才会被接收。", "我们将根据注册邮箱和所选登录方式核对账号。", "必要时可能通过注册邮箱等渠道要求进一步确认。", "核验后将依次处理删除并通过邮件告知结果。"], relay: "如果使用 Apple 登录并启用了隐藏邮箱，请填写 Apple 私密转发邮箱。处理时间会因核验范围和适用义务而异。" },
  inApp: { eyebrow: "REQUEST CHANNEL", title: "通过网页申请", text: "目前没有另行列出经确认的 ODOW 应用内删除路径。请在此公开页面生成并发送申请邮件。" },
  faq: { ...en.faq, title: "常见问题", items: [ { question: "卸载应用会删除账号吗？", answer: "不会。卸载可能移除应用和部分本地数据，但服务器账号可能仍然存在，请在此单独申请。" }, { question: "哪些信息会被删除？", answer: "经确认的 ODOW 账号、最低限度登录标识和 SAME STUDIO 持有的账号关联记录属于申请范围，具体取决于实际持有情况。" }, { question: "可以只删除部分数据吗？", answer: "目前确认的流程为删除账号及全部关联数据。如需其他范围，请在补充信息中说明。" }, { question: "社交登录账号也会被删除吗？", answer: "不会。仅处理与 ODOW 的关联，Apple、Google、Kakao 或 LINE 账号本身不会被删除。" }, { question: "购买记录也会被删除吗？", answer: "商店付款和购买记录由 Apple 或 Google 管理，不会通过本申请删除。" }, { question: "处理需要多长时间？", answer: "身份核验后依次处理。时间会因核验及法律保留义务而异，因此不提供未经确认的固定期限。" }, { question: "删除的数据可以恢复吗？", answer: "删除后的账号及相关数据可能无法恢复，请在申请前确认所需记录。" }, { question: "邮件应用无法打开怎么办？", answer: "请直接发送邮件至 contact@samestudio.kr，注明应用、注册邮箱、登录方式和删除请求。切勿发送密码或验证码。" } ] },
  links: { privacy: "PRIVACY", support: "SUPPORT", home: "HOME", ariaLabel: "相关页面" },
};

const zhTW: DeleteAccountMessages = {
  ...zhCN,
  metadataTitle: "刪除帳號與資料 | SAME STUDIO",
  metadataDescription: "用於申請刪除 SAME STUDIO 應用程式帳號及關聯資料的官方頁面。",
  hero: { label: "DATA CONTROL", title: "刪除帳號與資料", description: "您可以申請刪除 SAME STUDIO 應用程式帳號及其關聯資料。僅移除應用程式並不會刪除帳號。", privacy: "查看隱私權政策" },
  notices: [ { eyebrow: "ACCOUNT & DATA", title: "刪除帳號與關聯資料", text: "經確認的帳號及 SAME STUDIO 管理的帳號關聯資料將進入刪除流程。" }, { eyebrow: "VERIFICATION", title: "最低限度身分驗證", text: "為防止他人擅自刪除，我們僅核對註冊電子郵件和登入方式等必要資訊。" }, { eyebrow: "IRREVERSIBLE", title: "可能無法復原", text: "刪除完成後的帳號和相關資料可能無法復原，請在提交前確認範圍。" } ],
  steps: { eyebrow: "REQUEST FLOW", title: "刪除申請流程", items: [ { title: "選擇應用程式", text: "選擇支援帳號刪除的應用程式。" }, { title: "填寫註冊資訊", text: "填寫註冊電子郵件和實際使用的登入方式。" }, { title: "確認範圍並同意", text: "閱讀刪除範圍及可能保留的項目後進行最終確認。" }, { title: "傳送郵件並等待結果", text: "在郵件應用程式中傳送後，我們將核驗身分、依序處理並以郵件告知結果。" } ] },
  form: { ...zhCN.form, title: "填寫刪除申請", intro: "目前本網站確認支援帳號刪除的應用程式僅為 ODOW。請勿輸入密碼、驗證碼或身分證件資訊。", app: "應用程式", email: "註冊電子郵件", login: "登入方式", loginPlaceholder: "請選擇", requestType: "申請類型", fullDeletion: "刪除帳號及全部關聯資料", message: "補充資訊（選填）", messagePlaceholder: "僅填寫核驗帳號所需的資訊，請勿輸入密碼或驗證碼。", consent: "我已瞭解帳號刪除完成後相關資料可能無法復原，並申請刪除上述帳號。", privacyNotice: "填寫的電子郵件、應用程式、登入方式和申請內容僅用於處理刪除申請及身分核驗。申請記錄依隱私權政策和適用法律保留。", privacyLink: "隱私權政策", submit: "提交刪除請求", submitting: "正在開啟郵件應用程式…", errors: { app: "請選擇應用程式。", email: "請輸入有效的電子郵件地址。", login: "請選擇實際使用的登入方式。", consent: "必須同意刪除及無法復原提示。", required: "此欄位為必填。", submitFailed: "無法提交您的申請。", retry: "請再試一次。" }, draftReady: "刪除申請郵件草稿已準備好。", draftInstruction: "必須在郵件應用程式中完成傳送，申請才會被接收。僅停留在此頁面不會傳送申請或完成刪除。", reference: "參考編號", maskedEmail: "確認電子郵件", directEmail: "郵件應用程式未開啟？contact@samestudio.kr", mailAria: "向 contact@samestudio.kr 傳送帳號刪除申請", subject: "[SAME STUDIO] 帳號刪除申請" },
  scope: { ...zhCN.scope, title: "刪除與保留範圍", deletedTitle: "進入刪除流程的資訊", deleted: ["ODOW 帳號記錄", "Apple、Google、Kakao 或 LINE 提供的最低限度帳號識別與登入狀態", "SAME STUDIO 伺服器中與帳號關聯的 ODOW 記錄和設定（如有）"], retainedTitle: "可能不會立即刪除的資訊", retained: ["依法必須保留的記錄", "防止濫用與保障安全所需的有限記錄", "在技術備份週期內暫時保留的副本"], localTitle: "裝置及第三方資料", localText: "僅儲存在裝置上的資料可能需要透過移除應用程式或裝置設定另行刪除。本申請不會刪除 Apple、Google、Kakao、LINE 帳號本身，也不會刪除應用程式商店購買記錄。" },
  verification: { ...zhCN.verification, title: "身分核驗與處理", items: ["傳送郵件後，刪除申請才會被接收。", "我們將根據註冊電子郵件和所選登入方式核對帳號。", "必要時可能透過註冊電子郵件等管道要求進一步確認。", "核驗後將依序處理刪除並以郵件告知結果。"], relay: "如果使用 Apple 登入並啟用了隱藏電子郵件，請填寫 Apple 私密轉寄電子郵件。處理時間會因核驗範圍和適用義務而異。" },
  inApp: { eyebrow: "REQUEST CHANNEL", title: "透過網頁申請", text: "目前沒有另行列出經確認的 ODOW 應用程式內刪除路徑。請在此公開頁面產生並傳送申請郵件。" },
  faq: { ...zhCN.faq, title: "常見問題", items: [ { question: "移除應用程式會刪除帳號嗎？", answer: "不會。移除可能刪除應用程式和部分本機資料，但伺服器帳號可能仍然存在，請在此另行申請。" }, { question: "哪些資訊會被刪除？", answer: "經確認的 ODOW 帳號、最低限度登入識別和 SAME STUDIO 持有的帳號關聯記錄屬於申請範圍，具體取決於實際持有情況。" }, { question: "可以只刪除部分資料嗎？", answer: "目前確認的流程為刪除帳號及全部關聯資料。如需其他範圍，請在補充資訊中說明。" }, { question: "社群登入帳號也會被刪除嗎？", answer: "不會。僅處理與 ODOW 的關聯，Apple、Google、Kakao 或 LINE 帳號本身不會被刪除。" }, { question: "購買記錄也會被刪除嗎？", answer: "商店付款和購買記錄由 Apple 或 Google 管理，不會透過本申請刪除。" }, { question: "處理需要多久？", answer: "身分核驗後依序處理。時間會因核驗及法律保留義務而異，因此不提供未經確認的固定期限。" }, { question: "刪除的資料可以復原嗎？", answer: "刪除後的帳號及相關資料可能無法復原，請在申請前確認所需記錄。" }, { question: "郵件應用程式無法開啟怎麼辦？", answer: "請直接傳送郵件至 contact@samestudio.kr，註明應用程式、註冊電子郵件、登入方式和刪除申請。切勿傳送密碼或驗證碼。" } ] },
  links: { privacy: "PRIVACY", support: "SUPPORT", home: "HOME", ariaLabel: "相關頁面" },
};

export const DELETE_ACCOUNT_MESSAGES: Record<Locale, DeleteAccountMessages> = {
  ko,
  en,
  ja,
  "zh-CN": zhCN,
  "zh-TW": zhTW,
};
