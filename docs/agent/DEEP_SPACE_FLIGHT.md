# 공통 카메라 기반 우주 비행

2026-10-30 Windows 내장 Chromium 검증. 시작 HEAD `85de911646548e5ffebf179a55fd95a9080be48b`, 브랜치 `main`, 시작 working tree clean. Fetch와 `git pull --no-rebase --ff-only`는 already up to date였다. 기존 localhost 서버 하나를 재사용했다. 사용자 파일·세션 데이터 삭제, push·배포 없음.

판정: **DEEP_SPACE_FLIGHT_VISUALLY_VERIFIED**. 이전 CSS 연출의 성공 보고를 근거로 삼지 않고 새로운 공통 카메라 이동과 실제 연속 화면을 검증했다. 사용자의 주관적인 몰입감 만족 여부는 이 구현 검증과 별개다.

## 기존 구조와 렌더링 선택

이전 구현에도 CSS perspective와 translate3d는 있었지만, 공통 카메라·고정 세계 좌표·카메라 평면 통과 처리가 없었다. 천체마다 별도의 X/Y/Z keyframes와 opacity를 재생했고 별자리는 퇴장 시 흐려졌다. 실제 브라우저 duration은 5s였다.

Graft와 원본 확인 결과 `JellyCanvas.tsx`의 Three/R3F 컴포넌트는 존재하지만 현재 HomeExperience에서는 타입만 참조하며 실행 중인 Scene이 없다. 재사용할 활성 카메라가 없어 추가 WebGL 컨텍스트를 만드는 대신 **실제 원근 관계를 계산하는 경량 DOM/SVG 렌더러**를 선택했다. Three.js 의존성·기존 메인 페이지 구조는 변경하지 않았다.

- `spaceFlight.ts`: 세계 좌표·카메라·투영·별 재배치·프레임 루프와 정리
- `CosmicScenery.tsx`: 6개 천체와 2개 별자리 평면, 공용 별빛 SVG
- `space-flight.css`: 기존 천체 표면·고리·모양과 장면 전환
- `CosmicIntro.tsx`: 기존 수명주기와 공간 루프 연결
- `introLifecycle.ts` / `cosmic-intro.css`: 8초 타이밍·로고·Hero 전환

기존 `cosmic-scenery.css`의 개별 이동 keyframes는 제거했다. 천체는 기존 SVG로 그린 구면 이미지 billboard이며 새 구체 mesh나 물리 조명 시뮬레이션을 도입한 것은 아니다. 움직임은 아래 공통 3D 세계/카메라 투영으로 계산한다.

## 카메라·깊이·투영

세계의 천체 Z는 데스크톱에서 1700·2850·4000·5100·6050·6700으로 고정된다. 두 별자리 평면은 Z=3150·5700이다. 공통 카메라가 +Z로 전진하며 작은 X/Y 곡선 이동을 함께 한다. 좌표 단위는 연출용 세계 단위이며 미터나 실제 우주 속도를 뜻하지 않는다.

```text
depth = object.worldZ - camera.z
focal = viewportHeight / (2 * tan(55° / 2))
scale = focal / depth
screenX = viewportWidth / 2 + (worldX - camera.x) * scale
screenY = viewportHeight / 2 + (worldY - camera.y) * scale
```

카메라 접근에 따라 위치와 크기가 같은 투영식에서 변한다. 직접 작성한 개별 scale 애니메이션을 사용하지 않는다. 행성·별자리·별 모두 같은 카메라를 참조한다. 창 크기 변경은 렌즈와 화면 좌표만 바꾸며 비행 중 세계 위치와 크기를 재배치하지 않는다.

화면 밖 천체는 frustum culling으로 숨기고 near plane(깊이 16 이하)에 도달한 요소는 정리한다. 화면 안을 스치는 천체를 opacity로 조기 제거하지 않는다. 별자리는 연결선과 별의 각 세계 점을 같은 Z 평면에서 투영하며, 화면보다 커져 가장자리 밖으로 벗어난 뒤 평면이 통과한다. 숨긴 요소의 DOM bbox에는 이전 좌표가 남을 수 있으므로 visibility·status와 함께 해석한다.

별은 서로 다른 Z에 분포한다. 현재 카메라와 32ms 이전 카메라에서의 투영 차이를 streak로 그리므로 가까운 별이 더 빠르고 길게 이동한다. 지나간 별만 더 먼 Z로 재배치하며 seed를 바꿔 같은 위치 반복을 피한다.

## 8초 시퀀스

| 시간 | 동작 |
| --- | --- |
| 0–1.2초 | SAME STUDIO 중앙 등장, 먼 별 배경 |
| 1.2–2.295초 | 공백 제외 10개 문자, 75ms 간격·각 420ms, 16px 상승·1.2배·보라색 glow |
| 2.3–3.5초 | 카메라의 cosine 속도 가속, Z=0→900 |
| 3.5–7.1초 | 속도 1500 세계 단위/초로 등속 전진, Z=900→6300 |
| 7.1–8초 | 속도가 부드럽게 0으로 감소, Z=6975에서 정지하며 Hero 전환 |

2.3–7.1초의 **4.8초** 동안 비행이 이어진다. 천체는 먼 거리에서 나타나 개별 깊이에 따라 서로 다른 시점에 통과한다. 마지막 천체는 7.1초 부근에도 화면에 존재하고 전환 중 카메라 뒤로 넘어간다. 바닥 격자 스타일은 변경하지 않았다.

## 실제 화면 증거

최종 소스의 데스크톱 연속 관측은 약 1.4·2.4·3.0·3.6·3.9·4.4·4.8·5.1·5.4·6.0·6.4·6.65·7.0·7.5·8.3초에 수행했다. 실제 CSS elapsed와 camera Z를 각 프레임 JSON에 기록했다. DOM 읽기와 캡처는 연속 호출이므로 동일한 렌더 프레임을 뜻하지 않는다.

| 천체 | 접근 관측 | 통과·퇴장 관측 |
| --- | --- | --- |
| 암석 | 3.06초 x=447/y=394/지름109px → 3.67초 x=148/y=440/277px | 캡처에서 왼쪽 아래를 크게 통과. 3.95초 x=-1531/1220px, 화면 밖이며 opacity 1 |
| 가스 | 3.67초 x=726/y=221/126px → 4.45초 x=922/y=-97/409px | 고리와 천체가 오른쪽 위를 통과. 4.84초 camera plane 뒤로 정리 |
| 대기 | 4.84초 x=419/y=148/115px → 5.16초 x=254/y=-17/203px | 위·왼쪽으로 통과하고 5.46초 offscreen, opacity 1 |
| 위성 | 6.46초 x=361/y=365/146px | 별도 연속 캡처에서 큰 회색 위성이 왼쪽 아래를 스치는 장면 확인, 이후 passed |
| 원거리 천체 | 6.46초 102px → 7.05초 x=761/y=-28/291px | 7초 캡처에서 화면 위쪽을 크게 통과, 전환 중 passed |

암석·가스·위성·마지막 천체의 실제 화면 확대와 경계에서 잘리는 장면을 확인했다. 표의 수치나 transform 변화만을 성공 근거로 삼지 않았다.

| 별자리 | 초기 중심·폭 | 확대·통과 |
| --- | --- | --- |
| 첫 평면 | 약 3.06초 중심(624,352), 폭143px | 4.45초 중심(584,325)/495px → 4.84초 중심(462,234)/1720px. 선이 화면 가장자리로 벗어난 뒤 약 5초 평면 통과 |
| 둘째 평면 | 약 3.06초 중심(638,362), 폭74px | 6.04초 중심(655,364)/403px → 6.46초 중심(710,374)/1098px. 선과 별이 함께 확대되고 약 6.7초 평면 통과 |

캡처에서 첫 평면의 일부 선이 화면 모서리까지 길게 뻗어 사라지고, 뒤이어 두 번째 평면이 시야 전체를 채우며 통과하는 것을 확인했다. 이동 중 선을 단순히 흐리게 만들지 않는다.

문자 강조는 첫·중간·마지막 문자 delay가 1.2s·1.575s·1.875s이며 duration은 모두 0.42s였다. 별도 dense 관측과 1.4초 캡처에서 순차 상승·확대·glow·공백을 확인했다. Hero는 7.1초 이전 opacity 0, 약 7.55초 0.5, 종료 후 1이었다. 격자 opacity는 관측 구간에서 0.075를 유지했다. 종료 후 장면 display none, frame loop false다.

## 성능·자원과 측정 한계

| 관측 | rAF 평균 빈도 | rAF 간격 p95 | JS 갱신 평균 / 최대 |
| --- | ---: | ---: | ---: |
| 데스크톱 최종 무캡처 재생 | 63.2회/초 | 33.40ms | 1.049 / 4.200ms |
| 앞선 데스크톱 관측 | 80.9회/초 | 16.80ms | 0.893 / 3.000ms |
| 모바일 너비 관측 | 84.7회/초 | 16.90ms | 0.714 / 3.300ms |

같은 Windows 환경에서도 관측 빈도가 달랐으므로 고정 FPS 보장이나 개선율로 해석하지 않는다. 위 값은 requestAnimationFrame 콜백 간격과 갱신 함수 실행 시간이다. **실제 화면 출력 FPS, GPU 시간·메모리, 실제 모바일 기기 성능, cold network 로딩 시간, Core Web Vitals는 미측정**이다. JS 시간에는 이후 브라우저의 style/layout/paint 비용이 포함되지 않는다.

추가 의존성·원격 자산·Canvas·WebGL 컨텍스트는 0개다. 기존 천체 SVG 6개를 재사용한다. 장면 DOM/SVG는 176개 노드·SVG 3개이며 별 line 144개가 포함된다. 시작 viewport에 따라 144/88/56개 별과 6/5/3개 천체를 갱신한다. 두 별자리 평면은 모바일에서도 유지한다. rAF는 하나, resize 리스너도 하나다. React state를 프레임마다 변경하지 않는다.

정상 종료·입력 스킵·unmount에서 rAF와 resize 리스너를 해제한다. 실제 Escape 스킵 후 프레임 수가 7에서 멈추고 250ms 후에도 7이었다. 포인터 스킵도 즉시 정리되고 TOCOBI 선택까지 전달됐다. 비활성 탭·페이지 이탈 경로는 기존 수명주기가 같은 disposer를 호출하며 단위 검사로 확인했다. 실제 탭 비활성 상태를 별도의 기기 테스트로 검증한 것은 아니다.

## 정책·반응형·회귀

- 390×844에서 천체 3개와 두 평면, 가로 overflow 없음, 마지막 7초 부근까지 비행 확인
- 820×1180에서 천체 5개·정상 종료 확인. viewport override 복원
- 비행 중 viewport 변경 전후 가스의 world Z=2850·지름310 유지, 화면 밖 정리·종료 정상
- 실제 reduced motion의 새 탭: 하위 페이지 skipped-route, 첫 홈 1.2초 정적 로고, 공간 루프 시작 안 함
- 같은 세션 reload는 skipped-seen. `?intro=replay`는 reduced·기존 complete 상태 보존. 기존 세션 데이터 삭제 안 함
- `?intro=full`은 명시적으로 full·8초. 생산 파라미터 무시는 단위·생산 빌드 HTML 검사로 확인
- 캐러셀 좌우 키·TOCOBI Phone 6/Pad 5·큰 글자 적용 및 복원·영어/한국어 전환·Support ETC PINI 메일 작성 링크 확인
- Privacy·Terms·Delete Account·뒤로 가기·홈 재방문 생략 정상. 실제 메일 발송 안 함
- 최종 새 프리뷰 탭과 회귀 탭 error·warn 0건

TypeScript·전체 ESLint·빌드 PASS, 단위 **44/44 PASS**, HTML **13/13 PASS**. 새 검사는 카메라 연속성, 투영 비율과 clipping, 서로 다른 통과 시점, 별 재배치, resize 세계 좌표 보존, 프레임·리스너 정리, SSR 공간 요소 연결을 포함한다. 기존 Vinext route classification·플러그인 처리 시간 경고는 남아 있다. macOS와 실제 모바일 기기는 실행하지 않았다.

모델 추론 강도 전환 API가 없는 환경이므로 자동 Max 전환을 실행했다고 주장하지 않는다. 고객 데이터·인증·운영 구성은 변경하지 않았다.

## 증거·Git·미리보기

ignored `outputs/`에 다음을 보관한다.

- `deep-space-before.json/png`: 기존 5초 CSS 연출
- `deep-space-final.json`, `deep-space-final-*.png`: 시간별 카메라·천체·두 평면·Hero·격자
- `deep-space-letter-sequence.json`, `deep-space-mobile.json`, `deep-space-mobile-*.png`
- `deep-space-tablet.json`, `deep-space-tablet-logo.png`, `deep-space-tablet-flight.png`
- `deep-space-atmosphere-pass.png`, `deep-space-moon-pass.png`, `deep-space-additional-passes.json`
- `deep-space-performance-final.json`, `deep-space-performance-desktop.json`, `deep-space-performance-mobile.json`
- `deep-space-policy.json`, `deep-space-skip.json`, `deep-space-resize.json`, `deep-space-resize-completion.json`
- `deep-space-regressions.json`, `deep-space-final-console.json`

로컬 커밋: `e639181`(공통 카메라 기반 8초 비행), `5e3f789`(공간 투영·정리·SSR 계약 검사). 이 문서는 별도 커밋으로 저장한다. 최종 HEAD와 working tree 상태는 최종 보고에서 확인한다.

미리보기: <http://localhost:3000/?intro=full>. 설정 존중 재생: <http://localhost:3000/?intro=replay>. 기존 localhost 서버를 유지하며 push·배포하지 않았다.
