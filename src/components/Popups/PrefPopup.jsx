import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PartyPopper } from "lucide-react";

const AccountCreatedPopup = ({
  isOpen,
  onContinue,
  title = "Welcome Home!",
  message = "Your culinary journey starts now. Are ready to explore new flavors?",
  buttonLabel = "Let's Cook",
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-sm overflow-hidden"
          >
            <div className="bg-[#0060A9] text-white text-center py-14 px-6 relative overflow-hidden">
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute inset-0 bg-white rounded-full -translate-y-1/2"
              />

              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl relative z-10">
                <PartyPopper size={40} className="text-[#0060A9]" />
              </div>
              <h2 className="text-3xl font-black tracking-tight relative z-10">
                {title}
              </h2>
            </div>

            <div className="p-12 text-center">
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                {message}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onContinue}
                className="w-full py-4 rounded-2xl bg-[#F57600] text-white font-black text-xs tracking-widest uppercase shadow-xl shadow-orange-100"
              >
                {buttonLabel}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AccountCreatedPopup;
