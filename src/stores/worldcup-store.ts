import { create } from "zustand";
import type { Game, WorldCupSession, WorldCupMatch } from "@/types";

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createMatches(games: Game[]): WorldCupMatch[] {
  const matches: WorldCupMatch[] = [];
  for (let i = 0; i < games.length; i += 2) {
    if (games[i + 1]) {
      matches.push({ gameA: games[i], gameB: games[i + 1] });
    }
  }
  return matches;
}

interface WorldCupStore {
  session: WorldCupSession | null;
  startWorldCup: (games: Game[]) => void;
  selectWinner: (winner: Game) => void;
  reset: () => void;
}

export const useWorldCupStore = create<WorldCupStore>((set, get) => ({
  session: null,

  startWorldCup: (allGames) => {
    const popular = allGames.filter(
      (g) => g.active !== false && ((g.stage || 1) <= 2)
    );
    const selected = shuffle(popular).slice(0, 16);
    set({
      session: {
        games: selected,
        currentRound: 16,
        matches: createMatches(selected),
        currentMatchIndex: 0,
        winners: [],
      },
    });
  },

  selectWinner: (winner) => {
    const { session } = get();
    if (!session) return;
    const newWinners = [...session.winners, winner];
    const nextMatchIndex = session.currentMatchIndex + 1;
    if (nextMatchIndex >= session.matches.length) {
      if (newWinners.length === 1) {
        set({
          session: {
            ...session,
            winners: newWinners,
            champion: newWinners[0],
            currentMatchIndex: nextMatchIndex,
          },
        });
        return;
      }
      const nextMatches = createMatches(newWinners);
      set({
        session: {
          ...session,
          currentRound: newWinners.length,
          matches: nextMatches,
          currentMatchIndex: 0,
          winners: [],
        },
      });
    } else {
      set({
        session: {
          ...session,
          winners: newWinners,
          currentMatchIndex: nextMatchIndex,
        },
      });
    }
  },

  reset: () => set({ session: null }),
}));
