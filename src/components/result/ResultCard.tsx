import type { QuizResult } from '@/types';
import StatBar from './StatBar';

const TYPE_EMOJI: Record<string, string> = {
  'PC방 전설': '🖥️',
  '오락실 생존자': '🕹️',
  '콘솔 귀족': '🎮',
  'MMORPG 폐인': '⚔️',
  '경쟁전 중독자': '🏆',
  '모바일 과금러': '📱',
  '찍먹 방랑자': '🌍',
  '스토리 순례자': '📖',
  '추억 수집가': '💎',
  '고인물 박사': '🎓',
  '서비스종료 생존자': '💀',
  '현역 게이머': '🔥',
};

interface ResultCardProps {
  result: QuizResult;
}

export default function ResultCard({ result }: ResultCardProps) {
  const emoji = TYPE_EMOJI[result.gamerType] || '🎮';

  return (
    <div className="result-card w-full animate-fade-in">
      {/* Type badge */}
      <div className="text-center mb-4">
        <div style={{ fontSize: 48 }}>{emoji}</div>
        <h2 className="text-xl font-black text-white" style={{ marginTop: 8 }}>
          {result.gamerType}
        </h2>
        <p className="text-xs text-muted" style={{ marginTop: 4 }}>
          {result.score}/10 · 상위 {result.percentile}%
        </p>
      </div>

      {/* Stats */}
      <div className="space-y-3" style={{ marginBottom: 16 }}>
        <StatBar label="레트로 지수" value={result.stats.retro} color="var(--neon-blue)" />
        <StatBar label="하드코어 지수" value={result.stats.hardcore} color="var(--neon-pink)" />
        <StatBar label="추억밀도" value={result.stats.nostalgia} color="var(--neon-yellow)" />
      </div>

      {/* Tagline */}
      <p
        className="text-sm text-center"
        style={{
          fontStyle: 'italic',
          color: 'var(--muted)',
          lineHeight: 1.6,
        }}
      >
        "{result.tagline}"
      </p>
    </div>
  );
}
