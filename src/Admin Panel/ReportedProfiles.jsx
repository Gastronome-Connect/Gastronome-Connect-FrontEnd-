import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShieldAlert } from "lucide-react";
import ReportedProfileCard from "./ReportedProfileCards";
import { subscribe, getSnapshot, removeProfileReport } from "../Store/ReportStore";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "fake", label: "Fake Account" },
  { id: "identity_theft", label: "Identity Theft or Impersonation" },
  { id: "scam", label: "Scam or Fraud" },
  { id: "abusive_profile", label: "Abusive Profile Content" },
  { id: "other", label: "Others" },
];

export default function ReportedProfiles() {
  const [items, setItems] = useState(() => getSnapshot().profiles ?? []);
  const [initialTotal, setInitialTotal] = useState(() => (getSnapshot().profiles ?? []).length);
  const [searchTerm, setSearch] = useState("");
  const [activeFilter, setFilter] = useState("all");
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = subscribe(() => {
      const snap = getSnapshot();
      setItems([...(snap.profiles ?? [])]);
    });
    return unsub;
  }, []);

  useEffect(() => {
    setInitialTotal((prev) => Math.max(prev, items.length));
  }, [items.length]);

  const handleKeep = useCallback((id) => {
    removeProfileReport(id);
  }, []);

  const handleRemove = useCallback((id) => {
    try {
      removeProfileReport(id);
    } catch (err) {
      setError("Failed to remove profile.");
    }
  }, []);

  const filtered = items.filter((item) => {
    const author = item.author?.toLowerCase() ?? "";
    const bio = item.bio?.toLowerCase() ?? "";
    const query = searchTerm.toLowerCase();
    const matchSearch = author.includes(query) || bio.includes(query);
    const matchFilter = activeFilter === "all" || item.categoryId === activeFilter;
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
        <div className="mb-8">
          <motion.h1
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="text-4xl font-black text-[#0060A9] mb-2 tracking-tighter uppercase"
          >
            Reported Profiles
          </motion.h1>
          <p className="text-gray-500 font-medium">
            Review users and profiles reported by the community
          </p>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or bio..."
              value={searchTerm}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-100 focus:border-[#0060A9] focus:outline-none text-sm font-medium transition-all bg-white"
            />
          </div>
        </div>

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
              {cat.id !== "all" && (() => {
                const count = items.filter((i) => i.categoryId === cat.id).length;
                return count > 0 ? (
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                      activeFilter === cat.id ? "bg-white/30 text-white" : "bg-red-100 text-red-500"
                    }`}
                  >
                    {count}
                  </span>
                ) : null;
              })()}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Review Queue</p>
            <p className="text-2xl font-black text-[#0060A9]">{items.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Showing</p>
            <p className="text-2xl font-black text-[#F57600]">{filtered.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Processed</p>
            <p className="text-2xl font-black text-green-600">{initialTotal - items.length}</p>
          </div>
        </div>

        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((item) => (
                <ReportedProfileCard
                  key={item.id}
                  item={item}
                  onKeep={() => handleKeep(item.id)}
                  onRemove={() => handleRemove(item.id)}
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
                <ShieldAlert size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-400 font-bold">
                {items.length === 0
                  ? "No reported profiles yet — they'll appear here when users flag accounts."
                  : "No reported profiles match your search or filter."}
              </p>
            </motion.div>
          )}
        </>
      </motion.div>
    </div>
  );
}
