import { useNavigate } from "react-router-dom";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import ErrorLayout from "./ErrorLayout";

export default function Error500() {
  const navigate = useNavigate();

  return (
    <ErrorLayout errorCode="500" color="#0060A9" accent="#00B4FA">
      <div className="relative mb-8">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-[2rem] bg-[#00B4FA]"
        />
        <div className="relative w-24 h-24 rounded-[2rem] bg-white border-2 border-[#0060A9]/10 flex items-center justify-center shadow-2xl">
          <AlertTriangle size={42} className="text-[#0060A9]" strokeWidth={2} />
        </div>
      </div>

      <p className="text-[12px] font-black uppercase tracking-[0.3em] text-[#00B4FA] mb-2">
        500 — Server Error
      </p>
      <h1 className="text-5xl font-black text-[#0060A9] tracking-tighter mb-4 uppercase">
        Something Went Wrong
      </h1>
      <p className="text-gray-500 font-medium leading-relaxed mb-3 max-w-sm">
        An unexpected error occurred on our end — this is not your fault.
      </p>
      <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
        Our team has been notified and is working on a fix. Please try again in a few moments.
        If the problem persists, contact{" "}
        <span className="text-[#F57600] font-bold">Gastronome Connect</span> support.
      </p>

      <div className="bg-[#0060A9]/5 border border-[#0060A9]/10 rounded-2xl px-6 py-2 mb-10">
        <p className="text-[10px] text-[#0060A9] font-black tracking-widest uppercase">
          Error Code: 500 · Internal Server Error
        </p>
      </div>

      <div className="flex gap-4 w-full">
        <button
          onClick={() => window.location.reload()}
          className="flex-1 py-4 rounded-2xl bg-[#0060A9] text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 hover:bg-[#00B4FA] transition-all"
        >
          <RefreshCw size={14} /> Try Again
        </button>
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