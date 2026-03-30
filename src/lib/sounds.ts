/**
 * 웹 오디오 기반 효과음 시스템
 * - 사운드 토글 연동
 * - 앱인토스 오디오 포커스 연동
 */

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

function playTone(frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.3) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // 오디오 실패 무시
  }
}

/** 정답 효과음 — 상승 이중음 */
export function playCorrectSound() {
  playTone(523, 0.15, "sine", 0.25); // C5
  setTimeout(() => playTone(659, 0.15, "sine", 0.25), 100); // E5
  setTimeout(() => playTone(784, 0.2, "sine", 0.3), 200); // G5
}

/** 오답 효과음 — 낮은 버즈 */
export function playWrongSound() {
  playTone(200, 0.3, "sawtooth", 0.15);
  setTimeout(() => playTone(180, 0.3, "sawtooth", 0.1), 150);
}

/** 콤보 효과음 — 화려한 상승음 */
export function playComboSound(combo: number) {
  const baseFreq = 400 + combo * 50;
  for (let i = 0; i < Math.min(combo, 5); i++) {
    setTimeout(() => playTone(baseFreq + i * 100, 0.1, "sine", 0.2), i * 80);
  }
}

/** 타이머 경고음 */
export function playTimerWarning() {
  playTone(880, 0.08, "square", 0.1);
}

/** 카운트다운 효과음 — 3, 2, 1 */
export function playCountdownBeep() {
  playTone(660, 0.12, "sine", 0.2);
}

/** 카운트다운 시작(GO) 효과음 */
export function playCountdownGo() {
  playTone(880, 0.1, "sine", 0.25);
  setTimeout(() => playTone(1047, 0.15, "sine", 0.3), 80);
}

/** 오디오 일시정지/재개 */
export function pauseAudio() {
  audioContext?.suspend();
}

export function resumeAudio() {
  audioContext?.resume();
}

// 오디오 포커스 이벤트 리스너 등록
if (typeof document !== "undefined") {
  document.addEventListener("audio-pause", pauseAudio);
  document.addEventListener("audio-resume", resumeAudio);
}
