import { createPortal } from "react-dom";
import { ShieldAlert } from "lucide-react";

const CATEGORY_LABELS = {
  hate_speech: "Hate Speech",
  harassment: "Harassment",
  threats_or_violence: "Threats or Violence",
  explicit_sexual_content: "Explicit Sexual Content",
  self_harm: "Self-Harm Content",
  spam_or_scam: "Spam or Scam",
  dangerous_misinformation: "Dangerous Misinformation",
  personal_information_exposure: "Personal Information Exposure",
};

/**
 * Shown when the server rejects content (HTTP 422) due to a community
 * guidelines violation detected by the safety moderation system.
 *
 * @param {boolean}  isOpen
 * @param {Function} onClose
 * @param {string}   [reason]    - AI-generated explanation
 * @param {string}   [category]  - violated SAFETY_CATEGORY key
 * @param {"post"|"comment"} [contentType]
 */
const ContentViolationModal = ({
  isOpen,
  onClose,
  reason,
  category,
  contentType = "post",
}) => {
  if (!isOpen) return null;

  const categoryLabel = category
    ? CATEGORY_LABELS[category] || category.replace(/_/g, " ")
    : null;

  const typeLabel = contentType === "comment" ? "comment" : "post";

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 px-6 pt-8 pb-6 flex flex-col items-center text-white">
          <div className="bg-white/20 rounded-full p-3 mb-3">
            <ShieldAlert size={28} className="text-white" />
          </div>
          <h3 className="text-lg font-extrabold text-center">
            {contentType === "comment"
              ? "Comment Not Allowed"
              : "Post Not Allowed"}
          </h3>
          <p className="text-sm text-white/80 text-center mt-1 leading-snug">
            Your {typeLabel} goes against our community guidelines.
          </p>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5">
          {categoryLabel && (
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Violation
              </span>
              <span className="bg-red-50 text-red-600 text-xs font-bold px-2.5 py-0.5 rounded-full border border-red-200">
                {categoryLabel}
              </span>
            </div>
          )}

          {reason ? (
            <p className="text-sm text-gray-600 leading-relaxed">{reason}</p>
          ) : (
            <p className="text-sm text-gray-600 leading-relaxed">
              This {typeLabel} contains material that goes against our community
              standards. Please review your content and try again.
            </p>
          )}

          <p className="text-xs text-gray-400 mt-4 leading-snug">
            If you believe this is a mistake, please reach out to our support
            team.
          </p>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm font-bold transition-all"
          >
            Got It
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ContentViolationModal;
