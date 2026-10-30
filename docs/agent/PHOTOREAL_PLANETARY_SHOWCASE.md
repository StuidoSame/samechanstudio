# Photoreal-inspired app planets — 2026-10-30

판정: **PHOTOREAL_PLANETARY_SHOWCASE_VERIFIED**. Windows 실제 브라우저에서 이번 시각 변경과 아래 상호작용을 검증했다. macOS와 실물 터치 기기는 실행하지 않았다.

## 구현과 재질

기존 planetary DOM/CSS 구조에 앱당 장식용 `planet-shell` span 하나만 추가했다. 원본 아이콘·카탈로그·스토어 URL·상세 데이터는 변경하지 않았다. shell 지름은 아이콘의 1.30배이며 정사각형 아이콘이 구체 앞에 놓인다. SVG 표면의 좌상단 광원, relief, limb shading과 어두운 우하단을 하나의 이미지에 고정했다. CSS는 얇은 대기광과 x14/y18/blur24–42px 그림자를 조합한다.

| 앱 | 표면 | 대기·고리 |
| --- | --- | --- |
| Mapary | 청록·녹색·갈색 지형과 절제된 등고선 | 얇은 청록 rim, 희미한 탐사 궤도 |
| Pulto | 남보라·푸른 가스 띠 | 가장 밝은 보라 대기, 기울어진 고리 |
| EVRUNE | 어두운 자주·남색 구름과 먼지 | 은빛 달빛, 거의 없는 고리 |
| TOCOBI | 은회색·라벤더 층리 | 깨끗한 rim, 정제된 고리 |
| SKKOO | 크림·베이지 미세 입자 | 약한 따뜻한 rim, 먼지 고리 |
| Teru Bozu | 하늘색과 밝은 구름 | 청백색 대기, 희미한 halo |
| WAESSEUM | 회색 달 표면과 원근 압축된 분화구 | 매우 얇은 차가운 rim, 고리 없음 |

뒤 고리 → shell → 앞 고리 → 아이콘 순서로 가려짐을 구성해 고리가 아이콘을 덮지 않는다. 앱별 CSS 변수의 우선순위도 실제 computed style로 확인했다. 중앙은 전체 표면을 보여 주고 주변은 veil·대기·고리 강도를 낮춘다. 가까운 주변 아이콘의 실제 크기는 중앙의 약 0.69배다. 바깥 이웃은 더 작고 어둡다.

기존 spring·pointer parallax와 reduced motion 처리를 재사용한다. 새 라이브러리·Canvas·WebGL·rAF·타이머는 추가하지 않았다. 새 표면은 원본 생성기와 고정 seed로 만든 SVG 7개, 합계 **26,573 bytes**다. XML 파싱·외부 참조 부재·서로 다른 재질·재생성 SHA-256 일치를 확인했다. 빌드 결과에도 7개가 포함된다. SVG 필터는 정적 이미지 표현이며 FPS·GPU·Core Web Vitals 개선을 측정한 것은 아니다.

## 실제 실행 검증

| 검사 | 결과 |
| --- | --- |
| Windows 브라우저 시각 확인 | PASS — 7개 앱의 표면·명암·대기·고리·아이콘·이름·플랫폼 확인 |
| 데스크톱·태블릿·모바일 | PASS — 1440×900/810/768, 1152×900, 900×900/860, 390×844, 320×740/568, 1280×480 |
| 큰 글자·두 테마 | PASS — 320px 큰 글자, 낮은 데스크톱, 모바일 light/dark 확인 |
| 카드 클릭·화살표·키보드 | PASS — 앱 선택·순환·ArrowLeft, 선택 상태·포커스 유지 |
| 자동 재생·정지 | PASS — Pulto → EVRUNE 자동 이동 후 정지 |
| 상세 보기 | PASS — EVRUNE dialog 열기·닫기, 아이콘 및 Phone 이미지 5개 디코딩 |
| TOCOBI·Pulto | PASS — 쇼케이스 표시, 기존 이름·아이콘·스토어 데이터 검사 |
| Support·FAQ | PASS — 이동·ETC 선택·FAQ 12개·아코디언 열기, Support Pulto 디코딩 |
| 인트로 | PASS — 약 6초 후 Hero opacity 1·비행 중단·장식 숨김; 10개 문자 각각의 바운스 관측 |
| reduced motion·스킵 | PASS — 약 1.21초 replay, 재생 시작 후 실제 Escape 입력으로 finished-input·비행 중단 |
| 콘솔 | PASS — 확인한 페이지 오류 0개 |
| TypeScript·전체 ESLint | PASS |
| 단위 테스트 | PASS — 51/51 |
| 최종 빌드·HTML 검사 | PASS — 14/14; 기존 plugin timing·Vinext route 분류 안내 유지 |
| Graft·diff | PASS — 6개 MCP 도구·구조 freshness, `git diff --check` |

화면 높이에 따라 아이콘·정보 위치·Hero 최소 높이를 조절했다. 가로 overflow가 없으며 큰 글자에서도 버튼이 Hero 안에 남는다. 마지막 모바일 보정 후 320px shell은 약 302.5px, 390px shell은 약 368.7px로 스크롤바를 제외한 영역에 들어간다. 낮은 화면에서는 페이지를 스크롤할 수 있다.

실제 관측 자료는 ignored `outputs/photoreal-showcase/`의 변경 전·7개 앱·태블릿·모바일·큰 글자·상세 스크린샷과 크기별/인트로 JSON이다. 물리적인 터치 스와이프·macOS Safari·일반 모드 pointer parallax·화면 낭독기·GPU 성능은 별도 실행하지 않았다. 기존 터치/포인터 핸들러는 변경하지 않았고 OS reduced motion 환경의 동작을 검증했다.

시작 HEAD: `39a0695cb2682073a65417208a20395f002fb778`. 재질 커밋 `376a4ce`, UI 커밋 `ba7c45b`로 구분했다. 기존 개발 서버(PID 17184, localhost:3000)를 유지했으며 push·원격 브랜치·태그·배포는 수행하지 않았다.
