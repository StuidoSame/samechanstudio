# PULTO 개인정보처리방침 공개 확인 — 2026-11-11

판정: **PULTO_PRIVACY_PUBLISHED / PUBLICATION_OBSERVED**

최종 URL: <https://samestudio.kr/privacy/#pulto>

배포 준비 도중 이미 진행 중이던 기존 Cloudflare Workers 자동 빌드가 완료되었다. 공개 사이트에서 현재 개인정보처리방침을 확인했다. 이 작업은 Git Push, 수동 배포, 빌드 재실행 요청, 배포 취소, DNS·도메인·운영 설정 변경을 수행하지 않았다. 원격 Push나 자동 빌드를 시작한 주체는 확인하지 않았다. 중복 배포가 필요하지 않아 수동 프로덕션 배포 승인은 요청하지 않았다.

## 확인된 공식 배포 구조

| 항목 | 확인 결과 |
| --- | --- |
| 저장소 | `StuidoSame/samechanstudio`, `main` |
| 배포 소스 | `afada1df9abdca076dbf396e1b7d8c42c5a5eb0a` — PULTO 구현 `5623637` 및 로컬 조사 보고서 포함 |
| 실제 Workers 서비스 | `samechanstudio` — GitHub의 Cloudflare Workers Builds 체크와 Wrangler의 기존 서비스 조회가 일치 |
| 현재 활성 버전 | `306c7a66-0428-4799-8a46-0d5fa25613d8`, 트래픽 100% |
| 배포 시각 | 2026-11-11 12:21:56 KST — API의 `2026-11-11T03:21:56.982Z` |
| 빌드 기록 | `af0ca0b6-f6c2-4277-9871-1dcfa79956b3`, 최종 success 및 동일 Version ID |
| 이전 활성 버전 | `b7f30ad2-fd92-48f0-ba40-fc5414fe75e7`, 2026-11-10 배포 이력과 읽기 전용 버전 조회에서 확인 |
| 런타임 구조 | 현재·이전 버전 모두 ASSETS·IMAGES 바인딩, 호환 날짜 `2026-05-22`, `nodejs_compat` 유지. Wrangler 읽기 전용 버전 조회로 대조 |
| 공개 접근 | `samestudio.kr` HTTPS 200, Cloudflare 응답·네임서버. 로그인 없이 PULTO 안내 표시 |

기존 성공 경로는 **GitHub 연동 → Cloudflare Workers Builds → `samechanstudio` → 공개 사이트**로 확인했다. [이번 빌드 기록](https://dash.cloudflare.com/12ed2454719caeee89fe4e8cecbd5c0b/workers/services/view/samechanstudio/production/builds/af0ca0b6-f6c2-4277-9871-1dcfa79956b3)과 현재 활성 버전 및 공개 본문을 대조했다. CI 내부 빌드·배포 명령 원문과 도메인 바인딩 관리 화면은 조회하지 않았으므로 그 설정을 완전히 복원했다고 주장하지 않는다.

별도 Cloudflare Pages 프로젝트 `saemchanstudio`도 GitHub success 체크를 반환했으나, 기록된 배포별 URL의 `/`와 `/privacy/`는 확인 시 404였다. Pages 성공 배지를 공개 사이트 동작 증거로 사용하거나 대체 배포 대상으로 선택하지 않았다. Sites 목록은 비어 있었고 `.openai/hosting.json`에 Site ID도 없었다.

## 로컬 명령과 권한의 차이

저장소에는 `npm run deploy`와 `npm run deploy:built`가 있지만, `wrangler.jsonc`의 기본 Worker 이름은 `same-studio-interactive-portfolio`로 실제 서비스와 다르다. 이 이름으로 배포 조회는 10007을 반환했고, 확인된 실제 이름 `samechanstudio`로는 과거 배포 이력과 활성 버전 조회가 성공했다. 전자의 오류만으로 실제 서비스가 없다고 판단하지 않았다.

설치된 Vinext의 `deploy:built` 경로는 skip-build 전에도 의존성 검사·설치·생성 파일 처리를 할 수 있다. 향후 별도의 수동 배포가 필요할 때 검토할 더 좁은 명령은 다음과 같다. **이번에는 실행하지 않았다.**

```text
node scripts/with-wrangler.mjs wrangler deploy --config dist/server/wrangler.json --name samechanstudio
```

이 명령을 승인 대상으로 삼으려면 새 후보 커밋·빌드 검증, 정확한 Cloudflare 계정, 실제 서비스의 바인딩·도메인·환경 보존, Workers 배포 권한과 사용자 승인을 다시 확인해야 한다. 현재 로컬 OAuth에는 Workers/Pages 쓰기 scope가 없으며 인증·권한을 확장하지 않았다. 이미 완료된 자동 배포의 공개 검증에는 이 쓰기 권한이 필요하지 않았다.

프로덕션 변경의 단위는 개인정보 페이지만이 아니라 **전체 Worker 코드와 정적 자산, 전체 트래픽**이다. [Cloudflare 버전·배포 문서](https://developers.cloudflare.com/workers/versions-and-deployments/)에 따라 향후 수동 배포나 롤백은 별도 운영 변경 승인이 필요하다. 이전 버전으로 롤백하면 새 PULTO 안내도 사라질 수 있다. 롤백은 실행하지 않았다.

## 변경 범위와 최소 회귀

이 작업의 시작점은 깨끗한 `main`의 `afada1d`다. `git fetch --prune` 및 `git pull --no-rebase --ff-only`는 성공했고 원격과 동일했다. Push는 실행하지 않았다.

PULTO 직전 기준 `8a39d2b`와 공개 소스 `afada1d` 사이의 변경은 다음 네 파일뿐이다.

- `app/privacy/PrivacyArchive.tsx`
- `app/privacy/pultoPrivacyMessages.ts`
- `tests/rendered-html.test.mjs`
- `docs/agent/PULTO_PRIVACY_LOCAL_REPORT.md`

기존 공통 개인정보 문구 파일, 다른 페이지 소스, CSS·행성·애니메이션·이미지와 Android AAB는 변경되지 않았다. 이번 준비·확인 작업에서는 애플리케이션 코드를 추가 수정하지 않았다.

| 검사 | 결과 |
| --- | --- |
| `npm run build` | PASS, exit 0. 기존 5개 route 유지. 기존 Vinext route 분류·플러그인 시간 안내만 남음 |
| `node --test tests/rendered-html.test.mjs` | PASS, 16/16 |
| 공개 5개 route | `/`, `/support/`, `/terms/`, `/privacy/`, `/delete-account/` 모두 HTTPS 200 |
| 공개·로컬 본문 대조 | 위 5개 route의 정규화된 렌더링 본문이 현재 로컬 프로덕션 빌드와 모두 동일 |
| 기존 개인정보 8개 항목 | 각 영역의 공개·로컬 본문 동일 |
| 공개 PULTO 항목 | `#pulto`에 09번 영역과 7개 소제목, Health Connect·권한·저장·삭제·문의 설명 존재 |
| 공개 5개 언어 | ko/en/ja/zh-CN/zh-TW로 실제 UI 전환. 해당 제목·7개 소제목·9개 전체 영역·목차 표시 확인 |
| 공개 데스크톱 목차 | 각 언어의 09번 선택 후 PULTO 영역 활성화, 가로 넘침 없음 |
| 공개 모바일 | 390×844: 모바일 select → PULTO, 단일 열·14px 본문·가로 넘침 없음 |
| 공개 큰 글자 | 320×844: 15.68px 본문·단일 열·가로 넘침 없음. 임시 글자 크기·viewport 설정은 복원 |
| 공개 직접 앵커 | 최종 URL 새로고침 후 PULTO 영역 위치 약 120px, 로그인 요구 없음 |
| 공개 브라우저 로그 | 확인 시 warn/error 없음 |
| Sol Max 검토 | 기존 명시적 `gpt-6.1-sol` / `max` 하위 에이전트의 소스·문구 검토 유지 및 공개 관찰·중복 배포 불필요 판단 PASS. 제공자 내부 추론 실행의 독립 검증은 하지 않음 |

첫 공개 확인에서는 PULTO가 없었고 2026.07.28 문구가 표시됐다. 이후 기존 Workers 빌드의 terminal success, 새 활성 버전, 공개 PULTO 표시를 순서대로 관찰했다. 이는 캐시된 검색 결과나 배포 성공 배지만으로 공개 완료를 판단한 결과가 아니다.

정규화 본문 대조는 텍스트 동등성을 검증하며, 전체 번들의 바이트 동일성이나 모든 기능·기기·접근성 인증을 뜻하지 않는다. 전체 Android/실기기 QA와 의존성 갱신은 실행하지 않았다. 상세 로컬 코드·개인정보 근거와 알려진 의존성 경고는 [로컬 보고서](PULTO_PRIVACY_LOCAL_REPORT.md)에 기록돼 있다.

재현 가능한 읽기 전용 비교 결과는 ignored `outputs/privacy-deployment/live-comparison.json`에 보관했다. 이 문서는 애플리케이션·배포 구성을 변경하지 않는 별도 로컬 커밋으로 남긴다.

## Google Play 후속 조치

- 개인정보처리방침 URL은 계속 <https://samestudio.kr/privacy/>를 사용한다. `#pulto`는 해당 공개 문서의 직접 이동 앵커다.
- Play Console의 App content → Privacy Policy → Manage에서 기존 URL을 재확인하고 필요한 저장·심사 전송을 별도로 수행한다. 이번 작업은 Console을 변경하지 않았다.
- Data Safety와 Health Apps Declaration의 현재 답변을 실제 배포본·공개 문구와 대조해야 한다. 로컬 접근, 기기 간 전송, 플랫폼·SDK 처리를 구분한다.
- Phone 25 / Wear 14013 AAB, P-256 심사 패스, 관리형 게시 설정은 변경하지 않았다. 현재 앱 심사 상태나 프로덕션 공개 여부를 웹사이트 확인으로 추정하지 않는다.

남은 불확실성은 자동 빌드를 시작한 주체, CI 내부 명령·도메인 관리 설정의 원문, Google Play 현재 신고·심사 상태와 삼성 제공자 승인·실기기 데이터 접근이다. 웹사이트 개인정보처리방침의 공개 표시는 확인 완료했다.
