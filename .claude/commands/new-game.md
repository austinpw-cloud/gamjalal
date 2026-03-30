앱인토스용 새 게임 프로젝트를 현재 보일러플레이트(gemjalal)에서 생성합니다.

사용자에게 다음 정보를 물어봅니다:
1. 게임 이름 (한글) — displayName
2. 앱 ID (영문) — appName (콘솔과 동일해야 함)
3. 브랜드 색상 — primaryColor (기본: #39FF14)
4. 게임 카테고리 (퀴즈/퍼즐/캐주얼/기타)

그 후:
1. 현재 gemjalal 프로젝트를 새 디렉토리(`/Users/cj/Documents/works/{appName}/`)에 복사합니다.
   - node_modules, dist, .ait 파일은 제외
2. 새 프로젝트에서 다음을 변경합니다:
   - `granite.config.ts` — appName, displayName, primaryColor
   - `package.json` — name
   - `CLAUDE.md` — 프로젝트 설명 업데이트
   - `index.html` — title
3. `npm install`을 실행합니다.
4. `npx ait build`로 빌드 확인합니다.
5. 결과를 알려주고, 게임 로직 교체 가이드를 안내합니다:
   - src/data/ — 게임 데이터
   - src/lib/game-engine.ts — 핵심 로직
   - src/pages/ — UI
   - src/styles/global.css — 테마 컬러
