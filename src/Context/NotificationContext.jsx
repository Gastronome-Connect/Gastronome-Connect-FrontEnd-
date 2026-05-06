import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  API_BASE,
  AUTH_STATE_EVENT,
  apiFetch,
  getAdminAccessToken,
  hasAdminSession,
  hasUserSession,
  resolveAvatarUrl,
  resolveUploadUrl,
} from "../utils/api";

const NotificationContext = createContext(null);

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80";

const getSessionType = () => {
  if (hasAdminSession()) {
    return "admin";
  }

  if (hasUserSession()) {
    return "user";
  }

  return "guest";
};

const getEndpointBase = (sessionType) =>
  sessionType === "admin" ? "/api/admin/notifications" : "/api/notifications";

const normalizeNotification = (notification) => {
  const timestamp = Number(notification?.timestamp) || Date.now();
  const images = Array.isArray(notification?.images)
    ? notification.images
        .map((value) => resolveUploadUrl(value))
        .filter(Boolean)
    : [];
  const image = resolveUploadUrl(notification?.image) || images[0] || "";

  return {
    id:
      notification?.id ||
      `notif-${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
    type: notification?.type || "like",
    postId: notification?.postId ? String(notification.postId) : null,
    commentId: notification?.commentId ? String(notification.commentId) : null,
    reportId: notification?.reportId ? String(notification.reportId) : null,
    actorName: notification?.actorName || notification?.author || "Someone",
    actorAvatar:
      resolveAvatarUrl(notification?.actorAvatar || notification?.avatar) ||
      DEFAULT_AVATAR,
    actorUsername: notification?.actorUsername || "",
    content:
      notification?.content ||
      notification?.caption ||
      "interacted with your account.",
    caption:
      notification?.caption ||
      notification?.content ||
      "There is new activity on your account.",
    timestamp,
    read: Boolean(notification?.read),
    hidden: Boolean(notification?.hidden),
    targetRoute: notification?.targetRoute || "/feed",
    images,
    image,
    metadata: notification?.metadata || null,
  };
};

export function NotificationProvider({ children }) {
  const [sessionType, setSessionType] = useState(() => getSessionType());
  const [notifications, setNotifications] = useState([]);
  const [popupQueue, setPopupQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const knownNotificationIdsRef = useRef(new Set());
  const hasCompletedInitialLoadRef = useRef(false);

  const notificationRequest = useCallback(async (path = "", init = {}) => {
    const nextSessionType = getSessionType();
    if (nextSessionType === "guest") {
      return null;
    }

    const endpoint = `${getEndpointBase(nextSessionType)}${path}`;
    if (nextSessionType === "admin") {
      const token = getAdminAccessToken();
      const headers = { ...(init.headers || {}) };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      if (init.body && !(init.body instanceof FormData)) {
        headers["Content-Type"] = headers["Content-Type"] || "application/json";
      }

      return fetch(`${API_BASE}${endpoint}`, {
        credentials: "include",
        ...init,
        headers,
      });
    }

    return apiFetch(endpoint, init);
  }, []);

  const applyFetchedNotifications = useCallback((entries) => {
    const normalized = Array.isArray(entries)
      ? entries.map(normalizeNotification)
      : [];
    const nextIds = new Set(normalized.map((entry) => entry.id));

    setNotifications(normalized);

    if (!hasCompletedInitialLoadRef.current) {
      knownNotificationIdsRef.current = nextIds;
      hasCompletedInitialLoadRef.current = true;
      setPopupQueue([]);
      return;
    }

    const newUnread = normalized
      .filter(
        (entry) =>
          !entry.read &&
          !entry.hidden &&
          !knownNotificationIdsRef.current.has(entry.id),
      )
      .slice(0, 4);

    knownNotificationIdsRef.current = nextIds;

    if (newUnread.length > 0) {
      setPopupQueue((prev) => {
        const existingIds = new Set(prev.map((entry) => entry.id));
        return [
          ...newUnread.filter((entry) => !existingIds.has(entry.id)),
          ...prev,
        ].slice(0, 4);
      });
    }
  }, []);

  const refreshNotifications = useCallback(
    async ({ silent = false } = {}) => {
      const nextSessionType = getSessionType();
      setSessionType(nextSessionType);

      if (nextSessionType === "guest") {
        knownNotificationIdsRef.current = new Set();
        hasCompletedInitialLoadRef.current = false;
        setNotifications([]);
        setPopupQueue([]);
        setIsLoading(false);
        return;
      }

      if (!silent) {
        setIsLoading(true);
      }

      try {
        const response = await notificationRequest("?limit=100", {
          method: "GET",
        });
        if (!response?.ok) {
          throw new Error("Failed to load notifications.");
        }

        const data = await response.json();
        applyFetchedNotifications(data);
      } catch (error) {
        console.error("Failed to load notifications:", error);
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    },
    [applyFetchedNotifications, notificationRequest],
  );

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  useEffect(() => {
    const handleAuthChange = () => {
      refreshNotifications();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshNotifications({ silent: true });
      }
    };

    window.addEventListener(AUTH_STATE_EVENT, handleAuthChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener(AUTH_STATE_EVENT, handleAuthChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshNotifications]);

  useEffect(() => {
    if (sessionType === "guest") {
      return undefined;
    }

    const interval = window.setInterval(() => {
      refreshNotifications({ silent: true });
    }, 30000);

    return () => window.clearInterval(interval);
  }, [refreshNotifications, sessionType]);

  const mutateNotification = useCallback(
    async ({ path, method, optimisticUpdate }) => {
      if (typeof optimisticUpdate === "function") {
        optimisticUpdate();
      }

      try {
        const response = await notificationRequest(path, { method });
        if (!response?.ok) {
          throw new Error("Notification update failed.");
        }
      } catch (error) {
        console.error("Notification mutation error:", error);
        await refreshNotifications({ silent: true });
      }
    },
    [notificationRequest, refreshNotifications],
  );

  const createNotification = useCallback((notificationInput) => {
    const entry = normalizeNotification({
      ...notificationInput,
      read: false,
      hidden: false,
      timestamp: notificationInput?.timestamp || Date.now(),
    });

    setNotifications((prev) => [entry, ...prev]);
    setPopupQueue((prev) =>
      [entry, ...prev.filter((item) => item.id !== entry.id)].slice(0, 4),
    );
    knownNotificationIdsRef.current = new Set([
      entry.id,
      ...Array.from(knownNotificationIdsRef.current),
    ]);
    return entry;
  }, []);

  const markAsRead = useCallback(
    async (id) => {
      await mutateNotification({
        path: `/${id}/read`,
        method: "PATCH",
        optimisticUpdate: () => {
          setNotifications((prev) =>
            prev.map((notification) =>
              notification.id === id
                ? { ...notification, read: true }
                : notification,
            ),
          );
        },
      });
    },
    [mutateNotification],
  );

  const markAllAsRead = useCallback(async () => {
    await mutateNotification({
      path: "/read-all",
      method: "PATCH",
      optimisticUpdate: () => {
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, read: true })),
        );
        setPopupQueue([]);
      },
    });
  }, [mutateNotification]);

  const hideNotification = useCallback(
    async (id) => {
      await mutateNotification({
        path: `/${id}/hide`,
        method: "PATCH",
        optimisticUpdate: () => {
          setNotifications((prev) =>
            prev.map((notification) =>
              notification.id === id
                ? { ...notification, hidden: true, read: true }
                : notification,
            ),
          );
          setPopupQueue((prev) =>
            prev.filter((notification) => notification.id !== id),
          );
        },
      });
    },
    [mutateNotification],
  );

  const unhideNotification = useCallback(
    async (id) => {
      await mutateNotification({
        path: `/${id}/unhide`,
        method: "PATCH",
        optimisticUpdate: () => {
          setNotifications((prev) =>
            prev.map((notification) =>
              notification.id === id
                ? { ...notification, hidden: false }
                : notification,
            ),
          );
        },
      });
    },
    [mutateNotification],
  );

  const deleteNotification = useCallback(
    async (id) => {
      await mutateNotification({
        path: `/${id}`,
        method: "DELETE",
        optimisticUpdate: () => {
          setNotifications((prev) =>
            prev.filter((notification) => notification.id !== id),
          );
          setPopupQueue((prev) =>
            prev.filter((notification) => notification.id !== id),
          );
        },
      });
    },
    [mutateNotification],
  );

  const dismissPopup = useCallback(
    async (id) => {
      setPopupQueue((prev) =>
        prev.filter((notification) => notification.id !== id),
      );
      await markAsRead(id);
    },
    [markAsRead],
  );

  const visibleNotifications = useMemo(
    () => notifications.filter((notification) => !notification.hidden),
    [notifications],
  );

  const hiddenNotifications = useMemo(
    () => notifications.filter((notification) => notification.hidden),
    [notifications],
  );

  const unreadCount = useMemo(
    () =>
      visibleNotifications.filter((notification) => !notification.read).length,
    [visibleNotifications],
  );

  const value = useMemo(
    () => ({
      sessionType,
      isAdminSession: sessionType === "admin",
      isLoading,
      notifications,
      visibleNotifications,
      hiddenNotifications,
      popupQueue,
      unreadCount,
      hasNotifications: unreadCount > 0,
      createNotification,
      markAsRead,
      markAllAsRead,
      hideNotification,
      unhideNotification,
      deleteNotification,
      dismissPopup,
      refreshNotifications,
    }),
    [
      sessionType,
      isLoading,
      notifications,
      visibleNotifications,
      hiddenNotifications,
      popupQueue,
      unreadCount,
      createNotification,
      markAsRead,
      markAllAsRead,
      hideNotification,
      unhideNotification,
      deleteNotification,
      dismissPopup,
      refreshNotifications,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside <NotificationProvider>",
    );
  }

  return context;
};

export default NotificationContext;
