# Support 앱 선택 복구

2026-10-30 — **SUPPORT_APP_SELECTION_VERIFIED**

## 원인과 재현

시작 상태는 `main`, HEAD `170cf56155ab2132e231f0026c0663ab03fe6be6`, working tree clean이었다. Fetch 후 `git pull --no-rebase --ff-only`는 already up to date였다. 기존 localhost:3000 서버를 재사용했다.

넓은 화면에서 7개 앱과 ETC의 클릭은 정상이었으나, **800×900px에서 레일이 가로로 넘칠 때** Pulto·EVRUNE·TOCOBI·SKKOO·Teru Bozu·WAESSEUM·ETC를 각각 클릭해도 Mapary가 유지됐다. 같은 상태에서 Enter로 Pulto를 선택하면 문의 정보가 바뀌었다.

`app/support/SupportContent.tsx`의 `startAppRailDrag`는 실제 드래그 여부를 확인하기 전에 `pointerdown`에서 레일에 `setPointerCapture`를 호출했다. 임시 개발 진단으로 실제 브라우저에서 다음 이벤트를 관측했다.

```text
pointerdown: target="Pulto 선택", capture=true
click: target="support-app-rail", dragged=false
```

따라서 카드의 `onClick`까지 이벤트가 도달하지 않았다. `selectedCategoryId`를 ID로 관리하는 기존 상태와 `createSupportRequest`의 문의 정보 생성은 정상이었다. Mapary로 다시 초기화하는 effect나 잘못된 앱 ID가 원인은 아니었다. 진단 로그는 최종 코드에서 제거했다.

## 변경

- `SupportContent.tsx`: 기존 5px 임계값을 넘겨 실제 마우스 드래그가 시작될 때만 포인터를 캡처하고 dragging 표시를 켠다. 버튼을 누르고 있지 않은 이동은 무시한다. 새 포인터 입력은 이전 드래그의 클릭 억제 상태를 해제하며, 키보드 클릭은 억제하지 않는다.
- 카드의 실제 button·`aria-pressed`·ID 기반 상태·단일 선택·polite 문의 이름과 두 이메일 링크의 공통 데이터 소스는 유지했다. 별도 선택 상태나 앱 이름 기반 예외를 추가하지 않았다.
- `public/assets/archive/archive.css`: 스크롤 콘텐츠 안의 여백을 갤러리의 고정 여백으로 옮겨 화살표가 카드 레일 위를 덮지 않도록 했다. 데스크톱 좌우 52px, 모바일 40px이며 기존 카드 크기·색상·테두리·선택 강조·포커스·모션 정책은 유지했다.

## 실제 문의 계약과 선택 행렬

현재 Support는 문의 작성 안내와 **메일 앱에 전달할 `mailto:` 링크**를 생성한다. 서버 접수 API나 웹 제출 폼을 새로 만들지 않았다. 두 링크의 수신자·제목·인코딩된 본문을 읽어서 검증했으며, 메일 앱을 열거나 외부 이메일을 발송하지 않았다.

Windows ChatGPT in-app browser에서 800px 화면과 320px·큰 글자 화면의 실제 보이는 카드를 클릭했다. 카드가 화면 밖이면 기존 화살표로 먼저 이동했다. 각 단계에서 선택된 버튼은 정확히 하나였고, 선택 강조·문의 이름·두 메일 링크의 본문이 일치했다.

| 대상 | 카드 클릭 | 선택 강조 | 문의 이름·메일 본문 | 결과 |
| --- | --- | --- | --- | --- |
| Mapary | 정상 | Mapary | Mapary | PASS |
| Pulto | 정상 | Pulto | Pulto | PASS |
| EVRUNE | 정상 | EVRUNE | EVRUNE | PASS |
| TOCOBI | 정상 | TOCOBI | TOCOBI | PASS |
| SKKOO | 정상 | SKKOO | SKKOO | PASS |
| Teru Bozu | 정상 | Teru Bozu | Teru Bozu | PASS |
| WAESSEUM | 정상 | WAESSEUM | WAESSEUM | PASS |
| ETC | 정상 | ETC | 선택한 PINI / PEPESNAP / Other | PASS |

- 일반 앱의 기존 `[SAME STUDIO] Support` 제목을 보존했다. ETC → PINI / PEPESNAP은 각각 앱을 식별하는 제목과 본문, Other는 General Inquiry 제목과 한국어 Other 본문을 확인했다.
- ETC → Mapary → Pulto, Pulto 반복 클릭을 확인했다. ETC 세부 선택은 기존 정책대로 ETC를 떠났다가 돌아와도 보존된다.
- Tab으로 순서대로 8개 카드에 포커스하고 Enter/Space로 선택했다. 매번 문의 정보가 일치했고 포커스 outline이 보였다.
- 양방향 화살표 스크롤, 마우스 가로 드래그, 드래그 중 오선택 방지, 드래그 후 키보드·카드 재선택을 확인했다. 가로 드래그에서 scrollLeft는 0 → 202로 바뀌고 문의 대상 Pulto는 유지됐다.
- 포인터를 레일 밖으로 세로 이동해 놓은 뒤에도 dragging이 남지 않았고 TOCOBI를 클릭할 수 있었다.
- 320px·큰 글자에서 8개 대상 모두 정상이며 문서의 수평 overflow가 없었다. 화살표 사각형과 카드 레일의 교차 영역이 없음을 확인했다. 초기 화면 밖 카드의 자동 클릭 검사는 실제 카드가 아닌 가장자리/화살표에 도달했으므로, 최종 회귀는 화살표로 카드를 완전히 표시한 다음 hit target을 확인하고 클릭했다.
- 최종 탭의 console error·warn은 0건, FAQ는 12개였다. 기본 글자 크기와 viewport override를 복원하고 Pulto가 선택된 Support 탭을 유지했다.

## 기술 검증과 범위

| 검사 | 실제 결과 |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run test:unit` | PASS — 기존 52/52 |
| `npm run build` | PASS — 기존 plugin timing·Vinext route classification 안내 유지 |
| `node --test tests/rendered-html.test.mjs` | PASS — 14/14 |
| `node scripts/verify-graft.mjs` | PASS — 6/6, structural freshness 정상 |
| `git diff --check` | PASS |

포인터 회귀는 위 실제 브라우저 시나리오로 검사했다. 기존 단위 검사는 5개 언어의 모든 앱·ETC 문의 제목/본문과 FAQ 일관성을 포함한다. 메인 쇼케이스·앱 7개·TOCOBI·Pulto 자산·플랫폼 정보·Cosmic Intro·정책 페이지는 수정하지 않았고 관련 단위/HTML 검사가 통과했다. 모든 기능을 다시 수동 검증했다는 의미는 아니다.

모바일 크기에서 사용한 입력은 마우스 클릭과 마우스 드래그다. 실제 touch 이벤트·터치 스와이프·물리 모바일 기기와 macOS 런타임은 미실행이다. 네이티브 터치 스크롤의 `touch-action: pan-x pan-y`와 마우스에 한정한 커스텀 드래그 조건은 유지했다.

로컬 증거는 ignored `outputs/support-app-selection/`에 저장했다. `before-overflow-clicks.json`, `before-pointer-events.json`, `before-overflow.jpg`, `after-selection-800.jpg`, `final-desktop-matrix.json`, `keyboard-matrix.json`, `etc-round-trip.json`, `committed-mobile-matrix.json`, `mobile-pulto-final.jpg`, `final-drag-and-selection.json`, `abandoned-gesture.json`을 구분해 확인한다. 중간 실패 검사는 최종 PASS 행렬로 대체해 숨기지 않고 함께 보존했다.

## Git과 재검증

- `c5014b0` — `fix: preserve support app clicks until dragging starts`
- `1423516` — `fix: keep support arrows outside app card hit areas`
- 이 실행 기록은 별도 로컬 문서 커밋으로 남긴다. Push·원격 브랜치/태그 생성·배포 없음. 기존 개발 서버를 유지한다.

재검증할 때는 800px처럼 **레일이 넘치는 폭에서 네이티브 포인터로 Pulto를 클릭**해야 한다. 넓은 화면이나 Enter 선택만으로 재현 여부를 판단하지 않는다. 이어서 카드·강조·문의 이름·두 mailto 본문, ETC 왕복, 드래그 후 재선택을 함께 확인한다.

미리보기: <http://localhost:3000/support/>
