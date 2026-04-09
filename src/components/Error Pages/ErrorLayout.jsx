import React from "react";
import { motion } from "framer-motion";

export default function ErrorLayout({ children, errorCode, color = "#0060A9", accent = "#F57600" }) {
  return (
    <div className="fixed inset-0 bg-[#FDFCF9] flex items-center justify-center overflow-hidden font-sans">
      {/* Dynamic Background Blobs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 pointer-events-none"
        style={{ backgroundColor: color }}
      />
      <motion.div 
        animate={{ scale: [1, 1.1, 1], x: [0, -30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 pointer-events-none"
        style={{ backgroundColor: accent }}
      />

      {/* Giant Background Watermark */}
      <p className="absolute inset-0 flex items-center justify-center text-[350px] font-black text-gray-100/50 select-none pointer-events-none leading-none tracking-tighter z-0">
        {errorCode}
      </p>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-lg"
      >
        {children}
      </motion.div>
    </div>
  );
}