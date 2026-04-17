import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const NotificationContext = createContext(null);

const STORAGE_KEY = "gastro_notifications";
const AUTH_STATE_EVENT = "auth-state-changed";
const DEFAULT_STORAGE_OWNER = "guest";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80";

const SEED_NOTIFICATIONS = [
  {
    id: "notif-1",
    type: "like",
    actorName: "Ariana Cruz",
    actorAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80",
    actorUsername: "@arianacruz",
    content: 'liked your recipe "Creamy Garlic Pasta".',
    caption: "Your post is getting attention from pasta lovers.",
    timestamp: Date.now() - 1000 * 60 * 8,
    read: false,
    hidden: false,
    targetRoute: "/feed",
    images: [
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=600&q=80",
    ],
  },
  {
    id: "notif-2",
    type: "comment",
    actorName: "Marco Villanueva",
    actorAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    actorUsername: "@marcov",
    content: 'commented on your post: "This looks restaurant-worthy!"',
    caption: "Tap to view the conversation on your feed.",
    timestamp: Date.now() - 1000 * 60 * 32,
    read: false,
    hidden: false,
    targetRoute: "/feed",
    images: [
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=600&q=80",
    ],
  },
  {
    id: "notif-3",
    type: "reply",
    actorName: "Jamie Flores",
    actorAvatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80",
    actorUsername: "@jamief",
    content:
      'replied to your comment: "I used coconut cream and it worked great!"',
    caption: "Your discussion keeps growing.",
    timestamp: Date.now() - 1000 * 60 * 58,
    read: true,
    hidden: false,
    targetRoute: "/feed",
    images: [],
  },
  {
    id: "notif-4",
    type: "follow",
    actorName: "Sofia Dela Peña",
    actorAvatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
    actorUsername: "@sofiacooks",
    content: "started following you.",
    caption: "You have a new foodie follower.",
    timestamp: Date.now() - 1000 * 60 * 60 * 4,
    read: true,
    hidden: false,
    targetRoute: "/profile",
    images: [],
  },
  {
    id: "notif-5",
    type: "repost",
    actorName: "Nico Tan",
    actorAvatar:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=120&q=80",
    actorUsername: "@nicotan",
    content: 'shared your post "Ultimate Chicken Adobo".',
    caption: "More people can now discover your recipe.",
    timestamp: Date.now() - 1000 * 60 * 60 * 26,
    read: true,
    hidden: false,
    targetRoute: "/feed",
    images: [
      "https://images.unsplash.com/photo-1604908176997-4318406d8598?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&w=600&q=80",
    ],
  },
];

const getStorageOwner = () => {
  try {
    return localStorage.getItem("userId") || DEFAULT_STORAGE_OWNER;
  } catch {
    return DEFAULT_STORAGE_OWNER;
  }
};

const getScopedStorageKey = (owner = getStorageOwner()) =>
  `${STORAGE_KEY}:${owner}`;

const loadNotifications = (owner = getStorageOwner()) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(getScopedStorageKey(owner)));
    if (Array.isArray(parsed)) {
      return parsed.length > 0 ? parsed : SEED_NOTIFICATIONS;
    }

    const legacyParsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
      localStorage.setItem(
        getScopedStorageKey(owner),
        JSON.stringify(legacyParsed),
      );
      localStorage.removeItem(STORAGE_KEY);
      return legacyParsed;
    }

    return SEED_NOTIFICATIONS;
  } catch {
    return SEED_NOTIFICATIONS;
  }
};

const persistNotifications = (owner, notifications) => {
  try {
    localStorage.setItem(
      getScopedStorageKey(owner),
      JSON.stringify(notifications),
    );
  } catch {}
};

const timeAgoFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const getTimeAgo = (timestamp) => {
  const deltaSeconds = Math.round((timestamp - Date.now()) / 1000);
  const units = [
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
  ];

  for (const { unit, seconds } of units) {
    if (Math.abs(deltaSeconds) >= seconds || unit === "minute") {
      return timeAgoFormatter.format(Math.round(deltaSeconds / seconds), unit);
    }
  }

  return "just now";
};

const normalizeNotification = (notification) => {
  const timestamp = Number(notification.timestamp) || Date.now();

  return {
    id:
      notification.id ||
      `notif-${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
    type: notification.type || "like",
    actorName: notification.actorName || notification.author || "Someone",
    actorAvatar:
      notification.actorAvatar || notification.avatar || DEFAULT_AVATAR,
    actorUsername: notification.actorUsername || "",
    content:
      notification.content ||
      notification.caption ||
      "interacted with your post.",
    caption:
      notification.caption ||
      notification.content ||
      "There is new activity on your account.",
    timestamp,
    timeAgo: notification.timeAgo || getTimeAgo(timestamp),
    read: Boolean(notification.read),
    hidden: Boolean(notification.hidden),
    targetRoute: notification.targetRoute || "/feed",
    images:
      Array.isArray(notification.images) && notification.images.length > 0
        ? notification.images
        : notification.image
          ? [notification.image]
          : notification.mediaItems?.map((item) => item?.url).filter(Boolean) ||
            [],
    image: notification.image || notification.images?.[0] || FALLBACK_IMAGE,
    metadata: notification.metadata || null,
  };
};

export function NotificationProvider({ children }) {
  const [storageOwner, setStorageOwner] = useState(() => getStorageOwner());
  const [notifications, setNotifications] = useState(() =>
    loadNotifications().map(normalizeNotification),
  );
  const [popupQueue, setPopupQueue] = useState([]);
  const hydratedRef = useRef(false);

  const hydrateFromStorage = useCallback(() => {
    const nextOwner = getStorageOwner();
    setStorageOwner(nextOwner);
    setNotifications(loadNotifications(nextOwner).map(normalizeNotification));
    setPopupQueue([]);
  }, []);

  useEffect(() => {
    const normalized = notifications.map(normalizeNotification);
    persistNotifications(storageOwner, normalized);
  }, [notifications, storageOwner]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (
        event?.key &&
        event.key !== "userId" &&
        !event.key.startsWith(STORAGE_KEY)
      ) {
        return;
      }

      hydrateFromStorage();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(AUTH_STATE_EVENT, hydrateFromStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(AUTH_STATE_EVENT, hydrateFromStorage);
    };
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      return;
    }

    const unreadVisible = notifications
      .filter((notification) => !notification.read && !notification.hidden)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3);

    setPopupQueue((prev) => {
      const existingIds = new Set(prev.map((item) => item.id));
      const additions = unreadVisible.filter(
        (item) => !existingIds.has(item.id),
      );
      return additions.length > 0 ? [...additions, ...prev].slice(0, 4) : prev;
    });
  }, [notifications]);

  const createNotification = useCallback((notificationInput) => {
    const entry = normalizeNotification({
      ...notificationInput,
      read: false,
      hidden: false,
      timestamp: notificationInput.timestamp || Date.now(),
    });

    setNotifications((prev) => [entry, ...prev]);
    setPopupQueue((prev) =>
      [entry, ...prev.filter((item) => item.id !== entry.id)].slice(0, 4),
    );

    return entry;
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true })),
    );
    setPopupQueue([]);
  }, []);

  const hideNotification = useCallback((id) => {
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
  }, []);

  const unhideNotification = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, hidden: false }
          : notification,
      ),
    );
  }, []);

  const deleteNotification = useCallback((id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
    setPopupQueue((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  }, []);

  const dismissPopup = useCallback((id) => {
    setPopupQueue((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  }, []);

  const seedDemoNotification = useCallback(() => {
    const scenarios = [
      {
        type: "like",
        actorName: "Ella Reyes",
        actorAvatar:
          "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=120&q=80",
        actorUsername: "@ellareyes",
        content: 'liked your recipe "Spicy Tuna Pasta".',
        caption: "Your recipe just got another heart.",
        targetRoute: "/feed",
        images: [
          "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=600&q=80",
        ],
      },
      {
        type: "comment",
        actorName: "Paolo Santos",
        actorAvatar:
          "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=120&q=80",
        actorUsername: "@paolos",
        content: 'commented: "Can you share the full ingredient list?"',
        caption: "Someone wants to cook your recipe too.",
        targetRoute: "/feed",
      },
      {
        type: "reply",
        actorName: "Kim Alvarez",
        actorAvatar:
          "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=120&q=80",
        actorUsername: "@kimalvarez",
        content: "replied to your thread about adobo.",
        caption: "Your conversation has a new reply.",
        targetRoute: "/feed",
      },
      {
        type: "follow",
        actorName: "David Ong",
        actorAvatar:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80",
        actorUsername: "@davidong",
        content: "started following you.",
        caption: "A new foodie joined your community.",
        targetRoute: "/profile",
      },
    ];

    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    return createNotification(scenario);
  }, [createNotification]);

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
      notifications,
      visibleNotifications,
      hiddenNotifications,
      popupQueue,
      unreadCount,
      hasNotifications: unreadCount > 0,
      createNotification,
      seedDemoNotification,
      markAsRead,
      markAllAsRead,
      hideNotification,
      unhideNotification,
      deleteNotification,
      dismissPopup,
    }),
    [
      notifications,
      visibleNotifications,
      hiddenNotifications,
      popupQueue,
      unreadCount,
      createNotification,
      seedDemoNotification,
      markAsRead,
      markAllAsRead,
      hideNotification,
      unhideNotification,
      deleteNotification,
      dismissPopup,
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
