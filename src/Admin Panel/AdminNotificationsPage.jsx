import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import NotificationCard from "../components/Cards/NotificationCard";
import { SkeletonNotificationCard } from "../components/Skeletons";
import { useNotifications } from "../Context/NotificationContext";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "report_submitted", label: "New Reports" },
  { key: "hidden", label: "Hidden" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Recent" },
  { value: "oldest", label: "Oldest" },
];

export default function AdminNotificationsPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const {
    isLoading,
    visibleNotifications,
    hiddenNotifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
    hideNotification,
    unhideNotification,
    deleteNotification,
  } = useNotifications();

  const baseList = useMemo(() => {
    if (activeFilter === "hidden") {
      return hiddenNotifications;
    }

    if (activeFilter === "all") {
      return visibleNotifications;
    }

    return visibleNotifications.filter(
      (notification) => notification.type === activeFilter,
    );
  }, [activeFilter, hiddenNotifications, visibleNotifications]);

  const sorted = useMemo(() => {
    return [...baseList].sort((left, right) => {
      const leftTime = Number(left.timestamp || 0);
      const rightTime = Number(right.timestamp || 0);
      return sortBy === "newest" ? rightTime - leftTime : leftTime - rightTime;
    });
  }, [baseList, sortBy]);

  return (
    <div className="min-h-screen bg-[#FDFCF9] px-8 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              Admin Notifications
            </h1>
            <p className="mt-2 text-sm font-medium text-gray-500">
              New report submissions sent to admins appear here.
            </p>
          </div>

          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className={`rounded-2xl border px-4 py-2 text-sm font-bold transition-all ${
              unreadCount > 0
                ? "border-blue-200 bg-white text-[#0060A9] hover:border-blue-300 hover:bg-blue-50"
                : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
            }`}
          >
            Mark all as read
          </button>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wider transition-all ${
                activeFilter === filter.key
                  ? "border-[#0060A9] bg-[#0060A9] text-white"
                  : "border-gray-200 bg-white text-gray-500 hover:border-blue-300 hover:text-[#0060A9]"
              }`}
            >
              {filter.label}
            </button>
          ))}

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="ml-auto rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {isLoading && (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonNotificationCard key={index} />
            ))}
          </div>
        )}

        {!isLoading && sorted.length > 0 && (
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {sorted.map((notification) => (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <NotificationCard
                    notification={notification}
                    isHidden={notification.hidden}
                    onClick={() => markAsRead(notification.id)}
                    onDelete={() => deleteNotification(notification.id)}
                    onHide={() => hideNotification(notification.id)}
                    onUnhide={() => unhideNotification(notification.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!isLoading && sorted.length === 0 && (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-[2rem] border border-dashed border-gray-200 bg-white">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#0060A9] to-[#00B4FA] shadow-lg">
              <Bell size={28} className="text-white" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-black text-gray-900">
                No Admin Notifications
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                New report submissions will appear here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
