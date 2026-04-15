import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Activity,
  FileText,
  Heart,
  MessageCircle,
  Repeat2,
  Calendar,
} from "lucide-react";
import StatCard from "./StatCard";
import adminApi from "../utils/adminApi";

const buildPeriodStats = (label, totals) => {
  const suffix =
    label === "Today"
      ? "Today"
      : label === "Week"
        ? "This Week"
        : label === "Year"
          ? "This Year"
          : "Total";
  return [
    {
      title: `Users ${suffix}`,
      value: totals.totalUsers,
      icon: Users,
      color: "#0060A9",
      trend: { value: "Live", isPositive: true },
    },
    {
      title: `Active ${suffix}`,
      value: totals.activeUsers,
      icon: Activity,
      color: "#00B4FA",
      trend: { value: "Live", isPositive: true },
    },
    {
      title: `Posts ${suffix}`,
      value: totals.totalPosts,
      icon: FileText,
      color: "#F57600",
      trend: { value: "Live", isPositive: true },
    },
    {
      title: `Likes ${suffix}`,
      value: totals.totalLikes,
      icon: Heart,
      color: "#F0AE35",
      trend: { value: "Live", isPositive: true },
    },
    {
      title: `Comments ${suffix}`,
      value: totals.totalComments,
      icon: MessageCircle,
      color: "#0060A9",
      trend: { value: "Live", isPositive: true },
    },
    {
      title: `Reposts ${suffix}`,
      value: totals.totalReposts,
      icon: Repeat2,
      color: "#00B4FA",
      trend: { value: "Live", isPositive: true },
    },
  ];
};

export default function Statistics() {
  const [period, setPeriod] = useState("Month");
  const [statsByPeriod, setStatsByPeriod] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashboardResponse, postsResponse] = await Promise.all([
          adminApi.get("/admin/dashboard/stats"),
          adminApi.get("/posts"),
        ]);

        const totals = dashboardResponse.data;
        const now = new Date();
        const posts = postsResponse.data;

        const isToday = (date) => {
          const value = new Date(date);
          return value.toDateString() === now.toDateString();
        };

        const isThisWeek = (date) => {
          const value = new Date(date);
          const diff = (now - value) / (1000 * 60 * 60 * 24);
          return diff >= 0 && diff < 7;
        };

        const isThisMonth = (date) => {
          const value = new Date(date);
          return (
            value.getMonth() === now.getMonth() &&
            value.getFullYear() === now.getFullYear()
          );
        };

        const isThisYear = (date) => {
          const value = new Date(date);
          return value.getFullYear() === now.getFullYear();
        };

        const summarize = (matcher) => {
          const filteredPosts = posts.filter(
            (post) => post.createdAt && matcher(post.createdAt),
          );
          return {
            totalUsers: totals.totalUsers,
            activeUsers: totals.activeUsers,
            totalPosts: filteredPosts.length,
            totalLikes: filteredPosts.reduce(
              (sum, post) => sum + (post.likesCount || 0),
              0,
            ),
            totalComments: filteredPosts.reduce(
              (sum, post) => sum + (post.commentsCount || 0),
              0,
            ),
            totalReposts: filteredPosts.reduce(
              (sum, post) => sum + (post.repostsCount || 0),
              0,
            ),
          };
        };

        setStatsByPeriod({
          Today: buildPeriodStats("Today", summarize(isToday)),
          Week: buildPeriodStats("Week", summarize(isThisWeek)),
          Month: buildPeriodStats("Month", summarize(isThisMonth)),
          Year: buildPeriodStats("Year", summarize(isThisYear)),
        });
      } catch (err) {
        setError("Failed to load statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const cards = statsByPeriod[period] || [];

  return (
    <div className="min-h-screen bg-[#FDFCF9] p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8">
          <motion.h1
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="text-4xl font-black text-[#0060A9] mb-2 tracking-tighter uppercase"
          >
            Statistics
          </motion.h1>
          <p className="text-gray-500 font-medium">
            Live analytics generated from backend dashboard and posts data
          </p>
        </div>

        <div className="mb-6 flex gap-2">
          {["Today", "Week", "Month", "Year"].map((value) => (
            <motion.button
              key={value}
              onClick={() => setPeriod(value)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                period === value
                  ? "bg-gradient-to-r from-[#0060A9] to-[#00B4FA] text-white shadow-lg shadow-blue-900/20"
                  : "bg-white border-2 border-gray-100 text-gray-600 hover:border-[#0060A9]"
              }`}
            >
              {value}
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {cards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-[#0060A9] uppercase tracking-tight">
              Activity Summary
            </h3>
            <Calendar className="text-[#F57600]" size={20} />
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            This screen is now connected to live backend data. Counts are
            computed from the admin dashboard endpoint and filtered post
            activity for the selected period.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
