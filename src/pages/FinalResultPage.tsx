import { useQuizStore } from '@/stores/quiz-store';
import { STAGE_NAMES } from '@/lib/quiz-engine';
import { submitScore, openLeaderboard } from '@/lib/toss-sdk';
import TopBar from '@/components/ui/TopBar';
import CountUp from '@/components/ui/CountUp';
import { useEffect, useRef } from 'react';

interface FinalResultPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export default function FinalResultPage({ onNavigate }: FinalResultPageProps) {
  const { session, totalPoints, resetQuiz } = useQuizStore();
  const stageResults = session?.stageResults || [];

  // Submit final score to leaderboard
  const submitted = useRef(false);
  useEffect(() => {
    if (!submitted.current && totalPoints > 0) {
      submitted.current = true;
      submitScore(totalPoints);
    }
  }, [totalPoints]);

  const totalCorrect = stageResults.reduce((sum, r) => sum + r.score, 0);
  const totalQuestions = stageResults.length * 10;
  const stagesCleared = stageResults.filter((r) => r.passed).length;

  const handleGoHome = () => {
    resetQuiz();
    onNavigate('home');
  };

  return (
    <main className="page-full" style={{ paddingTop: 56, paddingBottom: 12, paddingLeft: 12, paddingRight: 12 }}>
      <TopBar />

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-4 animate-scale-in">
          <div style={{ fontSize: 48 }}>🏆</div>
          <h1 className="text-2xl font-black text-neon-yellow" style={{ marginTop: 8 }}>
            전체 결과
          </h1>
        </div>

        {/* Grand total */}
        <div className="game-card p-4 text-center mb-4 animate-fade-in">
          <p className="text-xs text-muted mb-1">총점</p>
          <p className="text-3xl font-black text-neon-yellow">
            <CountUp end={totalPoints} duration={2000} suffix="pt" />
          </p>
          <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />
          <div className="flex justify-between px-4">
            <div className="text-center">
              <p className="text-xs text-muted">정답</p>
              <p className="text-lg font-black text-white">
                {totalCorrect}/{totalQuestions}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted">클리어</p>
              <p className="text-lg font-black text-neon-green">
                {stagesCleared}/5
              </p>
            </div>
          </div>
        </div>

        {/* Stage breakdown */}
        <div className="space-y-2">
          {stageResults.map((sr) => (
            <div
              key={sr.stage}
              className="game-card p-3 flex items-center justify-between animate-fade-in"
            >
              <div className="flex items-center gap-3">
                <span className="text-base font-black text-white">{sr.stage}</span>
                <div>
                  <p className="text-xs font-bold text-white">
                    {STAGE_NAMES[sr.stage]}
                  </p>
                  <p className="text-xs text-muted">{sr.score}/10</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-neon-yellow">
                  {sr.totalPoints.toLocaleString()}pt
                </p>
                <p className={`text-xs font-bold ${sr.passed ? 'text-neon-green' : 'text-neon-pink'}`}>
                  {sr.passed ? '통과 ✓' : '미통과'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="shrink-0 pt-2 space-y-2" style={{ maxWidth: '24rem', margin: '0 auto', width: '100%' }}>
        <button
          onClick={() => openLeaderboard()}
          className="game-btn game-btn-primary"
          style={{ fontSize: 13 }}
        >
          🏆 랭킹 보기
        </button>
        <button
          onClick={handleGoHome}
          className="game-btn game-btn-secondary"
          style={{ fontSize: 13 }}
        >
          처음으로
        </button>
      </div>
    </main>
  );
}
