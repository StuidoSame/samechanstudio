# 인트로 라우팅·세션 감사

2026-10-29, Windows 내장 Chromium. 시작 HEAD `511605a`, branch `main`.
기존 개발 서버 하나를 재사용했다. 디자인·행성·문자 바운스 CSS는 수정하지 않았다.

## 발견과 수정

1. 새 탭의 Support → 첫 홈에서 인트로가 생략됐다. 내부 이동 marker와 진행 중인 페이지 전환을 영구적인 재생 불가 상태로 취급했고 홈 마운트가 URL 갱신보다 앞설 수도 있었다. `CosmicIntro`는 전환 정리가 끝난 뒤 처음 판단하도록 수정했다. 재생 중 다른 경로로 떠나면 기존 cleanup을 유지한다.
2. 기존 코드는 재생 시작에 완료값 `1`을 썼다. 실제 브라우저에서도 `running` 중 `cosmicIntroSeen=true`였다. 시작·완료·사용자 스킵·중단을 별개 값으로 저장하도록 수정했다. 시작 기록도 반복을 막으므로 재생 도중 새로고침에서 다시 기다리지 않는다.
3. 저장소를 읽을 수 없는 일반 방문은 즉시 콘텐츠를 표시한다. 저장소 쓰기 실패, 로고 애니메이션 부재·paused 상태·API 예외도 즉시 정리한다. 초기화 API 오류와 head 예외는 활성 플래그를 남기지 않는다. 재생 후 end 이벤트가 없으면 기존 duration+200ms deadline으로 정리하며 정상 완료로 오인하지 않는다.

수정 커밋: `8db1fee`, `bce2fd4`. 사용자 저장값 삭제, 새 라이브러리, push, 배포는 없다.

## 정책과 실제 브라우저 결과

현재 OS의 실제 reduced motion 설정은 `reduce`였다. 일반 방문의 최초 재생은 정적 로고 1.2초이며, 전체 모션은 정식 개발 `intro=full` 경로에서 실행했다. OS 설정을 바꾸거나 matchMedia를 모의로 교체하지 않았다.

| 시나리오 | 기대 | 실제 | 결과 |
| --- | --- | --- | --- |
| Support 직접 진입 | 즉시 콘텐츠, 방문 미소모 | main opacity 1, 인트로 DOM 없음, session new | PASS |
| Terms 직접 진입 | 즉시 콘텐츠, 방문 미소모 | main opacity 1, 인트로 DOM 없음, session new | PASS |
| Privacy 직접 진입 | 즉시 콘텐츠, 방문 미소모 | main opacity 1, 인트로 DOM 없음, session new | PASS |
| Delete account 직접 진입 | 즉시 콘텐츠, 방문 미소모 | main opacity 1, 인트로 DOM 없음, session new | PASS |
| 독립 새 탭 홈 최초 진입 | 접근성 설정에 맞게 1회 | started → complete, 정적 로고 → Hero | PASS |
| A: Support → 첫 홈 | 첫 홈에서 1회 | URL·전환 정리 후 running, 시작과 완료 기록 분리 | PASS |
| A/B: 완료 후 Support → 홈 | 재생 없음 | skipped-seen, Hero opacity 1 | PASS |
| C: Privacy → Terms → Support → 홈 | 하위 페이지는 미소모, 홈 1회 | 하위 페이지 session new 유지, 홈에서 started → complete | PASS |
| D: 홈 → Delete account → 홈 | 최초 홈만 재생 | 안내 페이지에 인트로 없음, 복귀 skipped-seen | PASS |
| E: 뒤로 Support / 앞으로 홈 | URL·내용 일치, 반복 없음 | 올바른 canonical·제목·DOM, 홈 skipped-seen | PASS |
| 완료 후 홈 새로고침 | 재생 없음 | 저장소에서 complete 복원, 즉시 Hero | PASS |
| 재생 중 새로고침 | 반복 대기 없음 | started → interrupted, reload skipped-seen | PASS |
| 재생 중 직접 Support 이동 / 홈 복귀 | 정리 후 반복 없음 | Support session interrupted, 홈 skipped-seen | PASS |
| 키보드 Tab 스킵 | 즉시 정리, 정상 키 이동 | finished-input/session skipped, 다음 언어 컨트롤에 focus | PASS |
| 스킵 후 새로고침 | 반복 없음 | skipped 복원, 즉시 Hero | PASS |
| 개발 full | 전체 모션, 일반 방문 미소모 | scene block, 문자 바운스·6천체·별빛, 종료 후 session new 유지 | PASS |
| full 후 일반 홈 | 아직 첫 방문 기회 있음 | 일반 홈에서 최초 started → complete | PASS |
| 개발 replay | 접근성 존중, 기존 기록 보존 | reduced 정적 로고, complete 기록 보존 | PASS |
| replay 후 일반 홈 | 재생 없음 | skipped-seen | PASS |

직접 진입 네 페이지는 각각 새 빈 탭에서 열었고 모두 `session=new`를 확인했다. 기존 탭의 세션 저장소를 지우지 않았다. 페이지 하단 링크 이동으로 스크롤과 라우팅을 확인했고 Support FAQ 버튼도 실제로 열었다. 종료 후 body aria-busy 없음, overflow auto, Hero opacity 1, 장식 숨김, canvas 0이었다. 감사용 탭 11개에서 console warn/error는 없었다.

## 테스트로 보완한 범위와 실행 한계

| 항목 | 검증 방식 | 결과 / 제한 |
| --- | --- | --- |
| 일반 no-preference 분기 | 단위·빌드 초기화 스크립트 실행, 개발 full의 실제 렌더링 | PASS. OS를 no-preference로 바꾼 일반 방문은 미실행 |
| 프로덕션 preview 무시 | 빌드된 head 스크립트 VM 실행 | PASS. seen 상태는 재생하지 않고 reduce 설정도 우회하지 않음 |
| sessionStorage 읽기·쓰기 예외 | 단위 테스트, 빌드 스크립트 VM | PASS. 실제 브라우저 저장소 권한 차단은 미실행 |
| 애니메이션 없음·paused·API 예외 | 단위 테스트 | PASS. 실제 브라우저 CSS/JS 고장 주입은 미실행 |
| 초기화 API 오류 | 단위·빌드 스크립트 VM | PASS. 활성 플래그·세션 기록 없음 |
| 탭 비활성화·pagehide·motion change·deadline | 이벤트·타이머·리스너 회귀 테스트 | PASS. 실제 pagehide는 새로고침·URL 이동에서 interrupted 관측 |
| 비활성 탭의 visibilitychange | 브라우저에서 새 탭 생성 시도 | NOT_VERIFIED: 문서가 visible로 유지되어 hidden 재현 불가. 단위 테스트는 통과 |
| opener를 가진 탭 복제 | 정책 검토·저장 상태별 테스트 | 실제 복제 탭 NOT_VERIFIED. 상속된 상태를 삭제하거나 새 방문으로 강제 처리하지 않음 |
| JavaScript 완전 비활성화 / screen reader | SSR 기본 상태·ARIA·focus 정적 검토 | 실제 브라우저 JS off와 보조 기술 런타임 NOT_VERIFIED |
| macOS Safari | 플랫폼 중립 경로·CSS·npm 명령 검토 | 실행 NOT_VERIFIED |

## 저장 상태

키는 `same-studio-cosmic-intro-v2`를 유지한다. 준비 단계는 저장하지 않는다. 실제 로고 CSS 애니메이션을 확인한 다음 `started`, 정상 로고 animationend에서 `1`, 신뢰된 사용자 입력에서 `skipped`, 이탈·중단·deadline에서 `interrupted`를 쓴다. 네 값 모두 재방문을 막는다. 개발 프리뷰는 읽기만 하고 어떤 방문 상태도 새로 쓰지 않는다. 이전 v1과 관련 없는 저장값은 보존한다.

## 접근성·SEO·오류 복구

인트로는 홈에서만 마운트되며 장식 ARIA hidden과 pointer-events none을 유지한다. 키 입력을 취소하지 않고 현재 동작과 focus 이동을 계속한다. 하위 페이지 SSR에는 주요 main·제목·링크·각 canonical이 있고 인트로 DOM은 없다. JS가 없으면 활성 attr도 없으므로 기본 콘텐츠가 보인다. CSS는 hydration 없이도 최종 Hero를 노출하며 JS 수명주기는 애니메이션 부재·오류·deadline에서 활성 attr를 제거한다. 저장소를 읽을 수 없으면 일반 방문에서는 대기를 만들지 않는다.

## 자원과 성능

빌드 HTML의 다섯 경로를 검사했다. 홈에서만 HomeExperience 모듈·인트로 DOM을 참조하며 하위 네 경로에는 둘 다 없다. 공통 head의 조건 판단 스크립트는 2,416 bytes다. PolicyPageLayout과 SupportContent의 빌드 import 그래프에는 HomeExperience가 없다. Support와 Delete account의 실제 관측 resource inventory에서 HomeExperience·인트로·행성·JellyCanvas·Three 관련 자산은 0개였고 canvas도 0개였다. 대규모 번들 분할은 필요하지 않아 수행하지 않았다.

기존 개발 서버는 port 3000의 단일 listener, PID 22636이었다. 점검 순간 working set 300.7MiB, private memory 456.5MiB였으며 비교 기준이나 leak 판정값은 아니다. 새 watcher·서버·렌더링 루프는 없다. 단위 테스트는 종료 후 타이머·리스너 제거와 중복 cleanup을 확인한다. FPS·GPU·Core Web Vitals는 측정하지 않았다.

## 검사와 증거

TypeScript, 전체 ESLint, 단위 테스트 31개(인트로 17개 포함), HTML 테스트 10개, 빌드가 통과했다. 기존 Vinext plugin timing·route classification 경고는 남아 있다. 주요 다섯 경로의 HTTP 200도 확인했다.

로컬 ignored `outputs/`의 증거:

- `intro-routing-before.json`, `intro-routing-start-before.json`: 수정 전 실제 실패와 조기 완료 표시.
- `intro-routing-matrix.json`: URL·세션·로고·Hero·focus·본문·스크롤의 35개 시점 관측.
- `intro-routing-console.json`: 감사 탭의 콘솔 결과.
- `intro-routing-assets.json`, `intro-routing-built-routes.json`: 관측 자산과 빌드 SSR 경계.
- `intro-routing-support.png`, `intro-routing-support-first-home.png`, `intro-routing-full-preview.png`: 실제 화면 캡처. 움직임과 재생 정책은 스크린샷 단독이 아닌 시간별 DOM 기록과 함께 판단했다.
