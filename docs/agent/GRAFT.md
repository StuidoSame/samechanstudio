# Graft 우선 탐색

## 확인된 도구와 격리

2026-10-29 확인 버전은 **`@nanonets/graft` 0.18.0**이다. 로컬 기존 설치의 package metadata, CLI help와 실제 MCP `tools/list`로 식별했다. 공식 [기존 저장소](https://github.com/NanoNets/context-graph-engine)는 현재 [Trail-Code](https://github.com/trailhq/Trail-Code)로 연결되지만, 이번 작업은 기존 Graft를 재사용하며 다른 이름의 패키지나 새 버전으로 교체하지 않는다.

세션에 처음 노출된 `mcp__graft__*`는 Mapary를 가리켰다. 이 결과는 본 저장소 분석 증거가 아니다. 별도 **`same-studio-graft`** Codex MCP 등록과 `scripts/graft.mjs` 실행기를 사용한다. 실행기는 자신의 위치에서 루트를 계산하므로 다른 채팅의 cwd를 상속해도 SAME STUDIO를 탐색한다. 기존 Mapary 등록은 보존한다. 현재 채팅의 도구 목록은 자동 갱신을 보장하지 않으므로 재연결 전에는 CLI 또는 MCP 검증기로 접근한다.

## 설치와 연결

기존 올바른 설치가 있으면 재설치하지 않는다. 실행기는 `GRAFT_CLI` → ignored `.graft/local.json` → 프로젝트에 설치된 패키지 → 표준 글로벌 npm 경로 순서로 CLI를 찾는다. `GRAFT_NODE` 또는 local.json의 `node`로 기존 parser와 호환되는 Node를 선택할 수 있다. 로컬 파일 예시는 다음과 같으며 실제 절대경로는 커밋하지 않는다.

```json
{ "cli": "<installed-graft>/dist/cli.js", "node": "<compatible-node-executable>" }
```

설치가 없는 OS에서는 공식 npm 패키지와 버전을 확인한 후 실행한다. 전역 설치가 허용되지 않는 환경은 개인 tool 디렉터리에 같은 버전을 설치하고 `GRAFT_CLI`로 연결한다.

```text
npm install --global @nanonets/graft@0.18.0
node scripts/graft.mjs --version
node scripts/graft.mjs build --include-dir build --no-gitignore --no-ignore
node scripts/verify-graft.mjs
```

사용자 지정 npm prefix는 `npm root --global` 아래 `@nanonets/graft/dist/cli.js`를 `GRAFT_CLI`로 지정한다. macOS zsh: `export GRAFT_CLI="$(npm root --global)/@nanonets/graft/dist/cli.js"`. PowerShell: `$env:GRAFT_CLI = Join-Path (npm root --global) '@nanonets/graft/dist/cli.js'`.

Codex 등록은 저장소 루트에서 한다. CLI가 생성하는 기기별 경로는 사용자 설정에만 저장한다.

```powershell
$launcher = Join-Path (Get-Location).Path 'scripts/graft.mjs'
codex mcp add same-studio-graft -- node $launcher mcp
codex mcp get same-studio-graft
```

```sh
codex mcp add same-studio-graft -- node "$PWD/scripts/graft.mjs" mcp
codex mcp get same-studio-graft
```

공식 [Codex MCP 설정 문서](https://learn.chatgpt.com/docs/extend/mcp?surface=cli)를 따른다. 다른 프로젝트용 등록을 교체하지 않는다.

## 구조 탐색 순서

| MCP tool | 인자 예시 / CLI 대응 |
| --- | --- |
| `graft_repo_map` | `{ "max_dirs": 16 }` / `node scripts/graft.mjs map` |
| `graft_find_code` | `{ "query": "HomeExperience", "limit": 3 }` / `ask "HomeExperience" --limit 3` |
| `graft_find_all` | `{ "pattern": "createPageMetadata", "fixed": true, "in": "app" }` / `grep createPageMetadata` |
| `graft_file_api` | `{ "file": "app/components/HomeExperience.tsx" }` / `skeleton app/components/HomeExperience.tsx` |
| `graft_trace_calls` | `{ "symbol": "createPageMetadata", "direction": "in" }` / `callers createPageMetadata` |
| `graft_check_freshness` | `{}` / `check` |

map → 관련 심볼 → 파일 API → 호출·참조 → 필요한 원본 → 수정 전 freshness 순서로 사용한다. 변경 범위가 이미 명확한 작은 문서 수정마다 map 전체를 다시 요구하지 않는다. MCP 스키마가 달라지면 실제 `tools/list`가 기준이다.

`build/`에는 생성물이 아닌 실제 Vite 플러그인이 있으므로 `--include-dir build`가 필요하다. `graft/`는 재생성 캐시로 ignore하며 네이티브 node_modules, dist, 대형 자산을 탐색하지 않는다. ignored `.graft/config.json`은 이 include 정책을 로컬에 보존하므로 각 OS에서 위 최초 build 명령을 실행한다. 실행기는 telemetry와 graph/.ignore 자동 추가를 끄며 필요한 `/graft/`, `/.graft/` ignore 규칙은 저장소에 포함한다. 별도 watcher·daemon·포트는 필요 없다.

## 검증과 freshness 해석

`scripts/verify-graft.mjs`는 실제 stdio MCP 초기화 → tools/list → 여섯 도구 호출 → 본 저장소 경로·심볼 assertion을 순차 수행한다. 증거는 ignored `outputs/graft-verification.json`이다.

이번 구성은 비용과 API 키가 필요 없는 **구조 그래프**다. freshness의 `graph check: OK`는 구조 동기화를 뜻한다. `graft check: NO GRAPH`, 의미 요약 pending은 선택적인 deep semantic manifest가 없다는 뜻으로 구조 그래프 누락과 구분한다. `--deep`는 LLM 호출을 일으키므로 이번 환경 구축에서 사용하지 않는다.

- `GRAFT_READY`: 올바른 저장소 그래프와 실제 탐색·MCP 검증 및 구조 freshness 성공.
- `GRAFT_PARTIAL`: CLI만 가능하거나 일부 도구가 실패함.
- `GRAFT_BLOCKED`: 올바른 저장소 탐색이 불가능함. 필요한 경로에 한정한 `rg`로 안전한 독립 작업을 계속한다.

토큰 절감 수치는 Graft 추정치일 뿐 실제 청구·전체 세션 절감량으로 간주하지 않는다. 다른 저장소 조회 수치를 이 프로젝트의 성과에 합산하지 않는다.
