# 개발 환경 문제 해결

## Windows에서 환경변수가 명령으로 인식되지 않음

기존 `WRANGLER_LOG_PATH=... vinext dev`는 Windows npm 기본 셸에서 실패한다. 수정된 npm scripts와 `scripts/with-wrangler.mjs`를 사용한다. 전역 shell 설정 변경이나 별도 cross-env 설치는 필요 없다. `npm install`이 선행되어야 local package bin이 존재한다.

## 설치 중 ENOTFOUND / 네트워크 실패

레지스트리 접근·DNS·실제 npm 로그를 확인한다. 샌드박스의 네트워크 제한이면 승인된 실행 경계를 사용하며 npm registry나 OS 보안 설정을 바꾸지 않는다. 같은 원인으로 무한 재시도하지 않는다. 이번 세션의 첫 제한된 설치 로그는 `outputs/failed-npm-cache/`, 성공한 설치 캐시는 `outputs/npm-cache/`에 보관했다.

## Graft가 다른 저장소를 탐색함 / 실행 파일 없음

map에 `app/components/HomeExperience.tsx` 등 실제 파일이 있는지 확인한다. Mapary/Wear/다른 프로젝트가 나오면 결과를 사용하지 않는다. `node scripts/verify-graft.mjs`로 독립 MCP 검증을 실행하고 [GRAFT](GRAFT.md)의 `same-studio-graft` 등록과 local.json을 확인한다. 사용자 전체의 기존 연결을 교체하지 않는다. 현재 채팅의 도구 목록은 등록 후 재연결이 필요할 수 있다.

`NO GRAPH`만 보고 deep build를 실행하지 않는다. `graph check: OK`와 선택적인 semantic manifest 부재를 구분한다. parser 오류라면 패키지·OS·Node ABI 조합을 확인한다. 기존 Windows Graft는 별도 Node 22.23.2로 검증했으며 앱 Node 24.14.1과 독립적으로 선택할 수 있다.

## 서버 포트·localhost 연결

실제 Local 로그와 포트 소유자를 확인한다. 관련 없는 프로세스를 종료하지 않는다. 다른 포트가 필요하면 `npm run dev -- --port 3001`처럼 지정하고 실제 URL을 확인한다. `localhost`가 `::1`에 바인딩된 경우 `127.0.0.1`로만 검사하면 실패할 수 있다. 샌드박스 소켓 오류는 서버 오류와 분리한다.

초기 로더와 Vite dependency optimization은 첫 요청에서 시간이 걸릴 수 있다. 준비 로그 후 HTTP 응답·브라우저 상태를 확인한다. 서버 stderr의 `THREE.Clock` deprecation은 현재 알려진 경고이며 예외와 구분한다.

## 검증·빌드 경고

`tsc` 타입 선언이 없으면 설치 완료 여부부터 확인한다. production HTML 검사는 최신 `dist/server/index.js`가 필요하므로 먼저 한 번 build한다. 500kB chunk 경고, Vinext의 route 분류 `Unknown`, plugin timing 안내는 종료 코드와 함께 판단한다. audit 경고는 [BOOTSTRAP_REPORT](BOOTSTRAP_REPORT.md)에 정리하며 강제 업데이트하지 않는다.

## Git 메타데이터 쓰기 거부

`.git/FETCH_HEAD`나 index 쓰기가 샌드박스에 막히면 해당 Git 작업을 승인된 실행 경계로 수행한다. 파일 권한·보안 프로필을 바꾸지 않는다. 자동 승인이 거절되면 영향 없는 작업을 완료한 뒤 실제 차단 작업과 이유를 보고한다.

## 서버 다시 실행 / 종료

저장소 루트에서 `npm run dev`를 실행한다. 이미 background 서버가 있으면 먼저 `outputs/dev-server.json`, 로그, 포트 소유자와 해당 명령의 자식 프로세스를 확인한다. 그 저장소의 서버임이 확인된 프로세스만 사용자가 원할 때 종료한다. `taskkill /IM node.exe` 같은 일괄 종료는 금지한다. 백그라운드 유지와 재부팅 후 자동 시작은 별개이며 자동 시작은 설정하지 않았다.
