# Wakeup

Windows와 macOS의 지원 브라우저에서 화면 꺼짐과 잠금을 방지하는 작은 정적 웹앱이다.

> 브라우저에서 화면이 잠들지 않게.

*A small static web app that keeps a PC or Mac screen awake in the browser, with an optional timer. Korean and English UI.*

**배포 주소: <https://wakeup.subproject.kr/>**

## 특징

- 페이지 로드 직후 무제한 절전 방지 자동 요청
- 무제한, 빠른 시간 선택 및 시간·분 직접 입력 타이머
- 절전 방지가 실제 활성화된 누적 시간과 남은 시간 표시
- 한국어와 영어 지원 (`?lang=ko`, `?lang=en`)
- 최초 방문 후 오프라인 실행 및 PWA 설치 지원
- 쿠키, 사용자 설정 저장, 분석 코드 및 외부 런타임 의존성 없음

## 로컬 실행

Wake Lock과 Service Worker는 보안 컨텍스트가 필요하므로 파일을 직접 열지 말고 `localhost`로 실행한다.

```sh
python3 -m http.server 8000
```

그다음 `http://localhost:8000`을 연다. `localhost`는 브라우저에서 개발용 보안 컨텍스트로 취급된다.

## 구조

- `index.html`: 단일 화면의 의미 구조
- `styles.css`: 레이아웃과 상태 스타일
- `app.js`: Wake Lock, 타이머 및 번역
- `sw.js`: 앱 셸 오프라인 캐시
- `manifest.webmanifest`: 설치형 웹앱 정보
- `favicon.svg`, `icons/`: 파비콘과 PWA 아이콘
- `_headers`: Cloudflare Pages 보안 및 캐시 응답 헤더
- `_redirects`: 존재하지 않는 경로의 404 응답 규칙
- `.gitattributes`, `.editorconfig`, `.gitignore`: 운영체제와 무관한 편집·형식 규칙
- `.github/workflows/checks.yml`: 푸시·PR마다 도는 정적 검사 (문법·manifest JSON·공백)
- `LICENSE`: MIT 라이선스
- `PLANNING.md`: 제품 범위와 완료 기준
- `AGENTS.md`: 이후 작업자가 따라야 할 프로젝트 규칙
- `CLAUDE.md`: Claude Code로 작업할 때의 실무 메모

## 배포

빌드 과정 없이 저장소의 정적 파일을 그대로 Cloudflare Pages에 배포한다. `_headers`의 보안 정책과 `_redirects`의 404 규칙이 함께 적용된다. 현재 `wakeup.subproject.kr`에 연결되어 있다.

## 알려진 제약

Screen Wake Lock은 페이지가 보이는 상태에서만 보장된다. 다른 탭으로 전환하거나 창을 최소화하면 해제될 수 있고, 운영체제의 전원 정책에 따라 요청이 거부될 수도 있다.

## 라이선스

[MIT](LICENSE) © yimsemin
