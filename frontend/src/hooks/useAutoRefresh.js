import { useEffect, useRef } from 'react';

const REFRESH_INTERVAL_MS = 30000;

export default function useAutoRefresh(refresh, enabled = true) {
  const refreshRef = useRef(refresh);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    if (!enabled) return undefined;

    let refreshing = false;
    const runRefresh = async () => {
      if (document.visibilityState !== 'visible' || refreshing) return;
      refreshing = true;
      try {
        await refreshRef.current();
      } catch {
        // Keep the current view intact when a background refresh fails.
      } finally {
        refreshing = false;
      }
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') runRefresh();
    };

    const intervalId = window.setInterval(runRefresh, REFRESH_INTERVAL_MS);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    window.addEventListener('focus', runRefresh);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      window.removeEventListener('focus', runRefresh);
    };
  }, [enabled]);
}