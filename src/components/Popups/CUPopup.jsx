import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";

const FeedbackSentPopup = ({ isOpen, onContinue, title = "Feedback Sent", message = "We've received your message." }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden"
          >
            <div className="bg-gradient-to-br from-[#0060A9] to-[#00B4FA] text-white text-center py-12 px-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
                <Send size={28} className="text-white ml-1" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">{title}</h2>
            </div>

            <div className="p-10 text-center">
              <p className="text-gray-500 text-sm leading-relaxed mb-8">{message}</p>
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "#d66700" }}
                whileTap={{ scale: 0.95 }}
                onClick={onContinue}
                className="w-full py-4 rounded-2xl bg-[#F57600] text-white font-black text-xs tracking-widest uppercase shadow-lg shadow-orange-100"
              >
                Continue
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackSentPopup;