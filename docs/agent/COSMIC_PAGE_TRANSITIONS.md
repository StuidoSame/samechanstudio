# Cosmic Warp Navigation

2026-10-30 — **COSMIC_PAGE_TRANSITIONS_VISUALLY_VERIFIED**

## 기준과 구조

- 시작: `main`, HEAD `a79180f3a98f421e6e13fc0d6256d08103cf7397`, working tree clean. Fetch 후 `git pull --no-rebase --ff-only`는 already up to date였다.
- 기존 `InternalTransitionLink`와 Root Layout의 `PageTransitionProvider`를 유지했다. 기존 이동도 SPA였으며, Support 이동 뒤에도 같은 문서의 인트로 진단 상태가 유지되는 것을 관측했다. 전체 문서 새로고침이 갑작스러운 전환의 원인은 아니었다.
- 기존의 일률적인 520ms 이동 지연·입력 잠금·큰 blur·클릭 위치 중심 portal CSS를 제거했다. `router.push`는 활성화 시 바로 호출한다. 도착 URL과 실제 페이지 DOM이 준비되면 스크롤·포커스를 정리하고, 별도의 짧은 시각 효과를 마무리한다.
- `cosmicNavigation.ts`가 이동 종류·경로별 시간·세대 ID·준비 확인·취소·오류·기한을 관리한다. 새 탐색은 이전 타이머를 해제하며 이미 큐에 들어간 오래된 콜백도 새 목적지를 정착시키지 못한다.
- `PageTransitionContext.ts`로 Context를 분리했다. 개발 중 Provider HMR 이후 Context 연결 오류를 관측해 분리했으며, 이후 Provider 갱신·페이지 이동과 최종 새 문서에서 정상 동작을 확인했다.
- `ArchivePortalTransition.tsx`의 기존 진입점은 유지하면서 내부를 단일 SVG 별빛과 짙은 보라색 터널로 교체했다. 기존 인트로의 밝은 보라색 별빛 디자인 언어를 사용하며 외부 이미지·라이브러리·Canvas·WebGL context는 추가하지 않았다.
- 본문·앱 전시 영역은 원근 방향으로 물러났다가 정착한다. Header·Footer 탐색 영역은 전환 transform 대상에서 제외한다. 오버레이는 장식이며 `aria-hidden`, `pointer-events:none`을 사용한다.
- 독립적인 archive 최초 진입 애니메이션을 제거해 공통 전환 종료 후 재시작되는 중복 효과를 방지했다. 기존 정책·Support 디자인과 우주 자산은 보존했다.

브라우저에서 `view-transition-name: root` CSS 지원을 관측했지만, 이 구현은 View Transitions API를 전제로 하지 않는다. 현재 Vinext 0.0.50의 `router.push`는 완료 Promise를 제공하지 않으므로 실제 URL·DOM 준비 확인을 사용한다. 프레임 스냅샷이나 비공개 라우터 메서드에는 의존하지 않는다.

## 시간과 인트로 정책

| 경로 | 데스크톱 연출 | 모바일 연출 |
| --- | --- | --- |
| HOME ↔ SUPPORT | 740ms | 622ms |
| HOME ↔ PRIVACY / TERMS / DELETE ACCOUNT | 560ms | 470ms |
| 하위 페이지 간 | 460ms | 386ms |
| 브라우저 뒤로·앞으로 | 즉시, 워프 생략 | 즉시, 워프 생략 |
| reduced motion | 120ms 저강도 fade, 공간 이동·SVG 생략 | 동일 |
| 첫 홈 인트로에 연결 | 워프 대기 0ms | 동일 |

출발은 최대 160ms(모바일 120ms), 도착은 220ms(모바일 180ms)다. 라우트 요청을 애니메이션 기한까지 보류하지 않는다. 준비된 페이지는 바로 포커스·스크롤 처리를 받고, 장식이 남아 있어도 입력을 차단하지 않는다. 늦은 페이지는 기존 콘텐츠를 유지하며 준비된 뒤 도착 구간을 완료한다. 준비되지 않은 이동은 2.5초의 안전 기한에서 장식·busy·타이머를 해제한다.

첫 홈 방문의 인트로 재생 여부를 기존 정책에서 읽고, 인트로가 필요한 경우 짧은 워프를 생략한다. 최초 홈 재생 기회를 사용했다고 임의 기록하지 않는다. 기존 세션 키·6초 비행·10개 문자 바운스·개발 `intro=full/replay` 정책은 유지했다. 인트로 컴포넌트는 Context import만 변경했다.

현재 Windows OS는 reduced motion이다. 전체 워프는 **개발 전용 `/?warp=full`**에서 확인했다. 이 설정은 같은 SPA 세션의 이후 이동에도 적용되며 새로고침하면 현재 URL에서 다시 판단한다. 일반 URL 새로고침은 OS 설정을 존중한다. 생산 환경에서는 이 QA 설정을 무시한다. UI에 테스트 버튼은 추가하지 않았다.

## Windows 실제 브라우저

ChatGPT 내장 브라우저에서 실제 마우스·키보드 입력과 화면 캡처를 사용했다. 최종 기본 크기는 1280×720이며 임시 viewport·큰 글자 설정을 복원했다.

| 검사 | 실제 관측 |
| --- | --- |
| HOME → SUPPORT → HOME | 출발·별빛 streak·도착, 준비 후 제목/메인 포커스, 스크롤 0, 중복 인트로 없음 |
| HOME → PRIVACY → TERMS → HOME | 각 경로·제목·polite 도착 안내 일치 |
| SUPPORT → DELETE ACCOUNT → SUPPORT | 정상 이동, ETC PEPESNAP·열린 FAQ 상태가 다른 페이지로 공유되지 않음. 복귀 시 기존 기본 Mapary·FAQ 닫힘 |
| 하위 경로 직접 접속 | Support·Privacy·Terms에서 워프/인트로 없음, 인트로 세션은 new로 유지 |
| 첫 홈 연결 | Terms → 첫 홈에서 warp 없음, 기존 reduced 인트로 running 관측. 추가 워프 대기 없음 |
| 전체 인트로 | `intro=full`: full·문자 10개·warp 없음 → 정상 종료·메인 opacity 1·장식 숨김 |
| reduced 인트로 | `intro=replay`: reduced·문자 animation none·비행 장식 숨김 |
| 실제 reduced motion 전환 | 120ms veil, SVG 별빛 0개, 본문 transform none |
| 키보드 | Enter 링크 활성화, 도착 h1/메인 포커스, `role=status`·polite·atomic의 페이지 제목 안내 |
| 앵커 | Support → `/#about`에서 h2 포커스·헤더 아래 도착. 같은 페이지 `#apps`는 워프·busy 없이 메뉴 닫힘과 스크롤/포커스 이동 |
| 빠른 재탐색 | 전환 중 Privacy → Terms 키보드 활성화에서 마지막 Terms 적용. 이후 빠른 뒤로/앞으로에서도 stale 가림 없음 |
| 마우스 반복 | 홈 링크 더블클릭 후 정상 홈 도착. Back 한 번에 이전 Privacy로 돌아가 중복 history 없음 |
| 전환 중 새로고침 | 가림·busy 없음, 기존 seen 인트로 반복 없음 |
| history 스크롤 | Back에서 이전 Delete Account 하단 3743px, Forward에서 Support 도착 위치 0px 복원 |
| 320×740·큰 글자 | 18개 별빛·0.622s·pointer-events none·수평 overflow 없음 |
| 820×1180 | 28개 별빛·HOME→PRIVACY 0.56s·수평 overflow 없음 |
| 대표 앱 회귀 | 7개 앱·TOCOBI/SKKOO 이름, Pulto PNG 디코딩·플랫폼 2개, Pulto 상세, EVRUNE Phone→Pad 4개 이미지 전환. 상세/FAQ/앱 선택에 warp 없음 |
| 최종 콘솔 | 새 최종 검증 탭에서 error·warn 0건 |

이동 중 폐기된 DOM을 가리킨 자동화의 두 번째 마우스 클릭은 유효한 링크 활성화로 세지 않았다. 링크 노드가 교체되는 시점의 locator 시도는 실패 기록에 남겼으며, 정상 마우스 이동·더블클릭·수신된 연속 키보드 활성화와 수명주기 단위 검사로 구분해 검증했다.

## 시각 증거

로컬 ignored `outputs/cosmic-page-transitions/`에 저장했다. 변경 전 `before-home.jpg`, `before-navigation.jpg`, `before-support.jpg`와 최종 `verified-before.jpg`, `verified-0.jpg`~`verified-7.jpg`를 같은 기본 viewport에서 비교한다.

최종 `verified-frames.json`의 호출 시작 기준 관측은 다음과 같다. 자동화 입력·캡처 왕복 시간이 포함되므로 FPS나 라우트 로딩 시간 측정값이 아니다.

| 관측 프레임 | 호출 기준 시각 | 내용 |
| --- | --- | --- |
| verified-0 | 25ms | 출발 전 HOME |
| verified-1 | 224ms | HOME 콘텐츠 원근 이동 시작 |
| verified-2 | 410ms | 새 DOM 준비, 보라색 공간·별빛 통과 |
| verified-3 | 633ms | 긴 방사형 streak와 터널, 도착 콘텐츠 등장 |
| verified-5 | 817ms | 장식 fade 마무리 |
| verified-6 | 907ms | 안정된 SUPPORT, 장식 해제 |

최종 8개 프레임 모두 Header/Footer transform은 none, 수평 overflow는 false였다. `mobile-verified-metrics.json`, `tablet-final-metrics.json`, `direct-routes.json`, `first-home-handoff.json`, `reduced-motion.json`, `routing-matrix.json`, `history-repaired.json`, `double-click-navigation.json`, `refresh-during-transition.json`, `anchor-navigation.json`, `intro-regression.json`, `app-regression.json`에 범위별 결과를 구분했다. 중간 프레임·실패한 locator 시도도 삭제하지 않았다.

## 성능·오류·검증 한계

새 의존성 0개, 추가 Canvas/WebGL 0개다. 단일 SVG의 방사형 별빛은 데스크톱 40개·태블릿 28개·모바일 18개가 표시된다. 프레임마다 React 상태를 갱신하거나 상시 rAF를 돌리지 않는다. 준비 확인은 30ms의 한정된 타이머이며 종료·오류·재탐색·숨김·이탈에서 해제한다. 장식은 종료 후 DOM에서 제거된다.

Vinext의 history 좌표 키를 기존 state와 병합해 마지막 도착 위치도 저장한다. 이 보정은 현재 고정 버전의 복원 계약에 근거한다. 스크롤 중 반복적인 History API 호출을 피하도록 정착 150ms 후 한 번 기록하고, blur·history 키·pagehide 및 페이지 정착 때 좌표를 갱신한다. 기존 router metadata·URL·history entry 수는 보존한다.

지연·실패·숨김 취소·오래된 콜백·100회 스크롤 burst의 정리 경로는 결정적인 타이머 단위 검사로 확인했다. 실제 네트워크 장애 주입·모든 JS 예외·실제 탭 비활성화 조합을 브라우저에서 전부 재현한 것은 아니다. Ctrl/Cmd/Shift/Alt·다른 target·다운로드·외부·mailto 비가로채기는 분류 단위 검사와 기존 anchor 구조로 확인했다.

실제 모바일 터치·macOS 런타임·스크린리더 제품은 미실행이다. 브라우저 heap/GPU 메모리·FPS·Core Web Vitals·정량 CLS는 측정하지 않았다. 보이는 프레임·속성·요소 수와 단위 타이머 정리를 성능 점수로 확대 해석하지 않는다.

## 기술 검사와 Git

| 검사 | 실제 결과 |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run test:unit` | PASS — 65/65, 탐색/스크롤 신규 13개 포함 |
| `npm run build` | PASS — 기존 plugin timing·Vinext route classification 안내 유지 |
| `node --test tests/rendered-html.test.mjs` | PASS — 15/15 |
| `node scripts/verify-graft.mjs` | PASS — 6/6, structural freshness 정상 |
| `git diff --check` | PASS |

- `87ae236` — `feat: add bounded cosmic navigation lifecycle`
- `1d63544` — `feat: integrate cinematic cosmic route transitions`
- 이 실행 기록·검사 지침은 별도 로컬 문서 커밋으로 남긴다. 최종 HEAD·working tree는 최종 보고에서 확인한다.
- 기존 개발 서버 한 개를 유지했다. Push·원격 브랜치/태그 생성·배포 없음.

일반 미리보기: <http://localhost:3000/>. 전체 모션 개발 검증: <http://localhost:3000/?warp=full>.
