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
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-[99994] bg-black/40"
            onClick={() => onDismiss?.()}
          />

          {/* Modal */}
          <div className="pointer-events-none fixed inset-0 z-[99995] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="pointer-events-auto w-[calc(100vw-2rem)] max-w-md overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-[0_20px_60px_-20px_rgba(245,118,0,0.6)]"
            >
              <div className="flex flex-col items-center gap-4 p-6 text-center sm:p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-[#F57600]">
                  <AlertTriangle size={24} />
                </div>

                <div className="space-y-2">
                  <p className="text-lg font-bold text-gray-900">{title}</p>
                  <p className="text-sm leading-6 text-gray-600">
                    {message}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onDismiss?.()}
                  className="mt-2 rounded-lg bg-[#F57600] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 active:bg-orange-700"
                  aria-label="Acknowledge review notice"
                >
                  I understand
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
