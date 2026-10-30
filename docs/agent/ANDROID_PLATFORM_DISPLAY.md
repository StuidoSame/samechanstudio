# TOCOBI / SKKOO Android 플랫폼 표시 검증

2026-10-30 — **TOCOBI_SKKOO_ANDROID_DISPLAY_VERIFIED**

## 원인과 변경

- 시작: `main`, `c74fc2f912b1be6c1327e7b9de98fb94f8369d1d`, 깨끗한 작업 트리. fetch 후 `git pull --no-rebase --ff-only`는 이미 최신 상태였다.
- `app/lib/apps.ts`의 TOCOBI(`tocklist`)와 SKKOO는 `platforms: ["apple"]`이었다. 메인 캐러셀은 이 배열을 그대로 사용하므로 Android가 빠졌다.
- 상세 화면은 스토어 URL이 있는 경우에만 아이콘을 렌더링했다. 두 앱의 Google Play URL은 저장소에 없었다.
- 두 앱의 플랫폼 배열을 `["apple", "android"]`로 수정했다. 기존 Apple URL과 모든 자산 경로는 보존했다.
- 공통 `getAppDetailPlatforms`가 카탈로그의 지원 플랫폼과 기존 스토어 링크 정책을 함께 사용한다. Apple → Android 순서로 표시하며 실제 URL이 있으면 링크, 없으면 이름이 있는 비대화형 지원 배지를 렌더링한다. 추측한 Play URL이나 앱별 렌더링 예외는 없다.
- 기존 상세 아이콘 크기·간격·색상을 재사용했다. hover/focus는 실제 링크에만 적용한다. 상세 영역 접근성 이름은 지원 플랫폼과 스토어를 나타내도록 5개 언어에서 갱신했다.
- 구현·회귀 테스트 커밋: `29a5cfe` (`fix: align android platform badges across showcase and details`).

## Windows 실제 브라우저

Windows의 ChatGPT in-app browser에서 메인과 상세를 열어 아이콘을 눈으로 확인하고 DOM의 아이콘·링크·배지·크기를 함께 검사했다.

| 앱 | 메인 | 상세 | 실제 스토어 링크 |
| --- | --- | --- | --- |
| Mapary | Apple + Android | Apple + Android | 기존 2개 유지 |
| Pulto | Apple + Android | Apple + Android | 기존 2개 유지 |
| EVRUNE | Apple + Android | Apple + Android | 기존 Apple 유지, Android 지원 배지 |
| TOCOBI | Apple + Android | Apple + Android | 기존 Apple 유지, Android 지원 배지 |
| SKKOO | Apple + Android | Apple + Android | 기존 Apple 유지, Android 지원 배지 |
| Teru Bozu | Apple + Android | Apple + Android | 기존 Apple 유지, Android 지원 배지 |
| WAESSEUM | Apple + Android | Apple + Android | 기존 Google Play 유지, Apple 지원 배지 |

- TOCOBI·SKKOO 상세의 데스크톱 아이콘 컨테이너는 각각 56×56px, 동일한 수직 위치·색상이며 간격은 18px였다.
- 320×740px, 사이트의 큰 글자 설정에서 두 앱의 메인·상세를 확인했다. 아이콘 컨테이너는 44×44px로 동일했으며 문서의 수평 overflow가 없었다.
- 7개 앱 순차 이동, 각 상세 열기·닫기, 자동 재생으로 SKKOO → Teru Bozu 전환, 일시정지, ArrowLeft로 SKKOO 복귀를 확인했다. 인덱스와 앱 이름이 일치했다.
- 해당 브라우저 탭의 수집된 콘솔 error는 0개였다. 뷰포트 override와 큰 글자를 기본 상태로 복원하고 메인 미리보기 탭을 유지했다.
- 로컬 증거: `outputs/android-platform-badges/`의 `before-skkoo.jpg`, `after-tocobi-home.jpg`, `after-tocobi-detail.jpg`, `after-skkoo-home-final.jpg`, `after-skkoo-detail.jpg`, 모바일 이미지, `all-platforms.json`, `mobile-large.json`. 생성물은 Git에서 제외한다.

## 기술 검사

| 명령 | 실제 결과 |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run test:unit` | PASS — 52/52 |
| `npm run build` | PASS — 기존 plugin timing·Vinext route classification 안내 있음 |
| `node --test tests/rendered-html.test.mjs` | PASS — 14/14 |
| `node scripts/verify-graft.mjs` | PASS — 6/6, freshness 정상 |
| `git diff --check` | PASS |

단위 테스트는 카탈로그 기반 지원 표시, URL 부재, 정렬·중복 제거, URL만으로 미지원 플랫폼이 나타나지 않는 조건을 검사한다. HTML 검사는 두 앱의 `iOS, Android` 메타데이터와 검증되지 않은 Google Play URL이 발행되지 않는 조건을 포함한다.

## 범위와 유지 상태

Cosmic Intro, 쇼케이스 디자인·상호작용 코드, Support ETC, FAQ 12개, 상세 스크린샷 데이터와 Pulto 아이콘은 변경하지 않았다. 기존 단위·HTML 회귀 검사에 포함되지만 이 작업에서 모든 기능을 다시 수동 검증한 것은 아니다. 실제 모바일 기기와 macOS 런타임은 실행하지 않았다. 플랫폼별 셸 코드나 의존성 변경은 없다.

기존 개발 서버 한 개를 유지했다. push·태그·원격 브랜치 생성·배포는 수행하지 않았다.
