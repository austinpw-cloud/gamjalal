import type { Game } from '@/types';

export function makeGame(overrides: Partial<Game> & { id: string }): Game {
  return {
    name: `Game ${overrides.id}`,
    year: 2000,
    platform: ['PC'],
    genre: ['RPG'],
    era: '2000s',
    difficulty: 1,
    hint1: 'hint 1',
    hint2: 'hint 2',
    hint3: 'hint 3',
    imageUrl: '',
    imageType: 'text_only',
    typeWeights: {},
    statWeights: { retro: 1, hardcore: 1, nostalgia: 1 },
    stage: 1,
    ...overrides,
  };
}

export function makeStageGames(stage: 1 | 2 | 3 | 4 | 5, count: number): Game[] {
  return Array.from({ length: count }, (_, i) =>
    makeGame({ id: `s${stage}-${i}`, stage, name: `S${stage} Game ${i}` }),
  );
}
