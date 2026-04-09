import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Undo2, X, BellRing } from "lucide-react";

/**
 * UndoToast - Gastronome Connect Edition
 * Palette: 60% White Glass, 30% Blue [#0060A9], 10% Orange [#F57600]
 */
const DURATION = 5000;

export default function UndoToast({
  visible,
  message = "Action performed",
  onUndo,
  onDismiss,
  duration = DURATION,
}) {
  const [progress, setProgress] = useState(100);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const dismissedRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      cancelAnimationFrame(rafRef.current);
      setProgress(100);
      dismissedRef.current = false;
      return;
    }

    dismissedRef.current = false;
    startRef.current = performance.now();
    setProgress(100);

    const tick = (now) => {
      const elapsed = now - startRef.current;
      const remaining = Math.max(0, 1 - elapsed / duration);
      setProgress(remaining * 100);

      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        if (!dismissedRef.current) {
          dismissedRef.current = true;
          onDismiss?.();
        }
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [visible, duration, onDismiss]);

  const handleUndo = () => {
    dismissedRef.current = true;
    cancelAnimationFrame(rafRef.current);
    onUndo?.();
  };

  const handleClose = () => {
    dismissedRef.current = true;
    cancelAnimationFrame(rafRef.current);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="undo-toast"
          initial={{ y: 100, opacity: 0, scale: 0.9, x: "-50%" }}
          animate={{ y: 0, opacity: 1, scale: 1, x: "-50%" }}
          exit={{ y: 100, opacity: 0, scale: 0.9, x: "-50%" }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="fixed bottom-10 lg:bottom-8 left-1/2 z-[200] w-[calc(100vw-40px)] max-w-sm pointer-events-auto"
        >
          {/* Main Glass Container */}
          <div 
            className="relative overflow-hidden rounded-[24px] border border-white/40 bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
          >
            {/* Progress Bar (The 10% Orange) */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-100/50">
              <motion.div
                className="h-full origin-left"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #F57600, #F0AE35)",
                }}
              />
            </div>

            <div className="flex items-center gap-4 px-5 py-4">
              {/* Animated Icon Box */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-2xl bg-[#0060A9]/10 flex items-center justify-center">
                  <BellRing size={18} className="text-[#0060A9]" />
                </div>
                {/* Subtle pulse ring */}
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 rounded-2xl border-2 border-[#0060A9]/20"
                />
              </div>

              {/* Message Content */}
              <div className="flex-1">
                <p className="text-[#0060A9] text-[13px] font-black uppercase tracking-tight leading-none mb-1">
                  System Alert
                </p>
                <p className="text-gray-600 text-[13px] font-medium leading-tight">
                  {message}
                </p>
              </div>

              {/* Undo Button (The 30% Blue) */}
              <button
                onClick={handleUndo}
                className="group relative flex-shrink-0 px-5 py-2.5 rounded-xl transition-all active:scale-90"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#0060A9] to-[#00B4FA] rounded-xl shadow-[0_4px_15px_rgba(0,96,169,0.3)] group-hover:shadow-[0_6px_20px_rgba(0,96,169,0.4)] transition-all" />
                <div className="relative flex items-center gap-2 text-white text-[11px] font-black uppercase tracking-widest">
                  <Undo2 size={14} strokeWidth={3} />
                  Undo
                </div>
              </button>

              {/* Minimal Close Button */}
              <button
                onClick={handleClose}
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}