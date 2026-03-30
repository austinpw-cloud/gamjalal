# 앱인토스 게임 보일러플레이트 시스템

> gemjalal(겜잘알)을 기반으로 앱인토스 WebView 게임을 찍어내듯 만들고 출시하는 표준 프로세스

---

## 0. 사전 준비

| 항목 | 설명 |
|------|------|
| 앱인토스 콘솔 | [console.apps-in-toss.toss.im](https://console.apps-in-toss.toss.im) 에서 앱 생성 |
| 샌드박스 앱 | iOS/Android 샌드박스 앱 설치 (테스트용) |
| appName | 콘솔에서 등록한 앱 ID (granite.config.ts에 동일하게 입력) |
| 광고 그룹 ID | 콘솔에서 인앱 광고 설정 후 발급 |
| Node.js | 18+ 필수 |

---

## 1. 프로젝트 생성

### 방법 A: 보일러플레이트 복사 (권장, 3분)

```bash
# 1) 보일러플레이트 복사
cp -r /Users/cj/Documents/works/gemjalal/ /Users/cj/Documents/works/새게임이름/
cd /Users/cj/Documents/works/새게임이름/

# 2) 불필요 파일 제거
rm -rf node_modules dist *.ait

# 3) 설정 변경
# - granite.config.ts → appName, displayName, primaryColor
# - package.json → name
# - index.html → title

# 4) 설치 & 빌드 확인
npm install
npm run build
```

### 방법 B: 처음부터 생성 (10분)

```bash
# 1) Vite 프로젝트 생성
npm create vite@latest my-game -- --template react-ts
cd my-game
npm install

# 2) 앱인토스 SDK + 의존성 설치
npm install @apps-in-toss/web-framework zustand uuid

# 3) 앱인토스 초기화
npx ait init
# → web-framework 선택
# → appName 입력 (콘솔과 동일)

# 4) vite.config.ts에 path alias 추가
# 5) 보일러플레이트에서 공유 모듈 복사 (toss-sdk.ts, sounds.ts, global.css 등)
```

### 방법 C: Claude Code 스킬 (1분)

```
/new-game
```
→ 게임 이름, appName, 브랜드 색상 입력하면 자동 생성

---

## 2. 프로젝트 구조 (표준)

```
my-game/
├── granite.config.ts        # 앱인토스 설정 (필수)
├── vite.config.ts           # Vite 설정 + path alias (@/)
├── index.html               # 핀치줌 비활성화 meta 필수
├── src/
│   ├── main.tsx             # 엔트리포인트
│   ├── App.tsx              # SPA 라우터 + TossProvider 감싸기
│   ├── types.ts             # 타입 정의
│   ├── data/                # 게임 데이터 (JSON)
│   ├── lib/
│   │   ├── game-engine.ts   # 게임 핵심 로직
│   │   ├── load-data.ts     # JSON 로드 + snake_case→camelCase 변환
│   │   ├── sounds.ts        # Web Audio 효과음 (재사용)
│   │   └── toss-sdk.ts      # SDK 래퍼 (재사용, 광고 ID만 변경)
│   ├── stores/              # Zustand 스토어
│   ├── pages/               # 페이지 컴포넌트
│   ├── components/
│   │   ├── providers/
│   │   │   └── TossProvider.tsx  # 오디오 포커스 핸들러 (심사 필수, 재사용)
│   │   ├── ui/              # 공통 UI (TopBar, CountUp, LoadingScreen)
│   │   └── ...              # 게임별 컴포넌트
│   └── styles/global.css    # 네온 게임 테마 (재사용)
├── docs/                    # 문서
└── .claude/commands/        # Claude Code 스킬
    ├── deploy.md            # /deploy — .ait 빌드+배포
    ├── new-game.md          # /new-game — 새 게임 생성
    └── test-sandbox.md      # /test-sandbox — 샌드박스 테스트
```

---

## 3. 핵심 설정 파일

### 3.1 granite.config.ts

```typescript
import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'your-app-name',       // 콘솔 앱 ID와 동일 (필수)
  brand: {
    displayName: '게임 이름',      // 내비바에 표시될 이름
    primaryColor: '#39FF14',       // 브랜드 색상
    icon: '',                      // 콘솔 앱 아이콘 URL
  },
  web: {
    host: 'localhost',             // 샌드박스 테스트 시 IP로 변경
    port: 5173,
    commands: {
      dev: 'vite --host',         // --host 필수 (실기기 테스트용)
      build: 'vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
  webViewProps: {
    type: 'game',                  // 게임='game', 비게임='partner'
  },
});
```

### 3.2 index.html 필수 meta

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
```

### 3.3 package.json scripts

```json
{
  "dev": "npx granite dev --host $(ipconfig getifaddr en0)",
  "build": "npx ait build",
  "build:web": "vite build"
}
```

> **중요:** `ait dev`는 존재하지 않음. `granite dev`를 사용해야 metro + vite 동시 실행됨.

---

## 4. SDK 사용 패턴

### 4.0 Safe Area (필수 — 네이티브 내비바 겹침 방지)

CSS `env(safe-area-inset-*)` 은 앱인토스 WebView에서 **제대로 동작하지 않을 수 있다.** 반드시 SDK의 `SafeAreaInsets` API를 사용할 것.

```typescript
import { SafeAreaInsets } from '@apps-in-toss/web-framework';

// 현재 값 가져오기
const insets = SafeAreaInsets.get(); // { top, bottom, left, right }

// 화면 모드 변경 구독
const cleanup = SafeAreaInsets.subscribe({
  onEvent: (insets) => {
    // CSS 변수로 주입
    document.documentElement.style.setProperty('--safe-top', `${insets.top}px`);
    document.documentElement.style.setProperty('--safe-bottom', `${insets.bottom}px`);
    document.documentElement.style.setProperty('--safe-left', `${insets.left}px`);
    document.documentElement.style.setProperty('--safe-right', `${insets.right}px`);
  },
});
```

**네이티브 X 버튼 좌표 (겹침 방지):**
- X축: `insets.right + 10`
- Y축: `insets.top + 5` (iOS) / `insets.top + 10` (Android)

**구현 방법:** TossProvider에서 CSS 변수로 주입 → global.css에서 `var(--safe-top)` 등 사용.

```css
body {
  padding-top: var(--safe-top);
  padding-bottom: var(--safe-bottom);
}

.top-bar {
  padding-top: calc(var(--safe-top) + 8px);
  padding-right: calc(var(--safe-right) + 60px); /* 네이티브 X + 더보기 버튼 공간 */
}
```

> ⚠️ CSS `env(safe-area-inset-*)` 사용 금지 — 앱인토스 WebView에서 값이 0으로 반환될 수 있음

### 4.1 저장소 (네이티브 Storage)

```typescript
import { Storage } from '@apps-in-toss/web-framework';

// 저장
await Storage.setItem('key', JSON.stringify(data));

// 읽기
const raw = await Storage.getItem('key');
const data = raw ? JSON.parse(raw) : null;

// ⚠️ AsyncStorage 사용 금지 (white-out 발생)
// ⚠️ localStorage는 앱 업데이트 시 날아갈 수 있음 → Storage 사용
// ⚠️ 브라우저 환경에서는 localStorage fallback 구현 필요
```

### 4.2 리더보드

```typescript
import {
  submitGameCenterLeaderBoardScore,
  openGameCenterLeaderboard,
} from '@apps-in-toss/web-framework';

// 점수 제출 (게임 종료 후, 진입 직후 금지)
await submitGameCenterLeaderBoardScore({ score: String(totalPoints) });

// 리더보드 열기 (미니앱은 백그라운드로 전환됨)
await openGameCenterLeaderboard();
```

### 4.3 통합 광고 (보상형/전면형)

```typescript
import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework';

// 1) 미리 로드 (페이지 마운트 시)
loadFullScreenAd({
  options: { adGroupId: 'your-ad-group-id' },
  onEvent: (e) => { if (e.type === 'loaded') setAdReady(true); },
  onError: console.error,
});

// 2) 보여주기 (버튼 클릭 시)
showFullScreenAd({
  options: { adGroupId: 'your-ad-group-id' },
  onEvent: (e) => {
    if (e.type === 'userEarnedReward') grantReward();  // 보상 지급은 여기서만
    if (e.type === 'dismissed') loadNextAd();           // 닫힌 후 다음 광고 로드
  },
  onError: console.error,
});

// ⚠️ load → show → load 순서 필수
// ⚠️ userEarnedReward에서만 보상 지급 (dismissed만으로는 안 됨)
// ⚠️ 브라우저에서는 동작 안 함 → try-catch + isSupported 체크 필요
```

### 4.4 공유

```typescript
import { share } from '@apps-in-toss/web-framework';

await share({ message: '공유 메시지 텍스트' });
// 브라우저 fallback: navigator.share 또는 클립보드 복사
```

---

## 5. 개발 → 테스트 → 배포

### 5.1 로컬 개발

```bash
npm run dev    # granite dev → metro(8081) + vite(5173) 동시 실행
```

PC 브라우저에서 `http://localhost:5173/` 으로 UI 확인 가능 (SDK 기능은 토스앱에서만 동작).

### 5.2 샌드박스 테스트

**iOS 실기기:**
1. 맥과 같은 Wi-Fi 연결
2. 샌드박스 앱 → 서버 주소에 맥 IP 입력
3. `intoss://your-app-name` 입력 → 열기

**Android:**
```bash
adb reverse tcp:8081 tcp:8081
adb reverse tcp:5173 tcp:5173
```
→ 샌드박스 앱에서 `intoss://your-app-name` 입력

**모바일 브라우저 (UI만 확인):**
`http://{맥IP}:5173/` 접속

### 5.3 빌드 & 배포

```bash
npm run build          # npx ait build → .ait 번들 생성
npx ait deploy         # 콘솔에 업로드
```

또는 Claude Code에서: `/deploy`

### 5.4 토스앱 테스트

콘솔 → 출시하기 → QR코드 스캔 → `intoss-private://your-app-name`

### 5.5 심사 & 출시

콘솔에서 심사 요청 → 승인 후 자동 배포

---

## 6. 심사 체크리스트

### 필수 (반려 사유)
- [ ] `webViewProps.type: 'game'` 설정
- [ ] Safe Area 처리 (SDK `SafeAreaInsets` API 사용, CSS `env()` 아님)
- [ ] 핀치줌 비활성화 (meta viewport `user-scalable=no`)
- [ ] 사운드 On/Off 토글 버튼
- [ ] 백그라운드 전환 시 사운드 즉시 종료 (TossProvider)
- [ ] 종료 확인 모달 ("게임명을 종료할까요?" + "닫기"/"종료하기")
- [ ] X 버튼과 게임 UI 겹침 없음
- [ ] 10초 이내 최초 화면 진입
- [ ] 자사 앱 설치 유도 링크 없음

### 권장
- [ ] 게임 프로필 생성 전 점수 제출 안 함
- [ ] 광고 표시 전 로드 완료 확인
- [ ] 리더보드 열 때 게임 프로필과 겹치지 않게

---

## 7. 새 게임 만들기 체크리스트

1. **보일러플레이트 복사** (gemjalal/ → 새 프로젝트/)
2. **granite.config.ts** — appName, displayName, primaryColor 변경
3. **package.json** — name 변경
4. **index.html** — title 변경
5. **src/data/** — 게임 데이터 교체
6. **src/lib/game-engine.ts** — 게임 핵심 로직 교체
7. **src/lib/load-data.ts** — 데이터 변환 로직 수정 (snake_case 주의)
8. **src/stores/** — 게임 상태 수정
9. **src/pages/** — UI 커스텀
10. **src/styles/global.css** — 컬러 테마 변경 (CSS 변수)
11. **src/lib/toss-sdk.ts** — AD_GROUP_ID 실제 값으로 변경
12. **빌드 확인** — `npm run build`
13. **배포** — `npx ait deploy`

---

## 8. 재사용 모듈 (게임 간 공유)

| 모듈 | 파일 | 설명 | 수정 필요 |
|------|------|------|-----------|
| toss-sdk.ts | lib/toss-sdk.ts | Storage, 리더보드, 광고, 공유 래퍼 | AD_GROUP_ID만 변경 |
| sounds.ts | lib/sounds.ts | Web Audio 효과음 (정답/오답/콤보/타이머/카운트다운) | 그대로 사용 |
| global.css | styles/global.css | 네온 게임 테마 + 유틸리티 클래스 | 컬러 변수만 변경 |
| TossProvider | components/providers/TossProvider.tsx | 오디오 포커스 핸들러 (심사 필수) | 그대로 사용 |
| TopBar | components/ui/TopBar.tsx | 로고 + 사운드 토글 + 종료 버튼/모달 | 로고만 변경 |
| CountUp | components/ui/CountUp.tsx | 숫자 카운트업 애니메이션 | 그대로 사용 |
| LoadingScreen | components/ui/LoadingScreen.tsx | 로딩 화면 | 이모지만 변경 |
| Timer | components/quiz/Timer.tsx | requestAnimationFrame 기반 타이머 | 그대로 사용 |

---

## 9. 주의사항 & 트러블슈팅

### Safe Area — CSS env() 사용 금지
앱인토스 WebView에서 `env(safe-area-inset-*)` 값이 0으로 반환되어 UI가 네이티브 내비바와 겹칠 수 있다. 반드시 SDK의 `SafeAreaInsets.get()` + `SafeAreaInsets.subscribe()`를 사용할 것. TossProvider에서 CSS 변수로 주입하는 패턴을 보일러플레이트에 포함시켜뒀다.

### JSON 데이터 snake_case 문제
Supabase/외부 DB에서 가져온 JSON은 `snake_case`인 경우가 많다. 코드는 `camelCase`를 기대하므로, `load-data.ts`에서 변환 레이어를 반드시 추가할 것.

### React StrictMode 이중 실행
개발 모드에서 useEffect가 2번 실행됨. 부작용(API 호출, 점수 제출 등)은 반드시 `useRef` 플래그로 중복 방지.

```typescript
const savedRef = useRef(false);
useEffect(() => {
  if (savedRef.current) return;
  savedRef.current = true;
  // ... 1회성 부작용
}, []);
```

### 광고 SDK 브라우저 에러
`loadFullScreenAd`, `showFullScreenAd`는 토스앱에서만 동작. 브라우저 개발 시 `try-catch`와 `typeof` 체크 필수.

### `ait dev` 명령어 없음
`ait` CLI에 `dev` 명령이 없다. 로컬 개발은 `npx granite dev --host IP`로 metro + vite 동시 실행.

### Timer 콜백 무한 루프
Timer의 `onTick` 콜백을 useEffect 의존성에 넣으면 타이머가 재시작됨. `useRef`로 콜백을 저장하고 의존성에서 제외할 것.

---

## 10. Claude Code 스킬

| 스킬 | 설명 |
|------|------|
| `/deploy` | .ait 빌드 → 콘솔 업로드 안내 |
| `/new-game` | 보일러플레이트에서 새 게임 프로젝트 자동 생성 |
| `/test-sandbox` | IP 확인 → granite.config 업데이트 → 샌드박스 테스트 가이드 |
