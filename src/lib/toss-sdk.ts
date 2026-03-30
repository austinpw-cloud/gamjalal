import {
  Storage,
  submitGameCenterLeaderBoardScore,
  openGameCenterLeaderboard,
  loadFullScreenAd,
  showFullScreenAd,
  share,
} from '@apps-in-toss/web-framework';

// ─── 광고 그룹 ID ───
export const AD_IDS = {
  REWARD: 'ait.v2.live.ffbd305733eb440f',       // 리워드 (오답제거, 재도전)
  INTERSTITIAL: 'ait.v2.live.8f341794e2344a95',  // 전면배너 (단계 전환)
  BANNER: 'ait.v2.live.683e6de9440e4ec0',        // 띠배너 (퀴즈 화면)
};

// ─── Storage wrapper ───
export const TossStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await Storage.getItem(key);
    } catch {
      return localStorage.getItem(key);
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      await Storage.setItem(key, value);
    } catch {
      localStorage.setItem(key, value);
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      await Storage.removeItem(key);
    } catch {
      localStorage.removeItem(key);
    }
  },
};

// ─── Leaderboard ───
export async function submitScore(score: number): Promise<boolean> {
  try {
    const result = await submitGameCenterLeaderBoardScore({ score: String(score) });
    return result?.statusCode === 'SUCCESS';
  } catch {
    console.warn('리더보드 점수 제출 실패');
    return false;
  }
}

export async function openLeaderboard(): Promise<void> {
  try {
    await openGameCenterLeaderboard();
  } catch {
    console.warn('리더보드 열기 실패');
  }
}

// ─── 리워드 광고 (오답제거 + 재도전) ───
export function loadRewardAd(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      if (typeof loadFullScreenAd !== 'function' || !loadFullScreenAd.isSupported?.()) {
        resolve(false);
        return;
      }
      loadFullScreenAd({
        options: { adGroupId: AD_IDS.REWARD },
        onEvent: (event) => {
          if (event.type === 'loaded') resolve(true);
        },
        onError: () => resolve(false),
      });
    } catch {
      resolve(false);
    }
  });
}

export function showRewardAd(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      if (typeof showFullScreenAd !== 'function' || !showFullScreenAd.isSupported?.()) {
        resolve(false);
        return;
      }
      let earned = false;
      showFullScreenAd({
        options: { adGroupId: AD_IDS.REWARD },
        onEvent: (event) => {
          if (event.type === 'userEarnedReward') earned = true;
          if (event.type === 'dismissed') resolve(earned);
        },
        onError: () => resolve(false),
      });
    } catch {
      resolve(false);
    }
  });
}

// ─── 전면배너 광고 (단계 전환 시) ───
export function loadInterstitialAd(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      if (typeof loadFullScreenAd !== 'function' || !loadFullScreenAd.isSupported?.()) {
        resolve(false);
        return;
      }
      loadFullScreenAd({
        options: { adGroupId: AD_IDS.INTERSTITIAL },
        onEvent: (event) => {
          if (event.type === 'loaded') resolve(true);
        },
        onError: () => resolve(false),
      });
    } catch {
      resolve(false);
    }
  });
}

export function showInterstitialAd(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      if (typeof showFullScreenAd !== 'function' || !showFullScreenAd.isSupported?.()) {
        resolve(false);
        return;
      }
      showFullScreenAd({
        options: { adGroupId: AD_IDS.INTERSTITIAL },
        onEvent: (event) => {
          if (event.type === 'dismissed') resolve(true);
          else if (event.type === 'show') { /* 표시됨 */ }
        },
        onError: () => resolve(false),
      });
    } catch {
      resolve(false);
    }
  });
}

// ─── Share ───
export async function shareResult(message: string): Promise<void> {
  try {
    await share({ message });
  } catch {
    if (navigator.share) {
      await navigator.share({ text: message });
    }
  }
}
