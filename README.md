# Wakeup

Windows와 macOS의 데스크톱 브라우저에서 화면이 꺼지지 않게 하는 정적 웹앱입니다. [Wakeup 열기](https://wakeup.subproject.kr/)

*A browser app that keeps your screen awake, with an optional timer and Korean and English interfaces.*

- 자동 절전 방지와 타이머. 빠른 시간 선택, 직접 입력, 종료 알림음, 누적 시간을 제공합니다.
- 작은 창과 전체 화면 시계. 다른 작업을 하면서 Wakeup을 보이는 곳에 둘 수 있습니다.
- 한국어·영어 전환, 다크 모드, 오프라인 실행과 설치를 지원합니다.

절전 방지는 Wakeup 페이지가 보이는 동안 작동합니다. 브라우저 제약은 [앱의 FAQ](https://wakeup.subproject.kr/)에서 확인할 수 있습니다.

## 로컬 실행

Python 3가 필요합니다. 터미널에서 저장소 루트로 이동해 다음 명령을 실행합니다.

```sh
python3 -m http.server --bind 127.0.0.1 8000
```

Windows에서 Python 런처를 사용한다면 `python3` 대신 `py -3`를 입력합니다.

서버는 이 컴퓨터에서만 접속할 수 있습니다. 브라우저에서 [127.0.0.1:8000](http://127.0.0.1:8000/)을 엽니다. 이 주소는 HTTP에서도 절전 방지와 Service Worker를 사용할 수 있는 보안 컨텍스트입니다. 8000번 포트가 이미 사용 중이면 명령과 주소의 포트 번호를 함께 바꿉니다. 서버를 끄려면 실행한 터미널에서 `Ctrl+C`를 누릅니다.

제품 사양은 [기획서](docs/PLANNING.md), 개발 가이드는 [AGENTS.md](AGENTS.md)를 참고하세요.

## 라이선스

[MIT](LICENSE) © yimsemin
