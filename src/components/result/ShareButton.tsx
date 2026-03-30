import { shareResult } from '@/lib/toss-sdk';
import type { QuizResult } from '@/types';

interface ShareButtonProps {
  result: QuizResult;
  onShareComplete?: () => void;
}

export default function ShareButton({ result, onShareComplete }: ShareButtonProps) {
  const handleShare = async () => {
    const message = `🎮 겜잘알 결과\n\n${result.gamerType} (${result.score}/10)\n"${result.tagline}"\n\n나도 도전해보기 👉`;
    await shareResult(message);
    onShareComplete?.();
  };

  return (
    <button
      onClick={handleShare}
      className="game-btn game-btn-secondary"
      style={{ fontSize: 13 }}
    >
      결과 공유하기 (+15pt)
    </button>
  );
}
