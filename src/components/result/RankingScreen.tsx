import { useQuizStore } from '@/stores/quiz-store';
import { openLeaderboard } from '@/lib/toss-sdk';

interface RankingScreenProps {
  onNext: () => void;
  buttonLabel?: string;
}

const AVATARS = ['🐰', '🐻', '🦊', '🐸', '🐱', '🐶', '🦁', '🐼', '🐨', '🐯', '🐷', '🐵'];

export default function RankingScreen({ onNext, buttonLabel = '결과 확인하기' }: RankingScreenProps) {
  const { totalPoints, bestScore, session } = useQuizStore();
  const stageResults = session?.stageResults || [];
  const stagesCleared = stageResults.filter((r) => r.passed).length;
  const displayPoints = totalPoints > 0 ? totalPoints : bestScore;

  return (
    <main className="page-full" style={{ paddingTop: 56, paddingBottom: 12, paddingLeft: 12, paddingRight: 12 }}>
      {/* Header */}
      <div className="shrink-0 mb-4 text-center">
        <p className="text-lg font-bold text-white">전체 랭킹</p>
        <p className="text-xs text-muted" style={{ marginTop: 4 }}>누적 총점 기준</p>
      </div>

      {/* My score card */}
      <div
        className="game-card p-4 mb-4 animate-scale-in"
        style={{ borderColor: 'var(--neon-blue)', borderWidth: 1 }}
      >
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 36 }}>😎</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-neon-blue">나</p>
            <p className="text-2xl font-black text-white">{displayPoints.toLocaleString()}점</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">클리어</p>
            <p className="text-lg font-black text-neon-green">{stagesCleared}/5</p>
          </div>
        </div>
      </div>

      {/* Stage breakdown */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {stageResults.length > 0 ? (
          <div className="space-y-1">
            {stageResults.map((sr, i) => (
              <div key={sr.stage} className="game-card p-3 flex items-center gap-3 animate-fade-in">
                <span style={{ fontSize: 20 }}>{AVATARS[i % AVATARS.length]}</span>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white">{sr.stage}단계</p>
                  <p className="text-xs text-muted">{sr.score}/10</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white">{sr.totalPoints.toLocaleString()}pt</p>
                  <p className={`text-xs font-bold ${sr.passed ? 'text-neon-green' : 'text-neon-pink'}`}>
                    {sr.passed ? '통과 ✓' : '미통과'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center" style={{ paddingTop: 40 }}>
            <p className="text-sm text-muted">아직 플레이 기록이 없어요</p>
          </div>
        )}

        {/* Native leaderboard button */}
        <button
          onClick={() => openLeaderboard()}
          className="game-btn game-btn-secondary w-full"
          style={{ marginTop: 16, fontSize: 13 }}
        >
          🏆 토스 리더보드 보기
        </button>
      </div>

      {/* Bottom button */}
      <div className="shrink-0" style={{ paddingTop: 12 }}>
        <button onClick={onNext} className="game-btn game-btn-primary" style={{ fontSize: 13 }}>
          {buttonLabel}
        </button>
      </div>
    </main>
  );
}
