import { createPortal } from "react-dom";

const DeleteConfirmModal = ({ onConfirm, onCancel }) =>
  createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-extrabold text-gray-900 mb-2">Delete Post?</h3>
        <p className="text-sm text-gray-500 mb-6">
          This action cannot be undone. Your post will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );

export default DeleteConfirmModal;