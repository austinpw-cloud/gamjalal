# Core Intent
PROBLEM: Casual Korean gamers want a fast, no-signup way to test how much they actually remember from past games and find out what kind of gamer they are.
FEATURES:
- 5-stage gaming-knowledge quiz over a ~500-game dataset, with combo scoring, per-stage pass thresholds, and 12-archetype gamer-type identification
- "Life-game" tournament (single-elimination bracket) for crowning the user's most influential title
- Native Toss leaderboard + share + reward/interstitial/banner ads through the Apps-in-Toss WebView SDK
TARGET_USER: Korean adult gamers (~25–45) who lived through PC방/오락실/콘솔 culture in the 90s–2000s and use the Toss app — reached through the Apps-in-Toss mini-app surface, not via app stores.

# Stack Fingerprint
RUNTIME: Node 18+ · TypeScript 5.9 · React 19.2
FRONTEND: React 19 + Vite 8 + plain CSS (single `src/styles/global.css`, no Tailwind / no UI kit) + a hand-rolled state-based SPA router in `src/App.tsx`
BACKEND: None — fully client-side. No API, no serverless functions, no shared server state.
DATABASE: None server-side. Local: ~500-game JSON dataset bundled at `src/data/games.json` + persisted Zustand stores written through Toss native Storage.
INFRA: Apps-in-Toss WebView. Build via `ait build` → `.ait` bundle, deploy via `npx ait deploy` (API token at `~/.ait/credentials`). No CI/CD configured.
AI_LAYER: None at runtime. The shipped product does not call any LLM/inference service. (AI was used to author the code; the app itself contains no AI feature.)
EXTERNAL_API: Apps-in-Toss SDK only — `submitGameCenterLeaderBoardScore`, `openGameCenterLeaderboard`, `loadFullScreenAd`/`showFullScreenAd` (reward + interstitial), `TossAds.attachBanner`, `share`, `Storage`, `SafeAreaInsets`. No third-party REST APIs.
AUTH: None implemented in-app. Leaderboard submission relies on the Toss host app's identity; no email/OAuth code exists in this repo.
SPECIAL: Custom switch-based router instead of React Router; Web Audio synth for SFX (`src/lib/sounds.ts`) instead of audio files; Zustand `persist` with a custom Toss-Storage-with-localStorage-fallback adapter; copyright-safe rename "월드컵 → 토너먼트" baked into copy.

# Failure Log
Note: this repo has a single squashed initial commit ("feat: 겜잘알 앱인토스 네이티브 버전 초기 커밋"), so there is no commit-by-commit history of failed iterations. The two items below are decisive corrections that are now codified as project rules in `CLAUDE.md` / saved memory — verifiable as rules-in-effect, not as live debugging traces in git.

## Failure 1
SYMPTOM: Layout collided with the Toss native top-right close button and `safe-area-inset-*` came back as 0 on real devices, so insets were ignored entirely.
CAUSE: Standard web `env(safe-area-inset-*)` CSS variables are not populated inside the Apps-in-Toss WebView. The host app injects insets via the SDK, not via OS-level CSS.
FIX: Replaced CSS `env()` with `SafeAreaInsets.get()` + `SafeAreaInsets.subscribe(...)` in `src/components/providers/TossProvider.tsx`, writing `--safe-top/bottom/left/right` CSS variables; added a hard layout rule to keep `padding-right: calc(var(--safe-right) + 60px)` near the top-right close button.
PREVENTION: Codified in `CLAUDE.md` ("Safe Area: CSS env(safe-area-inset-*) 사용 금지 — 앱인토스 WebView에서 값이 0으로 반환됨") so future generations don't regress.

## Failure 2
SYMPTOM: First plan tried to keep one codebase (Next.js + Supabase + Vercel) serving both a global standalone web/app and the Toss mini-app. This produced env-var branching, dual builds, white-out bugs from AsyncStorage, and safe-area divergence whenever either side changed.
CAUSE: The "share one codebase across platforms" instinct conflicted with App-in-Toss's hard requirements (`webViewProps.type: 'game'`, no AsyncStorage, no SSR, SDK-driven safe area).
FIX: Forked into a dedicated Vite + App-in-Toss project (this repo) with zero server dependency. Standalone/global app moved to a separate Expo + Supabase repo. Only pure logic (quiz engine, game DB) is shared by copy, not by import.
PREVENTION: Saved as a project-level rule in memory (`feedback_dual_build.md`): App-in-Toss games start from this boilerplate; never reuse the Next.js/Vercel side.

# Decision Archaeology
## Decision 1
ORIGINAL_PLAN: Next.js + Supabase + Vercel — server-rendered, central DB, email auth, shared between web and mini-app.
REASON_TO_CHANGE: Apps-in-Toss WebView constraints (no AsyncStorage / SDK-driven safe area / `webViewProps.type: 'game'`) plus the desire to ship without operating a backend. AI initially suggested the shared-stack approach; human overrode.
FINAL_CHOICE: Vite + React 19 + Zustand persist on Toss native Storage, ~500-game JSON shipped inside the bundle. No server, no DB, no auth.
OUTCOME: Faster iteration, zero infra cost, zero auth bugs. Trade-off: leaderboard/ranking is whatever Toss GameCenter provides — no custom analytics, no per-user history beyond local Toss Storage.

## Decision 2
ORIGINAL_PLAN: "인생게임 월드컵" — direct adoption of the popular 이상형 월드컵 single-elimination format and naming.
REASON_TO_CHANGE: Copyright/trademark exposure on a commercial Toss surface using the "월드컵" naming. Human-driven decision; AI followed.
FINAL_CHOICE: Renamed and re-skinned to "인생게임 토너먼트" — same single-elimination mechanic, copyright-safer framing.
OUTCOME: Removes IP risk before review submission. Trade-off: loses the immediate format-recognition value of "월드컵", so onboarding copy/UX has to do more work.

# AI Delegation Map

| Domain | AI % | Human % | Notes |
|--------|------|---------|-------|
| Quiz engine + scoring math (`src/lib/quiz-engine.ts`, `src/lib/type-calculator.ts`) | 75 | 25 | AI drafted shuffle, decoy selection, type-weight aggregation; human tuned stage thresholds, normalization caps, and special-case bonuses (고인물 박사 / 찍먹 방랑자 / 추억 수집가) |
| Game DB curation (`src/data/games.json`, ~500 entries) | 30 | 70 | AI seeded schema and entries; human curated era/genre/typeWeights and Korean cultural context |
| Apps-in-Toss SDK integration (`src/lib/toss-sdk.ts`, `BannerAd.tsx`, `TossProvider.tsx`) | 40 | 60 | Human had to debug SDK quirks (Safe Area, ad event types, `isSupported` guards, `granite dev` not `ait dev`); AI wrote the wrappers around the corrected pattern |
| UI components (`src/pages/*`, `src/components/quiz/*`, `src/components/result/*`) | 80 | 20 | AI generated most JSX/CSS; human fixed safe-area paddings and Toss close-button collisions |
| State stores (`src/stores/quiz-store.ts`, `src/stores/worldcup-store.ts`) | 70 | 30 | AI scaffolded Zustand+persist; human swapped storage adapter to Toss Storage with localStorage fallback |
| Korean voice / tagline / feedback copy | 20 | 80 | Human-authored — AI's first drafts read as "AI Korean"; the gamer-slang lines in `type-calculator.ts` are mostly human |
| Build / deploy config (`granite.config.ts`, `package.json`, `vite.config.ts`) | 50 | 50 | AI wrote scaffolding; human chose `granite dev` over the (non-existent) `ait dev`, set `webViewProps.type: 'game'`, fixed host config |
| Visual / brand decisions (color `#39FF14`, app icon spec, layout) | 25 | 75 | Human-led; AI suggested options |

# Live Proof
DEPLOYED_URL: Apps-in-Toss internal — `intoss-private://lunosoft-gamesolympic` (sandbox URI, requires Toss sandbox app). No public web URL for this build. The Vercel URL `https://game-olympics.vercel.app` belongs to a separate, older Next.js prototype (`/Users/cj/Documents/works/game-olympic/`), NOT this repo — flagged here so it isn't mistaken as this project's deployment.
GITHUB_URL: https://github.com/austinpw-cloud/gamjalal
API_ENDPOINTS: ? — none. Client-only app; no public endpoints exist.
CONTRACT_ADDRESSES: ? — not a blockchain project.
OTHER_EVIDENCE: `.ait` build artifact present at repo root (`lunosoft-gamesolympic.ait`, ~3.6 MB) confirming a successful `ait build`. Demo video / screenshots / user counts / Toss store listing: ? (Toss review submission pending).

# Next Blocker
CURRENT_BLOCKER: Knowledge / process — Apps-in-Toss review submission. The build is functional and deployable to the Toss console, but: (a) the live ad group IDs hardcoded in `src/lib/toss-sdk.ts` need to be created and bound on the Apps-in-Toss console, (b) the app icon is empty in `granite.config.ts.brand.icon` and needs to be designed and wired in, and (c) the review checklist (audio focus, safe area, copyright-safe copy for "토너먼트", `webViewProps.type: 'game'`) needs to be walked through one-by-one before submission.
FIRST_AI_TASK: Open `src/lib/toss-sdk.ts` and `granite.config.ts`, then produce a single checklist that maps each Apps-in-Toss review requirement (audio focus handler, SafeAreaInsets subscription, ad group IDs for REWARD/INTERSTITIAL/BANNER, icon, displayName, primaryColor, `webViewProps.type`, copyright-safe naming) to its current value and source location; flag every item still using a placeholder/test value; and output the exact diffs needed to make the project review-ready.

# Integrity Self-Check
PROMPT_VERSION: commit-brief/v1.3
VERIFIED_CLAIMS:
- Stack versions from `package.json`: React 19.2.4, Vite 8.0.1, TypeScript 5.9.3, zustand 5.0.12, @apps-in-toss/web-framework ^2.1.1, uuid 13, html2canvas.
- No backend / no DB: no server folder; no Supabase / Prisma / Drizzle / Postgres deps in `package.json`; all code lives under `src/`.
- Apps-in-Toss SDK usage: `src/lib/toss-sdk.ts` imports `Storage`, `submitGameCenterLeaderBoardScore`, `openGameCenterLeaderboard`, `loadFullScreenAd`, `showFullScreenAd`, `share`; `src/components/monetization/BannerAd.tsx` uses `TossAds.attachBanner`; `src/components/providers/TossProvider.tsx` uses `SafeAreaInsets.get/subscribe`.
- Custom router: `src/App.tsx` is a switch-case over `route.page`; no React Router import anywhere.
- Local game DB bundled: `src/data/games.json` exists and is loaded via `src/lib/load-games.ts`.
- Quiz engine details: `selectQuestions`, `generateOptions`, `assignQuestionTypes`, `buildQuiz`, `STAGE_NAMES`, `PASS_THRESHOLD = 8` all in `src/lib/quiz-engine.ts`.
- Type calculator: 12 `GamerType` archetypes, normalized 0–100 stats, special-case bonuses, tagline/feedback generators in `src/lib/type-calculator.ts`.
- Build artifact: `lunosoft-gamesolympic.ait` (~3.6 MB) present at repo root.
- Repo URL from `git remote -v`: `https://github.com/austinpw-cloud/gamjalal.git`.
- App config: `granite.config.ts` declares `appName: 'lunosoft-gamesolympic'`, `webViewProps.type: 'game'`, `primaryColor: '#39FF14'`, `icon: ''` (empty).
- Single commit: `git log --oneline` returns exactly one commit (`7cc5efc feat: 겜잘알 앱인토스 네이티브 버전 초기 커밋`).
- Korean-voice copy: human-style gamer-slang taglines and feedback strings are present verbatim in `src/lib/type-calculator.ts` (e.g. "100원의 무게를 아는 사람", "10콤보!! 퍼펙트…").
UNVERIFIABLE_CLAIMS:
- AI vs human delegation percentages — estimates inferred from file shape and saved memory; the squashed single commit prevents per-change attribution.
- Failure Log narratives — the Safe-Area incident and the dual-build incident are documented in `CLAUDE.md` and saved memory, but the actual sequence of failed attempts is not in this repo's git history.
- Copyright as the trigger for "월드컵 → 토너먼트" rename — inferred from `CLAUDE.md`'s "구 월드컵 → 저작권 대응" line, not from a verifiable legal artifact.
- Target user demographic (25–45 Korean gamers, 90s–2000s arcade/PC방 culture) — inferred from copy and stage descriptions; no analytics or user research data in the repo.
- Toss review submission status, user counts, external traction — not present in repo.
- Whether the ad group ID strings in `src/lib/toss-sdk.ts` (`ait.v2.live.…`) are wired to live Toss ad inventory — only the strings exist in code; runtime behavior cannot be verified from source.
- Whether the `.ait` build artifact at repo root corresponds to the current source (it could be stale).
DIVERGENCES:
- Earlier in the same chat session the user asked about a Vercel URL; the canonical `game-olympics.vercel.app` belongs to a separate older Next.js project (`/Users/cj/Documents/works/game-olympic/`), not this repo. Flagged explicitly in DEPLOYED_URL rather than letting the brief inherit a misleading external URL.
- This repo has only one commit. Framing it as an "iterated AI build" would overstate what git alone shows; Failure Log and Decision Archaeology lean on `CLAUDE.md` + saved memory, and this is disclosed.
- AI_LAYER is honestly "None at runtime". If commit.show assumes every submitted project ships with an in-product AI feature, this entry falls outside that assumption — not hidden.
- Template was filled as-is; no sections were removed or edited away by the user.
CONFIDENCE_SCORE: 7
- Stack / code-shape / file-reference claims: ~9 (read directly from current source).
- Failure Log + Decision Archaeology: ~6 (rely on `CLAUDE.md` + saved memory, not commits).
- AI Delegation percentages: ~5 (estimates by file shape).
- Live Proof: ~7 (repo URL, build artifact, and Toss internal URI verified; review/usage status not).
