import { describe, it, expect } from 'vitest';
import {
  selectQuestions,
  generateOptions,
  buildQuiz,
  PASS_THRESHOLD,
  STAGE_NAMES,
} from './quiz-engine';
import { makeGame, makeStageGames } from './__fixtures__/games';

describe('selectQuestions', () => {
  it('returns 10 games when the requested stage has enough', () => {
    const games = makeStageGames(2, 20);
    const picked = selectQuestions(games, 2);
    expect(picked).toHaveLength(10);
    expect(picked.every((g) => g.stage === 2)).toBe(true);
  });

  it('never returns games whose ids are in usedGameIds', () => {
    const games = makeStageGames(1, 30);
    const used = new Set(games.slice(0, 25).map((g) => g.id));
    const picked = selectQuestions(games, 1, used);
    expect(picked).toHaveLength(5);
    picked.forEach((g) => expect(used.has(g.id)).toBe(false));
  });

  it('falls back to neighboring stages when the target stage is short', () => {
    const games = [
      ...makeStageGames(2, 3),
      ...makeStageGames(1, 10),
      ...makeStageGames(3, 10),
    ];
    const picked = selectQuestions(games, 2);
    expect(picked).toHaveLength(10);
    const stages = new Set(picked.map((g) => g.stage));
    expect(stages.has(2)).toBe(true);
    expect(stages.size).toBeGreaterThan(1);
  });

  it('skips games marked active: false', () => {
    const games = [
      ...makeStageGames(1, 5),
      ...Array.from({ length: 10 }, (_, i) =>
        makeGame({ id: `inactive-${i}`, stage: 1, active: false }),
      ),
    ];
    const picked = selectQuestions(games, 1);
    picked.forEach((g) => expect(g.active).not.toBe(false));
  });
});

describe('generateOptions', () => {
  it('returns exactly 4 options including the correct answer', () => {
    const games = makeStageGames(1, 20);
    const correct = games[0];
    const options = generateOptions(correct, games);
    expect(options).toHaveLength(4);
    expect(options).toContain(correct.name);
  });

  it('produces no duplicate option strings', () => {
    const games = makeStageGames(1, 20);
    const options = generateOptions(games[0], games);
    expect(new Set(options).size).toBe(options.length);
  });

  it('prefers same-genre decoys when available', () => {
    const correct = makeGame({ id: 'c', genre: ['FPS'], era: '2000s' });
    const sameGenre = Array.from({ length: 5 }, (_, i) =>
      makeGame({ id: `g${i}`, genre: ['FPS'], era: '1990s', name: `FPS ${i}` }),
    );
    const otherGenre = Array.from({ length: 5 }, (_, i) =>
      makeGame({ id: `o${i}`, genre: ['RPG'], era: '1990s', name: `RPG ${i}` }),
    );
    const options = generateOptions(correct, [correct, ...sameGenre, ...otherGenre]);
    const decoyNames = options.filter((o) => o !== correct.name);
    const fromSameGenre = decoyNames.filter((n) => n.startsWith('FPS')).length;
    expect(fromSameGenre).toBe(3);
  });
});

describe('buildQuiz', () => {
  it('returns 10 questions with unique game ids', () => {
    const games = makeStageGames(1, 30);
    const quiz = buildQuiz(games, 1);
    expect(quiz).toHaveLength(10);
    const ids = quiz.map((q) => q.game.id);
    expect(new Set(ids).size).toBe(10);
  });

  it('every question has 4 options containing its correct answer', () => {
    const games = makeStageGames(1, 30);
    const quiz = buildQuiz(games, 1);
    quiz.forEach((q) => {
      expect(q.options).toHaveLength(4);
      expect(q.options).toContain(q.game.name);
    });
  });
});

describe('exported constants', () => {
  it('PASS_THRESHOLD is 8 — changing this is a balance change, update copy too', () => {
    expect(PASS_THRESHOLD).toBe(8);
  });

  it('STAGE_NAMES covers stages 1..5', () => {
    expect(Object.keys(STAGE_NAMES).sort()).toEqual(['1', '2', '3', '4', '5']);
  });
});
