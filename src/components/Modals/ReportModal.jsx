/**
 * ReportModal.jsx  (used by PostCard for reporting posts)
 *
 * Changes vs original:
 *  - On submit, calls ReportStore.addPostReport so the admin dashboard
 *    can display it immediately (no backend needed yet).
 *  - Accepts `post` prop so the store has the full post object.
 */
import { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { FaFlag } from "react-icons/fa";
import { addPostReport } from "../../Store/ReportStore";  // ← adjust path to match your project

const REPORT_REASONS = [
  { id: "spam",          label: "Spam or Misleading",       description: "Repetitive or unsolicited content" },
  { id: "harassment",    label: "Harassment or Bullying",   description: "Targeted abuse toward a person" },
  { id: "hate",          label: "Hate Speech",              description: "Content promoting hatred or discrimination" },
  { id: "violence",      label: "Violence or Dangerous Content", description: "Graphic violence or harmful acts" },
  { id: "false",         label: "False Information",        description: "Misleading or factually incorrect content" },
  { id: "nudity",        label: "Nudity or Sexual Content", description: "Explicit or adult material" },
  { id: "other",         label: "Others",                   description: "Something else not listed here" },
];

/**
 * Props:
 *   onConfirm  (reasonId) => void
 *   onCancel   () => void
 *   post       object   ← NEW: the full post object (for the store)
 */
const ReportModal = ({ onConfirm, onCancel, post = null }) => {
  const [selected,  setSelected]  = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!selected) return;

    // Save to store so admin dashboard picks it up
    if (post) {
      addPostReport(post, selected);
    }

    setSubmitted(true);
    setTimeout(() => {
      onConfirm?.(selected);
    }, 1500);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
            <FaFlag size={14} className="text-red-500" />
          </div>
          <div>
            <p className="font-extrabold text-gray-900 text-sm">Report Post</p>
            <p className="text-xs text-gray-400">Help us understand what's wrong</p>
          </div>
          <button
            onClick={onCancel}
            className="absolute right-5 p-1 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X size={16} strokeWidth={3} />
          </button>
        </div>

        {/* Body */}
        {submitted ? (
          <div className="p-8 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <p className="font-extrabold text-gray-900">Report Submitted</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Thanks for letting us know. We'll review this post and take action if it violates our guidelines.
            </p>
          </div>
        ) : (
          <>
            <div className="p-4 flex flex-col gap-2">
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => setSelected(reason.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3 rounded-2xl border-2 text-left transition-all ${
                    selected === reason.id
                      ? "border-red-400 bg-red-50"
                      : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {/* Radio indicator */}
                  <span
                    className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                      selected === reason.id ? "border-red-400 bg-red-400" : "border-gray-300"
                    }`}
                  >
                    {selected === reason.id && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                  </span>
                  <div>
                    <p className={`text-sm font-bold leading-tight ${selected === reason.id ? "text-red-600" : "text-gray-800"}`}>
                      {reason.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{reason.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 pb-4 flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selected}
                className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all ${
                  selected ? "bg-red-500 hover:bg-red-600 text-white shadow" : "bg-gray-100 text-gray-300 cursor-not-allowed"
                }`}
              >
                Submit Report
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ReportModal;