import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Flag } from "lucide-react";
import FlaggedPostCard from "./FlaggedPostCards";
import { SkeletonAdminCardList } from "../components/Skeletons";
import adminApi from "../utils/adminApi";
import {
  subscribe,
  getSnapshot,
  removePostReport,
  syncReportedPosts,
} from "../Store/ReportStore";

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

export default function FlaggedPosts() {
  const [posts, setPosts] = useState(() => getSnapshot().posts ?? []);
  const [initialTotal, setInitialTotal] = useState(
    () => (getSnapshot().posts ?? []).length,
  );
  const [searchTerm, setSearch] = useState("");
  const [activeFilter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = subscribe(() => {
      const snap = getSnapshot();
      setPosts([...(snap.posts ?? [])]);
    });
    return unsub;
  }, []);

  useEffect(() => {
    setInitialTotal((prev) => Math.max(prev, posts.length));
  }, [posts.length]);

  useEffect(() => {
    let isMounted = true;

    const fetchPosts = async (showLoading = false) => {
      try {
        if (showLoading && isMounted) {
          setLoading(true);
        }

        const response = await adminApi.get("/admin/flagged-posts");
        if (!isMounted) {
          return;
        }

        const nextPosts = Array.isArray(response.data) ? response.data : [];
        const localReportedPosts = getSnapshot().posts ?? [];
        const mergedPosts =
          nextPosts.length > 0
            ? [
                ...nextPosts,
                ...localReportedPosts.filter(
                  (localPost) =>
                    !nextPosts.some(
                      (serverPost) =>
                        (serverPost.postId || serverPost.id) ===
                        (localPost.postId || localPost.id),
                    ),
                ),
              ]
            : localReportedPosts;

        syncReportedPosts(mergedPosts);
        setPosts(mergedPosts);
        setInitialTotal((prev) => Math.max(prev, mergedPosts.length));
        setError(null);
        setLoading(false);
      } catch (err) {
        if (!isMounted) {
          return;
        }
        setError(null);
        setLoading(false);
      }
    };

    const handleFocus = () => {
      fetchPosts();
    };

    fetchPosts(true);
    const intervalId = window.setInterval(() => fetchPosts(), 15000);
    window.addEventListener("focus", handleFocus);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // ── Admin actions ────────────────────────────────────────────────────────────
  const handleKeep = useCallback(async (postId) => {
    try {
      await adminApi.post("/admin/moderation/resolve", {
        type: "post",
        postId,
        action: "approve",
        notes: "Approved by admin.",
      });
    } catch (err) {}
    removePostReport(postId);
  }, []);

  const handleRemove = useCallback(async (postId) => {
    try {
      await adminApi.post("/admin/moderation/resolve", {
        type: "post",
        postId,
        action: "reject",
        notes: "Rejected by admin.",
      });
    } catch (err) {}
    removePostReport(postId);
  }, []);

  // ── Filtering ────────────────────────────────────────────────────────────────
  const filtered = posts.filter((post) => {
    const matchSearch =
      (post.author || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.caption || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.detail || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter =
      activeFilter === "all" || post.categoryId === activeFilter;
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
            Flagged Posts
          </motion.h1>
          <p className="text-gray-500 font-medium">
            Review and act on posts reported by users
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
              {/* Show count badge on non-active bubbles so admin can see at a glance */}
              {cat.id !== "all" &&
                (() => {
                  const count = posts.filter(
                    (p) => p.categoryId === cat.id,
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
        {!loading && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">
                Review Queue
              </p>
              <p className="text-2xl font-black text-red-500">{posts.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">
                Showing
              </p>
              <p className="text-2xl font-black text-[#0060A9]">
                {filtered.length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">
                Processed
              </p>
              <p className="text-2xl font-black text-[#F57600]">
                {initialTotal - posts.length}
              </p>
            </div>
          </div>
        )}

        {/* Cards */}
        {loading ? (
          <SkeletonAdminCardList count={5} />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((post) => (
                  <FlaggedPostCard
                    key={post.id}
                    post={post}
                    onKeep={() => handleKeep(post.postId || post.id)}
                    onRemove={() => handleRemove(post.postId || post.id)}
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
                  <Flag size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-400 font-bold">
                  {posts.length === 0
                    ? "No reported posts yet — they'll appear here when users flag content."
                    : "No flagged posts match your search or filter."}
                </p>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
