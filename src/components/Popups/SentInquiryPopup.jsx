import React from "react";
import { motion } from "framer-motion";
import { Send, Check, Sparkles, Heart } from "lucide-react";

/**
 * ContactSuccessPopup
 * Designed for the Dev Team contact flow.
 * Tone: Friendly, Hopeful, and Professional.
 */
const ContactSuccessPopup = ({ onDone }) => {
  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onDone}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        className="bg-white rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,96,169,0.3)] w-full max-w-sm overflow-hidden border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section: 30% Blue Palette */}
        <div className="bg-gradient-to-br from-[#00B4FA] to-[#0060A9] text-white text-center py-14 px-6 relative">
          {/* Animated Background Element */}
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-10 -right-10 opacity-10 pointer-events-none"
          >
            <Sparkles size={180} />
          </motion.div>

          {/* Main Floating Icon */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-24 h-24 bg-white/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 backdrop-blur-xl border border-white/20 relative shadow-inner"
          >
            <Send
              size={36}
              className="text-white translate-x-1 -translate-y-1"
            />

            {/* Success Badge: 10% Orange Highlight */}
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              className="absolute -bottom-2 -right-2 bg-[#F57600] p-2 rounded-2xl border-[6px] border-[#0060A9] shadow-xl"
            >
              <Check size={16} strokeWidth={4} className="text-white" />
            </motion.div>
          </motion.div>

          <h2 className="text-2xl font-black uppercase tracking-tight">
            Message Received!
          </h2>
          <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-80">
            Dev Team Notified
          </p>
        </div>

        {/* Body Section: 60% White Palette */}
        <div className="p-10 text-center">
          <div className="flex justify-center mb-4">
            <Heart size={20} className="text-[#F57600] fill-[#F57600]/10" />
          </div>

          <p className="text-gray-500 text-[15px] leading-relaxed mb-10 font-medium">
            Your message has safely reached our dev team. We're excited to
            collaborate and will get back to you
            <span className="text-[#0060A9] font-bold block mt-1">
              as soon as possible!
            </span>
          </p>

          <div className="flex flex-col gap-4">
            {/* Primary Action Button: Orange */}
            <motion.button
              whileHover={{
                scale: 1.03,
                backgroundColor: "#f0ae35",
                boxShadow: "0 15px 30px -10px rgba(245, 118, 0, 0.4)",
              }}
              whileTap={{ scale: 0.97 }}
              onClick={onDone}
              className="w-full min-h-[56px] px-6 py-4 rounded-[1.5rem] bg-[#F57600] text-white font-black text-sm tracking-[0.2em] shadow-xl shadow-orange-100 uppercase transition-all"
            >
              Sounds Great
            </motion.button>

            {/* Secondary Button */}
            <button
              onClick={onDone}
              className="py-2 text-gray-400 hover:text-[#0060A9] font-bold text-[11px] uppercase tracking-[0.2em] transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Footer Accent Gradient */}
        <div className="h-2 w-full flex">
          <div className="flex-1 bg-[#0060A9]" />
          <div className="flex-1 bg-[#00B4FA]" />
          <div className="flex-1 bg-[#F57600]" />
          <div className="flex-1 bg-[#F0AE35]" />
        </div>
      </motion.div>
    </div>
  );
};

export default ContactSuccessPopup;
