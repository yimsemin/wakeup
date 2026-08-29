# CLAUDE.md

## 이 문서의 위치

- 제품 범위·확정 동작·완료 기준: `PLANNING.md`
- 작업 규칙(변경 원칙, 기능 안전성, 데이터, UI/번역, 배포, 검증): `AGENTS.md`
- 이 문서는 위 둘을 **반복하지 않고**, Claude Code로 작업할 때의 실무 정보만 담는다.

## 프로젝트 한 줄 요약

데스크톱 브라우저에서 Screen Wake Lock으로 화면 꺼짐을 막는 단일 페이지 정적 웹앱.
빌드·서버·의존성·계정 없음. GitHub `yimsemin/wakeup` → Cloudflare Pages → `wakeup.subproject.kr`.

파일 구조는 `PLANNING.md` 6절의 트리를 기준으로 한다. `app.js`는 단일 IIFE다.

## 로컬 실행 / 검증

```sh
python3 -m http.server 8000
```

- `http://localhost:8000` — `localhost`는 보안 컨텍스트라 Wake Lock/SW가 동작한다. `file://`로 열지 말 것.
- 린트·유닛 테스트는 없다. CI는 `.github/workflows/checks.yml` 하나로, 푸시·PR마다 아래를 실행한다. 로컬에서도 변경 후 최소한 같은 것을 확인한다:
  - `node --check app.js && node --check sw.js`
  - `node -e "JSON.parse(require('fs').readFileSync('manifest.webmanifest'))"`
  - `git diff --check`
- Wake Lock 실동작·오프라인·PWA는 **실제 브라우저에서 사람이** 확인한다(자동화 불가).
  헤드리스/샌드박스 브라우저는 `visibilityState`가 hidden이라 Wake Lock 요청이 거부되고,
  Service Worker 등록도 막힐 수 있다 — 이 환경의 실패는 코드 결함이 아닐 수 있다.
- macOS/Windows의 실제 절전 여부는 수동 확인 항목으로 남긴다.

## app.js 구조 메모

- 상태 `state`는 `PLANNING.md` 5절의 값만 가진다(`requesting`/`prompt`/`active`/`idle`/`suspended`/`expired`/`unsupported`/`error`).
- 전이를 결정하는 세 불리언: `shouldStayAwake`(사용자 의도), `timerExpired`, `requestInProgress`.
- `requestWakeLock(fromUserGesture)`: 자동 요청(로드·가시성 복귀·해제 후 재요청)이 거부되면 `prompt`, 사용자 조작에서 나온 요청이 거부되면 `error`. Safari는 사용자 조작 없는 요청을 항상 거부한다.
- 활성 시간·남은 시간은 tick 카운트가 아니라 `Date.now()` 차이를 누적하며,
  wakeLock이 실제로 잡힌 구간(`startActiveTiming`/`pauseActiveTiming`)에서만 진행한다.
- 사용자 표시 문구는 `COPY` 사전 한 곳. 새 문구는 ko/en 동시 추가.

## 자주 실수하는 지점

- 앱 셸 파일(`index.html`/`styles.css`/`app.js`/`manifest`/아이콘) 내용을 바꾸면
  `sw.js`의 `CACHE_NAME` 버전을 반드시 올린다. 안 올리면 재방문자가 구버전을 본다.
- 자산 파일명에 해시가 없다. SW 캐시 무효화는 위 버전 규율에만 의존한다.
- `_headers`/`_redirects`는 로컬 python 서버에서는 적용되지 않는다. 헤더·404 확인은 배포 환경에서.

## 배포

빌드 없음. Cloudflare Pages를 GitHub 리포에 연결하면 루트의 정적 파일, `_headers`(보안 헤더), `_redirects`(미존재 경로 → `index.html` 본문 + 404)가 그대로 적용된다. main에 push하면 자동 배포된다.
`wrangler.toml` 등 빌드/배포 설정 파일은 추가하지 않는다 — 대시보드 Git 연동만 사용한다.

CF 대시보드 쪽 설정(존별): Web Analytics 비활성(추적 코드 금지 원칙), SSL/TLS에서 HSTS, 필요 시 Browser Cache TTL을 "Respect Existing Headers"로 두어 `_headers`가 권위를 갖게 한다. 방문 통계가 필요하면 존 수준(엣지) 집계만 본다 — 페이지에 코드를 넣지 않는다.

릴리스를 표시할 때는 배포와 무관하게 해당 커밋에 `git tag -a vX.Y.Z`를 달고 push한다. 규칙은 `AGENTS.md` "저장소 및 배포" 참고.
