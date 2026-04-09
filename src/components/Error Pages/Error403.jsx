import { useNavigate } from "react-router-dom";
import { ShieldOff } from "lucide-react";
import { motion } from "framer-motion";
import ErrorLayout from "./ErrorLayout"; // Using the wrapper from the previous step

export default function Error403() {
  const navigate = useNavigate();

  return (
    <ErrorLayout errorCode="403" color="#0060A9" accent="#F57600">
      {/* Floating Shield Icon */}
      <motion.div 
        animate={{ 
          y: [0, -8, 0],
          rotate: [0, -2, 2, 0]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="w-24 h-24 rounded-[2rem] bg-white border-2 border-[#0060A9]/10 flex items-center justify-center mb-8 shadow-2xl shadow-blue-900/10"
      >
        <ShieldOff size={42} className="text-[#0060A9]" strokeWidth={2} />
      </motion.div>

      {/* Text Hierarchy */}
      <p className="text-[12px] font-black uppercase tracking-[0.3em] text-[#0060A9] mb-2">
        Permission Denied
      </p>
      
      <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4 uppercase">
        Off <span className="text-[#F57600]">Limits</span>
      </h1>

      <p className="text-gray-500 font-medium leading-relaxed mb-10 max-w-sm">
        Sorry! You don't have the secret ingredient (permissions) to view this page. 
        If you think this is a mistake, contact the head chef.
      </p>

      {/* Buttons: 60/30/10 compliant */}
      <div className="flex gap-4 w-full max-w-xs">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 py-4 rounded-2xl bg-[#0060A9] text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-900/20 hover:bg-[#00B4FA] transition-all active:scale-95"
        >
          Go Back
        </button>
        <button
          onClick={() => navigate("/")}
          className="flex-1 py-4 rounded-2xl bg-white border-2 border-gray-100 text-xs font-black uppercase tracking-widest text-gray-400 hover:border-[#F57600] hover:text-[#F57600] transition-all"
        >
          Go Home
        </button>
      </div>
    </ErrorLayout>
  );
}