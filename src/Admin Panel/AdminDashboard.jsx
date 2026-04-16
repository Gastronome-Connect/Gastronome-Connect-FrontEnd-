import React, { useState, useEffect } from "react";
import {
  Users,
  Activity,
  FileText,
  Heart,
  MessageCircle,
  Repeat2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import StatCard from "./StatCard";
import adminApi from "../utils/adminApi";
import { SkeletonStats, SkeletonAdminQuickActions } from "../components/Skeletons";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [summary, setSummary] = useState({ timeoutCount: 0, deletedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsResponse, timeoutsResponse, deletedResponse] =
          await Promise.all([
            adminAPI.getDashboardStats(),
            adminAPI.getTimeoutUsers(),
            adminAPI.getDeletedAccounts(),
          ]);
        
        const data = statsResponse.data;
        setStats([
          {
            title: "Total Users",
            value: data.totalUsers,
            icon: Users,
            color: "#0060A9",
            trend: { value: "12%", isPositive: true },
          },
          {
            title: "Active Users",
            value: data.activeUsers,
            icon: Activity,
            color: "#00B4FA",
            trend: { value: "8%", isPositive: true },
          },
          {
            title: "Total Posts",
            value: data.totalPosts,
            icon: FileText,
            color: "#F57600",
            trend: { value: "15%", isPositive: true },
          },
          {
            title: "Total Likes",
            value: data.totalLikes,
            icon: Heart,
            color: "#F0AE35",
            trend: { value: "23%", isPositive: true },
          },
          {
            title: "Comments",
            value: data.totalComments,
            icon: MessageCircle,
            color: "#0060A9",
            trend: { value: "5%", isPositive: false },
          },
          {
            title: "Reposts",
            value: data.totalReposts,
            icon: Repeat2,
            color: "#00B4FA",
            trend: { value: "18%", isPositive: true },
          },
        ]);
        setSummary({
          timeoutCount: timeoutsResponse.data.length,
          deletedCount: deletedResponse.data.length,
        });
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch dashboard statistics.");
        console.error(err);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-[#FDFCF9] p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <motion.h1
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="text-4xl font-black text-[#0060A9] mb-2 tracking-tighter uppercase"
          >
            Dashboard Overview
          </motion.h1>
          <p className="text-gray-500 font-medium">
            Welcome back, Admin! Here's what's happening today.
          </p>
        </div>

        {/* Stats Grid with Skeleton Loading */}
        {loading ? (
          <div className="mb-8">
            <SkeletonStats count={6} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <StatCard {...stat} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Quick Actions with Skeleton Loading */}
        {loading ? (
          <SkeletonAdminQuickActions />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl p-8 border-2 border-gray-100 shadow-lg"
          >
            <h2 className="text-2xl font-black text-[#0060A9] mb-6 uppercase tracking-tight">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/admin/timeout")}
                className="p-6 rounded-xl bg-gradient-to-br from-[#0060A9] to-[#00B4FA] text-white shadow-lg shadow-blue-900/20 text-left"
              >
                <div className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">
                  Moderation
                </div>
                <div className="text-2xl font-black">Review Users</div>
                <div className="text-xs font-medium opacity-90 mt-1">
                  {summary.timeoutCount} pending timeouts
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/admin/restore")}
                className="p-6 rounded-xl bg-gradient-to-br from-[#F57600] to-[#F0AE35] text-white shadow-lg shadow-orange-900/20 text-left"
              >
                <div className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">
                  Recovery
                </div>
                <div className="text-2xl font-black">Restore Accounts</div>
                <div className="text-xs font-medium opacity-90 mt-1">
                  {summary.deletedCount} requests pending
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/admin/statistics")}
                className="p-6 rounded-xl bg-white border-2 border-[#0060A9]/20 shadow-sm text-left hover:border-[#0060A9] transition-all"
              >
                <div className="text-[10px] font-black uppercase tracking-widest mb-2 text-[#0060A9]">
                  Analytics
                </div>
                <div className="text-2xl font-black text-gray-900">
                  View Reports
                </div>
                <div className="text-xs font-medium text-gray-400 mt-1">
                  Last updated 2 mins ago
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
