import { useEffect } from "react";
import { CheckCircle } from "lucide-react";

/**
 * ReportToast
 * Slides up from the bottom, auto-dismisses after 3 s.
 *
 * @param {boolean}  visible
 * @param {Function} onDone   - called when the toast finishes
 */
const ReportToast = ({ visible, onDone }) => {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [visible, onDone]);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes toastSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0);    }
        }
      `}</style>
      <div
        className="fixed bottom-6 left-1/2 z-[99999] flex items-center gap-2.5 bg-gray-900 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl pointer-events-none"
        style={{
          transform: "translateX(-50%)",
          animation: "toastSlideUp 0.25s ease both",
        }}
      >
        <CheckCircle size={16} className="text-green-400 shrink-0" />
        Report sent. Thanks for letting us know.
      </div>
    </>
  );
};

export default ReportToast;