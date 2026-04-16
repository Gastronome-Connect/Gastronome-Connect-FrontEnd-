import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, Utensils } from "lucide-react";

/**
 * Compact UploadProgressToast
 * A refined, "pill-style" notification.
 */
const UploadProgressToast = ({ uploadState = "idle", progress = 0, onDone }) => {
  const [visible, setVisible] = useState(false);
  const doneTimer = useRef(null);

  useEffect(() => {
    if (uploadState === "uploading") {
      setVisible(true);
      clearTimeout(doneTimer.current);
    }
    if (uploadState === "success") {
      doneTimer.current = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onDone?.(), 500);
      }, 2500);
    }
    if (uploadState === "idle") {
      setVisible(false);
    }
    return () => clearTimeout(doneTimer.current);
  }, [uploadState, onDone]);

  const isSuccess = uploadState === "success";
  const clampedPct = Math.min(100, Math.max(0, progress));

  // Compact Ring Math
  const R = 14; 
  const CIRCUMFERENCE = 2 * Math.PI * R;
  const dashOffset = CIRCUMFERENCE - (clampedPct / 100) * CIRCUMFERENCE;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="toast"
          initial={{ y: 80, opacity: 0, scale: 0.9, x: "-50%" }}
          animate={{ y: 0, opacity: 1, scale: 1, x: "-50%" }}
          exit={{ y: 50, opacity: 0, scale: 0.95, x: "-50%" }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
          className="fixed bottom-8 left-1/2 z-[99999] select-none"
          style={{ width: "280px" }} // Slightly more narrow
        >
          {/* Main Card with thinner gradient border */}
          <div
            className="relative rounded-full p-[1.5px] overflow-hidden"
            style={{
              background: isSuccess 
                ? "linear-gradient(135deg, #22c55e, #86efac)" 
                : "linear-gradient(135deg, #0060A9, #F57600)",
              boxShadow: isSuccess
                ? "0 12px 24px -8px rgba(34,197,94,0.3)"
                : "0 12px 24px -8px rgba(0,96,169,0.2)",
            }}
          >
            {/* Inner Glass Layer */}
            <div className="bg-white/95 backdrop-blur-md rounded-full overflow-hidden relative">
              
              {/* Content Row */}
              <div className="flex items-center gap-3 px-4 py-2 relative z-10">
                
                {/* Compact Progress Ring */}
                <div className="relative flex-shrink-0 w-9 h-9">
                  <svg width="36" height="36" className="absolute inset-0 -rotate-90">
                    <circle
                      cx="18" cy="18" r={R}
                      fill="none"
                      stroke="rgba(0,0,0,0.05)"
                      strokeWidth="3"
                    />
                    <motion.circle
                      cx="18" cy="18" r={R}
                      fill="none"
                      stroke={isSuccess ? "#22c55e" : "url(#miniGradient)"}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={CIRCUMFERENCE}
                      animate={{ strokeDashoffset: dashOffset }}
                      transition={{ type: "spring", bounce: 0, duration: 0.6 }}
                    />
                    <defs>
                      <linearGradient id="miniGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0060A9" />
                        <stop offset="100%" stopColor="#F57600" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Icon Toggle */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      {isSuccess ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-green-500 rounded-full p-0.5"
                        >
                          <CheckCircle2 size={10} className="text-white" strokeWidth={4} />
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="loader" 
                          animate={{ rotate: 360 }} 
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        >
                          <Loader2 size={12} className="text-[#0060A9]" strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <AnimatePresence mode="wait">
                    {isSuccess ? (
                      <motion.div
                        key="s"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <span className="font-black text-gray-900 text-[13px] tracking-tight">
                          Posted!
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="u"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <p className="font-black text-gray-900 text-[13px] tracking-tight leading-none">
                          Uploading...
                        </p>
                        <p className="text-[10px] font-bold text-[#0060A9]/50 mt-0.5 uppercase tracking-wider">
                          Recipe
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Progress Badge */}
                <div className="flex-shrink-0">
                  <AnimatePresence mode="wait">
                    {isSuccess ? (
                      <motion.div
                        key="badge-done"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-green-500 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-sm"
                      >
                        DONE
                      </motion.div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-lg">
                        <span className="text-[12px] font-black text-[#0060A9]">
                          {clampedPct}%
                        </span>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Faint watermark */}
              <div className="absolute right-3 -bottom-2 text-gray-200 pointer-events-none rotate-12 opacity-40">
                <Utensils size={32} strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UploadProgressToast;