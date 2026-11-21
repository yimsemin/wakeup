# Wakeup

Windows와 macOS의 데스크톱 브라우저에서 화면이 꺼지지 않게 하는 정적 웹앱입니다. [Wakeup 열기](https://wakeup.subproject.kr/)

*A browser app that keeps your screen awake, with an optional timer and Korean and English interfaces.*

- 자동 절전 방지와 타이머. 빠른 시간 선택, 직접 입력, 종료 알림음, 누적 시간을 제공합니다.
- 작은 창과 전체 화면 시계. 다른 작업을 하면서 Wakeup을 보이는 곳에 둘 수 있습니다.
- 한국어·영어 전환, 다크 모드, 오프라인 실행과 설치를 지원합니다.

절전 방지는 Wakeup 페이지가 보이는 동안 작동합니다. 브라우저 제약은 [앱의 FAQ](https://wakeup.subproject.kr/)에서 확인할 수 있습니다.

## 로컬 실행

저장소 루트에서 다음 명령을 실행하고 보안 컨텍스트인 [localhost:8000](http://localhost:8000)을 엽니다.

```sh
python3 -m http.server 8000
```

제품 사양은 [기획서](docs/PLANNING.md), 작업 규칙은 [AGENTS.md](AGENTS.md), 로컬 검사는 [CLAUDE.md](CLAUDE.md)를 참고하세요.

## 라이선스

[MIT](LICENSE) © yimsemin
