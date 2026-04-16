/**
 * MoreOptionsModal.jsx  (was: ReportModal used by CommentItem / MoreMenu)
 *
 * Changes vs original:
 *  - On submit, calls ReportStore.addCommentReport so the admin dashboard
 *    can display the report immediately (no backend needed yet).
 *  - Accepts `comment` + `postTitle` props so the store has full context.
 *    Falls back gracefully when they are not supplied.
 */
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X, Flag, Send } from "lucide-react";
import { addCommentReport } from "../../Store/ReportStore";  // ← adjust path to match your project

// ─── Report reasons ────────────────────────────────────────────────────────────
const REPORT_REASONS = [
  { id: "spam",       label: "Spam or misleading"            },
  { id: "harassment", label: "Harassment or bullying"        },
  { id: "hate",       label: "Hate speech"                   },
  { id: "violence",   label: "Violence or dangerous content" },
  { id: "false",      label: "False information"             },
  { id: "nudity",     label: "Nudity or sexual content"      },
  { id: "other",      label: "Others"                        },
];

/**
 * Props:
 *   open       boolean
 *   onClose    () => void
 *   onSubmit   (reasonId, detail?) => void   ← still called for local UI feedback
 *   subject    string   e.g. "this comment"
 *   comment    object   { id, author, text, type }   ← NEW (for store)
 *   postTitle  string                                 ← NEW (for store)
 */
const MoreOptionsModal = ({
  open,
  onClose,
  onSubmit,
  subject   = "this",
  comment   = null,
  postTitle = "Untitled post",
}) => {
  const [step,   setStep]   = useState("reasons");
  const [picked, setPicked] = useState(null);
  const [detail, setDetail] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (open) { setStep("reasons"); setPicked(null); setDetail(""); }
  }, [open]);

  useEffect(() => {
    if (step === "detail" && textareaRef.current) textareaRef.current.focus();
  }, [step]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [detail]);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  const submit = (reasonId, detailText = null) => {
    // Save to store so admin dashboard picks it up
    if (comment) {
      addCommentReport(comment, postTitle, reasonId, detailText);
    }
    onSubmit?.(reasonId, detailText);
    onClose();
  };

  const handlePickReason = (id) => {
    setPicked(id);
    if (id === "other") { setStep("detail"); }
    else { submit(id); }
  };

  const detailFilled = detail.trim().length > 0;

  const handleSubmitDetail = () => {
    if (!detailFilled) return;
    submit(picked, detail.trim());
  };

  const reasonLabel = REPORT_REASONS.find((r) => r.id === picked)?.label ?? "";

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "modalUp 0.22s cubic-bezier(.32,1,.46,1) both" }}
      >
        <style>{`
          @keyframes modalUp {
            from { opacity: 0; transform: translateY(24px) scale(0.98); }
            to   { opacity: 1; transform: none; }
          }
        `}</style>

        {/* ── Step 1: reason list ── */}
        {step === "reasons" && (
          <>
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-800 font-bold text-base">
                <Flag size={16} className="text-[#F57600]" />
                Why are you reporting {subject}?
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="py-1">
              {REPORT_REASONS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => handlePickReason(id)}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-[#F57600] transition-colors text-left"
                >
                  {label}
                  <ChevronRight size={15} className="text-gray-300 shrink-0" />
                </button>
              ))}
            </div>

            <div className="px-5 pb-5 pt-2">
              <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                Your report is anonymous. We'll review it and take action if it violates our community guidelines.
              </p>
            </div>
          </>
        )}

        {/* ── Step 2: free-text for "Others" ── */}
        {step === "detail" && (
          <>
            <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-gray-100">
              <button onClick={() => setStep("reasons")} className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors -ml-1">
                <ChevronLeft size={17} />
              </button>
              <span className="font-bold text-base text-gray-800 flex-1">Tell us more</span>
              <button onClick={onClose} className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="px-5 pt-4 pb-2">
              <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                You selected <span className="font-bold text-gray-700">"{reasonLabel}"</span>. Please describe the issue.
              </p>

              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmitDetail(); }}
                  placeholder="Describe the issue..."
                  rows={4}
                  maxLength={500}
                  className={`w-full text-sm text-gray-700 placeholder-gray-400 border rounded-2xl px-4 py-3 focus:outline-none resize-none transition-colors leading-relaxed ${
                    detailFilled ? "border-[#F57600] focus:border-[#F57600]" : "border-gray-200 focus:border-gray-400"
                  }`}
                  style={{ minHeight: "100px", maxHeight: "180px" }}
                />
                <span className="absolute bottom-3 right-4 text-[10px] text-gray-300 pointer-events-none">{detail.length}/500</span>
              </div>

              {!detailFilled && (
                <p className="text-[11px] text-red-400 font-semibold mt-1.5 ml-1">
                  A description is required to submit this report.
                </p>
              )}
            </div>

            <div className="px-5 pb-5 pt-3 flex gap-2">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSubmitDetail}
                disabled={!detailFilled}
                className={`flex-1 py-2.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  detailFilled ? "bg-[#F57600] hover:bg-orange-600 text-white" : "bg-gray-100 text-gray-300 cursor-not-allowed"
                }`}
              >
                <Send size={13} /> Submit Report
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default MoreOptionsModal;