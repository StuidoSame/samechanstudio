# 현재 디자인 기준선

새 디자인 제안이 아닌 2026-10-29 코드의 관찰 기록이다. 실제 원천은 `app/globals.css`와 각 컴포넌트다.

## 색상·테마

| 토큰 | Light | Dark |
| --- | --- | --- |
| `--theme-page` | `#f3eeff` | `#191522` |
| `--theme-text` / `--ink` | `#241442` | `#f1ebff` |
| `--theme-accent` / `--purple` | `#7045df` | `#b99cff` |
| `--active-accent` | `#ff5559` | `#ff7d89` |
| `--theme-page-flow` | `#f2ebff` | `#211b31` |

`globals.css:16-109`에 surface, border, shadow, star, glow, overlay, device-frame/input/disabled 토큰이 있다. 기본 CSS는 light지만 RootLayout 초기화는 저장값이 없으면 dark를 선택한다. 앱별 accent/RGB는 `app/lib/apps.ts`에서 가져온다. 별·성좌·궤도·성운·보라색 발광과 반투명 glass가 우주 테마를 이룬다.

## 글꼴·크기·간격

`globals.css:3`의 로컬 `/assets/font/BMJUA.otf`는 font-display swap과 unicode-range를 사용한다. 일본어·중국어는 `globals.css:141-173`의 시스템 fallback stack을 사용한다. 일반 scale은 small 0.92 / medium 1 / large 1.12, display scale은 0.96 / 1 / 1.04다 (`:58-70`). 이를 단순 브라우저 zoom으로 대체하지 않는다.

간격·radius·shadow 전체를 관리하는 독립 token 객체는 없다. 전역 CSS의 각 section 규칙과 clamp/viewport 계산이 기준이다. 고정 헤더 높이 token은 기본 84px, 767px 이하 분기에서 104px다 (`:20`, `:3098`). 임의의 새 spacing 체계를 기존 규칙 위에 덧씌우지 않는다.

## 레이아웃·컴포넌트

메인은 전체 높이 앱 hero → ABOUT → DEVICES의 Phone/Pad/Watch → CONTACT → Footer 흐름이다. 카드 궤도와 3D depth는 DOM transform과 HomeExperience 수치 계산을 사용한다. JellyCanvas만 별도 WebGL shader다. 이미지 중심 카드는 앱별 accent, 선택 상태와 플랫폼 표시를 가진다. `VIEW DETAIL`은 pill 형태로 상세 overlay를 연다.

Header의 LANG, Aa, theme/audio utility와 hamburger, section navigation, Footer는 여러 화면에서 공유된다. 법적·지원 화면은 `PolicyPageLayout`, archive card/목차·장식과 `app/policy-pages.css`를 사용하며 계정 삭제 화면은 전용 CSS도 사용한다.

반응형은 하나의 breakpoint 집합이 아니다. 주요 구간은 767px 이하, 768–1023px, 1024px 이상이며 359/400/420/600/680/700/900/1100/1280px 및 낮은 높이 보정도 있다. CSS 조건과 JS `getCarouselPositionAnchors` 계산을 함께 확인한다. narrow desktop browser에서 보이는 화면만으로 실제 iOS/Android 검증을 주장하지 않는다.

## 모션·터치·접근성

캐러셀에는 관성·자동 재생·타이핑·이름 강조·플랫폼/상세 노출 순서가 있다. `appCarouselTiming.ts`와 `typeRevealTiming.ts`를 타이밍 기준으로 사용한다. 페이지·archive 전환은 `navigation/` 및 `ArchivePortalTransition`이 맡는다. 시야 밖·탭 비활성·blur에서 정지하는 정책과 cleanup을 유지한다.

hover/fine pointer와 coarse/touch를 분리하고 pan-y, pinch-zoom, manipulation 등 기존 touch-action을 보존한다. 메뉴·overlay가 열린 동안의 pointer/autoplay 정책도 확인한다. ARIA·focus·Escape/방향키·reduced motion이 구현되어 있지만 정식 접근성 인증은 없다. 큰 글자, 5개 로케일, 두 테마, 키보드와 reduced motion에서 변경 부분을 검증한다.
