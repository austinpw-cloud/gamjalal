import { useState } from 'react';
import { useQuizStore } from '@/stores/quiz-store';
import { STAGE_NAMES } from '@/lib/quiz-engine';
import TopBar from '@/components/ui/TopBar';
import RankingScreen from '@/components/result/RankingScreen';

interface HomePageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [isStarting, setIsStarting] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const { resetQuiz, bestScore } = useQuizStore();

  const handleStart = (stage: number = 1) => {
    setIsStarting(true);
    resetQuiz();
    setTimeout(() => {
      onNavigate('quiz', { stage: String(stage) });
    }, 300);
  };

  if (showRanking) {
    return <RankingScreen onNext={() => setShowRanking(false)} buttonLabel="돌아가기" />;
  }

  return (
    <main className="page-center">
      <TopBar />

      {/* Background glow */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(57,255,20,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="relative z-10 flex flex-col items-center w-full max-w-sm animate-fade-in"
        style={{
          gap: 16,
          transition: 'all 0.3s',
          opacity: isStarting ? 0 : 1,
          transform: isStarting ? 'scale(0.95)' : 'scale(1)',
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div style={{ fontSize: 48 }}>🎮</div>
          <h1
            className="text-center font-black"
            style={{ fontSize: 48, textShadow: '0 0 12px rgba(57,255,20,0.4)' }}
          >
            <span className="text-neon-green">겜</span>
            <span className="text-neon-blue">잘알</span>
          </h1>
        </div>

        {/* Tagline */}
        <div className="text-center">
          <p className="text-base font-bold text-white">너 진짜 게임 좀 해봤어?</p>
          <p className="text-xs text-muted" style={{ marginTop: 2 }}>5단계 도전으로 증명해봐.</p>
        </div>

        {/* My record / Leaderboard */}
        {bestScore > 0 && (
          <button
            onClick={() => setShowRanking(true)}
            className="game-card w-full p-3 flex items-center justify-between"
            style={{ cursor: 'pointer' }}
          >
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 18 }}>🏅</span>
              <div className="text-left">
                <p className="text-xs text-muted">내 최고 점수</p>
                <p className="text-sm font-black text-white">{bestScore.toLocaleString()}점</p>
              </div>
            </div>
            <span className="text-muted text-xs">랭킹 보기 ›</span>
          </button>
        )}

        {/* Start */}
        <button
          onClick={() => handleStart(1)}
          disabled={isStarting}
          className="game-btn game-btn-primary animate-pulse-neon"
          style={{ fontSize: 15, padding: '14px 24px' }}
        >
          1단계부터 시작하기
        </button>

        {/* Stage select */}
        <div className="w-full">
          <p className="text-xs text-muted text-center" style={{ marginBottom: 6, fontSize: 10 }}>또는 단계 선택</p>
          <div className="grid grid-cols-5" style={{ gap: 6 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => handleStart(s)}
                disabled={isStarting}
                className="game-card flex flex-col items-center"
                style={{ padding: '8px 0', gap: 2, cursor: 'pointer', textAlign: 'center' }}
              >
                <span className="text-base font-black text-white">{s}</span>
                <span className="text-muted" style={{ fontSize: 9 }}>{STAGE_NAMES[s]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* World Cup */}
        <button
          onClick={() => onNavigate('worldcup')}
          className="game-btn game-btn-secondary"
          style={{ fontSize: 12, padding: '10px 24px' }}
        >
          🏆 인생게임 토너먼트
        </button>

        <p className="text-muted" style={{ fontSize: 10, opacity: 0.5 }}>회원가입 없이 바로 시작 · 약 90초</p>
      </div>
    </main>
  );
}
