# CLAUDE.md — 겜잘알 (앱인토스 네이티브)

## 프로젝트 개요

토스 앱인토스 WebView 기반 게임 미니앱. 게임 지식 퀴즈 + 인생게임 월드컵.

## 기술 스택

- **프레임워크**: Vite + React + TypeScript
- **앱인토스 SDK**: `@apps-in-toss/web-framework` 2.x
- **상태관리**: Zustand (persist → Toss 네이티브 Storage)
- **스타일**: 순수 CSS (global.css), Tailwind 사용 안 함
- **서버**: 없음 (Supabase/Vercel 의존 제로)
- **라우팅**: 자체 SPA 상태 기반 라우터 (App.tsx)

## 핵심 구조

```
src/
├── data/games.json          # 게임 DB (~500개)
├── lib/
│   ├── quiz-engine.ts       # 문제 생성, 단계 로직
│   ├── type-calculator.ts   # 게이머 타입 판정, 점수 계산
│   ├── sounds.ts            # Web Audio 효과음
│   └── toss-sdk.ts          # 앱인토스 SDK 래퍼
├── stores/
│   ├── quiz-store.ts        # 퀴즈 상태 (zustand)
│   └── worldcup-store.ts    # 월드컵 상태
├── pages/                   # 페이지 컴포넌트
├── components/              # UI 컴포넌트
└── styles/global.css        # 전체 스타일
```

## 개발 명령어

```sh
npm run dev          # 개발 서버 (granite dev → metro + vite, ait dev는 없음)
npm run build        # .ait 번들 생성 (ait build)
npx ait deploy       # 콘솔에 자동 업로드
npm run build:web    # Vite 빌드만 (디버깅용)
```

## 앱인토스 SDK 사용

- `SafeAreaInsets` — Safe Area 여백 (CSS env() 대체, 필수)
- `Storage` — 네이티브 저장소 (세션, 설정 저장)
- `submitGameCenterLeaderBoardScore` — 리더보드 점수 제출
- `openGameCenterLeaderboard` — 리더보드 열기
- `loadFullScreenAd` / `showFullScreenAd` — 통합 광고 (보상형)
- `share` — 네이티브 공유 시트

## 주의사항

- **Safe Area: CSS `env(safe-area-inset-*)` 사용 금지** — 앱인토스 WebView에서 값이 0으로 반환됨. SDK `SafeAreaInsets.get()` + `subscribe()` 사용 (TossProvider에서 CSS 변수로 주입)
- 네이티브 X 버튼 영역(우측 상단) 겹침 금지 — `padding-right: calc(var(--safe-right) + 60px)`
- TDS 미사용 (게임 카테고리 → TDS 필수 아님)
- `webViewProps.type: 'game'` 설정 필수
- AsyncStorage 사용 금지 (white-out 발생)
- 핀치줌 비활성화 (index.html meta viewport)
