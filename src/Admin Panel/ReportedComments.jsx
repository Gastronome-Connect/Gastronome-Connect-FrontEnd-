import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MessageSquareWarning } from "lucide-react";
import ReportedCommentCard from "./ReportedCommentCards";

const MOCK_REPORTED = [
  {
    id: 1,
    type: "comment",
    author: "TrollAccount",
    avatar: "",
    reportedBy: "Maria Santos",
    category: "Harassment",
    text: "This recipe is absolute garbage, just like the person who posted it. Go back to cooking school you moron.",
    postTitle: "My Special Adobo Recipe",
    reportedAt: "March 18, 2026",
    reportCount: 5,
  },
  {
    id: 2,
    type: "reply",
    author: "SpamReply99",
    avatar: "",
    reportedBy: "Juan Dela Cruz",
    category: "Spam",
    text: "Check out my profile for FREE recipe ebooks! LIMITED TIME OFFER. DM me now!!! 🔥🔥🔥",
    postTitle: "Homemade Kare-Kare",
    reportedAt: "March 17, 2026",
    reportCount: 3,
  },
  {
    id: 3,
    type: "comment",
    author: "HateUser123",
    avatar: "",
    reportedBy: "Ana Reyes",
    category: "Hate Speech",
    text: "People who eat this kind of food are uncivilized. This is why your country is a mess.",
    postTitle: "Traditional Sinigang",
    reportedAt: "March 16, 2026",
    reportCount: 11,
  },
  {
    id: 4,
    type: "reply",
    author: "FakeNews2026",
    avatar: "",
    reportedBy: "Abdul Jakul",
    category: "False Information",
    text: "Actually adding MSG to food causes cancer. Science proved this. Anyone who says otherwise is lying to you.",
    postTitle: "Fried Rice Tips & Tricks",
    reportedAt: "March 15, 2026",
    reportCount: 2,
  },
  {
    id: 5,
    type: "comment",
    author: "BullyBob",
    avatar: "",
    reportedBy: "Emma Wilson",
    category: "Harassment",
    text: "You clearly have no idea what you're doing. This is the worst cooking channel I've ever seen. Please stop.",
    postTitle: "Beginner's Guide to Filipino Cuisine",
    reportedAt: "March 14, 2026",
    reportCount: 6,
  },
];

const CATEGORIES = ["All", "Spam", "Hate Speech", "False Information", "Harassment"];

export default function ReportedComments() {
  const [items, setItems]         = useState(MOCK_REPORTED);
  const [searchTerm, setSearch]   = useState("");
  const [activeFilter, setFilter] = useState("All");

  const filtered = items.filter((i) => {
    const matchSearch = i.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        i.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = activeFilter === "All" || i.category === activeFilter;
    return matchSearch && matchFilter;
  });

  const remove = (id) => setItems((prev) => prev.filter((x) => x.id !== id));

  return (
    <div className="min-h-screen bg-[#FDFCF9] p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <motion.h1 initial={{ x: -20 }} animate={{ x: 0 }}
            className="text-4xl font-black text-[#0060A9] mb-2 tracking-tighter uppercase">
            Reported Comments
          </motion.h1>
          <p className="text-gray-500 font-medium">Review reported comments and replies from the community</p>
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
                  ({items.filter((i) => i.category === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Reported</p>
            <p className="text-2xl font-black text-[#0060A9]">{items.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Showing</p>
            <p className="text-2xl font-black text-[#F57600]">{filtered.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Removed</p>
            <p className="text-2xl font-black text-green-600">{MOCK_REPORTED.length - items.length}</p>
          </div>
        </div>

        {/* Cards grid */}
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <MessageSquareWarning size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-400 font-bold">No reported comments found</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}