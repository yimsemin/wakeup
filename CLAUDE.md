@AGENTS.md

# CLAUDE.md

## 로컬 실행 및 검사

[README의 실행 방법](README.md#로컬-실행)으로 저장소 루트를 서빙한다. Node 버전은 `.node-version`을 따른다.

[정적 검사 워크플로](.github/workflows/checks.yml)는 PR과 `main` 푸시에서 실행된다. 로컬 검사 명령은 다음과 같다.

```sh
node --check app.js
node --check sw.js
node -e "JSON.parse(require('fs').readFileSync('manifest.webmanifest', 'utf8'))"
node scripts/check-copy.mjs
npm run build
git diff --check
```

워크플로에서는 빌드에 앱 셸 파일이 모두 들어 있는지와 기준 커밋 대비 앱 셸 변경에 캐시 이름 갱신이 있는지도 검사한다. `main` 푸시의 커밋 제목 검사에는 `.githooks/commit-msg`를 사용한다.

## 함께 고칠 부분

- 색상을 바꾸면 `styles.css`에서 시스템 다크 모드와 명시적으로 선택한 다크 모드의 규칙을 함께 확인한다.
- 번역 문구는 `app.js`의 `COPY`를 수정하고, 해당하는 초기 한국어 HTML과 FAQ 구조화 데이터도 맞춘다. `data-i18n`은 본문, `data-i18n-content`는 메타 정보, `data-i18n-aria`는 접근성 라벨에 쓴다.
- 배포 파일을 추가하거나 제거할 때 `scripts/build.mjs`의 복사 목록을 함께 확인한다. 앱 셸 변경 시 캐시 갱신 규칙은 [AGENTS.md](AGENTS.md#데이터-및-오프라인)를 따른다.

## 배포 설정

Cloudflare Pages는 GitHub에 연결되어 있으며 빌드 명령은 `npm run build`, 출력 폴더는 `dist`다. Web Analytics는 비활성화한다. HSTS와 Service Worker의 재검증 정책은 `_headers`에 설정한다. 이 파일의 헤더는 Cloudflare Pages에서 확인한다.
