# 우주 인트로 실행·재생

`CosmicIntro.tsx`, `introLifecycle.ts`, `cosmic-intro.css`가 재생 정책과 연출을 맡는다. 메인 별 레이어를 재사용하며 추가 Canvas나 라이브러리는 없다. 메인 DOM·이벤트·이미지 초기화는 인트로 완료를 기다리지 않는다.

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
