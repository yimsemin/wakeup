# Wakeup

Windows와 macOS의 지원 브라우저에서 화면 꺼짐과 잠금을 방지하는 작은 정적 웹앱이다.

> 브라우저에서 화면이 잠들지 않게.

## 특징

- 페이지 로드 직후 무제한 절전 방지 자동 요청
- 무제한, 빠른 시간 선택 및 시간·분 직접 입력 타이머
- 절전 방지가 실제 활성화된 누적 시간과 남은 시간 표시
- 한국어와 영어 지원 (`?lang=ko`, `?lang=en`)
- 최초 방문 후 오프라인 실행 및 PWA 설치 지원
- 쿠키, 사용자 설정 저장, 분석 도구 및 외부 런타임 의존성 없음

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
- `_headers`: Cloudflare Pages 보안 및 캐시 응답 헤더
- `.gitattributes`, `.editorconfig`: 운영체제와 무관한 UTF-8/LF 편집 규칙
- `PLANNING.md`: 제품 범위와 완료 기준
- `AGENTS.md`: 이후 작업자가 따라야 할 프로젝트 규칙

## 배포

빌드 과정 없이 저장소의 정적 파일을 그대로 Cloudflare Pages에 배포할 수 있다. `_headers`의 보안 정책도 함께 적용되며, 실제 도메인 연결은 별도 배포 단계에서 진행한다.

## 알려진 제약

Screen Wake Lock은 페이지가 보이는 상태에서만 보장된다. 다른 탭으로 전환하거나 창을 최소화하면 해제될 수 있고, 운영체제의 전원 정책에 따라 요청이 거부될 수도 있다.
