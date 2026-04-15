import React from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

const CAPopup = ({ message, onConfirm, onCancel }) => {
  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#0060A9] text-white text-center py-10 px-6">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="w-16 h-16 bg-white/20 rounded-[2rem] flex items-center justify-center mx-auto mb-4 backdrop-blur-md"
          >
            <Trash2 size={28} className="text-white" />
          </motion.div>
          <h2 className="text-xl font-black uppercase tracking-tight">
            Clear History
          </h2>
        </div>

        <div className="p-10 text-center">
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            {message}
          </p>
          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              className="w-full py-4 rounded-2xl bg-red-600 text-white font-black text-xs tracking-widest shadow-lg shadow-red-100 uppercase"
            >
              Confirm Clear
            </motion.button>
            <button
              onClick={onCancel}
              className="py-2 text-gray-400 font-bold text-xs uppercase tracking-tighter"
            >
              Go Back
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CAPopup;
