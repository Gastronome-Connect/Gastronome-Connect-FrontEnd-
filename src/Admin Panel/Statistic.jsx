import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Activity, FileText, Heart, MessageCircle, Repeat2, TrendingUp, Calendar, TrendingDown } from "lucide-react";
import StatCard from "./StatCard";

/* ── Per-period datasets ─────────────────────────────────────────────── */
const DATA = {
  Today: {
    mainStats: [
      { title: "New Users",    value: "48",   icon: Users,    color: "#0060A9", trend: { value: "3%",  isPositive: true  } },
      { title: "Active Users", value: "31",   icon: Activity, color: "#00B4FA", trend: { value: "5%",  isPositive: true  } },
      { title: "New Posts",    value: "124",  icon: FileText, color: "#F57600", trend: { value: "8%",  isPositive: true  } },
    ],
    engagementStats: [
      { title: "Likes Today",    value: "1,204", icon: Heart,         color: "#F0AE35", trend: { value: "11%", isPositive: true  } },
      { title: "Comments Today", value: "387",   icon: MessageCircle, color: "#0060A9", trend: { value: "2%",  isPositive: false } },
      { title: "Reposts Today",  value: "92",    icon: Repeat2,       color: "#00B4FA", trend: { value: "6%",  isPositive: true  } },
    ],
    chart: {
      label: "Hourly activity today",
      bars: [
        { label: "6am",  users: 12, posts: 8,  likes: 34  },
        { label: "9am",  users: 28, posts: 19, likes: 87  },
        { label: "12pm", users: 48, posts: 31, likes: 124 },
        { label: "3pm",  users: 41, posts: 27, likes: 108 },
        { label: "6pm",  users: 55, posts: 38, likes: 152 },
        { label: "9pm",  users: 33, posts: 22, likes: 97  },
        { label: "12am", users: 14, posts: 9,  likes: 41  },
      ],
    },
    activity: [
      { action: "48 new users registered",        time: "Today",       color: "#0060A9" },
      { action: "124 posts published",            time: "Today",       color: "#F57600" },
      { action: "Peak activity at 6 PM",          time: "3 hours ago", color: "#00B4FA" },
      { action: "387 comments added",             time: "Today",       color: "#F0AE35" },
    ],
  },

  Week: {
    mainStats: [
      { title: "New Users",    value: "312",   icon: Users,    color: "#0060A9", trend: { value: "7%",  isPositive: true  } },
      { title: "Active Users", value: "214",   icon: Activity, color: "#00B4FA", trend: { value: "4%",  isPositive: true  } },
      { title: "New Posts",    value: "1,842", icon: FileText, color: "#F57600", trend: { value: "10%", isPositive: true  } },
    ],
    engagementStats: [
      { title: "Likes This Week",    value: "18.4K", icon: Heart,         color: "#F0AE35", trend: { value: "14%", isPositive: true  } },
      { title: "Comments This Week", value: "4,231", icon: MessageCircle, color: "#0060A9", trend: { value: "3%",  isPositive: false } },
      { title: "Reposts This Week",  value: "891",   icon: Repeat2,       color: "#00B4FA", trend: { value: "9%",  isPositive: true  } },
    ],
    chart: {
      label: "Daily activity this week",
      bars: [
        { label: "Mon", users: 38,  posts: 210, likes: 1800 },
        { label: "Tue", users: 52,  posts: 280, likes: 2400 },
        { label: "Wed", users: 45,  posts: 255, likes: 2100 },
        { label: "Thu", users: 61,  posts: 310, likes: 2900 },
        { label: "Fri", users: 57,  posts: 292, likes: 2700 },
        { label: "Sat", users: 44,  posts: 250, likes: 2300 },
        { label: "Sun", users: 15,  posts: 245, likes: 2200 },
      ],
    },
    activity: [
      { action: "Peak activity on Thursday",    time: "2 days ago", color: "#0060A9" },
      { action: "312 new signups",              time: "This week",  color: "#F57600" },
      { action: "Viral post: Adobo tips",       time: "3 days ago", color: "#00B4FA" },
      { action: "Moderation action taken",      time: "Yesterday",  color: "#F0AE35" },
    ],
  },

  Month: {
    mainStats: [
      { title: "Total Users",  value: "12,458", icon: Users,    color: "#0060A9", trend: { value: "12%", isPositive: true  } },
      { title: "Active Users", value: "8,234",  icon: Activity, color: "#00B4FA", trend: { value: "8%",  isPositive: true  } },
      { title: "Total Posts",  value: "45,892", icon: FileText, color: "#F57600", trend: { value: "15%", isPositive: true  } },
    ],
    engagementStats: [
      { title: "Total Likes",    value: "234K",   icon: Heart,         color: "#F0AE35", trend: { value: "23%", isPositive: true  } },
      { title: "Comments",       value: "89,432", icon: MessageCircle, color: "#0060A9", trend: { value: "5%",  isPositive: false } },
      { title: "Reposts",        value: "23,891", icon: Repeat2,       color: "#00B4FA", trend: { value: "18%", isPositive: true  } },
    ],
    chart: {
      label: "Weekly activity this month",
      bars: [
        { label: "Wk 1", users: 2800, posts: 9800,  likes: 52000 },
        { label: "Wk 2", users: 3100, posts: 11200, likes: 61000 },
        { label: "Wk 3", users: 3400, posts: 12800, likes: 68000 },
        { label: "Wk 4", users: 3158, posts: 12092, likes: 53000 },
      ],
    },
    activity: [
      { action: "New user registration", time: "5 mins ago",  color: "#0060A9" },
      { action: "Post published",        time: "12 mins ago", color: "#F57600" },
      { action: "Comment added",         time: "18 mins ago", color: "#00B4FA" },
      { action: "Profile updated",       time: "25 mins ago", color: "#F0AE35" },
    ],
  },

  Year: {
    mainStats: [
      { title: "Total Users",  value: "148K",  icon: Users,    color: "#0060A9", trend: { value: "54%", isPositive: true } },
      { title: "Active Users", value: "98.7K", icon: Activity, color: "#00B4FA", trend: { value: "42%", isPositive: true } },
      { title: "Total Posts",  value: "541K",  icon: FileText, color: "#F57600", trend: { value: "67%", isPositive: true } },
    ],
    engagementStats: [
      { title: "Total Likes",  value: "2.8M",  icon: Heart,         color: "#F0AE35", trend: { value: "78%", isPositive: true } },
      { title: "Comments",     value: "1.07M", icon: MessageCircle, color: "#0060A9", trend: { value: "34%", isPositive: true } },
      { title: "Reposts",      value: "286K",  icon: Repeat2,       color: "#00B4FA", trend: { value: "49%", isPositive: true } },
    ],
    chart: {
      label: "Monthly activity this year",
      bars: [
        { label: "Jan", users: 8200,  posts: 31000, likes: 160000 },
        { label: "Feb", users: 9100,  posts: 34000, likes: 178000 },
        { label: "Mar", users: 10400, posts: 39000, likes: 204000 },
        { label: "Apr", users: 11800, posts: 43000, likes: 231000 },
        { label: "May", users: 13200, posts: 49000, likes: 258000 },
        { label: "Jun", users: 15100, posts: 57000, likes: 302000 },
        { label: "Jul", users: 18400, posts: 68000, likes: 371000 },
        { label: "Aug", users: 16200, posts: 61000, likes: 334000 },
        { label: "Sep", users: 14900, posts: 56000, likes: 307000 },
        { label: "Oct", users: 13700, posts: 52000, likes: 281000 },
        { label: "Nov", users: 12400, posts: 48000, likes: 256000 },
        { label: "Dec", users: 14600, posts: 54000, likes: 298000 },
      ],
    },
    activity: [
      { action: "Record signups in July",      time: "8 months ago", color: "#0060A9" },
      { action: "1M likes milestone reached",  time: "6 months ago", color: "#F57600" },
      { action: "Mobile app launched",         time: "4 months ago", color: "#00B4FA" },
      { action: "Community guidelines update", time: "2 months ago", color: "#F0AE35" },
    ],
  },
};

/* ── Mini bar chart ──────────────────────────────────────────────────── */
const METRICS = [
  { key: "users", label: "Users",  color: "#0060A9" },
  { key: "posts", label: "Posts",  color: "#F57600" },
  { key: "likes", label: "Likes",  color: "#F0AE35" },
];

function BarChart({ chartData, period }) {
  const [activeMetric, setActiveMetric] = useState("users");
  const metric  = METRICS.find(m => m.key === activeMetric);
  const values  = chartData.bars.map(b => b[activeMetric]);
  const maxVal  = Math.max(...values) || 1;

  return (
    <div>
      {/* Metric toggle */}
      <div className="flex gap-2 mb-4">
        {METRICS.map(m => (
          <button
            key={m.key}
            onClick={() => setActiveMetric(m.key)}
            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border-2
              ${activeMetric === m.key
                ? "text-white border-transparent shadow-sm"
                : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"}`}
            style={activeMetric === m.key ? { backgroundColor: m.color, borderColor: m.color } : {}}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Bars */}
      <div className="flex items-end gap-1 h-36">
        {chartData.bars.map((bar, i) => {
          const pct = (bar[activeMetric] / maxVal) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="relative w-full flex items-end justify-center" style={{ height: "110px" }}>
                {/* Tooltip */}
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-gray-900 text-white text-[9px] font-bold px-2 py-1 rounded-lg whitespace-nowrap">
                    {bar[activeMetric].toLocaleString()}
                  </div>
                </div>
                <motion.div
                  key={`${period}-${activeMetric}-${i}`}
                  initial={{ height: 0 }}
                  animate={{ height: `${pct}%` }}
                  transition={{ duration: 0.5, delay: i * 0.04, ease: "easeOut" }}
                  className="w-full rounded-t-lg cursor-pointer group-hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: metric.color, minHeight: 4 }}
                />
              </div>
              <span className="text-[9px] text-gray-400 font-bold">{bar.label}</span>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-gray-400 font-medium mt-2 text-center">{chartData.label}</p>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */
export default function Statistics() {
  const [period, setPeriod] = useState("Month");
  const data = DATA[period];

  return (
    <div className="min-h-screen bg-[#FDFCF9] p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <motion.h1 initial={{ x: -20 }} animate={{ x: 0 }}
            className="text-4xl font-black text-[#0060A9] mb-2 tracking-tighter uppercase">
            Statistics
          </motion.h1>
          <p className="text-gray-500 font-medium">Comprehensive platform analytics and metrics</p>
        </div>

        {/* Period Selector */}
        <div className="mb-6 flex gap-2">
          {["Today", "Week", "Month", "Year"].map((p) => (
            <motion.button
              key={p}
              onClick={() => setPeriod(p)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                period === p
                  ? "bg-gradient-to-r from-[#0060A9] to-[#00B4FA] text-white shadow-lg shadow-blue-900/20"
                  : "bg-white border-2 border-gray-100 text-gray-600 hover:border-[#0060A9]"
              }`}
            >
              {p}
            </motion.button>
          ))}
        </div>

        {/* User Metrics */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`user-${period}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="mb-8"
          >
            <h2 className="text-lg font-black text-gray-900 mb-4 uppercase tracking-tight flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-[#0060A9] to-[#00B4FA] rounded-full" />
              User Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.mainStats.map((stat, i) => (
                <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <StatCard {...stat} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Engagement Metrics */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`engagement-${period}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, delay: 0.05 }}
            className="mb-8"
          >
            <h2 className="text-lg font-black text-gray-900 mb-4 uppercase tracking-tight flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-[#F57600] to-[#F0AE35] rounded-full" />
              Engagement Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.engagementStats.map((stat, i) => (
                <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 + 0.24 }}>
                  <StatCard {...stat} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Charts + Activity */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`charts-${period}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Bar Chart */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-[#0060A9] uppercase tracking-tight">Growth Trend</h3>
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <BarChart chartData={data.chart} period={period} />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-[#0060A9] uppercase tracking-tight">
                  {period === "Today" ? "Today's Activity" :
                   period === "Week"  ? "This Week" :
                   period === "Month" ? "This Month" : "This Year"}
                </h3>
                <Calendar className="text-[#F57600]" size={20} />
              </div>
              <div className="space-y-3">
                {data.activity.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.08 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all"
                  >
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">{item.action}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{item.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}