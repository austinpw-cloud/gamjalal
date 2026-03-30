import { useEffect } from 'react';
import { useWorldCupStore } from '@/stores/worldcup-store';
import { allGames } from '@/lib/load-games';
import TopBar from '@/components/ui/TopBar';

interface WorldCupPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const ROUND_LABELS: Record<number, string> = {
  16: '16강',
  8: '8강',
  4: '4강',
  2: '결승',
};

export default function WorldCupPage({ onNavigate }: WorldCupPageProps) {
  const { session, startWorldCup, selectWinner, reset } = useWorldCupStore();

  useEffect(() => {
    if (!session) {
      const activeGames = allGames.filter((g) => g.active !== false);
      startWorldCup(activeGames);
    }
  }, [session, startWorldCup]);

  const handleGoHome = () => {
    reset();
    onNavigate('home');
  };

  if (!session) return null;

  // Champion screen
  if (session.champion) {
    return (
      <main className="page-center">
        <TopBar />
        <div className="flex flex-col items-center gap-4 animate-scale-in" style={{ maxWidth: '20rem' }}>
          <div style={{ fontSize: 64 }}>🏆</div>
          <h2 className="text-2xl font-black text-neon-yellow text-center">
            당신의 인생게임
          </h2>
          <div className="game-card w-full p-5 text-center">
            <p className="text-xl font-black text-white">{session.champion.name}</p>
            <p className="text-xs text-muted" style={{ marginTop: 4 }}>
              {session.champion.year}년 · {session.champion.platform.join(', ')}
            </p>
            <p className="text-xs text-muted" style={{ marginTop: 2 }}>
              {session.champion.genre.join(', ')}
            </p>
          </div>

          <div className="w-full space-y-2">
            <button
              onClick={() => {
                reset();
                const activeGames = allGames.filter((g) => g.active !== false);
                startWorldCup(activeGames);
              }}
              className="game-btn game-btn-primary"
              style={{ fontSize: 13 }}
            >
              다시 하기
            </button>
            <button
              onClick={handleGoHome}
              className="game-btn game-btn-secondary"
              style={{ fontSize: 13 }}
            >
              홈으로
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Current match
  const match = session.matches[session.currentMatchIndex];
  if (!match) return null;

  const roundLabel = ROUND_LABELS[session.currentRound] || `${session.currentRound}강`;
  const matchNum = session.currentMatchIndex + 1;
  const totalMatches = session.matches.length;

  return (
    <main className="page-center">
      <TopBar />
      <div className="flex flex-col items-center gap-4 w-full" style={{ maxWidth: '24rem' }}>
        {/* Round info */}
        <div className="text-center">
          <p className="text-lg font-black text-neon-blue">🏆 인생게임 토너먼트</p>
          <p className="text-xs text-muted" style={{ marginTop: 4 }}>
            {roundLabel} ({matchNum}/{totalMatches})
          </p>
        </div>

        {/* VS */}
        <div className="flex gap-3 w-full" style={{ alignItems: 'stretch' }}>
          <button
            className="worldcup-card animate-fade-in"
            onClick={() => selectWinner(match.gameA)}
          >
            <span style={{ fontSize: 32 }}>🎮</span>
            <p className="text-sm font-black text-white">{match.gameA.name}</p>
            <p className="text-xs text-muted">{match.gameA.year}년</p>
            <p className="text-xs text-muted" style={{ fontSize: 10 }}>
              {match.gameA.genre.slice(0, 2).join(', ')}
            </p>
          </button>

          <div className="flex items-center">
            <span className="text-lg font-black text-neon-pink">VS</span>
          </div>

          <button
            className="worldcup-card animate-fade-in"
            onClick={() => selectWinner(match.gameB)}
          >
            <span style={{ fontSize: 32 }}>🎮</span>
            <p className="text-sm font-black text-white">{match.gameB.name}</p>
            <p className="text-xs text-muted">{match.gameB.year}년</p>
            <p className="text-xs text-muted" style={{ fontSize: 10 }}>
              {match.gameB.genre.slice(0, 2).join(', ')}
            </p>
          </button>
        </div>

        {/* Home button */}
        <button
          onClick={handleGoHome}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--muted)',
            fontSize: 10,
            cursor: 'pointer',
            marginTop: 8,
          }}
        >
          그만하기
        </button>
      </div>
    </main>
  );
}
