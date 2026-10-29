# 앱 카탈로그 정리 검증

2026-10-29 Windows 로컬 검증. 시작 HEAD `e7e50de09719f65cfab7ef53fc30d60dbd5d0f7d`, 브랜치 `main`. 시작 working tree는 깨끗했고 fetch와 `git pull --no-rebase --ff-only` 결과는 already up to date였다. 기존 개발 서버 하나를 재사용했다. Push·배포·원격 자산 삭제는 하지 않았다.

판정: **APP_CATALOG_CLEANUP_VERIFIED**. 웹 카탈로그·전용 자산 제거와 TOCOBI 표시 변경을 실제 Windows Chromium에서 확인했다. 실제 터치 기기 스와이프와 macOS 실행은 검증하지 않았다.

## 삭제 범위와 소유 근거

| 앱 | 데이터·참조 정리 | 변경한 텍스트 파일 | 삭제 자산 | 삭제 바이트 |
| --- | --- | ---: | ---: | ---: |
| PINI | 앱 레코드·화면 타입, 번역 ID, 상세 기능, 스크린샷 매니페스트, 5개 언어 상세·SEO·개인정보 예시, 전용 CSS, 관련 테스트 | 14 | 아이콘 1 + Phone 25 = 26 | 83,642,281 |
| PEPESNAP | 앱 레코드·화면 타입, 번역 ID, 상세 기능, 스크린샷 매니페스트, 5개 언어 상세·SEO·개인정보 예시, 전용 CSS, 관련 테스트 | 14 | 아이콘 1 + Phone 30 + Pad 30 = 61 | 249,191,613 |
| FEELOO | 앱 레코드·화면 타입, 번역 ID, 상세 기능, 5개 언어 상세·SEO, 전용 CSS, 관련 테스트 | 12 | 아이콘 1 | 89,190 |

총 **88개 파일, 332,923,084바이트(약 317.5MiB)**를 현재 작업 트리에서 제거했다. Git 이력에는 복구 가능한 원본이 남아 있다. 텍스트 파일 수는 각 앱 제거 커밋의 변경 파일 수이며 공통 파일이 겹치므로 합산한 고유 파일 수가 아니다. FEELOO에는 원래 전용 스크린샷 파일·매니페스트가 없었다.

삭제 전 `apps`, `APP_DETAIL_CAPABILITIES`, `SCREENSHOT_MANIFEST`, 언어별 상세·SEO, CSS와 추적 파일 목록을 대조했다. PINI·PEPESNAP 아이콘과 스크린샷 원본도 확인했다. 삭제 경로는 해당 앱 전용 디렉터리와 아이콘에 한정했고 다른 앱의 동적 매니페스트와 겹치지 않았다. PEPESNAP Pad의 언어별 `6.png` 5개는 기존 매니페스트에 없었지만 해당 앱 전용 디렉터리의 추적 자산으로 확인하고 함께 제거했다. Git 밖 사용자 원본은 삭제하지 않았다.

정확한 88개 경로·크기는 [삭제 자산 CSV](APP_CATALOG_REMOVED_ASSETS.csv)에 있다. 경로 범위는 다음과 같다.

- `public/assets/icons/pini_icon.png`
- `public/assets/screenshot/pini/phone/{ko,en,ja,zhg,zhb}/{1..5}.png`
- `public/assets/icons/pepsnap.png`
- `public/assets/screenshot/pepesnap/{phone,pad}/{ko,en,ja,zhg,zhb}/{1..6}.png`
- `public/assets/icons/feeloo_icon.png`

`app/`의 활성 제거 앱 참조는 0건이다. 부재 확인 테스트와 과거 감사 문서의 앱 이름은 기록·회귀 방지 목적으로 남겼다. 공유 여부가 불명확한 일반 `.map-line` 계열 CSS는 삭제하지 않았다. 확인된 삭제 대상 자산 중 미삭제 항목은 없다.

## TOCOBI와 남은 앱

순서: **Mapary → Pulto → EVRUNE → TOCOBI → SKKOO → Teru Bozu → WAESSEUM**. 기존 상대 순서를 보존했다.

`app/lib/apps.ts`의 표시 이름과 `app/lib/seo.ts`의 5개 언어 설명을 TOCOBI로 변경했다. 메인·상세·Support·alt·ARIA·구조화 데이터는 이 이름을 사용한다. 내부 ID·screen·screenshotId `tocklist`, 기존 아이콘과 모든 스크린샷 경로, 상세 구조, 정렬 위치를 유지했다.

기존 App Store 링크: <https://apps.apple.com/kr/app/tocklist/id6782831874>. 원래 Google Play 링크는 없었다. TOCOBI의 5개 언어별 Phone 6장·Pad 5장, 총 55장을 보존했다. 나머지 7개 앱 데이터는 이름 변경 외 시작 상태와 동일했고, 삭제 대상 이외 추적 자산 **330개 SHA-256**이 모두 일치했다. Cosmic Intro·행성 자산·라우팅 소스에는 변경이 없다.

기존 스크린샷 픽셀에는 **Tocklist**가 인쇄되어 있다. 저장소에 공식 TOCOBI 대체 이미지가 없고 원본 보존 지시가 있으므로 그대로 유지했다. 새 브랜드 이미지를 임의 생성하지 않았다. 웹 표시 문자열과 접근성 레이블은 TOCOBI로 변경되었지만 이미지 안의 옛 이름은 남는다.

## 카탈로그 갱신 시 런타임 보완

기존 10/10 WAESSEUM 선택 상태에서 목록 축소를 검사했다. 카탈로그 크기 변경 후 인덱스가 범위를 벗어나지 않도록 `wrapAppIndex`로 정규화하고, 상세 선택은 현재 카탈로그의 ID로 다시 해석한다. 삭제된 상세 객체가 계속 표시되지 않는다.

개발 서버의 다국어·카탈로그 동시 HMR 중 실제로 `useI18n must be used within I18nProvider` 오류가 발생했다. 새로고침에서는 재현되지 않아 기존 모듈 소비자와 재생성된 Context의 식별자 불일치로 확인했다. 개발 HMR 데이터에 Context를 보존한 뒤 PEPESNAP 상세가 열린 상태에서 앱·번역을 삭제하여 오류 없는 갱신과 상세 종료, body 스크롤 복원을 확인했다. Vite 타입 선언 경로의 초기 TS 오류는 `vite/types/hot.d.ts`로 수정했고 이후 전체 타입·린트·빌드가 통과했다. 수정 커밋을 별도로 남겼으며 이력을 재작성하지 않았다.

## 검증 결과

| 검사 | 결과 |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run test:unit` | 34/34 PASS: 앱 데이터 13, 캐러셀 4, 인트로 17 |
| `npm run build` | PASS. 기존 플러그인 처리 시간·Vinext route classification 경고는 남음 |
| `node --test tests/rendered-html.test.mjs` | 11/11 PASS. 빌드 결과의 5개 페이지·구조화 데이터 포함 |
| 자산 보존 | 나머지 추적 자산 330개 해시 일치 |
| 정적 자산 HTTP | 남은 아이콘·스크린샷 등 312개 HEAD 요청 모두 200, 삭제 아이콘 3개는 404 |
| Windows Chromium 메인 | 7개 카드·04/07 TOCOBI 표시, 제거 앱 없음 |
| 캐러셀 | 전체 7개 순환, 마지막→처음, 이전 역순환, Enter·좌우 화살표 키, 자동 재생 WAESSEUM→Mapary 확인 |
| 상세 | 남은 7개 앱 열기·닫기와 현재 Phone 이미지 전체 로딩 확인. TOCOBI Phone 6/Pad 5 및 스토어 URL 확인 |
| 언어·글자 크기 | ko/en/ja/zh-CN/zh-TW 전환, 모든 언어의 7개 카드 이름·제거 앱 부재 확인. 크게 적용 후 기본 복원 |
| 모바일 너비 | 390×844에서 가로 넘침 없음, TOCOBI 메인·상세·갤러리 다음(2/6) 확인. viewport override 복원 |
| 정책·지원 | Support 7개 선택지와 TOCOBI 문의 링크, Privacy·Terms·Delete Account 실제 렌더링 확인. 이메일 전송 안 함 |
| 인트로 회귀 | 개발 전용 `?intro=full`에서 SAME STUDIO 표시·글자별 바운스 transform 변화·행성 6개와 별자리 2개·시간별 Z 이동 확인. 종료 후 overlay display none·pointer-events none·메인 조작 가능 |
| 최종 브라우저 콘솔 | 새 검증 탭의 error·warn 0건 |
| Graft | SAME STUDIO 그래프 재빌드. 구조 freshness로 확인하며 선택적 deep semantic graph는 사용하지 않음 |

실제 모바일 터치와 macOS는 실행하지 않았다. 데스크톱 마우스 드래그는 기존 `pointerType === "mouse"` 제외 조건에 따라 이동하지 않았으며 이를 모바일 스와이프 PASS로 간주하지 않았다. 이 작업은 터치 동작 구현을 변경하지 않았다.

실제 화면과 DOM·시간별 상태 증거는 ignored `outputs/`에 보관한다.

- `app-catalog-browser-proof.json`: 카드 순서·순환·언어·상세·정책·인트로 프레임·콘솔
- `app-catalog-desktop.png`, `app-catalog-mobile.png`, `app-catalog-tocobi-pad.png`, `app-catalog-support.png`
- `app-catalog-intro-a.png`, `app-catalog-intro-b.png`
- `app-catalog-removal-inventory.json`, `app-catalog-preservation.json`, `app-catalog-asset-http.json`

## 로컬 커밋과 미리보기

- `1c16736` PINI 데이터·전용 자산 제거
- `94cdaf1` 카탈로그 인덱스·상세 상태와 개발 HMR Context 보완
- `0fcd72d` Vite HMR 타입 선언 경로 수정
- `9afc2ec` PEPESNAP 데이터·전용 자산 제거
- `5a95d27` FEELOO 데이터·전용 아이콘 제거
- `1e25e89` TOCOBI 표시 변경과 7개 앱·다국어·SSR 계약 검사
- 이 문서와 CSV는 별도 문서 커밋으로 저장한다. 최종 HEAD는 채팅 최종 보고와 Git 로그에서 확인한다.

미리보기: <http://localhost:3000/>. 기존 개발 서버를 종료하거나 중복 실행하지 않았다. Push·배포 없음.
