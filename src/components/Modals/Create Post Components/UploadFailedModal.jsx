import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, RotateCcw, X, AlertTriangle } from "lucide-react";

/**
 * UploadFailedModal
 * Shown when a post upload fails.
 *
 * Props:
 *   isOpen       - bool
 *   onRetry()    - user wants to retry the upload
 *   onCancel()   - user cancels the upload entirely
 */
const UploadFailedModal = ({ isOpen, onRetry, onCancel }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            className="fixed inset-0 z-[99998] bg-black/40 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ scale: 0.88, opacity: 0, y: 30 }}
            animate={{ scale: 1,    opacity: 1, y: 0  }}
            exit={{    scale: 0.88, opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-sm rounded-[2rem] overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.97)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 24px 60px rgba(239,68,68,0.18), 0 4px 20px rgba(0,0,0,0.10)",
                border: "1.5px solid rgba(239,68,68,0.15)",
              }}
            >
              {/* Red gradient header */}
              <div
                className="relative px-6 pt-8 pb-6 text-center overflow-hidden"
                style={{ background: "linear-gradient(160deg, #fff1f1 0%, #ffe4e4 100%)" }}
              >
                {/* Decorative rings */}
                <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-red-100/60 pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-red-50/80 pointer-events-none" />

                {/* Pulsing icon */}
                <div className="relative inline-flex items-center justify-center mb-4">
                  <motion.div
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-16 h-16 rounded-[1.2rem] bg-red-500 flex items-center justify-center shadow-lg shadow-red-200"
                  >
                    <WifiOff size={28} className="text-white" strokeWidth={2} />
                  </motion.div>
                  {/* Small warning pip */}
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-orange-400 border-2 border-white flex items-center justify-center">
                    <AlertTriangle size={11} className="text-white fill-white" />
                  </div>
                </div>

                <h2 className="text-xl font-black text-gray-900 tracking-tight">Upload Failed</h2>
                <p className="text-[13px] text-gray-500 font-medium mt-1 leading-relaxed">
                  Something went wrong while posting your recipe.
                  <br />Don't worry — your content is safe.
                </p>
              </div>

              {/* Reason chip */}
              <div className="mx-6 -mt-3 mb-5">
                <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0 animate-pulse" />
                  <p className="text-[12px] text-red-600 font-semibold">
                    Could not connect to server. Check your internet and try again.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 pb-7 flex flex-col gap-3">
                {/* Retry button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{  scale: 0.97 }}
                  onClick={onRetry}
                  className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-sm text-white uppercase tracking-widest"
                  style={{
                    background: "linear-gradient(135deg, #0060A9 0%, #00B4FA 100%)",
                    boxShadow: "0 6px 20px rgba(0,96,169,0.30)",
                  }}
                >
                  <RotateCcw size={16} strokeWidth={2.5} />
                  Try Again
                </motion.button>

                {/* Cancel button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{  scale: 0.98 }}
                  onClick={onCancel}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-gray-500 border-2 border-gray-100 hover:border-red-200 hover:text-red-500 transition-colors"
                >
                  <X size={15} strokeWidth={2.5} />
                  Cancel Upload
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UploadFailedModal;