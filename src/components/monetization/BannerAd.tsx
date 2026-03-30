import { useEffect, useRef, useState } from 'react';
import { AD_IDS } from '@/lib/toss-sdk';

/**
 * 띠배너 광고 컴포넌트
 * TossAds SDK를 사용하여 배너를 DOM에 부착한다.
 */
export default function BannerAd() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [initialized, setInitialized] = useState(false);

  // SDK 초기화 (1회)
  useEffect(() => {
    try {
      const { TossAds } = require('@apps-in-toss/web-framework');
      if (!TossAds?.initialize?.isSupported?.()) return;

      TossAds.initialize({
        callbacks: {
          onInitialized: () => setInitialized(true),
          onInitializationFailed: () => {},
        },
      });
    } catch {
      // 브라우저 환경 — 무시
    }
  }, []);

  // 배너 부착
  useEffect(() => {
    if (!initialized || !containerRef.current) return;

    try {
      const { TossAds } = require('@apps-in-toss/web-framework');
      const attached = TossAds.attachBanner(AD_IDS.BANNER, containerRef.current, {
        theme: 'dark',
        tone: 'blackAndWhite',
        variant: 'expanded',
        callbacks: {
          onAdFailedToRender: () => {},
          onNoFill: () => {},
        },
      });

      return () => {
        attached?.destroy();
      };
    } catch {
      // 브라우저 환경 — 무시
    }
  }, [initialized]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: 96,
        background: 'transparent',
      }}
    />
  );
}
