import React from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, XCircle } from "lucide-react";

export default function TimeoutUserCard({ user, onApprove, onReject }) {
  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-sm hover:shadow-lg hover:border-[#00B4FA]/30 transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0060A9] to-[#00B4FA] flex items-center justify-center text-white font-black text-xl">
              {user.name?.charAt(0) ?? "?"}
            </div>
          )}
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
            <Clock size={12} className="text-white" />
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1">
          <h4 className="text-sm font-black text-[#0060A9] mb-1">{user.name}</h4>
          <p className="text-[10px] text-gray-400 font-medium mb-2">{user.email}</p>

          <div className="bg-red-50 border border-red-100 rounded-xl p-2.5 mb-3">
            <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1">
              Timeout Reason
            </p>
            <p className="text-xs text-red-700 font-medium">{user.timeoutReason}</p>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
            <Clock size={12} />
            <span>Timeout: {user.timeoutDate}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4 pt-4 border-t-2 border-gray-50">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onApprove}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#0060A9] to-[#00B4FA] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
        >
          <CheckCircle size={14} />
          Approve
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReject}
          className="flex-1 py-3 rounded-xl bg-red-50 text-red-600 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
        >
          <XCircle size={14} />
          Reject
        </motion.button>
      </div>
    </motion.div>
  );
}