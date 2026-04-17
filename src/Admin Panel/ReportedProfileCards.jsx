import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Trash2, CheckCircle, AlertTriangle, UserRound } from "lucide-react";

const REASON_STYLES = {
  "Fake Account": { bg: "bg-orange-50", text: "text-[#F57600]", border: "border-orange-100" },
  "Identity Theft or Impersonation": { bg: "bg-red-50", text: "text-red-600", border: "border-red-100" },
  "Scam or Fraud": { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-100" },
  "Abusive Profile Content": { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" },
  "Others": { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-100" },
};

export default function ReportedProfileCard({ item, onKeep, onRemove }) {
  const s = REASON_STYLES[item.category] ?? { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-100" };
  const initials = item.author?.charAt(0)?.toUpperCase() || "U";
  const reasonBubbles = useMemo(() => {
    const reasons = Array.isArray(item.reasonBreakdown)
      ? item.reasonBreakdown
      : [
          {
            label: item.category || "Others",
            count: item.reportCount || 1,
          },
        ];

    return reasons
      .filter((reason) => reason?.label)
      .sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
  }, [item.category, item.reasonBreakdown, item.reportCount]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-lg hover:border-orange-200/60 transition-all overflow-hidden"
    >
      <div className="h-1 w-full bg-gradient-to-r from-[#F57600] to-[#0060A9]" />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="relative shrink-0">
              {item.avatar ? (
                <img
                  src={item.avatar}
                  alt={item.author}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-gray-100"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-black text-lg border-2 border-gray-100">
                  {initials}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#0060A9] rounded-full flex items-center justify-center border-2 border-white">
                <UserRound size={11} className="text-white" />
              </div>
            </div>

            <div className="min-w-0">
              <h4 className="text-sm font-black text-[#0060A9] truncate">{item.author || "Unknown User"}</h4>
              <p className="text-[10px] text-gray-400 font-medium truncate">
                {item.reportedAt}
              </p>
              <p className="text-xs text-gray-600 leading-relaxed mt-2 line-clamp-3">
                {item.bio || "No profile bio available."}
              </p>
            </div>
          </div>

          <span className="shrink-0 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[9px] font-black uppercase tracking-wider">
            {item.reportCount} report{item.reportCount !== 1 ? "s" : ""}
          </span>
        </div>

        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider mb-3 ${s.bg} ${s.text} ${s.border}`}>
          <AlertTriangle size={10} />
          {item.category}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {reasonBubbles.map((reason) => {
            const reasonStyle = REASON_STYLES[reason.label] ?? {
              bg: "bg-gray-50",
              text: "text-gray-600",
              border: "border-gray-100",
            };

            return (
              <span
                key={`${item.id}-${reason.label}`}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${reasonStyle.bg} ${reasonStyle.text} ${reasonStyle.border}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                {reason.label}
                <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[9px] leading-none">
                  {reason.count}
                </span>
              </span>
            );
          })}
        </div>

        {item.detail && (
          <div className="mb-3 bg-gray-50 border border-gray-100 rounded-xl p-3">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider mb-1">Reporter note</p>
            <p className="text-xs text-gray-700 leading-relaxed italic">"{item.detail}"</p>
          </div>
        )}

        <div className="flex gap-2 mt-4 pt-4 border-t-2 border-gray-50">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onKeep}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#0060A9] to-[#00B4FA] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-blue-900/15"
          >
            <CheckCircle size={13} /> Keep
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRemove}
            className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
          >
            <Trash2 size={13} /> Remove
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
