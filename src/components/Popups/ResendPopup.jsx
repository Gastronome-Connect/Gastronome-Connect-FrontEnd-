import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";

const ResendPopup = ({ isOpen, onContinue }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden"
          >
            {/* Header - 30% Blue */}
            <div className="bg-[#0060A9] text-white text-center py-12 px-6 relative overflow-hidden">
              <motion.div 
                animate={{ 
                  x: [0, 5, -5, 0],
                  y: [0, -5, 5, 0] 
                }}
                transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
                className="w-16 h-16 bg-white/20 rounded-[2rem] flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/30"
              >
                <Mail size={32} />
              </motion.div>
              <h2 className="text-xl font-black tracking-widest uppercase">Code Sent!</h2>
              <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mt-2">Verification Email</p>
            </div>

            {/* Body - 60% White */}
            <div className="p-10 text-center">
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                We've sent a new verification code to your inbox. Please check your email (and spam folder) to proceed.
              </p>
              
              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: "#d66700" }}
                whileTap={{ scale: 0.97 }}
                onClick={onContinue}
                className="w-full py-4 rounded-2xl bg-[#F57600] text-white font-black text-xs tracking-[0.2em] shadow-lg shadow-orange-100 uppercase flex items-center justify-center gap-2"
              >
                NEXT <ArrowRight size={14} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ResendPopup;