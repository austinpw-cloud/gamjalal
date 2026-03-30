import type { QuizQuestion } from '@/types';

interface QuizCardProps {
  question: QuizQuestion;
  questionNumber: number;
  timeLeft: number;
  hintsRevealed: number;
}

export default function QuizCard({ question, questionNumber, timeLeft, hintsRevealed }: QuizCardProps) {
  const game = question.game;
  const pointsLabel = hintsRevealed <= 1 ? '300pt' : hintsRevealed <= 2 ? '200pt' : '100pt';

  return (
    <div className="hint-card animate-fade-in" style={{ width: '100%' }}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-muted">Q{questionNumber}</span>
        <span className="points-display">{pointsLabel}</span>
      </div>

      <div className="space-y-2">
        {/* Hint 1 — always visible */}
        <div>
          <p className="hint-label">힌트 1</p>
          <p className="hint-text">{game.hint1}</p>
        </div>

        {/* Hint 2 */}
        <div>
          <p className="hint-label">힌트 2</p>
          {hintsRevealed >= 2 ? (
            <p className="hint-text animate-fade-in">{game.hint2}</p>
          ) : (
            <p className="hint-text hint-locked">12초 후 공개</p>
          )}
        </div>

        {/* Hint 3 */}
        <div>
          <p className="hint-label">힌트 3</p>
          {hintsRevealed >= 3 ? (
            <p className="hint-text animate-fade-in">{game.hint3}</p>
          ) : (
            <p className="hint-text hint-locked">7초 후 공개</p>
          )}
        </div>
      </div>

      {/* Game meta */}
      <div className="flex gap-2 mt-2" style={{ flexWrap: 'wrap' }}>
        <span className="text-xs text-muted">{game.year}년</span>
        <span className="text-xs text-muted">{game.platform.join(', ')}</span>
        <span className="text-xs text-muted">{game.genre.join(', ')}</span>
      </div>
    </div>
  );
}
