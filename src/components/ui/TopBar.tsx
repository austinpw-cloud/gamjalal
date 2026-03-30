import { useState } from 'react';
import { useQuizStore } from '@/stores/quiz-store';

export default function TopBar() {
  const { soundEnabled, toggleSound, resetQuiz } = useQuizStore();
  const [showExitModal, setShowExitModal] = useState(false);

  const confirmExit = () => {
    setShowExitModal(false);
    resetQuiz();
    window.location.reload();
  };

  return (
    <>
      <div className="top-bar" style={{ justifyContent: 'space-between' }}>
        {/* Left: Logo */}
        <div className="flex items-center gap-1" style={{ opacity: 0.8 }}>
          <span style={{ fontSize: 16 }}>🎮</span>
          <span style={{ fontSize: 13, fontWeight: 900 }}>
            <span className="text-neon-green">겜</span>
            <span className="text-neon-blue">잘알</span>
          </span>
        </div>

        {/* Right: Sound + Exit (네이티브 X 버튼보다 왼쪽에 위치) */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 18,
              cursor: 'pointer',
              opacity: 0.7,
            }}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <button
            onClick={() => setShowExitModal(true)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 18,
              cursor: 'pointer',
              opacity: 0.7,
              color: 'var(--muted)',
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* 종료 확인 모달 (심사 필수) */}
      {showExitModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)' }}
        >
          <div className="game-card p-5 text-center animate-scale-in" style={{ maxWidth: '18rem' }}>
            <p className="text-sm font-bold text-white mb-4">
              겜잘알을 종료할까요?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowExitModal(false)}
                className="game-btn game-btn-secondary"
                style={{ flex: 1, padding: '10px', fontSize: 13 }}
              >
                닫기
              </button>
              <button
                onClick={confirmExit}
                className="game-btn game-btn-primary"
                style={{ flex: 1, padding: '10px', fontSize: 13 }}
              >
                종료하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
