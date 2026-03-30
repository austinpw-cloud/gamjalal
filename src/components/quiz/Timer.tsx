import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

export interface TimerHandle {
  addTime: (seconds: number) => void;
}

interface TimerProps {
  duration: number;
  onExpire: () => void;
  isPaused: boolean;
  onTick?: (timeLeft: number) => void;
}

const Timer = forwardRef<TimerHandle, TimerProps>(({ duration, onExpire, isPaused, onTick }, ref) => {
  const [pct, setPct] = useState(100);
  const expiredRef = useRef(false);
  const onTickRef = useRef(onTick);
  const onExpireRef = useRef(onExpire);
  const isPausedRef = useRef(isPaused);
  const bonusRef = useRef(0);

  // 일시정지 시 경과 시간 보존용
  const elapsedBeforePauseRef = useRef(0);
  const resumeTimeRef = useRef(Date.now());

  onTickRef.current = onTick;
  onExpireRef.current = onExpire;

  // isPaused 변경 시 경과 시간 보존
  useEffect(() => {
    if (isPaused && !isPausedRef.current) {
      // playing → paused: 현재까지 경과 시간 저장
      elapsedBeforePauseRef.current += (Date.now() - resumeTimeRef.current) / 1000;
    } else if (!isPaused && isPausedRef.current) {
      // paused → playing: 재개 시점 기록
      resumeTimeRef.current = Date.now();
    }
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useImperativeHandle(ref, () => ({
    addTime: (seconds: number) => {
      bonusRef.current += seconds;
    },
  }));

  // 타이머 초기화 (duration이 바뀔 때만 = 새 문제)
  useEffect(() => {
    elapsedBeforePauseRef.current = 0;
    resumeTimeRef.current = Date.now();
    bonusRef.current = 0;
    expiredRef.current = false;
    isPausedRef.current = isPaused;
    setPct(100);

    let frameId: number;
    const tick = () => {
      if (expiredRef.current) return;

      if (isPausedRef.current) {
        // 일시정지 중에도 루프는 유지 (재개 시 바로 동작하도록)
        frameId = requestAnimationFrame(tick);
        return;
      }

      const currentElapsed = elapsedBeforePauseRef.current +
        (Date.now() - resumeTimeRef.current) / 1000;
      const totalDuration = duration + bonusRef.current;
      const remaining = Math.max(0, totalDuration - currentElapsed);
      const newPct = (remaining / totalDuration) * 100;
      setPct(newPct);
      onTickRef.current?.(remaining);

      if (remaining <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpireRef.current();
        return;
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const color = pct > 50 ? 'var(--neon-green)' : pct > 20 ? 'var(--neon-yellow)' : 'var(--neon-pink)';

  return (
    <div className="timer-bar">
      <div
        className="timer-fill"
        style={{
          width: `${pct}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
});

Timer.displayName = 'Timer';
export default Timer;
