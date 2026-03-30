import type { Game, QuizQuestion } from "@/types";

// Fisher-Yates 셔플
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function selectQuestions(
  games: Game[],
  stage: number,
  usedGameIds: Set<string> = new Set()
): Game[] {
  const available = games.filter(
    (g) => g.active !== false && !usedGameIds.has(g.id)
  );
  const stageGames = shuffle(available.filter((g) => g.stage === stage));
  const selected = stageGames.slice(0, 10);
  if (selected.length < 10) {
    const nearby = shuffle(
      available.filter((g) => !selected.includes(g) && Math.abs((g.stage || 1) - stage) <= 1)
    );
    selected.push(...nearby.slice(0, 10 - selected.length));
  }
  if (selected.length < 10) {
    const remaining = shuffle(available.filter((g) => !selected.includes(g)));
    selected.push(...remaining.slice(0, 10 - selected.length));
  }
  return shuffle(selected).slice(0, 10);
}

export function generateOptions(correct: Game, allGames: Game[]): string[] {
  const candidates = allGames.filter((g) => g.id !== correct.id);
  const correctNumbers = correct.name.match(/\d+/g);
  const sameGenre = candidates.filter((g) =>
    g.genre.some((genre) => correct.genre.includes(genre))
  );
  const sameEra = candidates.filter((g) => g.era === correct.era);
  const sameGenreAndEra = sameGenre.filter((g) => g.era === correct.era);
  let decoyPool: Game[] = [];
  if (sameGenreAndEra.length >= 3) decoyPool = sameGenreAndEra;
  else if (sameGenre.length >= 3) decoyPool = sameGenre;
  else if (sameEra.length >= 3) decoyPool = sameEra;
  else decoyPool = candidates;
  if (correctNumbers && correctNumbers.length > 0) {
    const withNumbers = decoyPool.filter((g) => /\d/.test(g.name));
    if (withNumbers.length >= 3) {
      decoyPool = withNumbers;
    }
  }
  const decoys = shuffle(decoyPool).slice(0, 3).map((g) => g.name);
  return shuffle([correct.name, ...decoys]);
}

export function assignQuestionTypes(
  games: Game[]
): QuizQuestion["questionType"][] {
  return games.map((g, i) => {
    if (g.imageUrl && i < 4) return "image_blur";
    return "text_hint";
  });
}

export function buildQuiz(
  allGames: Game[],
  stage: number,
  usedGameIds: Set<string> = new Set()
): QuizQuestion[] {
  const selected = selectQuestions(allGames, stage, usedGameIds);
  const types = assignQuestionTypes(selected);
  return selected.map((game, i) => ({
    game,
    options: generateOptions(game, allGames),
    questionType: types[i],
    hintsRevealed: 1,
  }));
}

export const STAGE_NAMES: Record<number, string> = {
  1: "워밍업",
  2: "중급자",
  3: "준고인물",
  4: "고인물",
  5: "극고인물",
};

export const STAGE_DESCRIPTIONS: Record<number, string> = {
  1: "누구나 아는 게임들. 8문제 이상 맞추면 통과!",
  2: "90~2000년대 대중작. 좀 알아야 맞힐 수 있어요.",
  3: "장르별 준고인물 수준. 꽤 해봤어야 합니다.",
  4: "고인물 전용. 이걸 안다면 진짜입니다.",
  5: "극고인물. 아는 사람만 아는 게임들.",
};

export const PASS_THRESHOLD = 8;
