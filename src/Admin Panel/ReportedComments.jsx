import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MessageSquareWarning } from "lucide-react";
import ReportedCommentCard from "./ReportedCommentCards";
import adminApi from "../utils/adminApi";
import { SkeletonAdminCardList } from "../components/Skeletons";

// ─── The 7 canonical filter categories ───────────────────────────────────────
const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "spam", label: "Spam or Misleading" },
  { id: "harassment", label: "Harassment or Bullying" },
  { id: "hate", label: "Hate Speech" },
  { id: "violence", label: "Violence or Dangerous Content" },
  { id: "false", label: "False Information" },
  { id: "nudity", label: "Nudity or Sexual Content" },
  { id: "other", label: "Others" },
];

export default function ReportedComments() {
  const [items, setItems] = useState([]);
  const [initialTotal, setInitialTotal] = useState(0);
  const [searchTerm, setSearch] = useState("");
  const [activeFilter, setFilter] = useState("all");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchComments = async (showLoading = false) => {
      try {
        if (showLoading && isMounted) {
          setLoading(true);
        }

        const response = await adminApi.get("/admin/reports", {
          params: { targetType: "comment,reply", status: "pending" },
        });
        if (!isMounted) {
          return;
        }

        const nextItems = Array.isArray(response.data) ? response.data : [];
        setItems(nextItems);
        setInitialTotal((prev) => Math.max(prev, nextItems.length));
        setError(null);
        setLoading(false);
      } catch (err) {
        if (!isMounted) {
          return;
        }
        setError("Failed to fetch flagged comments.");
        setLoading(false);
      }
    };

    const handleFocus = () => {
      fetchComments();
    };

    fetchComments(true);
    const intervalId = window.setInterval(() => fetchComments(), 15000);
    window.addEventListener("focus", handleFocus);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // ── Admin actions ────────────────────────────────────────────────────────────
  const handleKeep = useCallback(async (item) => {
    try {
      await adminApi.patch(`/admin/reports/${item.id}`, {
        action: "keep",
        notes: "Approved by admin.",
      });
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } catch (err) {
      setError("Failed to approve flagged comment.");
    }
  }, []);

  const handleRemove = useCallback(async (item) => {
    try {
      await adminApi.patch(`/admin/reports/${item.id}`, {
        action: "remove",
        notes: "Rejected by admin.",
      });
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } catch (err) {
      setError("Failed to reject flagged comment.");
    }
  }, []);

  // ── Filtering ────────────────────────────────────────────────────────────────
  const filtered = items.filter((item) => {
    const matchSearch =
      (item.author || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.text || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.detail || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter =
      activeFilter === "all" || item.categoryId === activeFilter;
    return matchSearch && matchFilter;
  });

  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-[#FDFCF9] p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <motion.h1
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="text-4xl font-black text-[#0060A9] mb-2 tracking-tighter uppercase"
          >
            Reported Comments
          </motion.h1>
          <p className="text-gray-500 font-medium">
            Review comments and replies reported by users
          </p>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by author or content..."
              value={searchTerm}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-100 focus:border-[#0060A9] focus:outline-none text-sm font-medium transition-all bg-white"
            />
          </div>
        </div>

        {/* ── Category filter bubbles ── */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                activeFilter === cat.id
                  ? "bg-gradient-to-r from-[#0060A9] to-[#00B4FA] text-white shadow-sm shadow-blue-200"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-[#0060A9] hover:text-[#0060A9]"
              }`}
            >
              {cat.label}
              {cat.id !== "all" &&
                (() => {
                  const count = items.filter(
                    (i) => i.categoryId === cat.id,
                  ).length;
                  return count > 0 ? (
                    <span
                      className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                        activeFilter === cat.id
                          ? "bg-white/30 text-white"
                          : "bg-red-100 text-red-500"
                      }`}
                    >
                      {count}
                    </span>
                  ) : null;
                })()}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Review Queue
            </p>
            <p className="text-2xl font-black text-[#0060A9]">{items.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Showing
            </p>
            <p className="text-2xl font-black text-[#F57600]">
              {filtered.length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Processed
            </p>
            <p className="text-2xl font-black text-green-600">
              {initialTotal - items.length}
            </p>
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <SkeletonAdminCardList count={5} />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((item) => (
                  <ReportedCommentCard
                    key={item.id}
                    item={item}
                    onKeep={() => handleKeep(item)}
                    onRemove={() => handleRemove(item)}
                  />
                ))}
              </AnimatePresence>
            </div>

            {filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <MessageSquareWarning size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-400 font-bold">
                  {items.length === 0
                    ? "No reported comments yet — they'll appear here when users flag content."
                    : "No reported comments match your search or filter."}
                </p>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
