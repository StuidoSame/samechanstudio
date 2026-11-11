# PULTO privacy local implementation — 2026-11-11

판정: **PULTO_PRIVACY_LOCAL_READY / LOCAL_READY / PUBLICATION_PENDING**

PULTO 전용 09번 항목을 기존 개인정보처리방침에 구현했다. 공개 배포와 Play Console 변경은 실행하지 않았다. 공개 URL은 계속 <https://samestudio.kr/privacy/>를 사용하며, 새 항목의 앵커는 `#pulto`다. 이 보고서는 공개 사이트 반영이나 Play 심사 제출 완료를 뜻하지 않는다.

## 범위와 작업 기준

- 웹사이트 시작점: 깨끗한 `main`, `8a39d2b2282d73ca19f119fb161aa3ab574a9448`. Fetch 후 `git pull --no-rebase --ff-only`: `Already up to date.`
- Android 조사점: 깨끗한 `main`, `522eb265d18b2283bb3bffc689e014d6e6a2e012`. Fetch와 같은 fast-forward pull 완료, 원격과 차이 없음. Android 파일과 번들은 수정하지 않았다.
- Windows, Node 24.14.1, npm 11.11.0. macOS 실행 검증은 하지 않았다.
- 명시적으로 요청된 `gpt-6.1-sol` / `max` 하위 에이전트 선택이 수락됐다. 해당 에이전트가 Android 소스와 5개 언어 문구를 검토하고 최종 PASS를 반환했다. 제공자 내부의 실제 추론 실행을 독립적으로 증명하지는 않는다.
- SAME STUDIO Graft 실행기는 설치를 찾지 못했다. 노출된 Graft MCP는 다른 Mapary 저장소를 가리켜 증거에서 제외했다. `GRAFT_BLOCKED`로 기록하고 관련 경로의 직접 원본·검색으로 진행했다.

## 수정 파일과 보존 범위

| 파일 | 변경 |
| --- | --- |
| `app/privacy/pultoPrivacyMessages.ts` | ko/en/ja/zh-CN/zh-TW의 PULTO 전용 안내. 7개 소제목, 업데이트 날짜 2026.11.11 |
| `app/privacy/PrivacyArchive.tsx` | 공통 메시지 뒤에 09번 항목을 합성하고 기존 목차·모바일 선택·스크롤·렌더링을 재사용. 마지막 항목에 기존 watch 장식 사용 |
| `tests/rendered-html.test.mjs` | 공통 8개 항목, 독립 09번 영역, 두 목차 컨트롤, 접근성 제목과 5개 언어 구조를 확인하는 검사 추가 |
| `docs/agent/PULTO_PRIVACY_LOCAL_REPORT.md` | 소스 근거, 검증 결과, 공개·신고 후속 작업 및 실제 한국어 문구 |

`app/privacy/privacyMessages.ts`는 변경하지 않았다. 시작 시 보관한 JSON과 비교하여 5개 언어의 공통 메시지 전체가 동일함을 확인했다. 기존 8개 항목·다른 앱 안내·앱 목록·스토어 링크·CSS·행성·애니메이션·이미지는 변경하지 않았다. 새 이미지 생성은 하지 않았다.

구현 커밋: `5623637` — `fix: document PULTO Android health data handling`.

## Android 소스 근거

아래 경로는 PULTO의 `Runtronome` 저장소 기준이며 `:숫자`는 확인한 행이다. 소스 존재와 로컬 배포물 포함은 실기기 동작·제공자 승인·현재 스토어 상태와 구분한다.

| 영역 | 확인한 처리와 근거 |
| --- | --- |
| 활동 감지 | Wear `ACTIVITY_RECOGNITION` 선언: `android/wear/src/main/AndroidManifest.xml:4`. 실제 선택·허가·로컬 실행·화면 활성 조건에서 Step Detector, 대체 Step Counter를 수신: `android/wear/src/main/java/com/samestudio/Runtronome/wear/WearCadenceTracker.kt:23`, `:113`. 구간·시각별 SPM과 평균 등을 구성: `WearCadenceRecorder.kt:12`. 총 걸음 수를 Wear 결과에 저장한다고 기재하지 않았다. |
| Health Connect 권한 | `android/app/src/healthConnect/java/com/samestudio/Runtronome/health/HealthConnectRegistration.kt:16`, `:48`에서 걸음·케이던스와 운동 읽기를 별도 요청. `READ_STEPS`·`READ_EXERCISE` 선언만을 처리 근거로 삼지 않고 실제 읽기를 추적했다. |
| 걸음 수·케이던스 읽기 | `HealthConnectModule.kt:99`의 선택 세션 시간대 StepsRecord 합계·StepsCadenceRecord 평균 및 출처. Android 14 이상 시스템 제공자와 전경 상태·허가 검사. |
| 삼성 운동 읽기 | 같은 파일 `:138`, `:243`에서 `com.sec.android.app.shealth` 출처로 달리기·트레드밀의 겹치는 시간대·종류·제공된 기기 정보를 투영. 걸음 읽기 허가가 있을 때 삼성 출처의 시간대 걸음·케이던스도 조회. |
| 제공자 조회값 저장 | `src/health/AndroidSessionHealthCard.tsx:19`, `src/health/AndroidSamsungRunningCard.tsx:145`의 화면 state로 처리. 조사한 경로에는 결과 파일 저장·Wear 전송 호출이 없다. PULTO 자체 운동 결과와 구분한다. |
| 권한 철회 | `HealthConnectModule.kt:121`, `:191`, `:271`에서 전경·허가를 읽기 전후 재확인하고 철회·오류 시 값을 보류. 센서와 삼성 직접 읽기도 권한·활성 상태에 제한된다. 저장된 PULTO 운동 결과를 자동 삭제하는 경로는 없다. |
| 운동 결과 저장 | `android/wear-shared/src/main/java/com/samestudio/Runtronome/wear/AndroidSessionResultStore.kt:28`, `:94`, `:173`의 앱 내부 `filesDir/pulto_android_results_v1` 아래 `.result`·`.cadence` 파일. Phone에서 만든 결과는 Phone에, Wear 결과와 케이던스는 Wear에 보관 후 Phone에 복사된다. |
| 설정·백업 | Phone JS 설정은 `src/appPreferencesStorage.ts:191`, `:299`의 AsyncStorage, 네이티브·Wear 설정은 SharedPreferences. Phone manifest `android/app/src/main/AndroidManifest.xml:19`의 `allowBackup=true`, Wear manifest `:11`은 false. 전체 데이터가 기기에만 남는다고 선언하지 않았다. |
| Phone–Wear 전달 | `android/wear-shared/src/main/java/com/samestudio/Runtronome/wear/WearResultDataLayer.kt:29`와 `android/app/src/main/java/com/samestudio/Runtronome/wear/WearPhoneListenerService.kt:72`에서 Wear 결과·선택적 센서 케이던스 수신·저장 후 ACK. 설정·재생 상태는 `PultoWearState.kt:30`, 사용 권한은 `PultoWearEntitlement.kt:47`. Health Connect·삼성 조회값은 이 전송 계약에 포함하지 않는다. |
| 삭제·보관 | `src/results/AndroidResultsScreen.tsx:135`의 옵션은 Session Info와 Cancel. Android 분기는 `src/App.tsx:5545`. 공유 JS의 iOS 삭제·tombstone 기능을 Android 기능으로 설명하지 않았다. 네이티브 저장소에는 개별 삭제·고정 TTL·기록 수 기반 자동 정리 경로가 없다. `android/wear/src/main/java/com/samestudio/Runtronome/wear/WearResultOutbox.kt:10`, `:47`의 ACK는 Wear 기록 삭제가 아니다. 양쪽 기기나 Data Layer 전송 대기 데이터를 원격 삭제하는 프로토콜도 확인되지 않았다. |
| Play 구매·복원 | `android/app/src/main/java/com/samestudio/Runtronome/billing/WearOsBillingModule.kt:354`, `:490`, `:652`: 구매 상품·상태·토큰 검사, Play 구매 확인 및 소유권 재조회로 복원. `WearOsEntitlementStore.kt:24`의 로컬 증거는 구매 토큰 SHA-256 해시·검증 시각 등. `PultoWearEntitlement.kt:47`의 Wear 전달에는 원본 토큰·결제 카드 정보가 없다. |
| 광고·분석·서버 | `package.json:27`, `android/app/build.gradle:261`의 선언 의존성과 `src`·Phone·Wear·shared 호출 검색에서 별도 광고·분석 SDK 적용이나 자체 건강·운동 기록 업로드 경로를 찾지 못했다. 이는 모든 플랫폼의 네트워크 동작 부재를 보증하는 주장이 아니다. |
| 별도 온라인 심사 인증 | `android/app/src/main/java/com/samestudio/Runtronome/wear/SecureReviewCoordinator.kt:163`, `:194`, `:231`의 조건부 HTTPS 요청은 심사용 인증 정보·앱/상품·요청·설치/연결 기기 식별자를 전송하며 건강·운동 기록은 포함하지 않는다. 이를 조건부로 공개 문구에 명시했다. 실제 인증 값은 읽거나 기록·변경하지 않았다. |
| Samsung Health 직접 SDK | `android/app/build.gradle:88`, `:115`, `:269`의 명시적 opt-in. `android/app/src/samsungHealthSdk/java/com/samestudio/Runtronome/health/SamsungHealthSdk.kt:27`, `:58`의 별도 EXERCISE/READ·STEPS/READ, `SamsungHealthExercise.kt:68`, `:84`, `:198`의 운동 식별값·분절·시간·기기·케이던스와 걸음 읽기. SDK의 일반 EXERCISE 읽기가 투영 필드보다 넓을 수 있어 SDK가 오직 특정 열만 받는다는 약속은 하지 않았다. |
| Phone 25 로컬 배포물 | `.tmp/review-production-25-14013/phone-aab-manifest.txt:6`, `:8`, `:103` 및 AAB ZIP 읽기에서 두 Health Connect 권한, 삼성 bridge/SDK 포함, hosted issuer 비설정을 확인했다. `docs/ANDROID_PRODUCTION_RELEASE_25_14013.md:39`, `:86`도 제공자 승인을 별도 조건으로 구분한다. 이 사실은 삼성 승인·실기기 접근·현재 스토어 상태의 증거가 아니다. |

## 플랫폼 정책 대조

- [Health Connect 권한·제한적 사용 정책](https://support.google.com/googleplay/android-developer/answer/16558241): 실제 사용자 기능의 목적, 읽는 데이터 유형, 관리·삭제 방법을 명시하고 광고·판매·중개 목적의 사용을 배제했다.
- [Wear OS Data Layer 전송 설명](https://developer.android.com/training/wearables/data/overview): Bluetooth 외에 Google 서버 중계가 가능하므로 “직접 Bluetooth로만 전송”이라고 쓰지 않았다. 암호화 설명은 이 플랫폼 문서에 근거한다.
- [Android Auto Backup](https://developer.android.com/identity/data/autobackup): Phone의 허용된 시스템 백업·기기 이전 가능성을 별도로 명시했다. 특정 사용자의 실제 백업 활성화·보관·삭제 상태는 확인하지 않았다.
- [Data safety 신고 지침](https://support.google.com/googleplay/android-developer/answer/10787469): 기기 내 접근과 기기 밖 전송, SDK 처리를 구분해야 한다. 이번 소스 조사만으로 Console의 “수집 없음/공유 없음” 답변을 일괄 확정하지 않았다.

## 실행한 검증

| 검사 | 결과 |
| --- | --- |
| 의존성 설치 | 기존 lockfile의 `npm ci` 실행으로 525개 패키지 설치, lockfile 변경 없음 |
| `npm run typecheck` | PASS, exit 0 |
| `npm run lint` | PASS, exit 0 |
| `npm run build` | PASS, 최종 문구 기준 exit 0, 5개 기존 route 유지 |
| `node --test tests/rendered-html.test.mjs` | PASS, 최종 빌드 기준 16/16 |
| 공통 메시지 보존 | 5개 언어의 전체 공통 dictionary JSON이 시작점과 동일. 원본 `privacyMessages.ts`, CSS, 잠금 파일 diff 없음 |
| `git diff --check` / staged check | PASS |
| 로컬 HTTP | `GET http://127.0.0.1:3000/privacy/` 200, PULTO 제목·섹션 포함 |
| 데스크톱 UI | 인앱 브라우저 1280×720에서 09번 목차 클릭 → PULTO, 9개 영역·7개 소제목·가로 넘침 없음 |
| 모바일 UI | 390×844에서 모바일 select → PULTO, 단일 열·14px 본문·가로 넘침 없음 |
| 큰 글자 | 320×844, 큰 글자에서 15.68px 본문·단일 열·가로 넘침 없음. 기본 크기·viewport 임시 설정 복원 |
| 직접 앵커 | `/privacy/#pulto` 진입 시 PULTO 위치로 이동, 헤더 여백 확보 |
| 브라우저 로그 | 확인 시 warn/error 없음. Edge·Play Console 사용 안 함 |
| 앱 내부 링크 소스 | `src/setting.tsx:60`, `:965`와 `android/app/src/healthConnect/java/com/samestudio/Runtronome/health/HealthConnectRationaleActivity.kt:18`에서 기존 `https://samestudio.kr/privacy` 경로 유지. 설치된 심사 AAB의 실제 클릭 동작은 미검증 |
| Max 검토 | 5개 언어 전체 문구와 합성 방식 PASS. 번역의 “상대 기기 사본” 표현은 권고에 따라 명확화 |

첫 보존 비교에서는 JSON이 `undefined` 속성을 생략하는데 원본 객체와 직접 deep-equal하여 검사 방식이 실패했다. 원본 데이터 변경은 없었으며, 양쪽의 JSON 직렬화 결과를 동일 방식으로 비교하여 PASS했다. 첫 샌드박스 dev/HTTP 실행은 loopback EACCES로 실패해 종료됐고, 승인된 실행 경계에서 단일 loopback 서버를 다시 실행해 200과 UI를 확인했다.

빌드는 Vinext의 기존 route 자동 분류 한계(`Unknown`)와 플러그인 시간 안내를 출력했다. 설치 시 npm audit은 기존 잠금 의존성에 35건(낮음 1·보통 15·높음 17·심각 2)을 보고했다. 의존성을 임의 갱신하거나 audit fix를 실행하지 않았다. 네이티브 빌드·전체 Android 테스트·실기기·모든 언어의 시각 QA·정식 접근성 인증은 이번 문서 변경 범위에서 실행하지 않았다.

## 공개 및 Play Console 후속 작업

문서화된 기존 웹사이트 수단은 `package.json`의 `npm run deploy`, `npm run deploy:built`와 `wrangler.jsonc`의 기존 Cloudflare Worker다. 명령의 존재만으로 이 작업의 운영 배포 권한을 추정하지 않았다. 현재 요청에서는 구체적인 운영 배포 승인을 확인하지 못해 실행하지 않았다. `.openai/hosting.json`에는 Sites `project_id`가 없고 Sites 공개 경로는 원격 소스 Push를 요구하므로, Push 금지 조건에서 새 Sites 등록이나 대체 호스팅도 시도하지 않았다.

- 공개 상태: **PUBLICATION_PENDING**. 로컬 변경이 공개 사이트에 반영됐다고 보고하지 않는다.
- 로컬 서버: `npm run dev -- --hostname 127.0.0.1 --port 3000`, 한 개 유지. 브라우저 확인용 서버를 자동 종료하지 않는 저장소 규칙에 따라 남겼다.
- 운영 URL: <https://samestudio.kr/privacy/>. 공개 후 `#pulto` 내용·무로그인 접근·모바일·앱 내부 링크를 다시 확인한다.
- 그다음 Play Console의 App content → Privacy Policy → Manage에서 동일 URL을 재확인하고 필요한 저장·검토 요청을 별도로 진행한다.
- Data Safety와 Health Apps Declaration의 실제 현재 답변은 재조회하지 않았다. 공개 문구와 실제 배포본의 활동 감지·Health Connect 읽기·Wear 전달·플랫폼/SDK 처리를 대조하여 필요한 부분만 갱신해야 한다. 권한 선언, 로컬 접근, 기기 밖 전송을 같은 개념으로 취급하지 않는다.
- 이번 작업은 Play Console 신고 저장·심사 전송을 수행하지 않았다. Phone 25 / Wear 14013 AAB, 운영 P-256 패스, 관리형 게시 설정을 변경하지 않았다. 그 현재 원격 상태나 프로덕션 미공개 상태를 확인했다고 주장하지 않는다.

남은 불확실성은 삼성 제공자 승인·지원 기기의 실제 읽기, 실제 사용자 백업·Data Layer 전송 상태, 배포된 심사 번들의 런타임, 원격 Console 신고 상태다. 새로운 앱 기능·삭제 프로토콜·서버 보관 정책을 가정하지 않았다.

## 실제 추가한 한국어 전체 문구

아래는 `app/privacy/pultoPrivacyMessages.ts`의 한국어 표시 문구이며, 나머지 4개 언어도 같은 파일에 있다.

### PULTO — 운동 및 건강 데이터 처리 안내

최종 업데이트 · 2026.11.11

이 안내는 SAME STUDIO가 개발·제공하는 PULTO의 Android 휴대전화 및 Wear OS 앱에 적용됩니다. 다른 SAME STUDIO 앱이 같은 건강 데이터를 처리한다는 의미는 아닙니다. 선택적 연결 기능의 이용 가능 여부는 배포 구성, 기기와 제공자의 지원·승인 및 사용자가 허용한 권한에 따라 달라집니다.

#### 처리하는 운동 및 활동 정보

PULTO에서 생성한 운동 시작·종료 시각, 운동 시간, 목표 BPM·리듬 등 운동 결과와 설정을 처리합니다. Wear OS에서 걸음 감지를 선택하면 걸음 센서 이벤트로 측정 구간과 실제 케이던스(분당 걸음 수)를 계산합니다. Health Connect 연결 시에는 허용된 범위에서 운동 시간대의 걸음 수·케이던스·데이터 출처와, 해당 시간과 겹치는 Samsung Health 달리기·트레드밀 운동의 종류·시작 및 종료 시각·제공된 기기 정보를 읽습니다. 별도 조건을 충족해 Samsung Health 직접 연결을 이용하는 경우에는 걷기를 포함한 운동 정보, 운동 식별값·구간·시간과 기기 정보, 해당 시간대의 걸음 수·케이던스도 읽을 수 있습니다.

#### 운동 데이터의 이용 목적

메트로놈의 운동 박자를 제공하고, 운동 결과를 보관·표시하며, 선택한 운동 시간대의 걸음 수와 케이던스 및 외부 운동 기록을 상세 화면에서 확인하는 데 이용합니다. 목표 BPM은 사용자가 정한 박자이며 센서로 측정한 실제 케이던스와 구분합니다. Health Connect로 읽은 정보는 이러한 사용자에게 보이는 운동·피트니스 기능에만 이용하며 광고, 판매 또는 데이터 중개 목적으로 이용하지 않습니다.

#### 활동 감지 및 Health Connect 권한

Wear OS의 선택적 걸음 감지는 사용자가 기능을 선택하고 활동 인식(ACTIVITY_RECOGNITION)을 허용한 경우에 작동합니다. 측정은 지원되는 걸음 센서를 사용하며 화면이 비활성화되거나 운동이 일시정지·종료되면 센서 수신을 중단합니다. 휴대전화의 Health Connect 연결은 Android 14 이상에서 사용자가 선택하며, 걸음 수·케이던스 읽기(READ_STEPS)와 운동 세션 읽기(READ_EXERCISE)를 별도로 요청합니다. PULTO는 이 경로로 건강 기록을 쓰지 않습니다. 권한을 거부하거나 철회하면 해당 조회·측정이 제한되며 기본 메트로놈은 계속 이용할 수 있습니다.

#### 데이터 저장 및 Phone–Wear 전달

휴대전화에서 만든 PULTO 운동 결과는 휴대전화의 앱 전용 파일에 저장합니다. Wear에서 만든 운동 결과와 측정 케이던스는 워치의 앱 전용 파일에 저장하고 연결된 휴대전화로 전달해 휴대전화에도 보관합니다. 설정은 각 앱의 로컬 저장소에 저장합니다. 이 운동 결과·케이던스 전달과 Phone–Wear 간 설정·재생 상태·사용 권한 확인 정보 전달에는 Google Play services의 Wear OS Data Layer를 사용합니다. Data Layer는 암호화된 Bluetooth 연결을 사용하거나 연결 상황에 따라 Google 서버를 경유하는 종단 간 암호화 전송을 사용할 수 있습니다. Health Connect 및 Samsung Health 조회값은 화면 표시를 위해 메모리에서 처리하며 PULTO 운동 결과 파일에 복사하거나 Wear로 동기화하지 않습니다. 휴대전화 앱 데이터는 Android 시스템 백업·기기 이전 설정에 따라 백업·복원될 수 있으므로 기기에만 남는다고 보장하지 않습니다.

#### 외부 플랫폼과 데이터 공유

Health Connect와 Samsung Health는 사용자가 허용한 기록의 제공 경로이며, 삼성 기록이 Health Connect에 제공되어야 해당 경로로 조회할 수 있습니다. Samsung Health Data SDK 직접 연결은 Health Connect와 별개이며 제공자 승인·지원·권한 조건에 따라 사용할 수 없을 수 있습니다. PULTO Android는 운동·건강 데이터를 SAME STUDIO의 서버로 업로드하거나 광고·분석 서비스에 보내는 기능을 사용하지 않습니다. Google은 Data Layer 전송과 Google Play 결제·구매 복원을 제공합니다. Premium 확인에는 상품·구매 상태와 구매 검증 정보를 이용하며 연결된 Wear에는 상품·구매 상태, 구매 토큰의 해시와 검증 시각 등 사용 권한 확인 정보를 전달합니다. PULTO는 결제 카드 정보를 직접 받지 않습니다. 별도 구성된 온라인 심사 인증을 이용하는 경우 심사용 인증 정보, 앱·상품 정보, 요청 식별자와 Phone·Wear의 설치 및 연결 기기 식별자를 인증 서버에 보내 사용 권한을 확인합니다. 운동·건강 데이터는 이 요청에 포함하지 않습니다. Google·Samsung이 직접 처리하는 플랫폼 데이터와 백업에는 각 제공자의 개인정보처리방침과 사용자 설정이 적용됩니다.

#### 보관 기간, 삭제 및 권한 철회

저장된 PULTO 운동 결과·케이던스·설정에는 자동 만료 기간을 두지 않으며 앱 데이터가 삭제될 때까지 보관합니다. 현재 Android 앱에는 운동 기록을 개별 삭제하는 기능이 없습니다. 각 기기의 설정에서 PULTO의 앱 저장공간 데이터 삭제를 이용하면 해당 기기의 기록과 설정이 함께 삭제됩니다. 한 기기의 데이터 삭제는 상대 기기의 사본·Data Layer 전송 대기 사본·시스템 백업의 삭제를 보장하지 않으며, 남은 기록은 다시 전달될 수 있습니다. 두 기기의 앱 데이터와 백업을 각각 관리해야 합니다. 활동 인식은 워치 앱 권한에서, Health Connect와 Samsung Health 접근은 해당 플랫폼의 앱 권한 설정에서 철회할 수 있습니다. 철회 후에는 새 조회·측정이 제한되지만 기존 PULTO 기록이나 제공자 원본은 자동 삭제되지 않습니다. Health Connect·Samsung Health 원본은 해당 플랫폼에서 삭제해야 하며, Google Play 구매 내역 역시 앱 데이터 삭제로 삭제되지 않습니다.

#### 개인정보 보호 문의

PULTO의 개인정보 처리, 권한 또는 데이터 삭제에 관한 문의는 SAME STUDIO의 contact@samestudio.kr로 보내주세요. 앱 이름 PULTO, Android 또는 Wear OS 여부와 요청 내용을 알려주시면 됩니다. 문의를 위해 건강 기록 원본이나 결제·심사용 인증 정보를 보내실 필요는 없습니다.
