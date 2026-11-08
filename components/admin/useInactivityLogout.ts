"use client";
import { useCallback, useEffect, useRef, useState } from 'react';

const LAST_ACTIVITY_KEY = 'admin-last-activity';
const SHARE_EVERY_MS = 5_000;
const TICK_MS = 1_000;

type Options = {
  enabled: boolean;
  idleLimitMs: number;
  warningMs: number;
  onTimeout: () => void;
};

function readSharedActivity(): number {
  try {
    return Number(localStorage.getItem(LAST_ACTIVITY_KEY)) || 0;
  } catch {
    return 0;
  }
}

/**
 * Logs out after a period with no activity. It compares timestamps instead of running one long timer, so it stays
 * correct after a laptop sleeps or a tab is throttled. Activity is shared across tabs, because signing out in one tab
 * ends the session in all of them.
 */
export function useInactivityLogout({ enabled, idleLimitMs, warningMs, onTimeout }: Options) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const lastActivity = useRef(0);
  const lastShared = useRef(0);
  const warningVisible = useRef(false);
  const timeoutHandler = useRef(onTimeout);

  useEffect(() => {
    timeoutHandler.current = onTimeout;
  });

  const noteActivity = useCallback(() => {
    const now = Date.now();
    lastActivity.current = now;
    warningVisible.current = false;
    if (now - lastShared.current >= SHARE_EVERY_MS) {
      lastShared.current = now;
      try {
        localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
      } catch {
        // Without storage, activity simply is not shared between tabs.
      }
    }
  }, []);

  const recordActivity = useCallback(() => {
    noteActivity();
    setSecondsLeft(null);
  }, [noteActivity]);

  useEffect(() => {
    if (!enabled) return;

    // Once the warning is up, only a deliberate action counts; a passing mouse must not dismiss it.
    const onActivity = (event: Event) => {
      if (warningVisible.current && (event.type === 'pointermove' || event.type === 'scroll')) return;
      recordActivity();
    };
    const events = ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'wheel', 'scroll'];
    events.forEach((name) => window.addEventListener(name, onActivity, { passive: true, capture: true }));

    lastShared.current = 0;
    noteActivity();

    const timer = setInterval(() => {
      const idle = Date.now() - Math.max(lastActivity.current, readSharedActivity());
      const remaining = idleLimitMs - idle;
      if (remaining <= 0) {
        clearInterval(timer);
        warningVisible.current = false;
        setSecondsLeft(null);
        timeoutHandler.current();
      } else if (remaining <= warningMs) {
        warningVisible.current = true;
        setSecondsLeft(Math.ceil(remaining / 1000));
      } else if (warningVisible.current) {
        warningVisible.current = false;
        setSecondsLeft(null);
      }
    }, TICK_MS);

    return () => {
      clearInterval(timer);
      events.forEach((name) => window.removeEventListener(name, onActivity, { capture: true }));
    };
  }, [enabled, idleLimitMs, warningMs, noteActivity, recordActivity]);

  return { secondsLeft: enabled ? secondsLeft : null, stayLoggedIn: recordActivity };
}
