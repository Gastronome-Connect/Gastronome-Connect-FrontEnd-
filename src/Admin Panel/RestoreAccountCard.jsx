import React from "react";
import { motion } from "framer-motion";
import { RefreshCw, AlertTriangle } from "lucide-react";

export default function RestoreAccountCard({ account, onRestore }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-sm hover:shadow-lg hover:border-[#F57600]/30 transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative">
          {account.avatar ? (
            <img
              src={account.avatar}
              alt={account.name}
              className="w-16 h-16 rounded-2xl object-cover grayscale"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-black text-xl">
              {account.name.charAt(0)}
            </div>
          )}
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#F57600] rounded-full flex items-center justify-center border-2 border-white">
            <AlertTriangle size={12} className="text-white" />
          </div>
        </div>

        {/* Account Info */}
        <div className="flex-1">
          <h4 className="text-sm font-black text-gray-900 mb-1">{account.name}</h4>
          <p className="text-[10px] text-gray-400 font-medium mb-2">{account.email}</p>

          <div className="bg-orange-50 border border-orange-100 rounded-xl p-2.5 mb-3">
            <p className="text-[9px] font-black text-[#F57600] uppercase tracking-widest mb-1">Deletion Reason</p>
            <p className="text-xs text-orange-700 font-medium">{account.reason}</p>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
            <AlertTriangle size={12} />
            <span>Deleted: {account.deletedDate}</span>
          </div>
        </div>
      </div>

      {/* Restore Button */}
      <div className="mt-4 pt-4 border-t-2 border-gray-50">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRestore}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F57600] to-[#F0AE35] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-900/20"
        >
          <RefreshCw size={14} />
          Restore Account
        </motion.button>
      </div>
    </motion.div>
  );
}