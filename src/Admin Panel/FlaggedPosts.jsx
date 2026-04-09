import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Flag } from "lucide-react";
import FlaggedPostCard from "./FlaggedPostCards";

const MOCK_FLAGGED = [
  {
    id: 1,
    author: "Jason Mercer",
    avatar: "",
    reportedBy: "Maria Santos",
    category: "Spam",
    caption: "Buy cheap followers now! 10k followers for only $5. Click the link in my bio for the best deal you'll ever see.",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
    reportedAt: "March 18, 2026",
    reportCount: 7,
  },
  {
    id: 2,
    author: "Anonymous_99",
    avatar: "",
    reportedBy: "Juan Dela Cruz",
    category: "Hate Speech",
    caption: "This kind of food is disgusting and so are the people who eat it. Absolute garbage culture.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80",
    reportedAt: "March 17, 2026",
    reportCount: 12,
  },
  {
    id: 3,
    author: "FoodScammer",
    avatar: "",
    reportedBy: "Ana Reyes",
    category: "False Information",
    caption: "Eating raw chicken is totally safe! I do it every day. Stop believing the food safety myths spread by the government.",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80",
    reportedAt: "March 16, 2026",
    reportCount: 4,
  },
  {
    id: 4,
    author: "SpamBot2026",
    avatar: "",
    reportedBy: "Abdul Jakul",
    category: "Spam",
    caption: "Win a free KitchenAid mixer! Just share this post to 20 friends and DM me. Limited slots only!",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
    reportedAt: "March 15, 2026",
    reportCount: 9,
  },
  {
    id: 5,
    author: "BullyUser88",
    avatar: "",
    reportedBy: "Emma Wilson",
    category: "Harassment",
    caption: "This chef is a total fraud. Everything they post is garbage. Stop following this clown immediately.",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80",
    reportedAt: "March 14, 2026",
    reportCount: 6,
  },
];

const CATEGORIES = ["All", "Spam", "Hate Speech", "False Information", "Harassment"];

export default function FlaggedPosts() {
  const [posts, setPosts]         = useState(MOCK_FLAGGED);
  const [searchTerm, setSearch]   = useState("");
  const [activeFilter, setFilter] = useState("All");

  const filtered = posts.filter((p) => {
    const matchSearch = p.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.caption.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = activeFilter === "All" || p.category === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-[#FDFCF9] p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <motion.h1 initial={{ x: -20 }} animate={{ x: 0 }}
            className="text-4xl font-black text-[#0060A9] mb-2 tracking-tighter uppercase">
            Flagged Posts
          </motion.h1>
          <p className="text-gray-500 font-medium">Review and act on posts reported by the community</p>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by author or content..."
              value={searchTerm}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-100 focus:border-[#0060A9] focus:outline-none text-sm font-medium transition-all bg-white"
            />
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all
                ${activeFilter === cat
                  ? "bg-gradient-to-r from-[#0060A9] to-[#00B4FA] text-white shadow-sm shadow-blue-200"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-[#0060A9] hover:text-[#0060A9]"}`}
            >
              {cat}
              {cat !== "All" && (
                <span className="ml-1.5 opacity-60">
                  ({posts.filter((p) => p.category === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Flagged Posts</p>
            <p className="text-2xl font-black text-red-500">{posts.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Showing</p>
            <p className="text-2xl font-black text-[#0060A9]">{filtered.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Removed</p>
            <p className="text-2xl font-black text-[#F57600]">{MOCK_FLAGGED.length - posts.length}</p>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((post) => (
              <FlaggedPostCard
                key={post.id}
                post={post}
                onKeep={() => setPosts((p) => p.filter((x) => x.id !== post.id))}
                onRemove={() => setPosts((p) => p.filter((x) => x.id !== post.id))}
              />
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Flag size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-400 font-bold">No flagged posts found</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}