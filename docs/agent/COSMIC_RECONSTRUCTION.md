# 우주 인트로 시각 재구성

2026-10-30 Windows 내장 Chromium 검증. 시작 HEAD `c17883af2d42f8309ddcad397e945a1167f1cd8b`, 브랜치 `main`, 시작 working tree clean. Fetch와 `git pull --no-rebase --ff-only`는 already up to date였다. 기존 localhost 개발 서버 하나를 재사용했다. Push·배포·세션 데이터 삭제 없음.

판정: **COSMIC_INTRO_RECONSTRUCTED_AND_VISUALLY_VERIFIED**. 기존 성공 보고를 근거로 삼지 않고 수정 전·후의 실제 화면과 시간별 DOM·computed style을 다시 확인했다.

## 재현 원인

- **짧은 시간:** JS 상수와 CSS fallback 모두 2400ms였다. 실제 브라우저 animation-duration도 2.4s였다.
- **인지하기 어려운 문자 강조:** 문자 DOM과 keyframes는 존재했고 full 프리뷰에서 실제 실행됐다. CSS가 누락되거나 덮인 상황은 재현되지 않았다. 다만 시작이 240ms, stagger가 45ms, 문자당 280ms, 높이 9px(모바일 6px), 최대 1.11배라 전체 강조가 970ms 안에 끝났다. 공백 인덱스도 지연에 포함되어 단어 사이 리듬이 벌어졌다. 단일 정지 화면이나 transform 변경만으로 충분한 시각 효과를 검증했다는 이전 결론은 부족했다.
- **약한 행성 통과:** 기존 near 행성은 58%의 opacity 1에서 82%의 opacity 0으로 동시에 보간됐다. 가장 커져 화면을 스치는 구간에서 이미 투명해졌다. 실제 암석은 약 201px일 때 opacity 0.89였지만 약 649px로 커져 화면 밖에 도달했을 때 0이었다. 초기 X/Y를 유지한 Z 이동과 압축된 시간으로 통과의 가독성이 약했다.
- **환경 구분:** 현재 Windows 브라우저는 reduced motion이다. 일반 URL과 `?intro=replay`의 1.2초 정적 로고는 접근성 정책이다. `?intro=full`에서는 full 모션·2.4초를 실제 재현했다. 서버가 오래된 코드였거나 세션 기록 때문에 full 프리뷰가 생략된 원인은 재현되지 않았다.

## 변경

| 구간 | 최종 시퀀스 |
| --- | --- |
| 0–1.1초 | 로고 중앙 등장. 별·행성은 조용한 깊이 배경 |
| 1.1–2.195초 | 공백을 제외한 10개 문자의 75ms stagger, 각 420ms 바운스 |
| 2.2–4.2초 | 서로 다른 X/Y/Z 경로와 속도의 행성·별자리·별빛 전진 |
| 4.2–5.0초 | 기존 Hero·헤더로 opacity 전환, 종료 정리 |

문자 peak는 데스크톱 -16px·1.2배, 모바일 -12px다. 밝은 흰보라색과 3단계 glow를 사용하며 전체 문자 정착 전 로고를 숨기지 않는다. 공백과 중앙 정렬을 보존한다. 기존 헤더의 브랜드 접근 가능한 이름을 유지하고 장식 문자 중복 읽기를 막는다.

암석·가스·위성은 확대 및 주변 이동이 보이는 동안 opacity 1을 유지하고 화면 밖에서 사라진다. 중거리·원거리 천체의 깊이와 속도는 다르다. 별자리는 뒤로 축소되기보다 시야 주변으로 빠진다. 별 레이어는 로고 구간에서 낮은 opacity를 유지하고 이후 서로 다른 Z 속도와 긴 streak를 사용한다. resting star opacity가 streak까지 지나치게 흐리게 만들지 않도록 full 모드의 dot 밝기를 별도 지정했다. 바닥 격자 CSS는 변경하지 않았다.

수정 파일: `CosmicIntro.tsx`(공백 제외 인덱스), `introLifecycle.ts`(5초 상수), `cosmic-intro.css`(문자·별·Hero 타임라인), `cosmic-scenery.css`(행성·별자리 경로). 라이브러리·이미지·Canvas·DOM 요소·JS 프레임 루프·이벤트 리스너·타이머를 추가하지 않았다. 기존 6개 SVG 표면·명암·고리를 그대로 사용한다.

## 실제 시각 증거

데스크톱 프레임은 약 0.5, 1.3, 1.7, 2.1, 3.0, 3.3, 3.7, 4.5, 5.2초에 캡처했다. 추가 dense 샘플에서 첫 S·중간 T·마지막 O를 따로 기록했다. 자동화 호출의 읽기 구간과 캡처 완료 시간도 JSON에 남겼다. DOM 읽기와 스크린샷은 연속 호출이므로 동일한 렌더 프레임이나 정밀 성능 시간 측정으로 간주하지 않는다.

| 문자 | 실제 delay / duration | 관측 scale / Y |
| --- | --- | --- |
| 첫 S (0) | 1.1s / 0.42s | 1.17254 / -13.80px |
| 중간 T (5) | 1.475s / 0.42s | 1.17242 / -13.79px |
| 마지막 O (9) | 1.775s / 0.42s | 1.19205 / -15.36px |

코드상 peak 1.2배·16px에 가까운 실제 상승·확대와 서로 다른 위치의 밝은 glow를 화면에서 확인했다. 모든 문자가 2.2초 부근에 정착하고 로고가 그동안 표시됐다.

| 천체 | 초기 지름 | 통과 관측 | 퇴장 관측 |
| --- | ---: | --- | --- |
| 암석 | 약 142px | 약 3.7초 408px, x=-141로 왼쪽 가장자리 통과, opacity 1 | 이후 x=-1253·721px로 화면 밖 |
| 가스 | 약 131px | 약 3.7초 397px, x=914로 오른쪽 가장자리 통과, opacity 1 | 이후 x=2087·799px로 화면 밖 |
| 위성 | 약 50px | 약 3.1초 140px로 확대, 연속 캡처에서 오른쪽 경계에 잘리며 통과 | 후속 프레임 x=1325 이상, opacity 1인 채 화면 밖으로 이동 후 사라짐 |

실제 캡처에서 문자마다 튀는 위치가 바뀌고, 암석·가스·위성이 커져 가장자리로 잘린 다음 사라지는 것을 확인했다. 단순 transform 변경으로 PASS 처리하지 않았다. 별의 Z 이동과 늘어나는 streak도 함께 확인했다. 관측한 전환 프레임에서 격자 opacity는 **0.075**를 유지했다. 약 4.5초 Hero opacity가 중간값으로 증가하고, 약 5.2초에는 1이었다. 종료 후 로고·장식 display none, 문자 transform none, 스크롤·메인 조작 정상이다.

ignored `outputs/` 증거:

- `reconstruction-before.json`, `reconstruction-before-logo.png`, `reconstruction-before-flyby.png`
- `reconstruction-final-desktop.json`, `reconstruction-final-{500,1300,1700,2100,3000,3300,3700,4500,5200}.png`
- `reconstruction-letter-peaks.json`, `reconstruction-letter-{0,5,9}.png`
- `reconstruction-flyby.json`, `reconstruction-flyby-{2900,3100,3250,3400,3800,5200}.png`
- `reconstruction-mobile.json`, `reconstruction-mobile-*.png`, `reconstruction-sizes.json`
- `reconstruction-policy.json`, `reconstruction-reduced.png`

## 접근성·세션·회귀

데스크톱 6개, 820×1180에서 5개, 390×844에서 3개, 낮은 1280×480에서 6개 천체가 표시됐다. 로고가 중앙에서 읽히고 가로 overflow가 없었다. 모바일에서도 문자 바운스와 큰 행성의 가장자리 통과를 실제 캡처로 확인했다. viewport override는 복원했다.

실제 reduced motion의 새 탭에서 Support 직접 진입은 skipped-route/session new, 첫 홈은 reduced·1.2초, 완료 후 reload는 skipped-seen이었다. `?intro=replay`는 정적 로고·문자 animation none·장식 숨김을 유지하고 기존 complete 세션을 보존했다. `?intro=full`은 명시적으로 full·5초를 재생했다. Escape와 실제 카드 클릭은 finished-input으로 즉시 종료되고, 카드 클릭은 TOCOBI 선택까지 정상 전달됐다. 입력 없이 캡처한 시퀀스는 finished-animation으로 종료됐다. 기존 세션 데이터는 삭제하지 않았다.

캐러셀 좌우 키, TOCOBI Phone 6장·Pad 5장 상세, 큰 글자 적용·복원, 영어·한국어 전환, Support ETC의 PEPESNAP 메일 작성 링크, Privacy·Terms·Delete Account, 뒤로 가기와 홈 재방문 생략을 실제 실행했다. 외부 이메일은 발송하지 않았다. 최종 검증 탭 error·warn은 0건이었다.

## 정적 검사와 한계

- TypeScript·전체 ESLint PASS
- 단위 테스트 **39/39 PASS**: 5초/reduced 수명주기 계약 추가, 기존 세션·스킵·정리·문의 회귀 유지
- 빌드 PASS, HTML **12/12 PASS**: 공백 보존·연속 10개 인덱스·생산 빌드의 프리뷰 무시 포함
- 기존 플러그인 처리 시간·Vinext route classification 경고는 남아 있다.

macOS와 실제 모바일 기기는 실행하지 않았다. FPS·GPU 메모리·Core Web Vitals는 측정하지 않았으므로 성능 수치를 주장하지 않는다. 경로·CSS·npm 명령은 플랫폼 중립성을 유지했다.

로컬 커밋: `112707f`(5초·문자·별 타임라인과 계약 검사), `f99018e`(행성별 통과 경로). 문서는 별도 커밋으로 저장하며 최종 HEAD와 clean 상태는 최종 보고에서 확인한다.

전체 연출: <http://localhost:3000/?intro=full> — 새로고침으로 개발 프리뷰 반복. 설정 존중: <http://localhost:3000/?intro=replay>. 프로덕션에서는 두 파라미터를 무시한다. 기존 개발 서버를 유지하며 push·배포하지 않았다.
