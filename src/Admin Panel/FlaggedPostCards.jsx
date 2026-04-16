import React, { useState } from "react";
import { motion } from "framer-motion";
import { Flag, Trash2, CheckCircle, AlertTriangle } from "lucide-react";

const REASON_STYLES = {
  "Spam":             { bg: "bg-orange-50", text: "text-[#F57600]",  border: "border-orange-100" },
  "Hate Speech":      { bg: "bg-red-50",    text: "text-red-600",    border: "border-red-100" },
  "False Information":{ bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-100" },
  "Harassment":       { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" },
};

/**
 * FlaggedPostCard
 * Props:
 *   post     { id, author, reportedBy, category, caption, image, reportedAt, reportCount }
 *   onKeep   Function
 *   onRemove Function
 */
export default function FlaggedPostCard({ post, onKeep, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  const s = REASON_STYLES[post.category] ?? { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-100" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-lg hover:border-red-200/60 transition-all overflow-hidden"
    >
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-red-500 to-[#F57600]" />

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Thumbnail */}
          <div className="relative shrink-0">
            <img
              src={post.image}
              alt=""
              className="w-20 h-20 rounded-xl object-cover border-2 border-gray-100"
            />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
              <Flag size={11} className="text-white" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <h4 className="text-sm font-black text-[#0060A9]">{post.author}</h4>
                <p className="text-[10px] text-gray-400 font-medium">
                  Reported by {post.reportedBy} · {post.reportedAt}
                </p>
              </div>
              <span className="shrink-0 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[9px] font-black uppercase tracking-wider">
                {post.reportCount} reports
              </span>
            </div>

            {/* Category badge */}
            <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider mb-2 ${s.bg} ${s.text} ${s.border}`}>
              <AlertTriangle size={10} />
              {post.category}
            </div>

            {/* Caption */}
            <p className={`text-xs text-gray-600 leading-relaxed ${expanded ? "" : "line-clamp-2"}`}>
              {post.caption}
            </p>
            {post.caption.length > 100 && (
              <button
                onClick={() => setExpanded((e) => !e)}
                className="text-[10px] text-[#0060A9] font-bold mt-0.5 hover:underline"
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t-2 border-gray-50">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onKeep}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#0060A9] to-[#00B4FA] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-blue-900/15"
          >
            <CheckCircle size={13} /> Keep Post
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRemove}
            className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
          >
            <Trash2 size={13} /> Remove Post
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}