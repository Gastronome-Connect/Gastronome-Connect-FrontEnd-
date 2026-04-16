import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Archive, Utensils } from "lucide-react";

const RecipePopup = ({ isOpen, onArchive, onFavorite, onSkip }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 18 }}
            className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-sm overflow-hidden"
          >
            <div className="bg-[#0060A9] text-white text-center py-12 px-6">
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center mx-auto mb-4 backdrop-blur-md"
              >
                <Utensils size={36} />
              </motion.div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">Chef's Kiss!</h2>
            </div>

            <div className="p-10 text-center">
              <p className="text-[#0060A9] font-black text-xs mb-8 uppercase tracking-widest">Save this discovery?</p>

              <div className="grid grid-cols-2 gap-4">
                <motion.button 
                  whileHover={{ y: -5, backgroundColor: "#f8fafc" }}
                  onClick={onArchive} 
                  className="flex flex-col items-center p-6 rounded-[2.5rem] bg-gray-50 border border-gray-100 transition-all group"
                >
                  <Archive className="text-gray-400 group-hover:text-[#0060A9] mb-2" />
                  <span className="text-[10px] font-black uppercase text-gray-400">Archive</span>
                </motion.button>

                <motion.button 
                  whileHover={{ y: -5, backgroundColor: "#fff7ed" }}
                  onClick={onFavorite} 
                  className="flex flex-col items-center p-6 rounded-[2.5rem] bg-orange-50/50 border border-orange-100 transition-all group"
                >
                  <Heart className="text-[#F57600] fill-[#F57600] mb-2" />
                  <span className="text-[10px] font-black uppercase text-[#F57600]">Favorite</span>
                </motion.button>
              </div>

              <button onClick={onSkip} className="mt-8 text-[11px] font-black text-gray-300 uppercase hover:text-[#0060A9] tracking-widest">
                Skip
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RecipePopup;