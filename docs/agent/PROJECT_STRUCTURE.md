# 프로젝트 구조와 기능 기준선

현재 앱 카탈로그는 7개이며 Tocklist의 표시 이름은 TOCOBI다. PINI·PEPESNAP·FEELOO 제거 이후의 현황과 검증은 [APP_CATALOG_CLEANUP](APP_CATALOG_CLEANUP.md)을 따른다. 아래 10개 앱 기준선은 당시 조사 기록으로 보존한다.

Support에는 마지막 ETC 카테고리에서 PINI·PEPESNAP·Other 문의를 받을 수 있다. 메인 홍보 목록과 별개인 지원 정책·구현·검증은 [SUPPORT_ETC](SUPPORT_ETC.md)를 따른다.

조사일: 2026-10-29. 기준 HEAD: `df3fd9f32b9783f9034249a21e2bd48d6fbc9406`. 코드·설정을 우선하고 [공식 홈페이지](https://samestudio.kr/)의 실제 메뉴·10개 앱·지원 및 정책 링크를 대조했다. 아래 상태는 코드 존재와 이번 검증 범위를 뜻하며 서비스 전체의 무결성을 보증하지 않는다.

## 기술 스택

| 영역 | 확인된 구현과 근거 |
| --- | --- |
| UI | Next.js 16.2.6 App Router API, React/React DOM 19.2.6 — `package.json` |
| 실제 실행·빌드 | **Vinext 0.0.50 + Vite 8.0.13**, `@vitejs/plugin-rsc` 0.5.26 — `vite.config.ts:14`, npm scripts. `next dev` 구성이 아님 |
| 언어 | TypeScript 5.9.3, strict/noEmit/bundler resolution, `@/*` alias — `tsconfig.json` |
| 스타일 | Tailwind CSS 4.2.1 PostCSS + 대형 전역 CSS/정책 전용 CSS — `app/globals.css:1`, `postcss.config.mjs` |
| 3D·모션 | Three 0.185.1, React Three Fiber 9.6.1, CSS keyframes, requestAnimationFrame. 별도 Motion/GSAP 라이브러리는 없음 |
| 호스팅 | Cloudflare Workers/정적 assets/IMAGES, Wrangler 4.92.0 — `wrangler.jsonc`, `worker/index.ts` |
| Sites 통합 | `.openai/hosting.json`와 자체 `build/sites-vite-plugin.ts`. 현재 D1/R2 값은 null |
| DB | Drizzle ORM 0.45.2 + drizzle-kit 0.31.10의 선택적 D1 스캐폴딩. 실제 `db/schema.ts`는 비어 있음 |
| 패키지·검사 | npm + lockfile v3, ESLint 9 flat config + Next presets, Node 내장 test runner. 별도 Prettier/브라우저 테스트 프레임워크·추적된 CI 설정은 없음 |

현재 런타임 고정과 검증 구분은 [CROSS_PLATFORM](CROSS_PLATFORM.md)을 따른다. 설치 경고는 [BOOTSTRAP_REPORT](BOOTSTRAP_REPORT.md)에 있다.

## 진입점과 모듈 관계

- `app/layout.tsx:91` RootLayout: 배경 오디오 → 페이지 전환 → 테마 → 글자 크기 → 다국어 Provider를 구성한다. hydration 전 테마·글자 크기 초기화 script와 `SeoLocaleSync`도 담당한다.
- `app/page.tsx:8` Home: JSON-LD `HomeStructuredData`와 `HomeExperience`를 렌더링한다.
- `app/components/HomeExperience.tsx:550`은 캐러셀·로더·스크롤·자동 재생·상세 overlay와 HOME의 여러 section을 조정한다. 약 2,578줄의 결합도가 높은 중심 모듈이다. 분해는 이번 작업 범위가 아니다.
- `app/lib/apps.ts:18`의 10개 앱 데이터가 캐러셀과 support 목록의 원천이다. `appScreenshots.ts:83,302,338`은 파일 manifest·로케일 fallback을, `appDetailCapabilities.ts`는 Phone/Pad/Watch/TV/Web 화면과 스토어 노출을 결정한다.
- `app/components/app-detail/`은 상세 dialog, 화면 종류별 갤러리, 이미지 실패 처리와 lightbox를 담당한다. 별도 앱 slug route는 없다.
- `app/components/device-showcase/`는 Phone 하루 질문, Pad 하루 퍼즐, Watch 3개 드럼을 담당한다. 질문·퍼즐은 로컬 저장, Watch는 Web Audio와 키보드를 사용한다.
- `app/navigation/`은 내부 링크의 화면 전환·스크롤·도착 focus 처리를, `PageSectionNavigation`은 section 간 탐색과 활성 상태를 담당한다.
- `app/i18n/`은 다국어 Context·locale 감지·타입·메시지 fallback을 담당한다. 테마, 글자 크기, 오디오는 각 별도 Context다. 외부 전역 상태 라이브러리는 없다.
- `app/support`, `terms`, `privacy`, `delete-account`는 각각 page entry와 콘텐츠·메시지를 가진다. `PolicyPageLayout`, Header/Footer를 공유한다. `app/i18n/README.md`의 standalone 문구는 과거 설명이며 현재 React 정책 페이지도 실제 Provider와 독립 메시지 사전을 함께 사용한다.
- `worker/index.ts:33`의 fetch는 `/_vinext/image`를 ASSETS/IMAGES로 처리하고 나머지를 Vinext App Router handler에 전달한다.
- `build/sites-vite-plugin.ts:17`은 빌드 후 hosting metadata·drizzle을 `dist/.openai`에 복사한다. **build 폴더는 실제 소스**다.
- `examples/d1/`의 notes GET/POST는 예제이며 활성 `app/api` route가 아니다. `app/chatgpt-auth.ts`는 헤더 기반 보조 함수이며 현재 화면의 로그인 플로우로 연결된 근거는 없다.

## 라우팅과 기능 상태

| 영역 | 상태 | 실제 경로 / 근거 |
| --- | --- | --- |
| HOME | IMPLEMENTED | `/`, `app/page.tsx` |
| APPS | IMPLEMENTED | `/#apps`; 10개 앱 캐러셀, 상세 overlay. `HomeExperience.tsx:2101` |
| ABOUT | IMPLEMENTED | `/#about`; 독립 route가 아닌 section. `HomeExperience.tsx:2403` |
| DEVICES | IMPLEMENTED | `/#devices`; `DeviceShowcase`와 각 인터랙티브 frame |
| CONTACT | IMPLEMENTED | `/#contact`; `mailto:contact@samestudio.kr`. `HomeExperience.tsx:2428,2445` |
| SUPPORT | IMPLEMENTED | `/support/`; 앱 선택·문의 내용으로 mailto 작성. `SupportContent.tsx:45` |
| TERMS / PRIVACY | IMPLEMENTED | `/terms/`, `/privacy/`; 다국어 archive와 목차 |
| DELETE ACCOUNT | PARTIAL | `/delete-account/`; 입력 검증·동의·참조번호·메일 앱 연결. `DeleteAccountContent.tsx:55-101`. 웹사이트가 실제 삭제를 수행하거나 전달 완료를 확인하는 API는 없음 |
| 앱 상세 독립 URL | MISSING | 상세는 현재 클라이언트 overlay. 새 route를 만들지 않음 |
| 문의의 서버 접수·메일 발송 | MISSING | 실제 구현은 mailto. 사용자의 메일 앱 설정과 최종 발송에 의존 |
| 운영 서버의 정확한 배포 revision·접수 처리 | UNKNOWN | 공개 응답만으로 commit이나 외부 처리 완료 여부는 확인 불가 |

`next.config.ts`는 trailingSlash를 유지한다. `public/_redirects`는 `/support.html`, `/terms.html`, `/privacy.html`을 slash 경로로 보낸다. 파일이 존재해도 모든 개발/호스팅 런타임이 해당 redirect 형식을 처리한다는 뜻은 아니므로 배포 전 플랫폼별 확인이 필요하다. sitemap에는 실제 5개 route가 있다. `/about/`, `/apps/`, `/devices/`, `/contact/`를 독립 route로 가정하지 않는다.

## 상호작용·접근성·SEO

| 기능 | 상태 | 근거·제한 |
| --- | --- | --- |
| 앱 전환·스크롤·드래그·터치·방향키 | IMPLEMENTED | `HomeExperience.tsx:1877-2001`; 자동 재생 타이밍은 `appCarouselTiming.ts` |
| 다국어 | IMPLEMENTED | `ko/en/ja/zh-CN/zh-TW`; `I18nProvider.tsx:29-76`, `locale.ts`, `messages.ts`의 Korean fallback. URL별 locale route는 없음 |
| 글자 크기 | IMPLEMENTED | small/medium/large; `FontSizeProvider.tsx:29`, `SiteHeader.tsx:38`; 브라우저에서 변경 확인 |
| 테마·배경음악 | IMPLEMENTED | light/dark, mute, 사용자 제스처 재생; `ThemeProvider`, `BackgroundAudioProvider` |
| 반응형·모션 | IMPLEMENTED | 전역 CSS의 viewport/hover/coarse pointer/reduced-motion 분기; `JellyCanvas`는 dynamic import |
| 키보드·dialog·접근성 | PARTIAL | ARIA 이름·키 입력·focus 처리·reduced motion 존재. 정식 WCAG·screen reader·대비·모든 크기 QA는 미실행. 기존 HTML 테스트는 홈 h1 부재를 기대하므로 변경 시 검토 필요 |
| 스토어·외부 링크 | IMPLEMENTED | `apps.ts`의 선택적 App Store/Google Play URL. 표시 platform만으로 URL 존재를 추정하지 않음 |
| SEO | IMPLEMENTED | `seo.ts:273-377` metadata/canonical/OG; `HomeStructuredData`, `SeoLocaleSync`; robots/sitemap/manifest. 검색 노출·색인 결과는 UNKNOWN |

## 자산과 상태

`public/assets/`는 앱 icons, 로케일·기기별 screenshot, BMJUA 폰트, 배경음악 및 archive 자산을 보존한다. `appScreenshots.ts`는 실제 파일 경로를 manifest로 연결한다. `public/assets/archive/archive.js` 등은 정적 legacy 자산이며 활성 React route와 혼동하지 않는다. 이미지 경로·대소문자·기존 제품 ID(`runtronome`의 표시명 Pulto 등)는 단순 rename하지 않는다.

저장 키는 `same-studio-locale-v1`, `same-studio-theme-v1`, `same-studio-font-size`와 device demo의 `same-studio-daily-question-v1`, `same-studio-daily-puzzle-v1`이다. 메모리 state와 refs로 animation을 관리하며 저장 형식·사용자 답변을 지우지 않는다. 배경음악 preference도 별도 provider가 보존한다.

## 환경변수·빌드·검증 구조

현재 public portfolio 구동에는 사용자 비밀 `.env`가 필요하지 않다. 실제 환경변수 참조는 `NODE_ENV`, Codex Seatbelt 감지용 `CODEX_SANDBOX`, `WRANGLER_WRITE_LOGS`, `WRANGLER_LOG_PATH`, `MINIFLARE_REGISTRY_PATH`다 (`vite.config.ts:12-19`, `messages.ts`). Cloudflare `ASSETS/IMAGES`는 Worker binding이며 일반 `.env` API 키가 아니다. DB 코드가 요구하는 DB binding은 현재 Wrangler에 구성되어 있지 않으므로 선택적 스캐폴딩을 실제 DB 서비스로 설명하지 않는다.

`npm run build`는 client reference → server reference → RSC → client → SSR를 빌드해 `dist/client`, `dist/server`를 만든다. 사이트 metadata packaging은 위 Vite plugin이 수행한다. deploy 계열 명령은 존재하지만 이번 작업에서 실행하지 않았다. `deploy:dry-run`도 자동 검증에 포함하지 않는다.

테스트는 `tests/app-data.test.mjs`(이름·아이콘·스크린샷·fallback), `app-carousel-timing.test.mjs`(타이핑 timeline), `rendered-html.test.mjs`(빌드 Worker 응답·메타데이터·정책·초기화)다. 명령과 위험별 선택은 [TESTING](TESTING.md)을 따른다.

## 향후 디자인 변경 경계

Provider 초기화와 hydration, 5개 로케일, 글자 크기·테마 조합, 캐러셀 rAF와 pointer 수명, 상세 dialog focus, device demo 저장 상태를 함께 고려한다. 법적 URL·스토어 링크·메일 동작·운영 bindings는 디자인 변경에 섞지 않는다. 대형 CSS와 HomeExperience를 수정할 때 [DESIGN_SYSTEM](DESIGN_SYSTEM.md)과 Graft 영향 관계를 먼저 확인한다.
