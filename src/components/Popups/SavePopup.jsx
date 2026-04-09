import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";

const SavedPopup = ({ isOpen, onContinue }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden border border-gray-50"
          >
            <div className="bg-[#0060A9] text-white py-8 px-10 flex items-center gap-5">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shrink-0 border border-white/30">
                <CheckCircle size={24} className="text-white" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-widest">Saved</h2>
            </div>

            <div className="p-10 text-center">
              <p className="text-gray-500 text-sm leading-relaxed mb-8 text-left border-l-4 border-[#F57600] pl-5">
                Your profile changes have been successfully saved to your vault.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onContinue}
                className="w-full py-4 rounded-2xl bg-[#F57600] text-white font-black text-xs tracking-widest uppercase shadow-lg shadow-orange-100"
              >
                Got it
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SavedPopup;