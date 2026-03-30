export type GamerType =
  | "PC방 전설"
  | "오락실 생존자"
  | "콘솔 귀족"
  | "MMORPG 폐인"
  | "경쟁전 중독자"
  | "모바일 과금러"
  | "찍먹 방랑자"
  | "스토리 순례자"
  | "추억 수집가"
  | "고인물 박사"
  | "서비스종료 생존자"
  | "현역 게이머";

export interface Game {
  id: string;
  name: string;
  nameEn?: string;
  year: number;
  platform: string[];
  genre: string[];
  era: string;
  difficulty: 1 | 2 | 3;
  hint1: string;
  hint2: string;
  hint3: string;
  imageUrl: string;
  imageType: "logo_crop" | "pixel" | "silhouette" | "text_only";
  typeWeights: Partial<Record<GamerType, number>>;
  statWeights: {
    retro?: number;
    hardcore?: number;
    nostalgia?: number;
  };
  active?: boolean;
  round1_featured?: boolean;
  stage?: 1 | 2 | 3 | 4 | 5;
  igdb_cover_id?: string;
}

export interface QuizQuestion {
  game: Game;
  options: string[];
  questionType: "logo_crop" | "pixel" | "silhouette" | "text_hint" | "image_blur" | "feeling";
  hintsRevealed?: number;
}

export interface QuizAnswer {
  gameId: string;
  correct: boolean;
  timeTaken: number;
  selectedOption: string;
  hintsUsed: number;
  pointsEarned: number;
}

export interface QuizResult {
  score: number;
  totalPoints: number;
  percentile: number;
  gamerType: GamerType;
  stats: {
    retro: number;
    hardcore: number;
    nostalgia: number;
  };
  tagline: string;
  stage: number;
  passed: boolean;
}

export interface QuizSession {
  sessionToken: string;
  stage: number;
  round: number;
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  currentIndex: number;
  result?: QuizResult;
  stageResults: StageResult[];
}

export interface StageResult {
  stage: number;
  score: number;
  totalPoints: number;
  passed: boolean;
}

export interface WorldCupMatch {
  gameA: Game;
  gameB: Game;
}

export interface WorldCupSession {
  games: Game[];
  currentRound: number;
  matches: WorldCupMatch[];
  currentMatchIndex: number;
  winners: Game[];
  champion?: Game;
}
