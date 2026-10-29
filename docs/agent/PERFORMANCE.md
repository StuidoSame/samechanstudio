# 성능 원칙

- 요청에 필요 없는 라이브러리·중복 런타임·watcher를 추가하지 않는다. 현재 애니메이션은 CSS/rAF/Three 조합이므로 유사한 역할의 라이브러리를 관성적으로 더하지 않는다.
- 이미지 최적화, 크기 지정, 실제 로케일 manifest, 갤러리의 제한된 preload와 오류 fallback을 보존한다. 원본 대형 PNG를 무차별 선로딩하지 않는다.
- `JellyCanvas`의 dynamic import 경계, WebGL fallback, device pixel ratio·모션 처리와 canvas cleanup을 확인한다. 모바일 GPU·배터리 비용을 고려한다.
- rAF·observer·event listener는 해제하고 탭 비활성/시야 밖에서 불필요한 animation을 멈춘다. pointer 이벤트마다 React render를 만들지 않는다. 기존 ref 기반 transform을 변경할 때 측정한다.
- reduced motion과 키보드·큰 글자 접근성을 성능과 함께 보존한다. 시각 효과를 줄였다고 기능·상태 전달까지 제거하지 않는다.
- Core Web Vitals의 LCP/INP/CLS를 고려하되 실제 측정 없이 점수 개선을 주장하지 않는다. 변경 전후 동일한 viewport·환경에서 비교한다.

초기 Windows 빌드에 500kB 초과 chunk 경고가 있다. 이번 작업은 디자인·번들 구성을 바꾸지 않았다. 향후 profiling 결과로 3D/runtime chunk 분리와 이미지 비용을 우선 검토한다. 경고 threshold만 높여 해결했다고 기록하지 않는다.
