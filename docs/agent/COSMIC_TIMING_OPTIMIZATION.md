# 6초 우주 비행 타이밍 검증

2026-10-30 Windows 실제 내장 Chromium. 판정: **COSMIC_FLIGHT_TIMING_VERIFIED**.

시작 브랜치 `main`, HEAD `7b039e24d34cc485c094f49e7c8a4253d7d011c0`, working tree clean. Fetch 성공, `git pull --no-rebase --ff-only`는 already up to date. 기존 localhost:3000 Vinext 서버(PID 30020)를 재사용하고 유지했다. Push·배포 없음.

작업 중 별도로 추가된 `1d65985`(Pulto·TOCOBI 아이콘 변경)를 보존했다. 인트로 수정 커밋에는 에셋 변경을 포함하지 않았다.

## 구현과 시간

전체 8000ms → 6000ms. `introTiming.mjs`의 공통 설정으로 수명주기 deadline, 카메라 가속·등속·감속, 로고·행성 등장·Hero CSS keyframe을 계산한다. CSS 타이밍은 SSR의 style로 제공하므로 hydration 이전에도 같은 시계를 사용한다.

| 구간 | 이전 | 현재 |
| --- | --- | --- |
| 문자 10개 바운스 | 1.2–2.295초 | 1.0–2.095초 |
| 로고 완전 표시 종료 | 2.4초 | 2.2초 |
| 로고 퇴장 완료 | 3.36초 | 2.6초 |
| 카메라 가속 | 2.3–3.5초 | 2.0–2.5초 |
| 등속 비행 | 3.5–7.1초 | 2.5–5.2초 |
| 최고 속도 | 1500 세계 단위/초 | 2300 세계 단위/초 |
| 감속·Hero 전환 | 7.1–8초 | 5.2–6초 |

75ms 간격, 각 420ms 바운스, 상승·확대·색상·glow keyframe은 유지했다. 마지막 O는 2.095초에 정착하고 로고는 2.2초까지 opacity 1이다. 2초 가속 시작과 마지막 바운스가 잠시 겹치지만 로고 퇴장은 바운스 종료 이후다.

## 천체·별자리 통과 비교

아래는 시작 HEAD와 현재 `getFlightCamera`를 1ms 간격으로 계산하여 깊이 16의 near plane에 처음 도달하는 시점이다. 실제 화면 가장자리를 스치는 시점은 이보다 빠르며 별도 연속 캡처로 검증했다. 렌더링·스크린샷의 정확한 실측 시각으로 해석하지 않는다.

| 대상 | 이전 | 현재 |
| --- | ---: | ---: |
| rocky | 4.023초 | 2.894초 |
| gas | 4.790초 | 3.344초 |
| atmosphere | 5.556초 | 3.844초 |
| ice | 6.290초 | 4.294초 |
| moon | 6.923초 | 4.744초 |
| distant | 7.377초 | 5.114초 |
| north 별자리 | 4.990초 | 3.644초 |
| south 별자리 | 6.690초 | 4.694초 |

천체 간 간격은 약 0.37–0.50초, 두 별자리 간격은 1.70초 → 1.05초다. 모바일은 기존 3개 천체를 유지하며 rocky 2.894초, gas 3.844초, atmosphere 5.044초에 통과한다. 태블릿은 기존 5개, 데스크톱은 6개다. 두 별자리는 모든 화면 크기에서 유지한다.

개별 통과 설정을 공통 카메라 경로 위의 고정 Z 좌표로 환산한다. 세계 좌표는 프레임이나 resize 때 재배치하지 않는다. 기존 X/Y 위치, 지름, 55° 핀홀 투영, near clipping, frustum culling, SVG 표면·고리, 별 재배치, 하나의 rAF와 resize 정리를 유지했다. 물체마다 깊이와 횡방향 위치가 다르므로 화면상의 속도·확대율도 서로 다르다. 가속·감속은 기존 cosine easing의 적분으로 연결된다.

행성 opacity는 1.9–2.4초에 0→1로 올라간 뒤 유지한다. 모든 천체와 별자리가 통과한 다음 5.2초에 장면 전체와 Hero 전환을 시작한다. 통과를 감추는 개별 fade-out은 추가하지 않았다.

## Windows 실제 브라우저 증거

ignored `outputs/cosmic-six-second/`에 연속 JPG와 DOM/computed-style JSON을 저장했다. 현재 세션의 증거이며 기존 8초 검증 화면을 재사용하지 않았다.

- 1440×900: 75개 연속 관측과 13개 캡처. 가스의 오른쪽 위 통과, 대기의 왼쪽 위 통과, 얼음의 오른쪽 아래 통과, 위성의 왼쪽 아래 통과, 마지막 천체의 위쪽 통과와 두 별자리 확대·공간 통과를 확인했다. 행성 가장자리 통과에서 opacity 1을 유지한다.
- 추가 dense 관측 190개: 문자 인덱스 0–9가 모두 움직였다. 2.117·2.150초에 10개 모두 원래 transform으로 정착했고 로고 opacity는 1이었다. 1.8초 캡처에서 마지막 O의 glow를 확인했다.
- Hero opacity는 관측 5.142초 0, 5.409초 약 0.14, 5.534초 약 0.36, 5.792초 약 0.86, 정상 종료 후 1이었다.
- 390×844·820×1180·1280×480: 정상 6초 종료, 가로 overflow 없음, Hero opacity 1, 장식 display none, flightRunning false. 이는 Windows 브라우저 viewport 검사이며 실제 모바일 기기 검사가 아니다.
- 실제 `prefers-reduced-motion: reduce`에서 `?intro=replay`: 1.2초, 정적 로고, 10개 문자 animation/transform none, 장식 display none, 공간 루프 시작 안 함. OS 설정이나 matchMedia를 조작하지 않았다.
- 실제 Escape: finished-input, Hero opacity 1, 프레임 수 6에서 정지하고 다음 관측에서도 6이었다. 일반 홈 방문 완료 뒤 reload는 skipped-seen이었다.
- TOCOBI 선택·상세 열기·Phone 6개·Pad 5개·기존 Apple 스토어 링크, Support ETC→PINI 메일 작성 링크, Privacy·Terms·Delete Account→Home 이동 정상. 메일·삭제 요청을 제출하지 않았다.
- 브라우저 콘솔 error/warn 0건. 임시 viewport override는 최종 복원했다.

## 검사와 수리

- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm run test:unit`: 47/47 PASS
- `npm run build`: PASS
- `node --test tests/rendered-html.test.mjs`: 13/13 PASS
- `node --check app/components/cosmic-intro/introTiming.mjs`: PASS
- `git diff --check`: PASS

첫 단위 실행은 43/44였다. 기존 resize fixture의 4초 관측에서는 이미 가스가 카메라 뒤로 지나가 크기 갱신이 없었다. 관측을 3.1·3.2초로 옮겨 비행 중 resize의 세계 좌표 보존을 검사하고, 관련 재실행과 최종 전체 실행이 통과했다. 화면 UI 작업에서는 중복 HOME locator를 Footer navigation으로 한정했다.

기존 Vinext의 route classification과 Vite plugin timing 경고는 남아 있다. macOS 런타임, 실제 모바일 기기, GPU 시간·메모리, 화면 출력 FPS, Core Web Vitals는 측정하지 않았다. npm 명령·경로·새 모듈에 플랫폼별 셸 문법이나 사용자 절대경로는 추가하지 않았다.

인트로 구현 커밋은 `f23c898`(공통 6초 타이밍), `08453dc`(개별 flyby·별자리 일정), `60dcc97`(문자·SSR 회귀 검사)다. 코드 검증 기준 HEAD는 `60dcc97`이며 이 문서는 별도 로컬 커밋으로 남긴다. 프리뷰는 [localhost:3000/?intro=full](http://localhost:3000/?intro=full)이다.
