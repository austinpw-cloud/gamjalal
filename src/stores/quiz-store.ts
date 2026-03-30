import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { QuizQuestion, QuizAnswer, QuizResult, QuizSession, StageResult } from "@/types";
import { TossStorage } from "@/lib/toss-sdk";

// Custom storage adapter for Toss native storage
const tossStorageAdapter = {
  getItem: async (name: string): Promise<string | null> => {
    return await TossStorage.getItem(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await TossStorage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await TossStorage.removeItem(name);
  },
};

interface QuizStore {
  session: QuizSession | null;
  isLoading: boolean;
  soundEnabled: boolean;
  totalPoints: number;       // 현재 세션(한 게임) 누적 점수 — 게임 시작 시 리셋
  bestScore: number;          // 역대 최고 점수 — persist
  retryCount: Record<number, number>;

  startQuiz: (questions: QuizQuestion[], stage: number, round?: number) => void;
  submitAnswer: (answer: QuizAnswer) => void;
  nextQuestion: () => void;
  setResult: (result: QuizResult) => void;
  addStageResult: (result: StageResult) => void;
  resetQuiz: () => void;
  resetForNextStage: () => void;
  toggleSound: () => void;
  addPoints: (points: number) => void;
  incrementRetry: (stage: number) => void;
}

export const useQuizStore = create<QuizStore>()(persist((set, get) => ({
  session: null,
  isLoading: false,
  soundEnabled: true,
  totalPoints: 0,
  bestScore: 0,
  retryCount: {},

  startQuiz: (questions, stage, round = 1) => {
    const prev = get().session;
    const token = prev?.sessionToken || uuidv4();
    set({
      session: {
        sessionToken: token,
        stage,
        round,
        questions,
        answers: [],
        currentIndex: 0,
        stageResults: prev?.stageResults || [],
      },
      isLoading: false,
    });
  },

  submitAnswer: (answer) => {
    const { session } = get();
    if (!session) return;
    set({
      session: { ...session, answers: [...session.answers, answer] },
    });
  },

  nextQuestion: () => {
    const { session } = get();
    if (!session) return;
    set({
      session: { ...session, currentIndex: session.currentIndex + 1 },
    });
  },

  setResult: (result) => {
    const { session } = get();
    if (!session) return;
    set({ session: { ...session, result } });
  },

  addStageResult: (result) => {
    const { session } = get();
    if (!session) return;
    // 같은 단계 재도전 시 이전 결과를 교체 (중복 방지)
    const filtered = session.stageResults.filter((r) => r.stage !== result.stage);
    set({
      session: { ...session, stageResults: [...filtered, result] },
    });
  },

  resetQuiz: () => {
    const { session, totalPoints, bestScore } = get();
    set({
      session: session ? {
        sessionToken: session.sessionToken,
        stage: 1,
        round: 1,
        questions: [],
        answers: [],
        currentIndex: 0,
        stageResults: [],
      } : null,
      totalPoints: 0,
      bestScore: Math.max(bestScore, totalPoints),
      retryCount: {},
    });
  },

  resetForNextStage: () => {
    const { session } = get();
    if (!session) return;
    set({
      session: {
        ...session,
        questions: [],
        answers: [],
        currentIndex: 0,
        result: undefined,
      },
    });
  },

  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

  addPoints: (points) =>
    set((state) => ({ totalPoints: state.totalPoints + points })),

  incrementRetry: (stage) =>
    set((state) => ({
      retryCount: {
        ...state.retryCount,
        [stage]: (state.retryCount[stage] || 0) + 1,
      },
    })),
}), {
  name: "quiz-store",
  storage: createJSONStorage(() => tossStorageAdapter),
  partialize: (state) => ({
    soundEnabled: state.soundEnabled,
    bestScore: state.bestScore,
  }),
}));
