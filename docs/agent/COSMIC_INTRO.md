# 우주 인트로 실행·재생

`CosmicIntro.tsx`, `introLifecycle.ts`, `cosmic-intro.css`가 재생 정책과 별 이동을 맡는다. `CosmicScenery.tsx`와 `cosmic-scenery.css`는 행성·별자리를 더한다. 메인 별 레이어를 재사용하며 추가 Canvas나 라이브러리는 없다. 메인 DOM·이벤트·이미지 초기화는 인트로 완료를 기다리지 않는다.

## 행성·별자리와 공간 이동

일반 모션에서 원거리 행성, 중거리 위성, 가까운 고리 행성이 서로 다른 Z 경로를 따라 이동한다. `perspective`가 가까워지는 물체의 크기와 주변 시야로 빠져나가는 속도를 함께 변화시킨다. 음영은 정적 CSS 그라데이션·shadow·mask로 표현하며 별도 이미지 요청이 없다. 로고 중앙을 비워 두고 얇은 SVG 별자리 두 개를 주변에 배치한다.

| 구간 | 연출 |
| --- | --- |
| 0–24% | 중앙 로고와 별자리, 먼 행성을 인지하는 안정된 장면 |
| 24–50% | 행성·위성이 가장자리로 다가오며 전진 시작 |
| 50–82% | 가까운 별의 Z 이동과 긴 streak가 가속되고 별자리는 뒤로 사라짐 |
| 68–100% | rush와 겹쳐 기존 Hero를 노출하고 모든 장식 레이어를 정리 |

별의 far/mid/near 레이어는 같은 소실점을 사용하고 서로 다른 원근 경로와 streak 길이를 갖는다. 빠져나간 별 레이어는 opacity가 0인 동안 원래 위치로 돌아와 메인 별 배경으로 이어진다. 바닥 격자와 기존 배경의 밝기는 변경하지 않는다.

767px 이하에서는 행성 2개와 별자리 1개만 렌더링에 참여한다. 기존 모바일 별 밀도 분기와 짧은 streak를 사용한다. reduced motion에서는 새 장식을 전부 숨기며 기존 1.2초 정적 로고 정책을 유지한다. 새 장식은 포인터를 가로채지 않고 보조 기술에서 숨긴다. 인트로가 끝나거나 스킵되면 `display:none`이 되므로 정지 화면에서 효과를 계속 렌더링하지 않는다.

추가 장식은 루트를 포함해 DOM/SVG 23개다. 새 JS 프레임 루프·타이머·리스너는 추가하지 않았으며 기존 수명주기 정리를 사용한다. GPU FPS·메모리·Core Web Vitals는 별도 측정 대상이다.

## 로고 문자 강조

`CosmicIntro.tsx`는 `SAME STUDIO`를 문자 span 11개(문자 10개·공백 1개)로 분리한다. 공백 span은 `white-space:pre`로 폭을 보존하고 움직이지 않는다. wordmark의 전체 `aria-label`로 브랜드명을 제공하며 개별 문자는 보조 기술에서 숨긴다. 인트로 자체는 기존처럼 장식 요소로 숨기고 메인 헤더의 접근 가능한 홈 링크를 유지한다.

전체 로고가 먼저 등장한 뒤 240ms부터 문자별 45ms 간격으로 한 번씩 강조한다. 각 문자는 280ms 동안 최대 9px 위로 이동하고 1.11배 커지며 흰보라색과 짧은 text-shadow로 강조된다. 전체 강조 구간은 공백 간격을 포함해 730ms이며, 마지막 문자는 970ms에 원래 크기·색·위치로 돌아온다. 강한 별빛 streak 앞에서 로고가 안정되고 기존 2.4초 인트로의 퇴장과 Hero 노출이 이어진다.

767px 이하에서는 상승 폭을 6px로, glow alpha를 0.4로 줄인다. reduced 모드에서는 문자 애니메이션을 적용하지 않아 완전한 정적 로고가 보인다. 명시적인 개발 `intro=full`에서는 OS의 reduced motion 설정과 관계없이 문자 모션까지 확인할 수 있으며 `intro=replay`는 설정을 존중한다.

문자 애니메이션은 `data-cosmic-intro=true`와 `motion=full`에만 연결된다. 종료 또는 스킵 시 기존 수명주기가 해당 속성을 제거하므로 문자 `animation-name`과 `transform`도 `none`으로 돌아간다. 문자 animationend는 인트로 완료로 취급하지 않고 바깥 로고의 기존 종료 이벤트만 사용한다. 추가 의존성·rAF·타이머·리스너는 없으며 DOM 증가량은 span 11개다.

## 개발 중 디자인 확인

기존 `npm run dev` 서버를 사용한다. 현재 미리보기 주소는 `http://localhost:3000/`이다.

| 주소 | 동작 |
| --- | --- |
| `/?intro=replay` | 기존 인트로 세션 기록과 관계없이 재생. reduced motion 설정을 존중한다. |
| `/?intro=full` | 전체 모션을 명시적으로 확인한다. reduced motion이 켜져 있어도 이 개발 프리뷰에서만 전체 연출을 사용한다. |
| `/` | 일반 방문 정책. 같은 탭 세션에서는 한 번만 재생한다. |

프리뷰는 기존 세션 기록을 지우거나 완료 상태를 새로 저장하지 않는다. 위 파라미터는 `NODE_ENV=development`에서만 유효하다. 프로덕션 빌드는 파라미터를 무시하며 디버그 버튼이나 테스트 UI를 렌더링하지 않는다. 해시·복원된 스크롤 위치·진행 중인 내부 페이지 전환은 일반 방문에서 보존한다.

## 일반 방문과 접근성

- 일반 모션은 2.4초의 CSS 시퀀스다. 별의 깊이별 이동 후 기존 홈 화면을 노출한다.
- reduced motion은 별·로고의 공간 이동 없이 1.2초 동안 로고를 표시하고 opacity로 전환한다.
- 실제 포인터·키보드·휠·터치 입력은 즉시 건너뛴다. 초기화 중 자동 포커스·스크롤·합성 이벤트는 스킵으로 간주하지 않는다.
- 비활성 탭과 `pagehide`에서는 연출을 정리한다. 타이머·이벤트 리스너를 해제하며 스크롤이나 포커스를 강제로 옮기지 않는다.
- `<head>`에서는 재생 조건만 정한다. 정리 기한은 실제 로고 CSS 애니메이션의 경과 시간에 맞추므로, SSR·자산 로딩 시간이 로고 표시 시간을 소진하지 않는다. hydration이 실패해도 CSS의 최종 상태는 메인 콘텐츠를 노출한다.

세션 키는 `same-studio-cosmic-intro-v2`다. 이전 v1은 재생하지 않은 방문까지 완료로 표시했으므로 새 키를 사용한다. 이전 키와 다른 저장값을 삭제하지 않는다. 숨겨진 탭·내부 이동 등 생략된 방문은 완료로 저장하지 않는다.

## 브라우저에서 확인할 증거

개발 환경의 `<html>`에는 `data-cosmic-intro-state`, `data-cosmic-intro-session`, `data-cosmic-intro-preference`가 표시된다. `prepared → running → finished-animation` 또는 `skipped-seen`을 확인할 수 있다. 이 진단 상태는 프로덕션에서 기록하지 않는다.

스크린샷과 함께 서로 다른 시점의 로고 opacity·좌표, far/near 별 레이어의 computed transform을 비교한다. 종료 시 `data-cosmic-intro`가 제거되고 로고는 `display:none`, 메인은 opacity 1이어야 한다. 바닥 격자 opacity가 전환 중 강제로 1이 되지 않는지도 확인한다.

2026-10-29 Windows 내장 Chromium에서 일반 URL의 새 탭·같은 세션 재방문·개발 프리뷰·실제 reduced motion 설정을 확인했다. 전체 모션은 정식 `intro=full` 경로로 검사했으며 OS 설정이나 `matchMedia`를 모의로 바꾸지 않았다. 데스크톱·모바일 크기의 연속 프레임과 computed style 기록은 로컬 ignored `outputs/cosmic-repair-*`에 저장했다. macOS와 실제 모바일 기기의 실행 검증은 별도다.

강화 연출은 같은 Windows 브라우저에서 1440×900, 390×844, 820×1180 크기로 확인했다. `outputs/cosmic-enhanced-*`에는 행성 좌표·로고와의 비중첩·별의 깊이별 transform·streak·종료 상태를 기록했다. 동일한 near 별의 화면 중심 반경이 관측 0.42초에 약 67px, 1.66초에 182px, 1.86초에 687px으로 증가했다. 이는 시각 연출의 가속 증거이며 GPU 성능 측정값은 아니다. Canvas는 0개였고 종료 후 장식과 로고가 숨겨지며 메인 opacity는 1이었다. 캐러셀, EVRUNE Phone/Pad 상세, 큰 글자 설정, 지원 페이지 왕복도 확인했다.

문자 강조는 2026-10-29 Windows 내장 Chromium의 기본 데스크톱 화면과 390×844·820×1180 viewport에서 확인했다. 로컬 ignored `outputs/cosmic-bounce-*`에 초기·강조 중·강조 후 스크린샷과 시간별 computed transform·색·text-shadow를 기록했다. 모바일 연속 관측에서 첫 S의 상승 시작 → M/E → 두 번째 S → U/D → 마지막 O의 강조가 이어지고 약 978ms 관측 시점에는 모든 문자가 원래 크기·위치로 돌아왔다. 관측 시간은 호출 시작 기준이며 CSS timeline과 정확히 일치하는 성능 측정값은 아니다. 공백과 전체 텍스트가 유지되고 가로 overflow는 없었다. 실제 reduced motion의 replay에서는 로고 opacity 1·모든 문자 animation/transform none을 확인했다. 종료 후 메인 opacity 1·장식 display none·문자 animation/transform none을 확인했고 콘솔 오류는 없었다.

이번 문자 강조 변경의 TypeScript, 전체 ESLint, 단위 테스트 26개, 빌드, HTML 테스트 10개가 통과했다. 캐러셀 키보드 전환, EVRUNE Phone 5개/Pad 4개 갤러리, 큰 글자 적용·기본값 복원, 지원 페이지 왕복을 실행했다. macOS와 실제 모바일 기기는 실행하지 않았으며 CSS·npm 명령의 플랫폼 중립성만 정적으로 검토했다. FPS·GPU 메모리·Core Web Vitals는 측정하지 않았다.
