import React, { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "../../Feed/SideBar";
import { Bell } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import NotificationCard from "../Cards/NotificationCard";
import UploadProgressToast from "../Toast/UploadProgressToast";
import UploadFailedModal   from "../Modals/Create Post Components/UploadFailedModal";
import useUpload           from "../../Hooks/UseUpload";

const FILTERS = [
  { key: "all",          label: "All"      },
  { key: "like",         label: "Likes"    },
  { key: "conversation", label: "Comments" },
  { key: "follow",       label: "Follows"  },
  { key: "repost",       label: "Reposts"  },
  { key: "hidden",       label: "Hidden"   },
];

/**
 * LazyItem
 * Renders its children only once the placeholder div scrolls within 200px
 * of the viewport. After that it disconnects the observer — "render once, stay."
 * The minHeight placeholder prevents layout shift / scroll-jump while items
 * below the fold haven't mounted yet.
 */
const LazyItem = ({ children, placeholderHeight = 96 }) => {
  const ref          = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If already visible on first paint (small list / large screen) show immediately
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={!show ? { minHeight: `${placeholderHeight}px` } : undefined}>
      {show ? children : null}
    </div>
  );
};

export default function NotificationsPage() {
  const [isCollapsed, setIsCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );
  const [activeFilter, setActiveFilter] = useState("all");

  // ── Replace this with your real data source (API call, context, props, etc.) ──
  const [notifications, setNotifications] = useState([]);
  // ─────────────────────────────────────────────────────────────────────────────

  const [hiddenIds, setHiddenIds] = useState(new Set());

  const {
    uploadState,
    progress,
    startUpload,
    retryUpload,
    cancelUpload,
    resetUpload,
  } = useUpload();

  const handleNewPost = useCallback(
    (newPost) => startUpload(newPost, () => {}),
    [startUpload]
  );

  useEffect(() => {
    const handler = () =>
      setIsCollapsed(localStorage.getItem("sidebar-collapsed") === "true");
    window.addEventListener("sidebarStateChange", handler);
    return () => window.removeEventListener("sidebarStateChange", handler);
  }, []);

  const handleDelete = useCallback(
    (id) => setNotifications((prev) => prev.filter((n) => n.id !== id)),
    []
  );

  const handleHide = useCallback(
    (id) => setHiddenIds((prev) => new Set([...prev, id])),
    []
  );

  const handleUnhide = useCallback((id) =>
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    }), []
  );

  const visibleNotifications = notifications.filter((n) => !hiddenIds.has(n.id));
  const hiddenNotifications  = notifications.filter((n) =>  hiddenIds.has(n.id));

  const filtered =
    activeFilter === "hidden" ? hiddenNotifications
    : activeFilter === "all"  ? visibleNotifications
    : visibleNotifications.filter((n) => n.type === activeFilter);

  const hiddenCount = hiddenNotifications.length;

  return (
    <div className="flex h-screen w-full bg-[#F8F9FA] overflow-hidden">
      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden lg:block transition-all duration-300 ease-in-out bg-white shadow-xl
          ${isCollapsed ? "w-[80px]" : "w-[288px]"}`}
      >
        <Sidebar onNewPost={handleNewPost} />
      </aside>

      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <Sidebar onNewPost={handleNewPost} />
      </div>

      <main
        className={`flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out
          ${isCollapsed ? "lg:ml-[80px]" : "lg:ml-[288px]"}`}
      >
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 lg:pb-6">

          {/* Header */}
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">
              Notifications
            </h1>
            <div className="flex-1 h-[2px] bg-gradient-to-r from-orange-400/30 to-transparent rounded-full" />
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 pt-1 -mx-1 px-1 scrollbar-hide">
            {FILTERS.map((f) => (
              <div key={f.key} className="relative flex-shrink-0">
                <motion.button
                  onClick={() => setActiveFilter(f.key)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 border-2
                    ${activeFilter === f.key
                      ? "bg-[#0060A9] border-[#0060A9] text-white shadow-sm shadow-blue-200"
                      : "bg-white text-gray-500 border-gray-200 hover:border-orange-300 hover:text-[#F57600]"
                    }`}
                >
                  {f.label}
                </motion.button>

                {f.key === "hidden" && hiddenCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#F57600] text-white text-[9px] font-black flex items-center justify-center pointer-events-none z-10 leading-none">
                    {hiddenCount}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Hidden tab hint */}
          {activeFilter === "hidden" && hiddenCount > 0 && (
            <p className="text-xs text-gray-400 mb-3">
              These notifications are hidden from your main feed. You can unhide them anytime.
            </p>
          )}

          {/* Notification cards — each wrapped in LazyItem */}
          {filtered.length > 0 ? (
            <div className="flex flex-col gap-3 sm:gap-4 w-full">
              <AnimatePresence mode="popLayout">
                {filtered.map((notif, index) => (
                  <LazyItem key={notif.id} placeholderHeight={96}>
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      // Cap stagger at first 6 items so deep-scroll items don't wait
                      transition={{ duration: 0.3, delay: Math.min(index, 5) * 0.05 }}
                    >
                      <NotificationCard
                        notification={notif}
                        isHidden={hiddenIds.has(notif.id)}
                        onDelete={() => handleDelete(notif.id)}
                        onHide={() => handleHide(notif.id)}
                        onUnhide={() => handleUnhide(notif.id)}
                      />
                    </motion.div>
                  </LazyItem>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 sm:py-32 gap-4 sm:gap-5"
            >
              <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-3xl bg-gradient-to-br from-[#F57600] to-[#F0AE35] flex items-center justify-center shadow-lg">
                <Bell size={28} className="text-white sm:hidden" />
                <Bell size={36} className="text-white hidden sm:block" />
              </div>
              <div className="text-center">
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-800 mb-2">
                  {activeFilter === "hidden" ? "No Hidden Notifications" : "No Notifications Yet"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 max-w-xs">
                  {activeFilter === "hidden"
                    ? "Notifications you hide will appear here."
                    : "Likes, comments, and activity alerts will show up here."}
                </p>
              </div>
            </motion.div>
          )}

        </div>
      </main>

      <UploadProgressToast
        uploadState={uploadState === "failed" ? "idle" : uploadState}
        progress={progress}
        onDone={resetUpload}
      />
      <UploadFailedModal
        isOpen={uploadState === "failed"}
        onRetry={retryUpload}
        onCancel={cancelUpload}
      />
    </div>
  );
}