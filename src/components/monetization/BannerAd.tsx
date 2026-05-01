import { useEffect, useRef, useState } from 'react';
import { TossAds } from '@apps-in-toss/web-framework';
import { AD_IDS } from '@/lib/toss-sdk';

export default function BannerAd() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    try {
      if (!TossAds?.initialize?.isSupported?.()) return;
      TossAds.initialize({
        callbacks: {
          onInitialized: () => setInitialized(true),
          onInitializationFailed: () => {},
        },
      });
    } catch {
      // 브라우저 환경 — SDK 미지원
    }
  }, []);

  useEffect(() => {
    if (!initialized || !containerRef.current) return undefined;
    try {
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
      return undefined;
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
