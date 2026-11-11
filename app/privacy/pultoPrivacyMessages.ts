import type { Locale } from "../i18n/types";
import type { PrivacySection } from "./privacyMessages";

export const PULTO_PRIVACY_MESSAGES: Record<Locale, {
  updated: string;
  section: PrivacySection;
}> = {
  ko: {
    updated: "최종 업데이트 · 2026.11.11",
    section: {
      id: "pulto", number: "09", eyebrow: "PULTO · ANDROID & WEAR OS",
      title: "PULTO — 운동 및 건강 데이터 처리 안내",
      intro: "이 안내는 SAME STUDIO가 개발·제공하는 PULTO의 Android 휴대전화 및 Wear OS 앱에 적용됩니다. 다른 SAME STUDIO 앱이 같은 건강 데이터를 처리한다는 의미는 아닙니다. 선택적 연결 기능의 이용 가능 여부는 배포 구성, 기기와 제공자의 지원·승인 및 사용자가 허용한 권한에 따라 달라집니다.",
      items: [
        {
          label: "01 · ACTIVITY DATA", title: "처리하는 운동 및 활동 정보",
          text: "PULTO에서 생성한 운동 시작·종료 시각, 운동 시간, 목표 BPM·리듬 등 운동 결과와 설정을 처리합니다. Wear OS에서 걸음 감지를 선택하면 걸음 센서 이벤트로 측정 구간과 실제 케이던스(분당 걸음 수)를 계산합니다. Health Connect 연결 시에는 허용된 범위에서 운동 시간대의 걸음 수·케이던스·데이터 출처와, 해당 시간과 겹치는 Samsung Health 달리기·트레드밀 운동의 종류·시작 및 종료 시각·제공된 기기 정보를 읽습니다. 별도 조건을 충족해 Samsung Health 직접 연결을 이용하는 경우에는 걷기를 포함한 운동 정보, 운동 식별값·구간·시간과 기기 정보, 해당 시간대의 걸음 수·케이던스도 읽을 수 있습니다.",
        },
        {
          label: "02 · PURPOSE", title: "운동 데이터의 이용 목적",
          text: "메트로놈의 운동 박자를 제공하고, 운동 결과를 보관·표시하며, 선택한 운동 시간대의 걸음 수와 케이던스 및 외부 운동 기록을 상세 화면에서 확인하는 데 이용합니다. 목표 BPM은 사용자가 정한 박자이며 센서로 측정한 실제 케이던스와 구분합니다. Health Connect로 읽은 정보는 이러한 사용자에게 보이는 운동·피트니스 기능에만 이용하며 광고, 판매 또는 데이터 중개 목적으로 이용하지 않습니다.",
        },
        {
          label: "03 · OPTIONAL PERMISSIONS", title: "활동 감지 및 Health Connect 권한",
          text: "Wear OS의 선택적 걸음 감지는 사용자가 기능을 선택하고 활동 인식(ACTIVITY_RECOGNITION)을 허용한 경우에 작동합니다. 측정은 지원되는 걸음 센서를 사용하며 화면이 비활성화되거나 운동이 일시정지·종료되면 센서 수신을 중단합니다. 휴대전화의 Health Connect 연결은 Android 14 이상에서 사용자가 선택하며, 걸음 수·케이던스 읽기(READ_STEPS)와 운동 세션 읽기(READ_EXERCISE)를 별도로 요청합니다. PULTO는 이 경로로 건강 기록을 쓰지 않습니다. 권한을 거부하거나 철회하면 해당 조회·측정이 제한되며 기본 메트로놈은 계속 이용할 수 있습니다.",
        },
        {
          label: "04 · STORAGE & TRANSFER", title: "데이터 저장 및 Phone–Wear 전달",
          text: "휴대전화에서 만든 PULTO 운동 결과는 휴대전화의 앱 전용 파일에 저장합니다. Wear에서 만든 운동 결과와 측정 케이던스는 워치의 앱 전용 파일에 저장하고 연결된 휴대전화로 전달해 휴대전화에도 보관합니다. 설정은 각 앱의 로컬 저장소에 저장합니다. 이 운동 결과·케이던스 전달과 Phone–Wear 간 설정·재생 상태·사용 권한 확인 정보 전달에는 Google Play services의 Wear OS Data Layer를 사용합니다. Data Layer는 암호화된 Bluetooth 연결을 사용하거나 연결 상황에 따라 Google 서버를 경유하는 종단 간 암호화 전송을 사용할 수 있습니다. Health Connect 및 Samsung Health 조회값은 화면 표시를 위해 메모리에서 처리하며 PULTO 운동 결과 파일에 복사하거나 Wear로 동기화하지 않습니다. 휴대전화 앱 데이터는 Android 시스템 백업·기기 이전 설정에 따라 백업·복원될 수 있으므로 기기에만 남는다고 보장하지 않습니다.",
        },
        {
          label: "05 · EXTERNAL PLATFORMS", title: "외부 플랫폼과 데이터 공유",
          text: "Health Connect와 Samsung Health는 사용자가 허용한 기록의 제공 경로이며, 삼성 기록이 Health Connect에 제공되어야 해당 경로로 조회할 수 있습니다. Samsung Health Data SDK 직접 연결은 Health Connect와 별개이며 제공자 승인·지원·권한 조건에 따라 사용할 수 없을 수 있습니다. PULTO Android는 운동·건강 데이터를 SAME STUDIO의 서버로 업로드하거나 광고·분석 서비스에 보내는 기능을 사용하지 않습니다. Google은 Data Layer 전송과 Google Play 결제·구매 복원을 제공합니다. Premium 확인에는 상품·구매 상태와 구매 검증 정보를 이용하며 연결된 Wear에는 상품·구매 상태, 구매 토큰의 해시와 검증 시각 등 사용 권한 확인 정보를 전달합니다. PULTO는 결제 카드 정보를 직접 받지 않습니다. 별도 구성된 온라인 심사 인증을 이용하는 경우 심사용 인증 정보, 앱·상품 정보, 요청 식별자와 Phone·Wear의 설치 및 연결 기기 식별자를 인증 서버에 보내 사용 권한을 확인합니다. 운동·건강 데이터는 이 요청에 포함하지 않습니다. Google·Samsung이 직접 처리하는 플랫폼 데이터와 백업에는 각 제공자의 개인정보처리방침과 사용자 설정이 적용됩니다.",
        },
        {
          label: "06 · RETENTION & CONTROL", title: "보관 기간, 삭제 및 권한 철회",
          text: "저장된 PULTO 운동 결과·케이던스·설정에는 자동 만료 기간을 두지 않으며 앱 데이터가 삭제될 때까지 보관합니다. 현재 Android 앱에는 운동 기록을 개별 삭제하는 기능이 없습니다. 각 기기의 설정에서 PULTO의 앱 저장공간 데이터 삭제를 이용하면 해당 기기의 기록과 설정이 함께 삭제됩니다. 한 기기의 데이터 삭제는 상대 기기의 사본·Data Layer 전송 대기 사본·시스템 백업의 삭제를 보장하지 않으며, 남은 기록은 다시 전달될 수 있습니다. 두 기기의 앱 데이터와 백업을 각각 관리해야 합니다. 활동 인식은 워치 앱 권한에서, Health Connect와 Samsung Health 접근은 해당 플랫폼의 앱 권한 설정에서 철회할 수 있습니다. 철회 후에는 새 조회·측정이 제한되지만 기존 PULTO 기록이나 제공자 원본은 자동 삭제되지 않습니다. Health Connect·Samsung Health 원본은 해당 플랫폼에서 삭제해야 하며, Google Play 구매 내역 역시 앱 데이터 삭제로 삭제되지 않습니다.",
        },
        {
          label: "07 · PRIVACY CONTACT", title: "개인정보 보호 문의",
          text: "PULTO의 개인정보 처리, 권한 또는 데이터 삭제에 관한 문의는 SAME STUDIO의 contact@samestudio.kr로 보내주세요. 앱 이름 PULTO, Android 또는 Wear OS 여부와 요청 내용을 알려주시면 됩니다. 문의를 위해 건강 기록 원본이나 결제·심사용 인증 정보를 보내실 필요는 없습니다.",
        },
      ],
    },
  },
  en: {
    updated: "LAST UPDATED · 2026.11.11",
    section: {
      id: "pulto", number: "09", eyebrow: "PULTO · ANDROID & WEAR OS",
      title: "PULTO — Exercise and health data",
      intro: "This notice applies to the PULTO Android phone and Wear OS apps developed and provided by SAME STUDIO. It does not mean that other SAME STUDIO apps handle the same health data. Optional connections depend on the distributed build, device, provider support and approval, and permissions you grant.",
      items: [
        {
          label: "01 · ACTIVITY DATA", title: "Exercise and activity information",
          text: "PULTO handles workout results and settings, including workout start and end times, duration, target BPM and rhythm. If you choose step sensing on Wear OS, step sensor events are used to calculate measurement intervals and actual cadence (steps per minute). With Health Connect permission, PULTO reads steps, cadence and data sources for the workout interval, and overlapping Samsung Health running and treadmill sessions, including type, start/end times and available device information. Where the separate requirements for direct Samsung Health access are met, it can also read walking workouts, exercise identifiers, segments, timing and device information, and interval steps and cadence.",
        },
        {
          label: "02 · PURPOSE", title: "How workout data is used",
          text: "Data supports the workout metronome, saved results, and displaying steps, cadence and external exercise records for the selected workout interval in session details. Target BPM is the beat you choose and is separate from sensor-measured cadence. Information read through Health Connect is used only for these visible exercise and fitness features, and is not used for advertising, sale or data brokering.",
        },
        {
          label: "03 · OPTIONAL PERMISSIONS", title: "Activity sensing and Health Connect permissions",
          text: "Optional Wear OS step sensing runs when you choose it and allow activity recognition (ACTIVITY_RECOGNITION). It uses a supported step sensor and stops receiving sensor events when the screen becomes inactive or the workout pauses or ends. Health Connect is an optional phone connection on Android 14 or later. Step/cadence reading (READ_STEPS) and exercise-session reading (READ_EXERCISE) are requested separately. PULTO does not write health records through this connection. Denying or revoking permission limits the related reading or sensing; the basic metronome remains available.",
        },
        {
          label: "04 · STORAGE & TRANSFER", title: "Storage and Phone–Wear transfer",
          text: "Phone-created PULTO workout results are saved in app-private files on the phone. Wear-created results and measured cadence are saved in app-private files on the watch and transferred to the connected phone, which also retains a copy. Settings are kept in each app’s local storage. These result/cadence transfers and Phone–Wear settings, playback-state and access-verification transfers use Google Play services’ Wear OS Data Layer. Data Layer may use encrypted Bluetooth or, depending on connectivity, end-to-end encrypted transfer via Google servers. Health Connect and Samsung Health query values are processed in memory for display; they are not copied into PULTO workout result files or synced to Wear. Phone app data may be backed up or restored according to Android system backup and device-transfer settings, so it is not guaranteed to remain solely on the device.",
        },
        {
          label: "05 · EXTERNAL PLATFORMS", title: "External platforms and data sharing",
          text: "Health Connect and Samsung Health provide records you permit PULTO to access. Samsung records must be available in Health Connect to be read through that route. Direct Samsung Health Data SDK access is separate and may be unavailable depending on provider approval, support and permissions. PULTO Android does not use a feature that uploads workout or health data to a SAME STUDIO server or sends it to advertising or analytics services. Google provides Data Layer transport and Google Play purchases and restoration. Product, purchase-status and purchase-verification information support Premium access; connected Wear receives access-verification information such as product, purchase status, purchase-token hash and verification time. PULTO does not directly receive payment-card information. If a separately configured online reviewer authorization service is used, reviewer authentication information, app/product information, request identifiers, and Phone/Wear installation and connected-device identifiers are sent to the authorization server to verify access. Workout and health data are not included in that request. Platform data and backups handled directly by Google or Samsung are subject to their privacy policies and your settings.",
        },
        {
          label: "06 · RETENTION & CONTROL", title: "Retention, deletion and revoking access",
          text: "Saved PULTO workout results, cadence and settings have no automatic expiry and remain until the app data is deleted. The Android app currently has no individual workout deletion feature. You can clear PULTO’s app storage data in each device’s settings; this removes that device’s records and settings together. Clearing one device does not guarantee deletion of peer-device copies, queued Data Layer copies or system backups, and remaining records may be transferred again. Manage app data on both devices and backups separately. Revoke activity recognition in the watch’s app permissions, and Health Connect or Samsung Health access in the relevant platform’s app-permission settings. Revocation limits new reads or sensing but does not automatically erase existing PULTO records or provider originals. Delete Health Connect and Samsung Health originals in those platforms. Clearing app data also does not delete Google Play purchase history.",
        },
        {
          label: "07 · PRIVACY CONTACT", title: "Privacy inquiries",
          text: "Contact SAME STUDIO at contact@samestudio.kr about PULTO privacy, permissions or data deletion. Include the app name PULTO, whether you use Android phone or Wear OS, and your request. You do not need to send original health records or purchase or reviewer credentials to make an inquiry.",
        },
      ],
    },
  },
  ja: {
    updated: "最終更新 · 2026.11.11",
    section: {
      id: "pulto", number: "09", eyebrow: "PULTO · ANDROID & WEAR OS",
      title: "PULTO — 運動・健康データの取り扱い",
      intro: "本案内は、SAME STUDIOが開発・提供するPULTOのAndroidスマートフォン版およびWear OS版に適用されます。他のSAME STUDIOアプリが同じ健康データを扱うことを意味しません。任意の接続機能は、配布構成、端末、提供元の対応・承認、許可された権限によって利用可否が異なります。",
      items: [
        {
          label: "01 · ACTIVITY DATA", title: "取り扱う運動・活動情報",
          text: "PULTOで作成した運動の開始・終了時刻、運動時間、目標BPM・リズムなどの結果と設定を扱います。Wear OSで歩数検知を選ぶと、歩数センサーのイベントから測定区間と実際のケイデンス（1分当たりの歩数）を計算します。Health Connectの許可範囲で、運動時間帯の歩数・ケイデンス・データ提供元、および時間が重なるSamsung Healthのランニング・トレッドミル記録の種類、開始・終了時刻、提供された端末情報を読み取ります。別途の条件を満たしてSamsung Healthに直接接続する場合は、ウォーキングを含む運動情報、運動識別値・区間・時間と端末情報、該当時間帯の歩数・ケイデンスも読み取ることがあります。",
        },
        {
          label: "02 · PURPOSE", title: "運動データの利用目的",
          text: "運動用メトロノームの提供、運動結果の保存・表示、選んだ運動時間帯の歩数・ケイデンスと外部の運動記録を詳細画面で確認するために利用します。目標BPMは利用者が選んだ拍子であり、センサーで測定する実際のケイデンスとは区別します。Health Connectから読み取った情報は、これらの画面上の運動・フィットネス機能にのみ利用し、広告、販売、データ仲介には利用しません。",
        },
        {
          label: "03 · OPTIONAL PERMISSIONS", title: "活動検知とHealth Connectの権限",
          text: "Wear OSの任意の歩数検知は、機能を選び、身体活動認識（ACTIVITY_RECOGNITION）を許可した場合に動作します。対応する歩数センサーを使用し、画面が非アクティブになった場合や運動の一時停止・終了時にはセンサーの受信を停止します。スマートフォンのHealth Connect接続はAndroid 14以降で任意に選択でき、歩数・ケイデンスの読み取り（READ_STEPS）と運動セッションの読み取り（READ_EXERCISE）を個別に要求します。この接続では健康記録を書き込みません。拒否・取り消しにより関連する読み取り・測定は制限されますが、基本のメトロノームは利用できます。",
        },
        {
          label: "04 · STORAGE & TRANSFER", title: "保存場所とPhone–Wear間の転送",
          text: "スマートフォンで作成したPULTO運動結果は、そのスマートフォンのアプリ専用ファイルに保存します。Wearで作成した運動結果と測定ケイデンスはウォッチのアプリ専用ファイルに保存し、接続したスマートフォンにも転送して保存します。設定は各アプリのローカルストレージに保存します。この結果・ケイデンスの転送とPhone–Wear間の設定・再生状態・利用権限確認情報の転送には、Google Play servicesのWear OS Data Layerを使用します。Data Layerは暗号化されたBluetooth、または接続状況に応じてGoogleサーバーを経由するエンドツーエンド暗号化通信を利用する場合があります。Health Connect・Samsung Healthの照会値は表示用にメモリ内で処理し、PULTOの運動結果ファイルへのコピーやWearへの同期は行いません。スマートフォンのアプリデータはAndroidのシステムバックアップ・端末移行設定によりバックアップ・復元される場合があり、端末内だけに残るとは保証しません。",
        },
        {
          label: "05 · EXTERNAL PLATFORMS", title: "外部プラットフォームとデータ共有",
          text: "Health ConnectとSamsung Healthは、利用者が許可した記録の提供経路です。Health Connect経由では、Samsungの記録がそこに提供されている必要があります。Samsung Health Data SDKによる直接接続は別経路で、提供元の承認・対応・権限条件により利用できない場合があります。PULTO Androidは運動・健康データをSAME STUDIOのサーバーにアップロードしたり、広告・分析サービスに送信する機能を使用しません。GoogleはData Layerの転送とGoogle Playでの購入・復元を提供します。Premiumの確認には商品・購入状態・購入検証情報を利用し、接続したWearには商品・購入状態・購入トークンのハッシュ・検証時刻などの利用権限確認情報を転送します。PULTOは支払いカード情報を直接受け取りません。別途設定されたオンライン審査認証を利用する場合は、審査用認証情報、アプリ・商品情報、要求識別子、Phone・Wearのインストールおよび接続端末の識別子を認証サーバーへ送り、利用権限を確認します。この要求に運動・健康データは含みません。Google・Samsungが直接扱うプラットフォームデータやバックアップには、各社のプライバシーポリシーと利用者の設定が適用されます。",
        },
        {
          label: "06 · RETENTION & CONTROL", title: "保存期間・削除・権限の取り消し",
          text: "保存したPULTOの運動結果・ケイデンス・設定には自動期限がなく、アプリデータが削除されるまで保持します。現在のAndroidアプリには運動記録を個別に削除する機能はありません。各端末の設定からPULTOのアプリストレージのデータを消去すると、その端末の記録と設定がまとめて削除されます。一方の端末の消去は相手端末のコピー・Data Layer転送待ちコピー・システムバックアップの削除を保証せず、残った記録が再転送される場合があります。両端末のアプリデータとバックアップを個別に管理してください。活動認識はウォッチのアプリ権限で、Health Connect・Samsung Healthへのアクセスは各プラットフォームのアプリ権限設定で取り消せます。取り消しは新しい照会・測定を制限しますが、既存のPULTO記録や提供元の原本は自動削除しません。Health Connect・Samsung Healthの原本は各プラットフォームで削除してください。アプリデータの消去ではGoogle Playの購入履歴も削除されません。",
        },
        {
          label: "07 · PRIVACY CONTACT", title: "プライバシーに関するお問い合わせ",
          text: "PULTOの個人情報、権限、データ削除に関するお問い合わせは、SAME STUDIOのcontact@samestudio.krまでお送りください。アプリ名PULTO、Androidスマートフォン版またはWear OS版の別、ご依頼内容をお知らせください。お問い合わせのために健康記録の原本や購入・審査用の認証情報を送る必要はありません。",
        },
      ],
    },
  },
  "zh-CN": {
    updated: "最后更新 · 2026.11.11",
    section: {
      id: "pulto", number: "09", eyebrow: "PULTO · ANDROID & WEAR OS",
      title: "PULTO — 运动与健康数据处理说明",
      intro: "本说明适用于由 SAME STUDIO 开发和提供的 PULTO Android 手机版与 Wear OS 版，不代表其他 SAME STUDIO 应用也处理相同健康数据。可选连接功能取决于发布配置、设备、提供方支持与批准，以及您授予的权限。",
      items: [
        {
          label: "01 · ACTIVITY DATA", title: "处理的运动与活动信息",
          text: "PULTO 处理应用中产生的运动起止时间、运动时长、目标 BPM、节奏等运动结果与设置。在 Wear OS 中选择步数感应后，会通过步数传感器事件计算测量区间和实际步频（每分钟步数）。连接 Health Connect 并获准后，会读取运动时间段的步数、步频、数据来源，以及与该时间段重叠的 Samsung Health 跑步与跑步机记录的类型、起止时间和可用设备信息。满足独立条件并使用 Samsung Health 直接连接时，也可能读取包括步行在内的运动信息、运动标识、分段、时间和设备信息，以及相应时段的步数与步频。",
        },
        {
          label: "02 · PURPOSE", title: "运动数据的使用目的",
          text: "数据用于提供运动节拍器、保存和显示运动结果，以及在详情页查看所选运动时段的步数、步频和外部运动记录。目标 BPM 是您选择的节拍，与传感器测量的实际步频区分显示。通过 Health Connect 读取的信息仅用于这些面向用户的运动与健身功能，不用于广告、出售或数据中介业务。",
        },
        {
          label: "03 · OPTIONAL PERMISSIONS", title: "活动感应与 Health Connect 权限",
          text: "Wear OS 的可选步数感应在您选择该功能并允许活动识别（ACTIVITY_RECOGNITION）后运行。功能使用受支持的步数传感器，在屏幕不再活跃或运动暂停、结束时停止接收传感器事件。手机版在 Android 14 及以上提供可选的 Health Connect 连接，分别申请步数与步频读取（READ_STEPS）和运动会话读取（READ_EXERCISE）权限。PULTO 不通过该连接写入健康记录。拒绝或撤回权限会限制相应读取或测量，基本节拍器仍可使用。",
        },
        {
          label: "04 · STORAGE & TRANSFER", title: "数据存储与 Phone–Wear 传输",
          text: "手机创建的 PULTO 运动结果保存在该手机的应用私有文件中。Wear 创建的运动结果与测得的步频保存在手表的应用私有文件中，并传输至连接的手机另存副本。设置保存在各应用的本地存储中。这些运动结果、步频传输及 Phone–Wear 间的设置、播放状态和使用权限验证信息传输使用 Google Play services 的 Wear OS Data Layer。Data Layer 可使用加密 Bluetooth，或根据连接情况经 Google 服务器进行端到端加密传输。Health Connect 与 Samsung Health 查询值仅在内存中用于显示，不复制到 PULTO 运动结果文件中，也不同步到 Wear。手机应用数据可能依据 Android 系统备份与设备迁移设置进行备份和恢复，因此不保证仅保留在设备上。",
        },
        {
          label: "05 · EXTERNAL PLATFORMS", title: "外部平台与数据共享",
          text: "Health Connect 和 Samsung Health 是您授权记录的提供途径。通过 Health Connect 读取 Samsung 记录的前提是相应记录已提供至 Health Connect。Samsung Health Data SDK 直接连接是独立途径，可能因提供方批准、支持或权限条件而无法使用。PULTO Android 不使用将运动或健康数据上传至 SAME STUDIO 服务器或发送至广告、分析服务的功能。Google 提供 Data Layer 传输与 Google Play 购买、恢复服务。Premium 验证使用商品、购买状态及购买验证信息；连接的 Wear 接收商品、购买状态、购买令牌哈希和验证时间等使用权限验证信息。PULTO 不直接接收支付卡信息。使用单独配置的在线审核认证时，会将审核认证信息、应用与商品信息、请求标识，以及 Phone、Wear 安装和连接设备标识发送至认证服务器以验证权限。该请求不包含运动与健康数据。Google、Samsung 直接处理的平台数据与备份适用各自的隐私政策及您的设置。",
        },
        {
          label: "06 · RETENTION & CONTROL", title: "保留期限、删除与撤回权限",
          text: "保存的 PULTO 运动结果、步频和设置没有自动到期期限，会保留至应用数据被删除。目前 Android 应用不提供逐条删除运动记录的功能。您可在每台设备的设置中清除 PULTO 应用存储数据，该设备的记录与设置会一同删除。清除一台设备不保证删除另一台设备中的副本、Data Layer 待传输副本或系统备份，剩余记录可能再次传输。请分别管理两台设备的应用数据与备份。活动识别可在手表应用权限中撤回，Health Connect 与 Samsung Health 访问可在对应平台的应用权限设置中撤回。撤回会限制新的查询或测量，但不会自动删除现有 PULTO 记录或提供方原始数据。Health Connect、Samsung Health 原始数据需在对应平台删除；清除应用数据也不会删除 Google Play 购买历史。",
        },
        {
          label: "07 · PRIVACY CONTACT", title: "隐私保护咨询",
          text: "如需咨询 PULTO 的隐私、权限或数据删除，请联系 SAME STUDIO：contact@samestudio.kr。请说明应用名 PULTO、使用 Android 手机版还是 Wear OS 版，以及您的请求。咨询时无需发送健康记录原文或购买、审核认证凭据。",
        },
      ],
    },
  },
  "zh-TW": {
    updated: "最後更新 · 2026.11.11",
    section: {
      id: "pulto", number: "09", eyebrow: "PULTO · ANDROID & WEAR OS",
      title: "PULTO — 運動與健康資料處理說明",
      intro: "本說明適用於由 SAME STUDIO 開發及提供的 PULTO Android 手機版與 Wear OS 版，不代表其他 SAME STUDIO 應用程式也處理相同健康資料。選用連線功能取決於發行設定、裝置、提供者支援與核准，以及您授予的權限。",
      items: [
        {
          label: "01 · ACTIVITY DATA", title: "處理的運動與活動資訊",
          text: "PULTO 處理應用程式中產生的運動起訖時間、運動時長、目標 BPM、節奏等運動結果與設定。在 Wear OS 選擇步數感應後，會透過步數感測器事件計算測量區間及實際步頻（每分鐘步數）。連接 Health Connect 並取得許可後，會讀取運動時段的步數、步頻、資料來源，以及與該時段重疊的 Samsung Health 跑步與跑步機記錄類型、起訖時間和可用裝置資訊。符合獨立條件並使用 Samsung Health 直接連線時，也可能讀取包含步行的運動資訊、運動識別值、分段、時間與裝置資訊，以及相應時段的步數與步頻。",
        },
        {
          label: "02 · PURPOSE", title: "運動資料的使用目的",
          text: "資料用於提供運動節拍器、儲存及顯示運動結果，以及在詳細畫面查看所選運動時段的步數、步頻與外部運動記錄。目標 BPM 是您選擇的節拍，與感測器測得的實際步頻區分顯示。透過 Health Connect 讀取的資訊僅用於這些使用者可見的運動與健身功能，不用於廣告、販售或資料仲介業務。",
        },
        {
          label: "03 · OPTIONAL PERMISSIONS", title: "活動感應與 Health Connect 權限",
          text: "Wear OS 的選用步數感應在您選擇該功能並允許活動辨識（ACTIVITY_RECOGNITION）後執行。功能使用支援的步數感測器，在畫面不再作用或運動暫停、結束時停止接收感測器事件。手機版於 Android 14 以上提供選用的 Health Connect 連線，分別申請步數與步頻讀取（READ_STEPS）及運動階段讀取（READ_EXERCISE）權限。PULTO 不透過此連線寫入健康記錄。拒絕或撤回權限會限制相關讀取或測量，基本節拍器仍可使用。",
        },
        {
          label: "04 · STORAGE & TRANSFER", title: "資料儲存與 Phone–Wear 傳輸",
          text: "手機建立的 PULTO 運動結果儲存在該手機的應用程式專用檔案中。Wear 建立的運動結果與測得的步頻儲存在手錶的應用程式專用檔案中，並傳輸至連接的手機另存副本。設定則保存在各應用程式的本機儲存空間。這些運動結果、步頻傳輸及 Phone–Wear 間的設定、播放狀態與使用權限驗證資訊傳輸使用 Google Play services 的 Wear OS Data Layer。Data Layer 可使用加密 Bluetooth，或依連線情況經 Google 伺服器進行端對端加密傳輸。Health Connect 與 Samsung Health 查詢值僅於記憶體中用於顯示，不複製到 PULTO 運動結果檔案，也不同步至 Wear。手機應用程式資料可能依 Android 系統備份與裝置移轉設定備份及還原，因此不保證僅保留在裝置上。",
        },
        {
          label: "05 · EXTERNAL PLATFORMS", title: "外部平台與資料分享",
          text: "Health Connect 與 Samsung Health 是您授權記錄的提供途徑。透過 Health Connect 讀取 Samsung 記錄的前提是相關記錄已提供至 Health Connect。Samsung Health Data SDK 直接連線是獨立途徑，可能因提供者核准、支援或權限條件而無法使用。PULTO Android 不使用將運動或健康資料上傳至 SAME STUDIO 伺服器或傳送至廣告、分析服務的功能。Google 提供 Data Layer 傳輸及 Google Play 購買、還原服務。Premium 驗證使用商品、購買狀態與購買驗證資訊；連接的 Wear 接收商品、購買狀態、購買權杖雜湊與驗證時間等使用權限驗證資訊。PULTO 不直接接收付款卡片資訊。使用另行設定的線上審查認證時，會將審查認證資訊、應用程式與商品資訊、要求識別碼，以及 Phone、Wear 安裝與連接裝置識別碼傳送至認證伺服器以驗證權限。該要求不包含運動與健康資料。Google、Samsung 直接處理的平台資料及備份適用各自的隱私政策與您的設定。",
        },
        {
          label: "06 · RETENTION & CONTROL", title: "保存期限、刪除及撤回權限",
          text: "儲存的 PULTO 運動結果、步頻與設定沒有自動到期期限，會保留至應用程式資料被刪除。目前 Android 應用程式不提供逐筆刪除運動記錄的功能。您可在每台裝置的設定中清除 PULTO 應用程式儲存空間資料，該裝置的記錄與設定會一併刪除。清除一台裝置不保證刪除另一台裝置上的副本、Data Layer 待傳輸副本或系統備份，剩餘記錄可能再次傳輸。請分別管理兩台裝置的應用程式資料與備份。活動辨識可於手錶應用程式權限中撤回，Health Connect 與 Samsung Health 存取可於對應平台的應用程式權限設定中撤回。撤回會限制新的查詢或測量，但不會自動刪除現有 PULTO 記錄或提供者原始資料。Health Connect、Samsung Health 原始資料需在對應平台刪除；清除應用程式資料也不會刪除 Google Play 購買歷史。",
        },
        {
          label: "07 · PRIVACY CONTACT", title: "隱私保護諮詢",
          text: "如需諮詢 PULTO 的隱私、權限或資料刪除，請聯絡 SAME STUDIO：contact@samestudio.kr。請說明應用程式名稱 PULTO、使用 Android 手機版或 Wear OS 版，以及您的要求。諮詢時無須傳送健康記錄原文或購買、審查認證憑據。",
        },
      ],
    },
  },
};
