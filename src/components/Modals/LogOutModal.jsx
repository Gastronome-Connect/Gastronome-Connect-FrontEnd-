import React from "react";
import { createPortal } from "react-dom";
import { LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "../../utils/api";

const LogOutModal = ({ isOpen, onConfirm, onCancel }) => {
  const handleConfirm = async () => {
    if (onConfirm) return onConfirm();
    try {
      await logout();
    } finally {
      window.location.href = "/Home";
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Warning Red */}
            <div className="bg-red-600 text-white py-10 px-6 text-center relative overflow-hidden">
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/30"
              >
                <LogOut size={32} />
              </motion.div>
              <h2 className="text-2xl font-black tracking-tighter uppercase">
                Logging Out?
              </h2>
            </div>

            <div className="p-10 text-center">
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Are you sure you want to leave? Your culinary session will be
                ended.
              </p>

              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: "#DC2626" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirm}
                  className="w-full py-4 rounded-2xl bg-red-500 text-white font-black text-xs tracking-widest uppercase shadow-lg shadow-red-100"
                >
                  LOGOUT
                </motion.button>
                <button
                  onClick={onCancel}
                  className="py-2 text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] hover:text-gray-600 transition-colors"
                >
                  Stay in the Kitchen
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default LogOutModal;
