import React from "react";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";

export default function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden"
      >
        {/* Red header */}
        <div className="bg-gradient-to-br from-red-600 to-red-500 text-white text-center py-8 px-6">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md"
          >
            <LogOut size={26} className="text-white" />
          </motion.div>
          <h2 className="text-lg font-black uppercase tracking-tight">Log Out</h2>
          <p className="text-red-100 text-xs mt-1">Admin Panel · Gastronome</p>
        </div>

        {/* Body */}
        <div className="p-6 text-center">
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Are you sure you want to log out? You'll be redirected to the login page.
          </p>
          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 text-white font-black text-xs tracking-widest shadow-lg shadow-red-200 uppercase"
            >
              Yes, Log Out
            </motion.button>
            <button
              onClick={onCancel}
              className="py-2 text-gray-400 font-bold text-xs uppercase tracking-tighter hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}