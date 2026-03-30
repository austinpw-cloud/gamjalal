import { useEffect } from 'react';
import { SafeAreaInsets } from '@apps-in-toss/web-framework';
import { pauseAudio, resumeAudio } from '@/lib/sounds';

/**
 * 앱인토스 SDK 전역 초기화 Provider
 * - Safe Area Insets 적용 (SDK 기반, CSS env() 대체)
 * - 오디오 포커스 핸들러 (심사 필수: 백그라운드 시 사운드 종료)
 */

function applySafeAreaInsets(insets: { top: number; bottom: number; left: number; right: number }) {
  const root = document.documentElement;
  root.style.setProperty('--safe-top', `${insets.top}px`);
  root.style.setProperty('--safe-bottom', `${insets.bottom}px`);
  root.style.setProperty('--safe-left', `${insets.left}px`);
  root.style.setProperty('--safe-right', `${insets.right}px`);
}

export default function TossProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Safe Area Insets 적용 (앱인토스 SDK)
    try {
      const insets = SafeAreaInsets.get();
      applySafeAreaInsets(insets);

      const cleanup = SafeAreaInsets.subscribe({
        onEvent: (newInsets) => {
          applySafeAreaInsets(newInsets);
        },
      });

      // 백그라운드/포그라운드 전환 시 오디오 제어 (심사 필수)
      const handleVisibility = () => {
        if (document.hidden) {
          pauseAudio();
        } else {
          resumeAudio();
        }
      };

      document.addEventListener('visibilitychange', handleVisibility);

      return () => {
        cleanup();
        document.removeEventListener('visibilitychange', handleVisibility);
      };
    } catch {
      // 브라우저 환경 fallback — CSS env() 값 사용
      const handleVisibility = () => {
        if (document.hidden) {
          pauseAudio();
        } else {
          resumeAudio();
        }
      };

      document.addEventListener('visibilitychange', handleVisibility);
      return () => document.removeEventListener('visibilitychange', handleVisibility);
    }
  }, []);

  return <>{children}</>;
}
