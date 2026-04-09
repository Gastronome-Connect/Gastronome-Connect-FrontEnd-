import { createPortal } from "react-dom";
import { X, Trash2, PencilLine } from "lucide-react";

/**
 * DiscardChangesModal
 *
 * Shown when user tries to close EditPostModal with unsaved changes.
 *
 * Props:
 *   onDiscard     — discard changes and close the editor
 *   onKeepEditing — dismiss this modal, return to editor
 */
const DiscardChangesModal = ({ onDiscard, onKeepEditing }) =>
  createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onKeepEditing}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-xs shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative flex items-center justify-center px-5 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Discard changes?</h2>
          <button
            onClick={onKeepEditing}
            aria-label="Keep editing"
            className="absolute right-4 top-4 p-1.5 rounded-full bg-gray-100 text-gray-500
                       hover:bg-orange-50 hover:text-[#F57600] transition-colors"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <p className="px-6 pt-4 pb-1 text-sm text-gray-500 text-center leading-relaxed">
          You have unsaved changes. Are you sure you want to leave without saving?
        </p>

        {/* Actions */}
        <div className="p-5 flex flex-col gap-2.5">
          {/* Keep editing — primary */}
          <button
            onClick={onKeepEditing}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm
                       bg-gradient-to-r from-[#F57600] to-[#F0AE35] text-white shadow
                       hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <PencilLine size={15} />
            Keep Editing
          </button>

          {/* Discard — destructive */}
          <button
            onClick={onDiscard}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm
                       bg-red-50 text-red-500 hover:bg-red-100 active:scale-[0.98] transition-all"
          >
            <Trash2 size={15} />
            Discard Changes
          </button>
        </div>
      </div>
    </div>,
    document.body
  );

export default DiscardChangesModal;