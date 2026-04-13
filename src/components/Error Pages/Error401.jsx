import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";
import ErrorLayout from "./ErrorLayout";

export default function Error401() {
  const navigate = useNavigate();
  return (
    <ErrorLayout errorCode="401" color="#0060A9" accent="#F57600">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="w-24 h-24 rounded-[2rem] bg-white border-2 border-[#F57600]/10 flex items-center justify-center mb-8 shadow-2xl shadow-orange-500/10"
      >
        <Lock size={42} className="text-[#F57600]" strokeWidth={2} />
      </motion.div>

      <p className="text-[12px] font-black uppercase tracking-[0.3em] text-[#F57600] mb-2">
        401 — Not Signed In
      </p>
      <h1 className="text-5xl font-black text-[#0060A9] tracking-tighter mb-4 uppercase">
        Sign In Required
      </h1>
      <p className="text-gray-500 font-medium leading-relaxed mb-3 max-w-xs">
        You need to be signed in to view this page.
      </p>
      <p className="text-gray-400 text-sm leading-relaxed mb-10 max-w-xs">
        If you already have an account, sign in below. If not, you can create one for free.
      </p>

      <div className="flex gap-4 w-full">
        <button
          onClick={() => navigate("/login")}
          className="flex-1 py-4 rounded-2xl bg-[#0060A9] text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-900/20 hover:bg-[#00B4FA] transition-all active:scale-95"
        >
          Sign In
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