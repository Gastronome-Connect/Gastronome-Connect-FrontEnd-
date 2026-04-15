import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MessageSquareWarning } from "lucide-react";
import ReportedCommentCard from "./ReportedCommentCards";
import adminApi from "../utils/adminApi";

const CATEGORIES = ["All", "Comment"];

export default function ReportedComments() {
  const [items, setItems] = useState([]);
  const [initialTotal, setInitialTotal] = useState(0);
  const [searchTerm, setSearch] = useState("");
  const [activeFilter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await adminApi.get("/posts");
        const mappedItems = response.data.flatMap((post) =>
          (post.comments || []).map((comment) => ({
            id: comment._id || `${post.id || post._id}-${comment.createdAt}`,
            type: "comment",
            author: comment.username || "Unknown",
            avatar: comment.avatar || "",
            reportedBy: "System Review",
            category: "Comment",
            text: comment.text || "",
            postTitle: post.title || post.caption || "Untitled post",
            reportedAt: comment.createdAt
              ? new Date(comment.createdAt).toLocaleDateString()
              : "",
            reportCount: 1,
          })),
        );
        setItems(mappedItems);
        setInitialTotal(mappedItems.length);
      } catch (err) {
        setError("Failed to fetch comments.");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, []);

  const remove = (id) =>
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));

  const filtered = items.filter((item) => {
    const matchSearch =
      item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter =
      activeFilter === "All" || item.category === activeFilter;
    return matchSearch && matchFilter;
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-[#FDFCF9] p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="mb-8">
          <motion.h1
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="text-4xl font-black text-[#0060A9] mb-2 tracking-tighter uppercase"
          >
            Reported Comments
          </motion.h1>
          <p className="text-gray-500 font-medium">
            Review comments pulled from the moderation queue
          </p>
        </div>

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

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                activeFilter === cat
                  ? "bg-gradient-to-r from-[#0060A9] to-[#00B4FA] text-white shadow-sm shadow-blue-200"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-[#0060A9] hover:text-[#0060A9]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <ReportedCommentCard
                key={item.id}
                item={item}
                onKeep={() => remove(item.id)}
                onRemove={() => remove(item.id)}
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
              No reported comments found
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
