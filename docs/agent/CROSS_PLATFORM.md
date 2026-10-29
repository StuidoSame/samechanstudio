# Windows / macOS 개발

## 공통 런타임과 명령

`package.json` 요구 사항은 Node **>=22.13.0**이다. 이 환경 구축에서 선택한 공통 버전 **24.14.1**을 `.nvmrc`와 `.node-version`에 고정했다. npm 검증 버전은 **11.11.0**이다. 두 파일이 자동으로 Node를 설치하지는 않으므로 각 OS의 버전 관리자에서 같은 버전을 선택한다. 버전을 갱신할 때 두 파일을 함께 변경한다.

Windows는 Git, Node/npm, PowerShell/Windows Terminal을 사용한다. macOS는 Git, Node/npm, Terminal/zsh를 사용한다. Codex는 같은 [AGENTS.md](../../AGENTS.md)를 진입점으로 사용한다.

두 OS에서 저장소 루트 기준으로 동일하게 실행한다.

```text
npm install
npm run dev
npm run typecheck
npm run lint
npm run test:unit
```

서버 로그의 실제 Local URL을 사용한다. Vinext 기본값이나 README의 예시 포트를 실행 결과로 간주하지 않는다. 프로젝트에 다른 패키지 매니저 lockfile을 추가하지 않는다.

## 경로와 셸

`scripts/with-wrangler.mjs`는 패키지의 실제 bin을 읽어 Node로 실행하며 `WRANGLER_LOG_PATH`를 자식 환경에 전달한다. Windows 기본 npm 셸에서 실패하는 `VAR=value command` 문법을 사용하지 않는다. `&&`는 두 npm 기본 셸에서 지원된다. 서버 실행·빌드와 배포의 의미는 기존과 같다.

새 스크립트는 Node `path`, `URL`, `fs` API와 저장소 상대경로를 사용한다. 경로에 공백이 있어도 shell 문자열 조합을 피하고 spawn의 인자 배열을 사용한다. import 대소문자는 파일과 정확히 일치시킨다. 사용자별 경로는 ignored `.graft/local.json`처럼 로컬 설정에만 둔다.

Graft 네이티브 parser는 OS별 설치가 필요하다. Windows에서 만든 `node_modules`와 Graft 설치를 macOS로 복사하지 않는다. [GRAFT](GRAFT.md)의 동일 버전을 각 OS에서 설치한다.

## 검증 상태

- **CURRENT_OS_VERIFIED:** 이번 세션은 Windows에서 실제 명령을 실행한다. 구체적 성공·실패는 [BOOTSTRAP_REPORT](BOOTSTRAP_REPORT.md)에 기록한다.
- **OTHER_OS_STATICALLY_CHECKED:** macOS에 대해 npm 명령, Node 경로 처리, 셸 문법과 기존 Seatbelt polling 구성을 정적 검토한다.
- **OTHER_OS_RUNTIME_NOT_VERIFIED:** 이번 세션에는 macOS 실행 환경이 없다. macOS 첫 실행에서 설치, dev, HTTP·브라우저, typecheck·lint·관련 테스트를 실행해야 한다.

정적 호환성 검토는 macOS 런타임 PASS가 아니다.
