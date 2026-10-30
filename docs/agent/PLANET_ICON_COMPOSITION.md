# Planet / app icon composition — 2026-10-30

판정: **PLANET_ICON_COMPOSITION_VERIFIED** — Windows 브라우저에서 같은 Pulto·같은 viewport의 변경 전후 화면을 비교했다. macOS와 실물 터치 기기는 실행하지 않았다.

## 원인과 변경

기존 아이콘은 카드 전체를 채우고 그 뒤에 1.30배 구체가 같은 중심으로 놓였다. 아이콘이 표면 대부분을 가려 큰 사각형 스티커처럼 보였다. 카드 전체의 brightness/saturation/blur와 중복 궤도도 두 오브젝트의 분리를 약하게 했다.

`planet-body` 안에 뒤 고리·구체·대기·앞 고리를 묶고, 별도 형제 레이어에 `planet-icon-shadow`와 원본 아이콘 프레임을 배치했다. 구체는 왼쪽 위, 아이콘은 오른쪽 아래의 별도 공간을 차지한다. 아이콘을 원형으로 자르거나 구체 조명으로 덮지 않는다. 정착 프레임에서 구체 원과 아이콘 사각 경계 사이에도 빈 공간이 있어 표면의 절반 이상이 명확히 드러난다.

| Pulto 비교 | 행성 지름 | 앱 아이콘 |
| --- | --- | --- |
| 1152×900 이전 | 504.6px | 388.2px |
| 1152×900 이후 | 289.6px | 150.5px |
| 390×844 이전 | 368.7px | 283.6px |
| 390×844 이후 | 198.5px | 103.2px |

측정한 데스크톱 중앙 행성은 251–293px, 아이콘은 131–152px다. 가까운 주변 행성은 중앙의 약 0.69배다. 기존 7종 표면·공통 좌상단 광원·앱 데이터·아이콘 바이너리를 보존했다. Pulto와 TOCOBI만 얇은 고리를 유지하고 공통 SVG 궤도·광점·dust 장식을 제거했다.

기존 spring/rAF에서 그룹의 6.8초·최대 1.5px 부유와 아이콘의 최대 3px/2px pointer 차이를 처리한다. 새 루프·타이머·라이브러리·WebGL은 추가하지 않았다. float는 재생 중·문서 표시·Hero 근처에서만 적용한다. reduced motion에서는 float와 아이콘 tilt/parallax를 제거하고 모바일은 기존 pointer 제한을 유지한다. 행성용 필터는 `planet-body`에만 적용한다.

## 검증

| 항목 | 실제 결과 |
| --- | --- |
| 동일 앱/크기의 전후 시각 비교 | PASS — Pulto 1152×900 및 390×844, 표면·아이콘 분리 확인 |
| 7개 앱 | PASS — 모든 표면·원본 아이콘·이름·플랫폼·상세 버튼 표시 |
| 데스크톱·태블릿·모바일 | PASS — 1440×900/768, 1152×900, 1024×900, 900×900, 390×844, 320×740/568, 1280×480 |
| 큰 글자·테마 | PASS — 320px 큰 글자, 낮은 데스크톱, 모바일 light/dark |
| 페이지 탐색점 간섭 | PASS — 900/1024px에서는 3개 그룹 표시, 아이콘과 탐색점 비중첩 |
| 캐러셀 | PASS — 7개 순환·화살표·카드 클릭·ArrowRight·자동 재생·정지 |
| 상세 | PASS — TOCOBI Phone 6장·Pad 5장 전환 및 이미지 디코딩·닫기 |
| Support·FAQ | PASS — 페이지 왕복·ETC·FAQ 12개·아코디언 열기·Pulto 이미지 |
| 인트로 | PASS — 약 6.09초 종료·10개 문자 각각 바운스·Hero opacity 1 |
| reduced motion·스킵 | PASS — 약 1.15초 replay·문자 transform none, 실제 Escape로 finished-input·비행 종료 |
| 콘솔 | PASS — 확인한 페이지 오류 0개 |
| TypeScript / 전체 ESLint | PASS |
| 단위 / HTML 검사 | PASS — 51/51 및 14/14; 아이콘이 행성의 필터/aria-hidden 레이어 밖에 있는지 회귀 검사 |
| 최종 빌드 / Graft / diff | PASS — 기존 plugin timing·Vinext route 분류 안내 유지, 6개 MCP 도구·구조 freshness·diff 검사 통과 |

ignored `outputs/planet-icon-composition/`에 같은 앱의 before/after 이미지·7개 앱·모바일·태블릿·큰 글자·상세·크기·인트로 관측을 저장했다. 낮은 화면에서는 페이지 스크롤을 허용하며 측정한 모든 크기에서 가로 overflow와 Hero 내부 버튼 잘림이 없었다. 마지막 측정의 아이콘과 정보 영역 간격은 최소 약 19.5px였다.

일반 모드의 float/pointer 효과·실물 터치 스와이프·macOS Safari·화면 낭독기·GPU 성능은 별도 실행하지 않았다. 현재 OS reduced motion에서 정적 구도와 입력을 검증했고 기존 터치 핸들러는 변경하지 않았다. 성능 수치 개선은 주장하지 않는다.

시작 HEAD `f168b0af702264d70833e7217e277b2c682c4061`, UI 로컬 커밋 `2adf289`. 기존 개발 서버 PID 17184와 localhost:3000을 유지했다. Push·원격 브랜치·태그·배포는 수행하지 않았다.
