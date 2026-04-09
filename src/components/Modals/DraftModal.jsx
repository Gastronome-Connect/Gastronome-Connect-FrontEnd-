import { createPortal } from "react-dom";
import { X, BookmarkPlus, Trash2 } from "lucide-react";

/**
 * DraftPromptModal
 * Shown when the user tries to close CreatePostModal with unsaved content.
 *
 * @param {Function} onSaveDraft   — save content as draft, then close CreatePost
 * @param {Function} onDiscard     — wipe everything, close CreatePost
 * @param {Function} onDismiss     — close THIS modal only, return to CreatePost
 */
const DraftPromptModal = ({ onSaveDraft, onDiscard, onDismiss }) => {
  return createPortal(
    <div
      className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onDismiss}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-5 flex items-center justify-center border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Save as draft?</h2>
          <button
            onClick={onDismiss}
            className="absolute right-4 p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-orange-50 hover:text-[#F57600] transition-colors"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pt-4 pb-2">
          <p className="text-sm text-gray-500 text-center leading-relaxed">
            You have unsaved content. Save it as a draft so you can come back to it later.
          </p>
        </div>

        {/* Actions */}
        <div className="p-5 flex flex-col gap-2.5">
          {/* Save draft — primary */}
          <button
            onClick={onSaveDraft}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#F57600] to-[#F0AE35] text-white font-bold py-3.5 rounded-2xl shadow hover:opacity-90 transition-all active:scale-[0.98]"
          >
            <BookmarkPlus size={16} />
            Save Draft
          </button>

          {/* Discard — destructive */}
          <button
            onClick={onDiscard}
            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-500 font-bold py-3.5 rounded-2xl hover:bg-red-100 transition-all active:scale-[0.98]"
          >
            <Trash2 size={16} />
            Discard Post
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DraftPromptModal;