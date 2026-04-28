import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  AUTH_STATE_EVENT,
  clearAllAuth,
  getAccessToken,
  getAdminAccessToken,
  hasAdminSession,
  hasUserSession,
  logout,
  refreshAccessToken,
} from "../utils/api";

const LAST_ACTIVITY_KEY = "gc:last-activity-at";
const IDLE_MINUTES = Number(process.env.REACT_APP_IDLE_TIMEOUT_MINUTES || 45);
const WARNING_MINUTES = Number(process.env.REACT_APP_IDLE_WARNING_MINUTES || 5);
const REFRESH_INTERVAL_MINUTES = Number(
  process.env.REACT_APP_SESSION_REFRESH_INTERVAL_MINUTES || 10,
);
const IDLE_MS = IDLE_MINUTES * 60 * 1000;
const WARNING_MS = WARNING_MINUTES * 60 * 1000;
const LOGOUT_MS = IDLE_MS + WARNING_MS;
const REFRESH_INTERVAL_MS = REFRESH_INTERVAL_MINUTES * 60 * 1000;
const ACTIVITY_WRITE_THROTTLE_MS = 15 * 1000;
const ACTIVE_REFRESH_WINDOW_MS = REFRESH_INTERVAL_MS;

function getStoredLastActivity() {
  try {
    const raw = localStorage.getItem(LAST_ACTIVITY_KEY);
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : Date.now();
  } catch {
    return Date.now();
  }
}

function SessionWarningModal({ secondsRemaining }) {
  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <span className="text-xl font-black">!</span>
        </div>
        <h2 className="text-xl font-black text-slate-900">
          Session Timeout Warning
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          You have been away for 45 minutes. You will be logged out in 5 minutes
          if there is no activity.
        </p>
        <p className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
          Time remaining: {Math.max(secondsRemaining, 0)} second
          {secondsRemaining === 1 ? "" : "s"}
        </p>
        <p className="mt-3 text-xs text-slate-500">
          Move the mouse, type, scroll, touch the screen, or focus the tab to
          keep your session active.
        </p>
      </div>
    </div>,
    document.body,
  );
}

export default function SessionManager() {
  const navigate = useNavigate();
  const [lastActivityAt, setLastActivityAt] = useState(getStoredLastActivity);
  const [secondsRemaining, setSecondsRemaining] = useState(
    WARNING_MINUTES * 60,
  );
  const [warningVisible, setWarningVisible] = useState(false);
  const lastActivityRef = useRef(lastActivityAt);
  const lastPersistedActivityRef = useRef(lastActivityAt);
  const refreshInFlightRef = useRef(false);
  const logoutInFlightRef = useRef(false);

  const sessionState = {
    hasUser: hasUserSession(),
    hasAdmin: hasAdminSession(),
    accessToken: getAccessToken(),
    adminToken: getAdminAccessToken(),
  };

  const isAuthenticated = !!(
    sessionState.accessToken || sessionState.adminToken
  );

  const persistActivity = useCallback((timestamp = Date.now()) => {
    lastActivityRef.current = timestamp;
    setLastActivityAt(timestamp);

    if (
      timestamp - lastPersistedActivityRef.current <
      ACTIVITY_WRITE_THROTTLE_MS
    ) {
      return;
    }

    lastPersistedActivityRef.current = timestamp;
    try {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(timestamp));
    } catch {}
  }, []);

  const performLogout = useCallback(
    async (mode = "user") => {
      if (logoutInFlightRef.current) return;
      logoutInFlightRef.current = true;
      setWarningVisible(false);

      try {
        if (mode === "user") {
          await logout();
        } else {
          clearAllAuth();
        }
      } finally {
        clearAllAuth();
        navigate("/login?mode=login", {
          replace: true,
          state: { sessionExpired: true },
        });
        logoutInFlightRef.current = false;
      }
    },
    [navigate],
  );

  const refreshIfPossible = useCallback(async () => {
    if (!sessionState.hasUser || sessionState.hasAdmin) return true;
    if (refreshInFlightRef.current) return true;

    refreshInFlightRef.current = true;
    try {
      await refreshAccessToken();
      persistActivity(Date.now());
      return true;
    } catch {
      await performLogout("user");
      return false;
    } finally {
      refreshInFlightRef.current = false;
    }
  }, [
    performLogout,
    persistActivity,
    sessionState.hasAdmin,
    sessionState.hasUser,
  ]);

  const handleActivity = useCallback(async () => {
    if (!isAuthenticated) return;

    const now = Date.now();
    const idleFor = now - lastActivityRef.current;
    persistActivity(now);
    setWarningVisible(false);

    if (idleFor >= IDLE_MS && idleFor < LOGOUT_MS) {
      await refreshIfPossible();
    }
  }, [isAuthenticated, persistActivity, refreshIfPossible]);

  useEffect(() => {
    if (!isAuthenticated) {
      setWarningVisible(false);
      return;
    }

    persistActivity(Date.now());
  }, [isAuthenticated, persistActivity]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === LAST_ACTIVITY_KEY && event.newValue) {
        const timestamp = Number(event.newValue);
        if (Number.isFinite(timestamp) && timestamp > 0) {
          lastActivityRef.current = timestamp;
          setLastActivityAt(timestamp);
        }
      }
    };

    const handleAuthChange = () => {
      if (hasUserSession() || hasAdminSession()) {
        persistActivity(Date.now());
      } else {
        setWarningVisible(false);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(AUTH_STATE_EVENT, handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(AUTH_STATE_EVENT, handleAuthChange);
    };
  }, [persistActivity]);

  useEffect(() => {
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "pointerdown",
      "focus",
    ];

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void handleActivity();
      }
    };

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [handleActivity]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const timer = window.setInterval(() => {
      const idleFor = Date.now() - lastActivityRef.current;

      if (idleFor >= LOGOUT_MS) {
        void performLogout(
          sessionState.hasAdmin && !sessionState.hasUser ? "admin" : "user",
        );
        return;
      }

      if (idleFor >= IDLE_MS) {
        setWarningVisible(true);
        setSecondsRemaining(Math.ceil((LOGOUT_MS - idleFor) / 1000));
        return;
      }

      setWarningVisible(false);
      setSecondsRemaining(WARNING_MINUTES * 60);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [
    isAuthenticated,
    performLogout,
    sessionState.hasAdmin,
    sessionState.hasUser,
  ]);

  useEffect(() => {
    if (!isAuthenticated || !sessionState.hasUser || sessionState.hasAdmin) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      const idleFor = Date.now() - lastActivityRef.current;

      if (document.visibilityState !== "visible") return;
      if (idleFor > ACTIVE_REFRESH_WINDOW_MS) return;

      void refreshIfPossible();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [
    isAuthenticated,
    refreshIfPossible,
    sessionState.hasAdmin,
    sessionState.hasUser,
  ]);

  if (!warningVisible) {
    return null;
  }

  return <SessionWarningModal secondsRemaining={secondsRemaining} />;
}
