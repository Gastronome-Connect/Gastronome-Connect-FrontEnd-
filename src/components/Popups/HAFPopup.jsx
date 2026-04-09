import React from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

const HAFPopup = ({ message, onConfirm, onCancel }) => {
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[9999] p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", damping: 18, stiffness: 250 }}
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#0060A9] text-white text-center py-10 px-6">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl"
          >
            <Trash2 size={32} className="text-red-500" />
          </motion.div>
          <h2 className="text-xl font-black tracking-tighter uppercase">Remove Recipe</h2>
        </div>

        <div className="p-10 text-center">
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            {message || "Are you sure you want to remove this recipe from your history?"}
          </p>
          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              className="w-full py-4 rounded-2xl bg-red-600 text-white font-black text-xs tracking-widest uppercase shadow-lg shadow-red-100"
            >
              Yes, Remove
            </motion.button>
            <button
              onClick={onCancel}
              className="py-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-[#0060A9] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HAFPopup;