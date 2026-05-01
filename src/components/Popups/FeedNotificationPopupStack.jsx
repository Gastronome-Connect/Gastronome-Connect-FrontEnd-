import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Heart,
  HeartCrack,
  MessageCircle,
  Repeat2,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const TYPE_ICON_MAP = {
  like: Heart,
  dislike: HeartCrack,
  comment: MessageCircle,
  reply: MessageCircle,
  follow: UserPlus,
  repost: Repeat2,
  report_status: ShieldCheck,
  report_submitted: ShieldAlert,
};

const TYPE_COLOR_MAP = {
  like: "text-rose-500 bg-rose-50",
  dislike: "text-red-500 bg-red-50",
  comment: "text-blue-500 bg-blue-50",
  reply: "text-sky-500 bg-sky-50",
  follow: "text-emerald-500 bg-emerald-50",
  repost: "text-orange-500 bg-orange-50",
  report_status: "text-indigo-500 bg-indigo-50",
  report_submitted: "text-violet-500 bg-violet-50",
};

function FeedNotificationPopup({ notification, onDismiss }) {
  const navigate = useNavigate();
  const Icon = TYPE_ICON_MAP[notification.type] || Bell;
  const iconClass =
    TYPE_COLOR_MAP[notification.type] || "text-[#0060A9] bg-blue-50";

  const handleNavigate = () => {
    if (notification.targetRoute) {
      navigate(notification.targetRoute);
    }
    onDismiss(notification.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 32, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 32, scale: 0.96 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="pointer-events-auto w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl border border-white/70 bg-white/95 shadow-[0_12px_40px_-16px_rgba(0,96,169,0.35)] backdrop-blur-xl"
    >
      <div className="flex gap-3 p-3">
        <button
          onClick={handleNavigate}
          className="flex flex-1 items-start gap-3 text-left"
        >
          <img
            src={notification.actorAvatar}
            alt={notification.actorName}
            className="h-11 w-11 flex-shrink-0 rounded-full object-cover ring-2 ring-white"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gray-900">
                  {notification.actorName}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">
                  {notification.content}
                </p>
              </div>

              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${iconClass}`}
              >
                <Icon size={15} />
              </div>
            </div>

            {notification.caption && (
              <p className="mt-1 line-clamp-2 text-[11px] text-gray-400">
                {notification.caption}
              </p>
            )}

            <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-[#0060A9]/70">
              {notification.timeAgo || "Just now"}
            </p>
          </div>
        </button>

        <button
          onClick={() => onDismiss(notification.id)}
          className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
}

export default function FeedNotificationPopupStack({
  notifications = [],
  onDismiss,
  autoDismissDelay = 4500,
}) {
  useEffect(() => {
    if (!notifications.length) return undefined;

    const timers = notifications.map((notification, index) =>
      window.setTimeout(
        () => {
          onDismiss(notification.id);
        },
        autoDismissDelay + index * 500,
      ),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [notifications, onDismiss, autoDismissDelay]);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[90] flex max-h-[calc(100vh-2rem)] w-fit flex-col gap-3 sm:right-6 sm:top-6">
      <AnimatePresence initial={false}>
        {notifications.map((notification) => (
          <FeedNotificationPopup
            key={notification.id}
            notification={notification}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
