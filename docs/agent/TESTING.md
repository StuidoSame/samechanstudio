# 위험도에 따른 검증

| 변경 | 필요한 검증 |
| --- | --- |
| 작은 문서 | 실제 파일·상대 링크·규칙 충돌·`git diff --check` |
| 작은 UI | `npm run typecheck`, 관련 파일 lint, 변경 영역 브라우저 확인·관련 기존 테스트 |
| 기능 | 관련 단위 테스트 + 빌드 + 필요한 화면·동작 확인 |
| 고위험·출시 직전 | 영향 분석, 관련 통합·회귀 검사, 별도 통합 QA와 [MODEL_ROUTING](MODEL_ROUTING.md) 검토 |

## 실제 명령

```text
npm run typecheck
npm run lint
npm run test:unit
npm run build
node --test tests/rendered-html.test.mjs
node scripts/verify-graft.mjs
```

`test:unit`은 app-data·carousel-timing·cosmic-intro·support-inquiries·space-flight 5개 파일을 실행한다. 공간 비행 검사는 카메라 연속성·투영·near clipping·개별 통과·별 재배치·resize 시 세계 좌표 보존·rAF 정리를 포함한다. `npm test`는 **빌드를 다시 수행한 후 rendered-html만** 실행한다. 이미 최신 빌드가 있으면 `node --test tests/rendered-html.test.mjs`로 불필요한 재빌드를 피한다. HTML 검사는 브라우저 hydration·WebGL·모바일 장치를 대신하지 않는다. 인트로의 개발 전용 재생과 시각 검증은 [COSMIC_INTRO](COSMIC_INTRO.md)를 따른다.

현재 린트는 ESLint flat config이며 build 소스는 기존 ignore 정책으로 제외되어 있다. 새 스크립트는 Node `--check`도 적용한다. 새 테스트는 동작의 의미 있는 실패를 잡을 때만 추가하고 사소한 문구 변경에 구현을 복제하는 테스트를 만들지 않는다.

## 서버 검증

기존 서버·포트 확인 → `npm run dev`의 준비 로그 → 프로세스와 listener → 실제 URL HTTP → 주요 route·자산 → 브라우저 콘솔과 상호작용 순서로 확인한다. 메인과 `/support/`, `/terms/`, `/privacy/`, `/delete-account/` 및 대표 icon/font를 검사한다. mailto·계정 삭제 요청의 실제 발송은 하지 않는다.

Windows/macOS 실행 여부를 분리하고, 한 OS에서만 실행한 결과를 양쪽 PASS로 표시하지 않는다. 경고·실패·SKIPPED·NOT VERIFIED를 성공과 분리한다. 이번 실행 증거와 결과는 [BOOTSTRAP_REPORT](BOOTSTRAP_REPORT.md)에 기록한다.
