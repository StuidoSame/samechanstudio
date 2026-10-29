# SAME STUDIO agent entrypoint

공식 사이트는 https://samestudio.kr/ 이며, 이 저장소는 앱 포트폴리오와 지원·정책 페이지를 제공한다. 구현의 근거는 현재 코드와 설정이다.

## 반드시 지킬 규칙

- 요청한 목표를 Inspect → Plan → Implement → Verify → Repair → Commit → Report 순서로 완수한다. 안전한 로컬 작업의 승인을 반복 요청하지 않는다.
- 디자인, 앱 목록, 스토어 링크, 기존 기능과 사용자 변경을 보존한다. 작업 범위 밖의 리팩터링을 하지 않는다.
- 허용 모델은 **GPT-6.1 Sol Extra High (`xhigh`) / Max (`max`)**뿐이다. 기본은 Extra High이며 승격 기준은 [MODEL_ROUTING](docs/agent/MODEL_ROUTING.md)을 따른다. 지원하지 않는 자동 전환을 주장하지 않는다.
- 구조 탐색은 **이 저장소를 가리키는 Graft**를 우선한다. 다른 프로젝트의 MCP 결과는 폐기한다. [GRAFT](docs/agent/GRAFT.md)의 검증된 실행기를 사용하고 수정할 원본은 직접 확인한다.
- 독립적이고 검증 가능한 변경마다 작은 로컬 커밋을 만든다. 사용자 변경을 섞지 않는다. **명시적인 사용자 요청 없이 push, 원격 브랜치·태그 생성, 배포를 하지 않는다.**
- 검증은 위험도에 비례한다. 실행하지 않은 검사를 PASS로 기록하지 않는다. 실패는 실제 로그에 따라 최소 수정하고 새로운 증거 없이 반복하지 않는다.
- Windows PowerShell과 macOS zsh에서 같은 npm 명령을 유지한다. 절대경로·사용자 이름·플랫폼별 셸 문법을 저장소에 하드코딩하지 않는다.
- 데이터 손실, 비밀정보 노출, 권한 변경, 예상 밖의 대규모 삭제, 운영 환경 변경이 필요하면 해당 작업을 멈추고 영향을 설명한다. `.env` 값과 인증 토큰은 출력하거나 커밋하지 않는다.
- 개발 서버는 한 개만 유지하고 다른 프로젝트 프로세스를 종료하지 않는다. 브라우저 확인용 서버를 자동 종료하지 않는다.

## 시작 순서와 문서 선택

1. OS, 저장소 루트, 브랜치, HEAD, `git status`, 원격, Node/npm, 기존 서버·포트를 확인한다.
2. 원격이 있으면 fetch한다. 깨끗하고 충돌 위험이 없을 때 `git pull --no-rebase --ff-only`로 동기화한다. 사용자 변경에 stash/reset/clean을 사용하지 않는다.
3. [WORKFLOW](docs/agent/WORKFLOW.md)와 작업에 필요한 문서만 읽는다. 새 저장소 탐색은 Graft map → 심볼 → API/참조 → 필요한 원본 → freshness 순서다.

| 작업 | 세부 지침 |
| --- | --- |
| 작업 절차·Git | [WORKFLOW](docs/agent/WORKFLOW.md), [GIT_POLICY](docs/agent/GIT_POLICY.md) |
| 구조·디자인 | [PROJECT_STRUCTURE](docs/agent/PROJECT_STRUCTURE.md), [DESIGN_SYSTEM](docs/agent/DESIGN_SYSTEM.md) |
| 실행·호환성 | [CROSS_PLATFORM](docs/agent/CROSS_PLATFORM.md), [TROUBLESHOOTING](docs/agent/TROUBLESHOOTING.md) |
| 검증·보안·성능 | [TESTING](docs/agent/TESTING.md), [SECURITY](docs/agent/SECURITY.md), [PERFORMANCE](docs/agent/PERFORMANCE.md) |

현재 작업의 지시와 상위 실행 환경의 지침이 우선한다. 문서 전체나 소스 전체를 매번 읽지 않는다.
