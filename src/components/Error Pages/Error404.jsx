import { useNavigate } from "react-router-dom";
import { SearchX } from "lucide-react";
import { motion } from "framer-motion";
import ErrorLayout from "./ErrorLayout";

export default function Error404() {
  const navigate = useNavigate();

  return (
    <ErrorLayout errorCode="404" color="#00B4FA" accent="#F57600">
      {/* Lively Wobbling Icon */}
      <motion.div 
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="w-24 h-24 rounded-[2rem] bg-white border-2 border-[#00B4FA]/10 flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/10"
      >
        <SearchX size={42} className="text-[#00B4FA]" strokeWidth={2} />
      </motion.div>

      {/* Text Hierarchy: Blue Title + Light Blue Accent */}
      <p className="text-[12px] font-black uppercase tracking-[0.3em] text-[#00B4FA] mb-2">
        Recipe Missing
      </p>
      <h1 className="text-5xl font-black text-[#0060A9] tracking-tighter mb-4 uppercase">
        Out of Stock
      </h1>
      <p className="text-gray-500 font-medium leading-relaxed mb-10 max-w-sm">
        We couldn't find the page you're looking for. It might have been deleted or moved to another shelf.
      </p>

      {/* Updated Primary Action: Take Me Back */}
      <div className="flex gap-4 w-full max-w-xs">
        <button 
          onClick={() => navigate(-1)}
          className="flex-1 py-4 rounded-2xl bg-[#F57600] text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-900/20 hover:bg-[#F0AE35] transition-all active:scale-95"
        >
          Take Me Back
        </button>
      </div>
    </ErrorLayout>
  );
}