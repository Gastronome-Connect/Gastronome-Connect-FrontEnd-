import React, { useState, useEffect, useRef, useMemo } from "react";
import Sidebar from "../../Feed/SideBar";
import { Bell } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { HiChevronDown } from "react-icons/hi";
import NotificationCard from "../Cards/NotificationCard";
import UploadProgressToast from "../Toast/UploadProgressToast";
import UploadFailedModal from "../Modals/Create Post Components/UploadFailedModal";
import useUpload from "../../Hooks/UseUpload";
import useModeratedPostCreation from "../../Hooks/useModeratedPostCreation";
import PostUnderReviewPopup from "../Popups/PostUnderReviewPopup";
import { SkeletonNotificationCard } from "../Skeletons";
import { useNotifications } from "../../Context/NotificationContext";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "like", label: "Likes" },
  { key: "comment", label: "Comments" },
  { key: "reply", label: "Replies" },
  { key: "follow", label: "Follows" },
  { key: "repost", label: "Reposts" },
  { key: "hidden", label: "Hidden" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Recent" },
  { value: "oldest", label: "Oldest" },
];

const LazyItem = ({ children, placeholderHeight = 96 }) => {
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
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
  const [sortBy, setSortBy] = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sortRef = useRef(null);

  const { uploadState, progress, startUpload, retryUpload, cancelUpload, resetUpload } = useUpload();
  const { handleNewPost, reviewPopupProps } = useModeratedPostCreation({ startUpload });

  const {
    visibleNotifications,
    hiddenNotifications,
    unreadCount,
    hasNotifications,
    markAllAsRead,
    markAsRead,
    hideNotification,
    unhideNotification,
    deleteNotification,
  } = useNotifications();

  useEffect(() => {
    const handler = () => setIsCollapsed(localStorage.getItem("sidebar-collapsed") === "true");
    window.addEventListener("sidebarStateChange", handler);
    return () => window.removeEventListener("sidebarStateChange", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 550);
    return () => clearTimeout(timer);
  }, []);

  const baseList = useMemo(() => {
    if (activeFilter === "hidden") return hiddenNotifications;
    if (activeFilter === "all") return visibleNotifications;
    return visibleNotifications.filter((notification) => notification.type === activeFilter);
  }, [activeFilter, hiddenNotifications, visibleNotifications]);

  const sorted = useMemo(() => {
    return [...baseList].sort((a, b) => {
      const tA = new Date(a.timestamp ?? 0).getTime();
      const tB = new Date(b.timestamp ?? 0).getTime();
      return sortBy === "newest" ? tB - tA : tA - tB;
    });
  }, [baseList, sortBy]);

  const hiddenCount = hiddenNotifications.length;

  return (
    <div className="flex h-screen w-full bg-[#F8F9FA] overflow-hidden">
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden lg:block transition-all duration-300 ease-in-out bg-white shadow-xl ${
          isCollapsed ? "w-[80px]" : "w-[288px]"
        }`}
      >
        <Sidebar onNewPost={handleNewPost} hasNotifications={hasNotifications} />
      </aside>
      <div className="lg:hidden">
        <Sidebar onNewPost={handleNewPost} hasNotifications={hasNotifications} />
      </div>

      <main
        className={`flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:ml-[80px]" : "lg:ml-[288px]"
        }`}
      >
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 lg:pb-6">
          <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">Notifications</h1>
              <div className="flex-1 h-[2px] bg-gradient-to-r from-orange-400/30 to-transparent rounded-full" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                <span className="font-semibold text-gray-700">{visibleNotifications.length}</span>
                <span>visible notifications</span>
                {unreadCount > 0 && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="font-semibold text-[#F57600]">{unreadCount} unread</span>
                  </>
                )}
              </div>

              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className={`self-start sm:self-auto px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border ${
                  unreadCount > 0
                    ? "bg-white border-orange-200 text-[#F57600] hover:bg-orange-50 hover:border-orange-300"
                    : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Mark all as read
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 flex-1 overflow-x-auto pb-2 pt-1 -mx-1 px-1 scrollbar-hide">
              {FILTERS.map((f) => (
                <div key={f.key} className="relative flex-shrink-0">
                  <motion.button
                    onClick={() => setActiveFilter(f.key)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 border-2 ${
                      activeFilter === f.key
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

            <div className="relative flex-shrink-0 pb-2 pt-1" ref={sortRef}>
              <button
                onClick={() => setSortOpen((o) => !o)}
                className={`flex items-center gap-2 bg-white border rounded-xl pl-3 sm:pl-4 pr-2 sm:pr-3 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-gray-700 shadow-sm transition-all w-32 sm:w-40 justify-between ${
                  sortOpen
                    ? "border-[#F57600] ring-2 sm:ring-4 ring-orange-100 text-[#F57600]"
                    : "border-gray-200 hover:border-orange-300"
                }`}
              >
                <span>{SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Sort"}</span>
                <HiChevronDown
                  size={14}
                  className={`transition-transform duration-200 text-[#F57600] ${sortOpen ? "rotate-180" : ""}`}
                />
              </button>
              {sortOpen && (
                <div className="absolute right-0 mt-1.5 w-32 sm:w-40 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSortBy(opt.value);
                        setSortOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-colors ${
                        sortBy === opt.value
                          ? "bg-orange-50 text-[#F57600]"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {sortBy === opt.value && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#F57600]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {activeFilter === "hidden" && hiddenCount > 0 && (
            <p className="text-xs text-gray-400 mb-3">
              These notifications are hidden from your main feed. You can unhide them anytime.
            </p>
          )}

          {isLoading && (
            <div className="flex flex-col gap-3 sm:gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonNotificationCard key={i} />
              ))}
            </div>
          )}

          {!isLoading && sorted.length > 0 && (
            <div className="flex flex-col gap-3 sm:gap-4 w-full">
              <AnimatePresence mode="popLayout">
                {sorted.map((notif, index) => (
                  <LazyItem key={notif.id} placeholderHeight={96}>
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: Math.min(index, 5) * 0.05 }}
                    >
                      <NotificationCard
                        notification={notif}
                        isHidden={notif.hidden}
                        onClick={() => markAsRead(notif.id)}
                        onDelete={() => deleteNotification(notif.id)}
                        onHide={() => hideNotification(notif.id)}
                        onUnhide={() => unhideNotification(notif.id)}
                      />
                    </motion.div>
                  </LazyItem>
                ))}
              </AnimatePresence>
            </div>
          )}

          {!isLoading && sorted.length === 0 && (
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
                    : "Likes, comments, replies, and activity alerts will show up here."}
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
      <PostUnderReviewPopup {...reviewPopupProps} />
      <UploadFailedModal isOpen={uploadState === "failed"} onRetry={retryUpload} onCancel={cancelUpload} />
    </div>
  );
}