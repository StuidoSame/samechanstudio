# SAME STUDIO 환경 구축 실행 기록

실행일: 2026-10-29 (Asia/Seoul). 네 가지 목표의 실제 실행 근거를 남긴다. 디자인·기능 소스와 운영 구성을 수정하지 않았다.

## 1. Repository

- OS: Windows 11 계열 10.0.26200, PowerShell Core 7.6.5.
- 저장소: 현재 checkout의 Git root, `origin`은 `StuidoSame/samechanstudio`.
- 브랜치: `main`.
- 시작 HEAD: `df3fd9f32b9783f9034249a21e2bd48d6fbc9406`, 시작 working tree clean.
- `git fetch origin` 성공, `git pull --no-rebase --ff-only`: Already up to date.
- 최종 HEAD·전체 커밋은 `git log --oneline df3fd9f..HEAD`와 채팅 최종 보고로 확인한다. 보고서 자체 커밋의 해시는 그 파일 안에 자기 참조로 고정하지 않는다.

## 2. Architecture / Agent Harness

Next.js App Router API + React 19 + Vinext/Vite + TypeScript, npm, Tailwind/전역 CSS, Three/R3F, Cloudflare Workers를 확인했다. [PROJECT_STRUCTURE](PROJECT_STRUCTURE.md)에 route·기능 상태·자산·state·DB 예제 경계·코드 위치를 기록했다.

AGENTS와 WORKFLOW, MODEL_ROUTING, GIT_POLICY, GRAFT, PROJECT_STRUCTURE, DESIGN_SYSTEM, TESTING, SECURITY, PERFORMANCE, CROSS_PLATFORM, TROUBLESHOOTING을 구축했다. 요청한 Sol Extra High/Max 정책은 문서화했으며 현재 채팅의 추론 강도를 바꾸거나 자동 강제했다고 주장하지 않는다.

## 3. Graft

- 기존 공식 `@nanonets/graft` **0.18.0** 설치와 호환 Node **22.23.2**를 재사용했다.
- 최초 전역 `graft` MCP는 다른 Mapary 저장소를 가리켰으므로 본 프로젝트 증거에서 제외했다.
- 별도 `same-studio-graft` Codex stdio MCP를 등록했다. 기존 등록은 보존했다. 현재 채팅 도구 목록의 hot reload는 보장하지 않는다.
- 전용 실행기로 구조 그래프를 생성했고 초기 **76 files / 450 nodes / 851 edges**를 확인했다. 이후 스크립트 추가 시 자동 refresh된다.
- `node scripts/verify-graft.mjs`가 실제 initialize, tools/list, 여섯 도구 호출 및 본 저장소 symbol/path assertion을 통과했다. `outputs/graft-verification.json`에 스키마·응답을 남겼다.
- 구조 freshness OK. 선택적인 deep semantic manifest/LLM 요약은 생성하지 않았다. 별도 watcher·daemon·포트는 실행하지 않았다.
- 판정: **GRAFT_READY** (구조 탐색 기준).

## 4. Dependencies

- 앱 Node **24.14.1**, npm **11.11.0**; 공통 Node 버전을 `.nvmrc` / `.node-version`에 명시했다.
- `npm install --no-fund --cache outputs/npm-cache --fetch-retries=1 --fetch-timeout=30000`: exit 0, 525 packages changed / 526 audited.
- 첫 샌드박스 실행의 registry ENOTFOUND를 확인하고 해당 실행만 중단한 뒤 네트워크 접근으로 설치했다. 관련 로그는 outputs 아래에 보존했다.
- 원본 lockfile과 모든 package version/integrity를 비교해 동일함을 확인했다. npm의 dev metadata 25줄 삭제만 원복해 **lockfile 변경 없음**을 유지했다.
- `npm ls --depth=0`: exit 0, 필수 직접 의존성 존재. optional wasm 관련 `@emnapi/runtime`, `@tybys/wasm-util`의 extraneous 표시는 남아 있으나 missing/invalid dependency는 보고되지 않았다.

### 남은 보안 경고

`npm audit --json`은 **28건: critical 1 / high 18 / moderate 8 / low 1**이다. 전체 원문은 ignored `outputs/npm-audit.json`에 있다. deprecated `@esbuild-kit/esm-loader`, `core-utils`도 설치 중 보고됐다.

직접 의존성에는 Next 16.2.6(critical 집계), react-server-dom-webpack 19.2.6, Vite 8.0.13, Vinext 0.0.50, Cloudflare Vite plugin, Wrangler, drizzle-kit이 포함된다. audit 제안은 Next 16.4.3, react-server-dom-webpack 19.3.1, Vite 8.3.5, Cloudflare plugin 1.66.0, Vinext 1.4.0 등이며 일부는 major 변경 또는 drizzle-kit 하향 변경을 제안하므로 일괄 적용하지 않았다.

Next.js의 정상 서버와 Vinext의 실제 실행 경로는 다르다. 의존성 경고만으로 이 사이트의 모든 악용 조건 충족 또는 비영향을 단정할 수 없다. 서버·빌드·Windows 도구 경로를 포함해 별도 보안 영향 분석과 버전 조합 검증이 필요하다. `npm audit fix`나 `--force`는 실행하지 않았다. 로컬 구동은 가능하지만 출시 보안 검증 완료 판정이 아니다.

공식 advisory도 대조했다. [Windows-hosted Next 서버 RCE](https://github.com/advisories/GHSA-p293-qw3h-jr36)는 Next 16.3.3 미만의 특정 서버 조건을 다루며, [SVG image optimization RCE](https://github.com/advisories/GHSA-2464-fhr4-w9xw)는 glibc Linux의 upstream 이미지 라이브러리 조건을 다룬다. 서로 다른 적용 조건이 있으므로 audit의 critical 집계를 이 로컬 Vinext 서버의 악용 확인 결과로 해석하지 않는다.

## 5. Development Server

- 실제 명령: **`npm run dev -- --host 127.0.0.1`** (Windows 기본 셸 호환 Node 실행기).
- Vinext가 출력한 실제 URL: **http://localhost:3000/**.
- 실제 listener는 **`::1:3000`**, 확인 시 소유 PID **7080**. 로그와 HTTP 검증은 localhost 기준으로 수행했다.
- 숨김 background npm 부모 PID **13636**로 시작했으며 `outputs/dev-server.json`, `dev.stdout.log`, `dev.stderr.log`에 실행 근거를 남겼다. 프로세스는 사용자 확인을 위해 유지한다. 시스템 재부팅 후 자동 시작은 설정하지 않았다.
- `/`, `/support/`, `/terms/`, `/privacy/`, `/delete-account/`, robots/sitemap/manifest, Mapary icon/BMJUA font **10개 요청 모두 HTTP 200**. `outputs/http-verification.json` 참조.
- 실제 브라우저에서 로더 종료·캐러셀 자동 전환·상세 열기·대표 스크린샷 4개 로딩·Escape 닫기·글자 크기 large 변경과 medium 복원·SUPPORT 내부 탐색을 확인했다. 다른 screenshot은 lazy loading 상태였으므로 전체 로딩 검증으로 확대 해석하지 않는다. 사용자 확인용 메인 브라우저 탭을 유지한다.
- 브라우저 콘솔의 확인 범위에서 error 없음, **THREE.Clock deprecated** 경고 1종. 실제 메일 발송·계정 삭제는 수행하지 않았다.
- 서버가 종료되면 저장소 루트에서 `npm run dev`로 다시 실행한다. 이미 살아 있는 서버를 중복 실행하지 않는다.

## 6. Code Health

| 검사 | 실제 결과 |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run test:unit` | PASS — 14/14 |
| `npm run build` | PASS — exit 0, 다섯 빌드 단계 완료 |
| `node --test tests/rendered-html.test.mjs` | PASS — 9/9 |
| Graft 실제 stdio MCP 검증 | PASS — 6/6 |
| 문서 파일·상대 링크·사용자 절대경로 검사 | PASS — 14개 MD, 상대 링크 32개, 오류 0 |
| `git diff --check`, 새 스크립트 `node --check` | PASS |

빌드는 500kB 초과 chunk, plugin timing, Vinext route classification Unknown 안내를 남겼다. 실패로 숨기거나 경고를 제거하려고 번들·기능을 변경하지 않았다. staged diff 검토는 변경 단위별 로컬 커밋 직전에 수행한다.

## 7. Remaining / Next Step

**CURRENT_OS_VERIFIED / OTHER_OS_STATICALLY_CHECKED / OTHER_OS_RUNTIME_NOT_VERIFIED**. macOS 실행 환경은 없어 설치·서버·네이티브 Graft parser를 실제 검증하지 못했다. 5개 언어·두 테마·모든 viewport·모든 상호작용·screen reader의 광범위한 회귀 QA도 이번 범위가 아니다.

코드 탐색, 계층형 운영 지침, Windows 실행 환경이 확보되어 로컬 디자인 개선을 시작할 수 있다. 운영 출시는 취약점 검토와 별도 통합 QA 이후 판단한다. 모든 작업은 로컬 커밋으로만 남기며 push·태그·원격 브랜치·배포는 수행하지 않는다.

## 8. 후속 앱 쇼케이스 검증

2026-10-30 행성형 캐러셀·Pulto 아이콘 복구의 최신 실행 결과와 남은 터치/macOS 검증 범위는 [PLANETARY_APP_SHOWCASE](PLANETARY_APP_SHOWCASE.md)에 기록했다. TypeScript·ESLint·단위 테스트 50개·최종 빌드·HTML 검사 14개·Graft 검증은 통과했으며 기존 개발 서버를 유지했다.

후속 실사 기반 shell·7종 재질·대기·고리 개선과 Windows 시각·상호작용·인트로 회귀 검증은 [PHOTOREAL_PLANETARY_SHOWCASE](PHOTOREAL_PLANETARY_SHOWCASE.md)에 기록했다. TypeScript·ESLint·단위 테스트 51개·최종 빌드·HTML 검사 14개·Graft 검증이 통과했다. 기존 서버를 유지하고 push·배포는 수행하지 않았다.
