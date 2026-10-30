# Support ETC와 기존 앱 문의

2026-10-30 Windows 검증. 시작 HEAD `66b6e9b2a690890d769c808acc96c7d9131f8b5a`, 브랜치 `main`, 시작 working tree clean. Fetch 후 `git pull --no-rebase --ff-only`는 already up to date였다. 기존 localhost 개발 서버 하나를 재사용했다.

판정: **SUPPORT_ETC_VERIFIED**. 실제 Windows Chromium에서 ETC 선택과 이메일 작성 링크의 문의 식별자를 확인했다. 실제 외부 메일 발송과 실제 터치 기기·macOS 실행은 검증하지 않았다.

## 지원 정책

PINI와 PEPESNAP은 메인 쇼케이스 홍보 목록에서 제외되었지만 서비스 종료를 의미하지 않는다. 기존 사용자는 **ETC → PINI / PEPESNAP**으로 문의할 수 있다. 서비스 종료·다운로드 불가·업데이트 보장 문구를 추가하지 않았다. FEELOO를 별도 지원 옵션이나 메인 앱으로 복원하지 않았다. 그 외 문의는 Other로 접수한다.

사용자 데이터, 개인정보처리방침과 지원 주소 `contact@samestudio.kr`를 변경하지 않았다. 기존 Support는 앱 이름·기기·OS·문의 내용의 작성 안내와 `mailto:` 링크를 제공한다. 이 구조와 FAQ를 유지했으며 백엔드·저장소·신규 필수 입력·동의 항목을 만들지 않았다. 사용자는 기존처럼 이메일 클라이언트에서 내용을 작성하고 발송한다.

## 구현

- `app/support/supportInquiries.ts`: 메인 앱 데이터를 입력받아 기존 순서를 유지한 Support 전용 카테고리를 만들고 ETC를 마지막에 추가한다. 메인 `apps` 자체를 수정하지 않는다. PINI·PEPESNAP·Other는 ETC 내부 문의 유형이며 개별 캐러셀 카드가 아니다.
- `SupportContent.tsx`: 선택 상태를 이름 대신 카테고리 ID로 관리한다. ETC 선택 시 기본 Other와 네이티브 radio 3개를 표시한다. fieldset·legend·label·선택 상태·키보드 이동과 문의 이름의 polite live region을 제공한다.
- 기존 레일의 화살표·휠·포인터 드래그·터치 스크롤·방향키·ResizeObserver를 재사용한다. 기존 Support에는 자동 재생이나 무한 순환이 없으며 새로 추가하지 않았다.
- `public/assets/archive/archive.css`: 기존 카드 프레임·선택 강조를 사용한다. 짙은 보라색·별빛 CSS와 장식용 인라인 SVG 메시지/물음표를 추가했다. 외부 이미지·AI 이미지·라이브러리를 추가하지 않았다.
- ko/en/ja/zh-CN/zh-TW에 문의 유형·설명·Other 표시를 제공한다.

| 선택 | 메일 제목 | 본문 식별 |
| --- | --- | --- |
| 기존 7개 앱 | 기존 `[SAME STUDIO] Support` 유지 | 선택한 앱 이름 |
| ETC → PINI | `[SAME STUDIO] PINI Support` | PINI |
| ETC → PEPESNAP | `[SAME STUDIO] PEPESNAP Support` | PEPESNAP |
| ETC → Other | `[SAME STUDIO] General Inquiry` | 각 언어의 Other 표시 |

기존 본문의 기기·OS·문의 내용 템플릿과 URI 인코딩을 보존했다. 두 이메일 링크 모두 실제 선택한 유형을 반영한다.

## 검증

| 항목 | 결과 |
| --- | --- |
| TypeScript | `npm run typecheck` PASS |
| ESLint | `npm run lint` PASS. 마지막 UI 정리 후 관련 파일 lint도 PASS |
| 단위 테스트 | `npm run test:unit` 38/38 PASS. 문의 생성·카탈로그 분리 4개 추가 |
| 빌드 | `npm run build` PASS. 기존 플러그인 시간·Vinext route classification 경고는 남음 |
| HTML | `node --test tests/rendered-html.test.mjs` 12/12 PASS. ETC 마지막 순서와 기존 앱·페이지 회귀 포함 |
| 브라우저 순서 | Mapary → Pulto → EVRUNE → TOCOBI → SKKOO → Teru Bozu → WAESSEUM → ETC |
| 문의 전달 | PINI·PEPESNAP·Other 제목·본문·수신자 확인. 기존 7개 앱의 제목·본문 유지. 실제 발송 안 함 |
| 키보드·탐색 | Enter로 ETC 선택, radio 좌우 키 선택, 레일 방향키·양방향 화살표·마우스 드래그 확인 |
| 반응형 | 기본 데스크톱, 820×1180, 390×844 확인. 모바일 큰 글자에서도 가로 넘침 없음. viewport·글자 크기·테마 복원 |
| 디자인 | 데스크톱 카드 프레임 88px·모서리 24% 동일. 모바일 기존 66px 규칙 재사용. 두 테마 확인 |
| 다국어 | 5개 언어 옵션과 PINI·Other 메일 본문을 실제 UI로 확인. 모든 유형·기존 앱의 5개 언어 본문은 단위 검사 |
| reduced motion | 현재 환경에서 rail scroll-behavior auto·카드 transition 0.001ms 관측. 기존 미디어 쿼리 적용 |
| 메인 회귀 | 메인 카드 7개 유지. ETC·PINI·PEPESNAP·FEELOO 재등장 없음 |
| 콘솔 | 최종 소스의 새 탭에서 ETC 3개 유형 선택 후 error·warn 0건 |

개발 도중 helper export를 변경하는 중간 HMR에서 이전 export 참조 오류가 기록되었으나, 최종 모듈 연결과 새 탭 검증에서는 재현되지 않았다. 최초 TypeScript 검사에서 `.ts` 런타임 import 확장자 오류를 발견해 런타임 import 없이 카탈로그를 인자로 받도록 수정했고 이후 검사·빌드가 통과했다.

모바일 너비에서 마우스 드래그로 scrollLeft 373→217 변화를 확인했다. 실제 터치 이벤트나 물리 모바일 기기는 사용하지 않았으므로 터치 스와이프 PASS로 간주하지 않는다. 기존 `touch-action: pan-x pan-y`와 네이티브 스크롤 구조는 유지했다. macOS는 실행하지 않았고 플랫폼 전용 의존성·셸 코드를 추가하지 않았다.

증거는 ignored `outputs/support-etc-browser.json`, `support-etc-desktop.png`, `support-etc-tablet.png`, `support-etc-mobile-large.png`, `support-etc-light.png`에 저장했다. JSON은 개발 중 과거 로그와 최종 새 탭 로그를 구분한다.

## Git과 미리보기

- `295e21d`: Support 전용 카테고리·문의 생성·5개 언어·단위 테스트
- `b9eb0b7`: ETC 카드·접근 가능한 문의 선택 UI·SSR 계약 검사
- 이 기록은 별도 문서 커밋으로 저장한다. 최종 HEAD와 clean 상태는 최종 보고에서 확인한다.

미리보기: <http://localhost:3000/support/>. Push·배포 없음. 개발 서버는 유지한다.
