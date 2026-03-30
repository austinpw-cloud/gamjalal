interface ComboFeedbackProps {
  message: string;
  isCorrect: boolean;
  comboCount: number;
  visible: boolean;
  correctAnswer?: string;
  pointsEarned: number;
}

export default function ComboFeedback({
  message,
  isCorrect,
  comboCount,
  visible,
  correctAnswer,
  pointsEarned,
}: ComboFeedbackProps) {
  if (!visible) return null;

  return (
    <div className={`combo-overlay ${isCorrect ? 'correct-bg' : 'wrong-bg'}`}>
      <div className="animate-combo" style={{ textAlign: 'center' }}>
        {/* Emoji */}
        <div style={{ fontSize: 48, marginBottom: 8 }}>
          {isCorrect
            ? comboCount >= 5
              ? '🔥'
              : comboCount >= 3
              ? '⚡'
              : '✅'
            : '❌'}
        </div>

        {/* Combo count */}
        {isCorrect && comboCount >= 2 && (
          <p className="text-lg font-black text-neon-yellow" style={{ marginBottom: 4 }}>
            {comboCount} COMBO!
          </p>
        )}

        {/* Message */}
        <p
          className={`text-sm font-bold ${isCorrect ? 'text-neon-green' : 'text-neon-pink'}`}
          style={{ marginBottom: 4 }}
        >
          {message}
        </p>

        {/* Points */}
        {isCorrect && pointsEarned > 0 && (
          <p className="text-xs text-neon-yellow">+{pointsEarned}pt</p>
        )}

        {/* Show correct answer on wrong */}
        {!isCorrect && correctAnswer && (
          <p className="text-xs text-muted" style={{ marginTop: 8 }}>
            정답: <span className="text-neon-green font-bold">{correctAnswer}</span>
          </p>
        )}
      </div>
    </div>
  );
}
