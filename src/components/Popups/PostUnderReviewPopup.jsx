import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

export default function PostUnderReviewPopup({
  isOpen,
  onDismiss,
  title = "Post under review",
  message = "Your post is under review because it does not appear to be food related.",
  autoDismissDelay = 4500,
}) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      onDismiss?.();
    }, autoDismissDelay);

    return () => window.clearTimeout(timer);
  }, [isOpen, onDismiss, autoDismissDelay]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.97 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="pointer-events-none fixed right-4 top-4 z-[99995] sm:right-6 sm:top-6"
        >
          <div className="pointer-events-auto w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-[0_16px_48px_-20px_rgba(245,118,0,0.4)]">
            <div className="flex items-start gap-3 p-4">
              <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-[#F57600]">
                <AlertTriangle size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900">{title}</p>
                <p className="mt-1 text-xs leading-5 text-gray-600">{message}</p>
              </div>

              <button
                type="button"
                onClick={() => onDismiss?.()}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="Dismiss review notice"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
