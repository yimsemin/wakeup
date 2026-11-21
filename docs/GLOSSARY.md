# 한·영 화면 문구 용어집

| 개념 | 한국어 | 영어 | 피할 표현 |
| --- | --- | --- | --- |
| 표시 중인 화면이 꺼지지 않게 하는 기능 | 절전 방지 | keep the screen awake | 화면 잠금 방지, keep awake, screen wake lock |
| 브라우저가 제공하는 표준 기능의 이름 | Screen Wake Lock | Screen Wake Lock | 표준 이름의 번역 및 상태·버튼에서의 API 이름 |
| 절전 방지가 켜져 있던 누적 시간 | 절전 방지 시간 | time the screen was kept awake | 컴퓨터 가동 시간, uptime |
| 시작한 타이머가 끝날 때까지 남아 있는 시간 | 남은 시간 | time remaining | 다음 타이머 |
| 절전 방지를 새로 시작하면 적용되는 시간 | 다음 타이머 | next timer | 남은 시간 |
| 페이지가 보이는 동안 절전 방지가 예기치 않게 멈춘 횟수 | 중단 횟수 | interruptions | 오류 횟수, failures |
| 사용자가 정한 시간이 끝날 때 재생하는 소리 | 종료 알림음 | timer chime | 경보, alarm |
| 현재 시각과 설정된 타이머 정보를 크게 보여 주는 화면 | 전체 화면 시계 | full-screen clock | 앰비언트, ambient mode |

`Wakeup` 및 브라우저·운영체제의 제품명은 원문으로 쓴다. 표준 명칭 `Screen Wake Lock`은 FAQ에서 브라우저 지원 조건이나 사용 기술을 설명할 때 쓴다. `NotAllowedError` 같은 오류 종류와 내부 상태 이름은 코드와 개발 문서에 쓴다. 오류 상태와 `NotAllowedError`의 표시 기준은 [기획 문서 3.1절](PLANNING.md#31-절전-방지)을 따른다.
