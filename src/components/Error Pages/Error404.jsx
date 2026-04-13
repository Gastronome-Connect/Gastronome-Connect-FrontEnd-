import { useNavigate } from "react-router-dom";
import { SearchX } from "lucide-react";
import { motion } from "framer-motion";
import ErrorLayout from "./ErrorLayout";

export default function Error404() {
  const navigate = useNavigate();

  return (
    <ErrorLayout errorCode="404" color="#00B4FA" accent="#F57600">
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="w-24 h-24 rounded-[2rem] bg-white border-2 border-[#00B4FA]/10 flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/10"
      >
        <SearchX size={42} className="text-[#00B4FA]" strokeWidth={2} />
      </motion.div>

      <p className="text-[12px] font-black uppercase tracking-[0.3em] text-[#00B4FA] mb-2">
        404 — Page Not Found
      </p>
      <h1 className="text-5xl font-black text-[#0060A9] tracking-tighter mb-4 uppercase">
        Nothing Here
      </h1>
      <p className="text-gray-500 font-medium leading-relaxed mb-3 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <p className="text-gray-400 text-sm leading-relaxed mb-10 max-w-sm">
        Double-check the URL, or use the button below to go back to where you came from.
      </p>

      <div className="flex gap-4 w-full max-w-xs">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 py-4 rounded-2xl bg-[#F57600] text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-900/20 hover:bg-[#F0AE35] transition-all active:scale-95"
        >
          Go Back
        </button>
      </div>
    </ErrorLayout>
  );
}