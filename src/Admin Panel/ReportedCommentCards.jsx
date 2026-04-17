import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { Trash2, CheckCircle, AlertTriangle, MessageSquare, CornerDownRight } from "lucide-react";

const REASON_STYLES = {
  "Harassment":        { bg: "bg-red-50",    text: "text-red-600",    border: "border-red-100" },
  "Spam":              { bg: "bg-orange-50", text: "text-[#F57600]",  border: "border-orange-100" },
  "Hate Speech":       { bg: "bg-red-50",    text: "text-red-600",    border: "border-red-100" },
  "False Information": { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-100" },
};

/**
 * ReportedCommentCard
 * Props:
 *   item     { id, type, author, reportedBy, category, text, postTitle, reportedAt, reportCount }
 *   onKeep   Function
 *   onRemove Function
 */
const ReportedCommentCard = forwardRef(function ReportedCommentCard(
  { item, onKeep, onRemove },
  ref,
) {
  const s = REASON_STYLES[item.category] ?? { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-100" };
  const isReply = item.type === "reply";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-200/60 transition-all overflow-hidden"
    >
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#0060A9] to-red-500" />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Avatar initial */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-black text-sm shrink-0">
              {item.author.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-black text-[#0060A9] truncate">{item.author}</h4>
                {/* Comment / Reply badge */}
                <span className={`shrink-0 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5
                  ${isReply ? "bg-blue-50 text-[#0060A9]" : "bg-gray-100 text-gray-500"}`}>
                  {isReply ? <CornerDownRight size={9} /> : <MessageSquare size={9} />}
                  {isReply ? "Reply" : "Comment"}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium truncate">
                On: "{item.postTitle}" · {item.reportedAt}
              </p>
            </div>
          </div>
          <span className="shrink-0 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[9px] font-black uppercase tracking-wider">
            {item.reportCount} report{item.reportCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Category badge */}
        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider mb-2 ${s.bg} ${s.text} ${s.border}`}>
          <AlertTriangle size={10} />
          {item.category}
        </div>

        {/* Reported by */}
{item.detail && (
  <p className="text-[10px] text-gray-400 font-semibold mb-2">
    Reason: <span className="text-gray-600 font-medium italic">{item.detail}</span>
  </p>
)}

        {/* Quoted text */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
          <p className="text-xs text-gray-700 leading-relaxed italic">"{item.text}"</p>
        </div>

        {/* Actions */}
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
});

export default ReportedCommentCard;