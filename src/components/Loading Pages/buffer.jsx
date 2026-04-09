import React from "react";
import { motion } from "framer-motion";
import LogoImage from "../Assets/Gastro.png";

function LoadingPage() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70 backdrop-blur-md">
      <div className="flex flex-col items-center">
        {/* The "Simmering" Animation */}
        <div className="relative flex items-center justify-center">
          <motion.div
            animate={{ 
              scale: [1, 1.4, 1],
              rotate: [0, 180, 360],
              borderRadius: ["20%", "50%", "20%"]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-24 h-24 border-t-4 border-b-4 border-[#0060A9]/30"
          />
          
          <motion.div
            animate={{ 
              scale: [1, 0.9, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <img
              src={LogoImage}
              alt="Loading"
              className="w-16 h-16 object-contain"
            />
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 flex flex-col items-center"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0060A9]">
            Preparing Flavors
          </span>
          <div className="flex gap-1 mt-2">
             <motion.span 
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1, delay: 0 }}
              className="w-1 h-1 bg-[#F57600] rounded-full"
             />
             <motion.span 
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
              className="w-1 h-1 bg-[#F57600] rounded-full"
             />
             <motion.span 
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
              className="w-1 h-1 bg-[#F57600] rounded-full"
             />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default LoadingPage;