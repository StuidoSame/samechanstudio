# Planetary App Showcase 검증 — 2026-10-30

판정: **PLANETARY_APP_SHOWCASE_PARTIAL**. Windows 브라우저의 시각·키보드·마우스 검증과 기술 검사는 완료했다. 터치 전용 스와이프와 macOS 실행은 확인하지 않았다.

## 구현

- 기존 DOM/CSS 캐러셀과 spring/rAF, 앱 선택·자동 재생·상세 상태를 유지했다. 새 의존성·이미지·Canvas·WebGL·프레임 루프는 추가하지 않았다.
- 중앙 scale 1.18 → 1.24, 첫 주변 scale 0.93 → 0.70, 중앙/첫 주변 Z 100/30 → 140/-65로 계층을 분리했다. X/Y 회전은 작게 유지하고 기존 ref 기반 pointer parallax에 연결했다.
- 원본 정사각형 아이콘을 프레임 안에 유지하고 그 바깥에 구형 halo, 앞뒤 ring, 작은 광점과 정적 SVG 궤도를 배치했다. Mapary 지형, Pulto 파동, EVRUNE 달빛, TOCOBI 시계, SKKOO 크림, Teru Bozu 햇빛, WAESSEUM 얇은 고리로 주변 표현을 구분했다.
- 모바일은 장식과 노출 범위를 줄였다. 좁거나 낮은 화면에서는 크기·정보 간격·최소 높이를 조절했다. 데스크톱 화살표는 고정 페이지 이동 점과 겹치지 않게 안쪽으로 옮겼다.
- 초기 서버 HTML에도 선택 앱의 `aria-current`와 단일 tab stop을 제공하고 장식은 `aria-hidden`으로 숨겼다. 기존 이름·플랫폼·상세·포커스와 reduced motion 정책을 보존했다.

## Pulto 아이콘 복구

원본 `pulto_icon.png`는 Git 추적된 정상 PNG(4,448 bytes, 1,254 × 1,254)였다. 동일 시점 서버 요청은 정상 PNG였지만 브라우저의 기존 URL은 Not Found·디코딩 실패 상태였다. 콘텐츠 해시 쿼리를 붙인 동일 파일 요청은 직접 이미지와 메인·상세·Support에서 모두 표시됐다. 실패 응답을 캐시한 정확한 계층은 특정하지 않았다.

- 이전: `/assets/icons/pulto_icon.png`
- 이후: `/assets/icons/pulto_icon.png?v=aa92ad34`
- 아이콘 바이너리와 다른 앱 경로는 변경하지 않았다. 데이터 테스트가 SHA-256 접두사와 쿼리 일치를 검증한다.

## 실행 검증

| 항목 | 결과 |
| --- | --- |
| Windows 실제 브라우저, 7개 앱 선택 | PASS — 아이콘 디코딩·활성 앱·이름·플랫폼·상세 버튼 확인 |
| 이전/다음 클릭·순환·ArrowRight | PASS — 고정 페이지 이동 점의 클릭 가림을 발견·수정 후 재검증 |
| 전환 중 깊이·halo 보간 | PASS — 중간 scale/Z/focus와 정착 상태, 스크린샷 기록 |
| 자동 재생 시작·다음 앱 전환·정지 | PASS |
| Pulto 상세 열기·닫기 | PASS — 아이콘·스토어 링크·Phone 갤러리 표시 |
| 데스크톱/태블릿/모바일 | PASS — 1440×900, 1440×768, 1152×900, 900×900, 390×844, 320×740, 320×568, 1280×480 확인 |
| 큰 글자·밝은/어두운 테마 | PASS — 320px 큰 글자 및 낮은 데스크톱 상세 버튼 잘림 확인·수정 |
| 6초 인트로 → Hero | PASS — 약 6.05초 종료, 문자 10개, Hero opacity 1·공간 비행 중단 |
| 실제 reduced motion replay | PASS — 약 1.21초 종료·Hero 노출 |
| Support 이동·ETC·FAQ 12개 | PASS — 메일 링크만 확인, 발송하지 않음 |
| 새 페이지 콘솔 | PASS — 오류 0개. 편집 중 이전 탭의 HMR reload 오류는 새 페이지에서 재발하지 않음 |
| TypeScript / 전체 ESLint | PASS |
| 단위 테스트 | PASS — 50/50 |
| 최종 빌드 / HTML 검사 | PASS — 14/14, 기존 plugin timing·Vinext route 분류 안내 유지 |
| Graft / diff 검사 | PASS — 6개 도구·freshness 및 `git diff --check` |

로컬 관측 자료는 ignored `outputs/planetary-showcase/`에 있다. 초기·변경 후·7개 앱·Pulto 복구·큰 글자·테마 스크린샷과 viewport·인트로·콘솔 JSON을 저장했다. 수치는 UI 관측값이며 FPS·GPU·Core Web Vitals 측정이 아니다.

## 남은 실행 범위

현재 도구의 드래그는 마우스 입력이며 기존 터치 전용 핸들러가 이를 무시한다. 실제 모바일 터치 스와이프와 macOS Safari는 실행 검증하지 않았다. 터치·자동 재생·키보드·상세 핸들러는 정적으로 보존 여부를 확인했다. OS reduced motion 상태에서 일반 모드의 pointer parallax를 별도로 실행하지 않았다. 화면 낭독기와 GPU 성능도 미측정이다.

시작 HEAD는 `ec2f9ad8f3fab535bbc6b60d5693e630d22de0f5`였다. 자산 복구는 `aedfc07`, 행성 UI는 `061c514` 로컬 커밋이다. 개발 서버는 기존 프로세스를 유지하며 push·원격 브랜치·태그·배포를 수행하지 않았다.
