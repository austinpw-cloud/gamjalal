import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuizStore } from '@/stores/quiz-store';
import { buildQuiz, STAGE_NAMES } from '@/lib/quiz-engine';
import { getFeedbackMessage } from '@/lib/type-calculator';
import { loadRewardAd, showRewardAd } from '@/lib/toss-sdk';
import {
  playCorrectSound, playWrongSound, playComboSound,
  playTimerWarning, playCountdownBeep, playCountdownGo,
} from '@/lib/sounds';
import { allGames } from '@/lib/load-games';
import type { QuizQuestion, QuizAnswer } from '@/types';
import TopBar from '@/components/ui/TopBar';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Timer, { type TimerHandle } from '@/components/quiz/Timer';
import ProgressBar from '@/components/quiz/ProgressBar';
import QuizCard from '@/components/quiz/QuizCard';
import AnswerOptions from '@/components/quiz/AnswerOptions';
import ComboFeedback from '@/components/quiz/ComboFeedback';
import BannerAd from '@/components/monetization/BannerAd';

type Phase = 'countdown' | 'playing' | 'feedback' | 'transitioning';

interface QuizPageProps {
  stage: number;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export default function QuizPage({ stage, onNavigate }: QuizPageProps) {
  const { session, startQuiz, submitAnswer, nextQuestion, soundEnabled } = useQuizStore();

  const [phase, setPhase] = useState<Phase>('countdown');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [comboCount, setComboCount] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);
  const [feedbackPoints, setFeedbackPoints] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [hintsRevealed, setHintsRevealed] = useState(1);
  const [countdownNum, setCountdownNum] = useState(3);

  // 부스트 상태
  const [boostUsed, setBoostUsed] = useState(false);
  const [boostLoading, setBoostLoading] = useState(false);
  const [eliminatedOption, setEliminatedOption] = useState<string | null>(null);
  const timerRef = useRef<TimerHandle>(null);

  const questionStartRef = useRef(Date.now());
  const hasAnsweredRef = useRef(false);
  const navigatingRef = useRef(false);

  // 현재 문제의 오답 목록 (부스트용)
  const wrongOptions = useMemo(() => {
    if (!session) return [];
    const q = session.questions[session.currentIndex];
    if (!q) return [];
    return q.options.filter((o) => o !== q.game.name);
  }, [session, session?.currentIndex]);

  // Build quiz locally
  const loadedStageRef = useRef<number | null>(null);
  useEffect(() => {
    if (loadedStageRef.current === stage) return;
    loadedStageRef.current = stage;

    navigatingRef.current = false;
    setPhase('countdown');
    setCountdownNum(3);

    const activeGames = allGames.filter((g) => g.active !== false);
    const questions = buildQuiz(activeGames, stage);
    startQuiz(questions, stage);
    setComboCount(0);
    setSelectedOption(null);
    hasAnsweredRef.current = false;
    setHintsRevealed(1);
    setBoostUsed(false);
    setEliminatedOption(null);
  }, [stage, startQuiz]);

  // Countdown
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdownNum <= 0) {
      if (soundEnabled) playCountdownGo();
      setPhase('playing');
      setTimerKey((k) => k + 1);
      questionStartRef.current = Date.now();
      return;
    }
    if (soundEnabled) playCountdownBeep();
    const timer = setTimeout(() => setCountdownNum((n) => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, countdownNum, soundEnabled]);

  const currentQuestion: QuizQuestion | null =
    session?.questions[session.currentIndex] ?? null;

  // 부스트 핸들러: 광고 시청 → 오답 1개 제거 + 5초 추가
  const handleBoost = useCallback(async () => {
    if (boostUsed || boostLoading || hasAnsweredRef.current || phase !== 'playing') return;
    setBoostLoading(true);

    // 광고 보는 동안 타이머 일시정지 + 타이머 만료 차단
    hasAnsweredRef.current = true;
    setPhase('feedback');

    const loaded = await loadRewardAd();
    if (loaded) {
      await showRewardAd();
      // 광고가 dismissed되면 (시청 완료 여부 무관) 부스트 적용
      // userEarnedReward 이벤트 여부는 SDK 내부에서 판단
    }

    // 부스트 적용 (광고 로드 실패 시에도 적용 — 유저 경험 우선)
    if (wrongOptions.length > 0) {
      const randomWrong = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
      setEliminatedOption(randomWrong);
    }
    timerRef.current?.addTime(5);
    setBoostUsed(true);

    // 타이머 재개 + 답변 가능 상태로 복원
    hasAnsweredRef.current = false;
    setPhase('playing');
    setBoostLoading(false);
  }, [boostUsed, boostLoading, phase, wrongOptions]);

  const handleAnswer = useCallback(
    (option: string) => {
      if (!currentQuestion || !session || hasAnsweredRef.current || navigatingRef.current) return;
      hasAnsweredRef.current = true;

      const timeTaken = Date.now() - questionStartRef.current;
      const isCorrect = option === currentQuestion.game.name;
      const isLastQuestion = session.currentIndex >= session.questions.length - 1;

      let basePoints = 0;
      if (isCorrect) {
        if (hintsRevealed <= 1) basePoints = 300;
        else if (hintsRevealed <= 2) basePoints = 200;
        else basePoints = 100;
        basePoints += Math.max(0, Math.round((1 - timeTaken / 15000) * 50));
      }

      const answer: QuizAnswer = {
        gameId: currentQuestion.game.id,
        correct: isCorrect,
        timeTaken,
        selectedOption: option,
        hintsUsed: hintsRevealed,
        pointsEarned: basePoints,
      };

      setSelectedOption(option);
      submitAnswer(answer);

      const newCombo = isCorrect ? comboCount + 1 : 0;
      setComboCount(newCombo);

      if (soundEnabled) {
        if (isCorrect) {
          if (newCombo >= 3) playComboSound(newCombo);
          else playCorrectSound();
        } else {
          playWrongSound();
        }
      }

      const isTimeout = option === '__timeout__';
      const msg = isTimeout ? '시간 초과!' : getFeedbackMessage(isCorrect, newCombo, currentQuestion.game.difficulty);
      setFeedbackMsg(msg);
      setFeedbackCorrect(isCorrect);
      setFeedbackPoints(basePoints);
      setShowFeedback(true);
      setPhase('feedback');

      const delay = isCorrect ? 1500 : 2500;

      setTimeout(() => {
        setShowFeedback(false);

        if (isLastQuestion) {
          navigatingRef.current = true;
          setPhase('transitioning');
          onNavigate('result', { stage: String(stage) });
        } else {
          nextQuestion();
          setSelectedOption(null);
          setTimerKey((k) => k + 1);
          setPhase('playing');
          questionStartRef.current = Date.now();
          hasAnsweredRef.current = false;
          setHintsRevealed(1);
          setBoostUsed(false);
          setEliminatedOption(null);
        }
      }, delay);
    },
    [session, currentQuestion, comboCount, hintsRevealed, soundEnabled, stage, submitAnswer, nextQuestion, onNavigate],
  );

  const handleTimerExpire = useCallback(() => {
    if (!currentQuestion || hasAnsweredRef.current || boostLoading) return;
    handleAnswer('__timeout__');
  }, [currentQuestion, handleAnswer, boostLoading]);

  if (phase === 'transitioning') {
    return (
      <div className="loading-screen">
        <div style={{ fontSize: 48 }} className="animate-pulse-neon">🎮</div>
        <p className="text-sm text-muted">결과 계산 중...</p>
      </div>
    );
  }

  if (phase === 'countdown') {
    return (
      <main className="page-center">
        <TopBar />
        <div className="flex flex-col items-center gap-6 animate-scale-in">
          <p className="text-sm font-bold text-neon-blue">
            {STAGE_NAMES[stage]} · {stage}단계
          </p>
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: '50%',
              background: 'rgba(42, 42, 78, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="text-7xl font-black text-neon-green animate-pulse-neon-text">
              {countdownNum}
            </span>
          </div>
          <p className="text-sm text-muted">잠시 후 퀴즈가 시작돼요</p>
        </div>
      </main>
    );
  }

  if (!session || !currentQuestion) {
    return <LoadingScreen />;
  }

  return (
    <main className="page-full" style={{ paddingTop: 48, paddingLeft: 12, paddingRight: 12 }}>
      <TopBar />

      {/* Header: stage + progress + timer */}
      <div className="shrink-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-neon-blue">
            {STAGE_NAMES[stage]} · {stage}단계
          </span>
          <ProgressBar
            current={session.currentIndex}
            total={session.questions.length}
            answers={session.answers}
          />
        </div>
        <div className="mb-1">
          <Timer
            ref={timerRef}
            key={timerKey}
            duration={15}
            onExpire={handleTimerExpire}
            isPaused={phase !== 'playing'}
            onTick={(t) => {
              if (t <= 12 && hintsRevealed < 2) setHintsRevealed(2);
              if (t <= 7 && hintsRevealed < 3) setHintsRevealed(3);
              if (soundEnabled && t <= 3 && t > 2.9) playTimerWarning();
              if (soundEnabled && t <= 2 && t > 1.9) playTimerWarning();
              if (soundEnabled && t <= 1 && t > 0.9) playTimerWarning();
            }}
          />
        </div>
      </div>

      {/* Quiz card + Boost button (가운데 배치) */}
      <div className="flex-1 min-h-0 flex flex-col" key={currentQuestion.game.id}>
        <div className="flex items-start">
          <QuizCard
            question={currentQuestion}
            questionNumber={session.currentIndex + 1}
            hintsRevealed={hintsRevealed}
          />
        </div>

        {/* Boost — 3,4,5단계에서만 표시. 문제와 4지선다 사이 상하좌우 가운데 */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {stage >= 3 && !boostUsed && phase === 'playing' && !selectedOption ? (
            <button
              onClick={handleBoost}
              disabled={boostLoading}
              style={{
                width: '80%',
                padding: '10px 24px',
                border: '1px solid var(--border)',
                background: 'linear-gradient(180deg, rgba(57,255,20,0.08) 0%, rgba(10,10,15,0.8) 100%)',
                color: 'var(--neon-green)',
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 8,
                cursor: 'pointer',
                opacity: boostLoading ? 0.5 : 1,
                transition: 'all 0.15s',
              }}
            >
              {boostLoading ? '로딩 중...' : '⚡ 오답 제거 + 5초 추가'}
            </button>
          ) : boostUsed ? (
            <span className="text-xs text-neon-green" style={{ opacity: 0.4 }}>
              ⚡ 부스트 사용 완료
            </span>
          ) : null}
        </div>
      </div>

      {/* Answer options */}
      <div className="shrink-0">
        <AnswerOptions
          options={currentQuestion.options}
          correctAnswer={currentQuestion.game.name}
          onSelect={handleAnswer}
          selectedOption={selectedOption}
          disabled={phase !== 'playing'}
          eliminatedOption={eliminatedOption}
        />
      </div>

      {/* 띠배너 광고 — 전 단계 항시 노출 */}
      <div className="shrink-0" style={{ marginTop: 4 }}>
        <BannerAd />
      </div>

      <ComboFeedback
        message={feedbackMsg}
        isCorrect={feedbackCorrect}
        comboCount={comboCount}
        visible={showFeedback}
        correctAnswer={!feedbackCorrect ? currentQuestion?.game.name : undefined}
        pointsEarned={feedbackPoints}
      />
    </main>
  );
}
