import type { Game, GamerType, QuizAnswer, QuizResult } from "@/types";

const ALL_TYPES: GamerType[] = [
  "PC방 전설",
  "오락실 생존자",
  "콘솔 귀족",
  "MMORPG 폐인",
  "경쟁전 중독자",
  "모바일 과금러",
  "찍먹 방랑자",
  "스토리 순례자",
  "추억 수집가",
  "고인물 박사",
  "서비스종료 생존자",
  "현역 게이머",
];

/**
 * 퀴즈 결과 계산
 */
export function calculateResult(
  answers: QuizAnswer[],
  games: Game[]
): Omit<QuizResult, "percentile" | "stage" | "passed"> {
  const gameMap = new Map(games.map((g) => [g.id, g]));

  // 1. 점수
  const score = answers.filter((a) => a.correct).length;

  // 2. 총 점수 (힌트 차등 or 레거시 계산)
  let totalPoints = 0;
  answers.forEach((a) => {
    if (a.pointsEarned !== undefined) {
      totalPoints += a.pointsEarned;
    } else if (a.correct) {
      const base = 100;
      const speedBonus = Math.max(0, Math.round((1 - a.timeTaken / 15000) * 50));
      totalPoints += base + speedBonus;
    }
  });

  // 3. 지수 계산
  const stats = { retro: 0, hardcore: 0, nostalgia: 0 };
  let maxRetro = 0;
  let maxHardcore = 0;

  answers.forEach((answer) => {
    const game = gameMap.get(answer.gameId);
    if (!game) return;

    const sw = game.statWeights;
    maxRetro += sw.retro || 0;
    maxHardcore += sw.hardcore || 0;

    if (answer.correct) {
      stats.retro += sw.retro || 0;
      stats.hardcore += sw.hardcore || 0;
    }

    // 추억밀도: 빠른 응답 = 즉각적인 기억 = 높은 추억밀도 (15초 기준)
    if (answer.timeTaken < 3000) stats.nostalgia += 12;
    else if (answer.timeTaken < 5000) stats.nostalgia += 8;
    else if (answer.timeTaken < 7000) stats.nostalgia += 4;
    else stats.nostalgia += 1;
  });

  // 0~100 정규화
  const normalizedStats = {
    retro: maxRetro > 0 ? Math.min(100, Math.round((stats.retro / maxRetro) * 100)) : 50,
    hardcore: maxHardcore > 0 ? Math.min(100, Math.round((stats.hardcore / maxHardcore) * 100)) : 50,
    nostalgia: Math.min(100, Math.round(stats.nostalgia)),
  };

  // 4. 타입 판정
  const typeScores: Record<string, number> = {};
  ALL_TYPES.forEach((t) => (typeScores[t] = 0));

  answers.forEach((answer) => {
    if (!answer.correct) return;
    const game = gameMap.get(answer.gameId);
    if (!game) return;

    Object.entries(game.typeWeights).forEach(([type, weight]) => {
      typeScores[type] = (typeScores[type] || 0) + (weight as number);
    });
  });

  // 특수 보정
  // 전체 정답률 높고 고난도 정답 있으면 → 고인물 박사 보너스
  const hardCorrects = answers.filter((a) => {
    const g = gameMap.get(a.gameId);
    return a.correct && g && g.difficulty === 3;
  }).length;
  if (score >= 8 && hardCorrects >= 1) {
    typeScores["고인물 박사"] += 3;
  }

  // 전반적으로 낮으면 → 찍먹 방랑자
  if (score <= 3) {
    typeScores["찍먹 방랑자"] += 5;
  }

  // 추억밀도가 높으면 → 추억 수집가 보너스
  if (normalizedStats.nostalgia >= 80) {
    typeScores["추억 수집가"] += 2;
  }

  const gamerType = Object.entries(typeScores)
    .sort(([, a], [, b]) => b - a)[0][0] as GamerType;

  // 5. 한 줄 평
  const tagline = generateTagline(gamerType, normalizedStats, score);

  return {
    score,
    totalPoints,
    gamerType,
    stats: normalizedStats,
    tagline,
  };
}

/**
 * 백분위 계산 (기존 세션 데이터 기반)
 */
export function calculatePercentile(
  score: number,
  allScores: number[]
): number {
  if (allScores.length === 0) return 95; // 초기에는 높게
  const below = allScores.filter((s) => s < score).length;
  return Math.round((below / allScores.length) * 100);
}

/**
 * 한 줄 평 — AI스럽지 않게, 게이머 말투
 */
export function generateTagline(
  type: GamerType,
  _stats: QuizResult["stats"],
  score: number,
  stage: number = 1
): string {
  const taglines: Record<GamerType, string[]> = {
    "PC방 전설": [
      "PC방이 집이었던 시절, 당신은 거기 살았습니다.",
      "밤새는 게 당연했던 시절의 생존자.",
      "컵라면 냄새와 키보드 소리가 당신의 BGM이었던 시절.",
    ],
    "오락실 생존자": [
      "100원의 무게를 아는 사람.",
      "형들 이기려고 연속기 외우던 시절이 있었죠.",
      "동전 하나로 1시간 버틴 전설.",
    ],
    "콘솔 귀족": [
      "혼자서 엔딩 보는 맛을 아는 사람.",
      "새 게임 나오면 발매일에 사야 직성이 풀리는 타입.",
      "콘솔 앞에서 보낸 시간이 가장 행복했던 사람.",
    ],
    "MMORPG 폐인": [
      "게임 속 길드원이 현실 친구보다 가까웠던 적 있죠.",
      "공성전 승리의 함성은 아직도 귀에 남아있을 겁니다.",
      "레벨업 알림이 세상에서 가장 좋은 소리였던 시절.",
    ],
    "경쟁전 중독자": [
      "지면 잠 못 자고, 이기면 한 판 더 하는 타입.",
      "랭크 올리다 날 샌 적 한두 번이 아니죠.",
      "승률 0.1% 차이에 목숨 거는 사람.",
    ],
    "모바일 과금러": [
      "한정 캐릭터 보면 손이 먼저 움직이는 타입.",
      "뽑기 확률을 몸으로 증명해본 사람.",
      "이번 달 지출의 절반은 게임이었을 겁니다.",
    ],
    "찍먹 방랑자": [
      "유행은 다 타봤고, 오래 한 건 없지만 아는 건 많음.",
      "게임 인생이 넓이로는 아무도 못 이깁니다.",
      "뭐든 해봤는데 뭘 했는지는 잘 기억 안 나는 타입.",
    ],
    "스토리 순례자": [
      "엔딩 크레딧에서 눈물 흘린 적 있는 사람.",
      "게임은 결국 이야기고, 당신은 그걸 아는 사람.",
      "좋은 스토리 하나면 밤을 새울 수 있는 타입.",
    ],
    "추억 수집가": [
      "게임 자체보다 그때 그 시절이 더 소중한 타입.",
      "오래된 게임 BGM 들으면 가슴이 먹먹해지는 사람.",
      "당신의 게임 기억은 곧 당신의 청춘입니다.",
    ],
    "고인물 박사": [
      "당신이 아는 걸 아는 사람이 얼마나 될까요.",
      "공략 사이트 없이도 히든 퀘스트를 찾아낸 타입.",
      "이 정도면 게임이 아니라 학문입니다.",
    ],
    "서비스종료 생존자": [
      "좋아하던 게임이 사라지는 걸 너무 많이 봤습니다.",
      "서비스 종료 공지를 볼 때의 그 기분, 알죠.",
      "떠나보낸 게임들의 목록이 꽤 길 겁니다.",
    ],
    "현역 게이머": [
      "지금도 함. 그냥 게임이 삶인 사람.",
      "요즘 게임도, 옛날 게임도. 장르 불문 다 아는 타입.",
      "단순히 게임을 한 게 아니라, 시대를 통과한 편.",
    ],
  };

  const lines = taglines[type] || ["게이머로 산 시간이 헛되지 않았습니다."];

  // 단계별 + 점수 구간별 칭찬
  if (score === 10) {
    const perfect: Record<number, string> = {
      1: "워밍업 퍼펙트! 다음 단계가 기대되는데요.",
      2: "중급 퍼펙트! 이 정도면 게이머 명함 내밀어도 됩니다.",
      3: "준고인물 퍼펙트! 이건 진짜 아무나 못 합니다.",
      4: "고인물 퍼펙트?! 당신은 게임계의 살아있는 역사서입니다.",
      5: "극고인물 퍼펙트... 전설이 실존합니다. 경배.",
    };
    return perfect[stage] || perfect[1];
  }
  if (score >= 8) {
    const high: Record<number, string[]> = {
      1: ["워밍업 통과! 아직 본게임도 안 했어요.", "좋은 출발이에요. 다음 단계도 가볍죠?"],
      2: ["중급자 실력 인증 완료. 꽤 하셨는데요?", "이 정도면 프로급. 다음 단계도 도전해봐요."],
      3: ["준고인물 클리어라니. 진성 게이머시네요.", "이 난이도에서 이 점수면 대단합니다."],
      4: ["고인물 수준 통과. 존경합니다.", "이걸 맞힌다고? 당신 뭐하시는 분이에요?"],
      5: ["극고인물 통과... 당신은 게이머계의 위키피디아.", "이 단계에서 이 점수는 전설급입니다."],
    };
    const msgs = high[stage] || high[1];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }
  if (score >= 6) {
    if (stage >= 4) return "이 난이도에서 6개 이상이면 충분히 고인물입니다.";
    if (stage >= 3) return "준고인물 수준에서 선전했어요. 꽤 아시는데요?";
    return lines[Math.floor(Math.random() * lines.length)];
  }
  if (score >= 4) {
    if (stage >= 4) return "고인물 난이도에서 절반이면 나쁘지 않아요. 대단한 겁니다.";
    if (stage >= 3) return "이 난이도에서 반타작이면 괜찮아요. 다시 도전!";
    const mid = [
      "절반은 맞혔네요. 아는 건 확실히 아는 타입.",
      "게이머의 피는 흐르고 있습니다. 아직 희망이 있어요.",
    ];
    return mid[Math.floor(Math.random() * mid.length)];
  }
  if (score === 0) {
    if (stage >= 4) return "고인물 난이도는 원래 이래요. 기죽지 마세요.";
    return "...혹시 게임 안 해보셨어요? 진심으로 궁금합니다.";
  }
  // 1~3점
  if (stage >= 4) return "이 난이도는 아는 사람만 아는 거예요. 괜찮습니다.";
  if (stage >= 3) return "준고인물 난이도는 어려운 게 정상이에요. 다시 도전!";
  const low = [
    "혹시 게임 처음이세요? 괜찮아요, 다들 처음은 있으니까.",
    "좀 아쉽네요. 다음 라운드에서 설욕하시죠.",
  ];
  return low[Math.floor(Math.random() * low.length)];
}

/**
 * 정답/오답 피드백 멘트
 */
export function getFeedbackMessage(
  correct: boolean,
  comboCount: number,
  difficulty: number
): string {
  if (correct) {
    // 콤보 멘트 (우선)
    if (comboCount >= 10) return "10콤보!! 퍼펙트. 당신은 전설입니다.";
    if (comboCount >= 9) return `${comboCount}콤보! 이건 거의 사기급인데요`;
    if (comboCount >= 8) return `${comboCount}콤보! 혹시 게임 개발자세요?`;
    if (comboCount >= 7) return `${comboCount}콤보!! 게이머계의 위키피디아시네요`;
    if (comboCount >= 5) return `${comboCount}콤보... 혹시 이쪽 업계 분이세요?`;
    if (comboCount >= 3) return `${comboCount}콤보! 연식 좀 되시네요`;

    // 난이도별 멘트
    const correctMessages = [
      ["이건 기본이지", "오, 아는구나?", "좋아, 워밍업 끝", "쉽죠?"],
      ["오, 연식이 보이는데?", "이건 좀 아는 사람인데", "인정.", "꽤 하시는데요"],
      ["미쳤다 이걸 아네", "진짜 고인물이시네요", "존경합니다", "이걸 안다고?"],
    ];
    const msgs = correctMessages[difficulty - 1] || correctMessages[0];
    return msgs[Math.floor(Math.random() * msgs.length)];
  } else {
    const wrongMessages = [
      ["이걸 모르면 좀 서운한데?", "흠... 진짜?", "다음엔 맞혀봐", "아 이건 알아야지..."],
      ["여기서 막히면 콘솔러 자격 보류", "아 이게 뭔지도 몰라?", "꽤 유명한 건데...", "연식이 부족하신 듯"],
      ["이건 몰라도 돼. 고인물 전용이야", "어려웠지? 괜찮아", "이건 좀 매니악하긴 해"],
    ];
    const msgs = wrongMessages[difficulty - 1] || wrongMessages[0];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }
}
