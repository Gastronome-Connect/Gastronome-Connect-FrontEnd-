import React from "react";
import { motion } from "framer-motion";

export default function StatCard({ title, value, icon: Icon, color = "#0060A9", trend }) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{
        y: -4,
        boxShadow: "0 12px 32px rgba(0,96,169,0.15), 0 2px 8px rgba(0,96,169,0.08)",
      }}
      className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm hover:border-[#00B4FA]/30 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={28} style={{ color }} strokeWidth={2.5} />
        </div>
        {trend && (
          <div
            className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
              trend.isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
            }`}
          >
            {trend.isPositive ? "↑" : "↓"} {trend.value}
          </div>
        )}
      </div>

      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">
          {title}
        </p>
        <h3
          className="text-4xl font-black tracking-tighter group-hover:text-[#0060A9] transition-colors"
          style={{ color }}
        >
          {value}
        </h3>
      </div>

      {/* Animated underline */}
      <div
        className="mt-4 h-1 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
        style={{ backgroundColor: color }}
      />
    </motion.div>
  );
}