import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Utensils } from "lucide-react";

/**
 * SaveToast
 *
 * Pill-style confirmation toast — same visual language as UploadProgressToast.
 *
 * Timing:
 *   0 ms        → overlay appears + toast slides up showing "Saving…"
 *   700 ms      → toast flips to "Saved!" (overlay stays)
 *   700 + savedDuration ms → overlay AND toast exit together → onDone() fires
 *
 * The overlay and the panel/modal close are fully synchronised:
 * both disappear at the exact same moment.
 *
 * @param {boolean}  visible        - mount/unmount trigger
 * @param {string}   message        - success label  (default "Changes saved")
 * @param {string}   subLabel       - small caps sub (default "Recipe")
 * @param {number}   savedDuration  - ms to show "Saved!" before everything exits (default 2500)
 * @param {Function} onDone         - called when both overlay and toast finish exiting
 */
const SaveToast = ({
  visible,
  message       = "Changes saved",
  subLabel      = "Recipe",
  savedDuration = 2500,
  onDone,
}) => {
  const [show,    setShow]    = useState(false);
  const [success, setSuccess] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    clearTimeout(timerRef.current);

    if (visible) {
      setShow(true);
      setSuccess(false);

      // Step 1 — flip to success after saving phase
      timerRef.current = setTimeout(() => {
        setSuccess(true);

        // Step 2 — hide BOTH overlay and toast at the same time
        timerRef.current = setTimeout(() => {
          setShow(false);    // triggers exit animation on overlay AND toast simultaneously
          setSuccess(false);
          // Give exit animations time to finish (400 ms) then call onDone
          setTimeout(() => onDone?.(), 400);
        }, savedDuration);
      }, 700);
    } else {
      setShow(false);
      setSuccess(false);
    }

    return () => clearTimeout(timerRef.current);
  }, [visible, savedDuration, onDone]);

  // Lock body scroll for the entire duration (saving + saved)
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [show]);

  if (!show) return null;

  return createPortal(
    <>
      {/* ── Overlay — blocks interaction for the full save duration ─────────
          Dims during "Saving…", lightens slightly on "Saved!" so the user
          can see the success state clearly, exits at the same time as toast.
      ─────────────────────────────────────────────────────────────────── */}
      <motion.div
        key="save-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[99998]"
        style={{
          background: success
            ? "rgba(0,0,0,0.15)"   // lighter tint once saved — user can see it worked
            : "rgba(0,0,0,0.35)",  // stronger block during active save
          backdropFilter: success ? "blur(1px)" : "blur(2px)",
          pointerEvents: "all",
          cursor: success ? "default" : "wait",
          transition: "background 0.4s ease, backdrop-filter 0.4s ease",
        }}
      />

      {/* ── Toast pill ────────────────────────────────────────────────────── */}
      <motion.div
        key="save-toast"
        initial={{ y: 80, opacity: 0, scale: 0.9, x: "-50%" }}
        animate={{ y: 0,  opacity: 1, scale: 1,   x: "-50%" }}
        exit={{   y: 50,  opacity: 0, scale: 0.95, x: "-50%" }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className="fixed bottom-8 left-1/2 z-[99999] select-none"
        style={{ width: "280px" }}
      >
        {/* Gradient border pill */}
        <div
          className="relative rounded-full p-[1.5px] overflow-hidden"
          style={{
            background: success
              ? "linear-gradient(135deg, #22c55e, #86efac)"
              : "linear-gradient(135deg, #0060A9, #F57600)",
            boxShadow: success
              ? "0 12px 24px -8px rgba(34,197,94,0.3)"
              : "0 12px 24px -8px rgba(0,96,169,0.2)",
            transition: "background 0.4s ease, box-shadow 0.4s ease",
          }}
        >
          {/* Glass inner */}
          <div className="bg-white/95 backdrop-blur-md rounded-full overflow-hidden relative">
            <div className="flex items-center gap-3 px-4 py-2 relative z-10">

              {/* Icon */}
              <div className="relative flex-shrink-0 w-9 h-9 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {success ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 22 }}
                      className="bg-green-500 rounded-full p-1.5"
                    >
                      <CheckCircle2 size={14} className="text-white" strokeWidth={3} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="saving-ring"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <svg width="36" height="36" className="-rotate-90">
                        <circle
                          cx="18" cy="18" r="14"
                          fill="none"
                          stroke="rgba(0,0,0,0.05)"
                          strokeWidth="3"
                        />
                        <motion.circle
                          cx="18" cy="18" r="14"
                          fill="none"
                          stroke="url(#saveGradient)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 14}
                          animate={{ strokeDashoffset: [2 * Math.PI * 14 * 0.75, 0] }}
                          transition={{ duration: 0.7, ease: "easeInOut" }}
                        />
                        <defs>
                          <linearGradient id="saveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%"   stopColor="#0060A9" />
                            <stop offset="100%" stopColor="#F57600" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  {success ? (
                    <motion.div
                      key="saved-text"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <span className="font-black text-gray-900 text-[13px] tracking-tight">
                        {message}
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="saving-text"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <p className="font-black text-gray-900 text-[13px] tracking-tight leading-none">
                        Saving…
                      </p>
                      <p className="text-[10px] font-bold text-[#0060A9]/50 mt-0.5 uppercase tracking-wider">
                        {subLabel}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Badge */}
              <div className="flex-shrink-0">
                <AnimatePresence mode="wait">
                  {success ? (
                    <motion.div
                      key="badge-done"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1,   opacity: 1 }}
                      className="bg-green-500 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-sm"
                    >
                      SAVED
                    </motion.div>
                  ) : (
                    <motion.div
                      key="badge-saving"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1,   opacity: 1 }}
                      className="bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-lg"
                    >
                      <span className="text-[12px] font-black text-[#0060A9]">···</span>
                    </motion.div>
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
    </>,
    document.body
  );
};

export default SaveToast;