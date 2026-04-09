import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import TimeoutUserCard from "./TimeoutUserCard";

const MOCK_USERS = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    timeoutReason: "Violated community guidelines - spam posting",
    timeoutDate: "March 8, 2026",
    avatar: "",
    category: "Spam",
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria.santos@example.com",
    timeoutReason: "Inappropriate content shared multiple times",
    timeoutDate: "March 9, 2026",
    avatar: "",
    category: "Inappropriate",
  },
  {
    id: 3,
    name: "Robert Chen",
    email: "robert.chen@example.com",
    timeoutReason: "Harassment of other users reported",
    timeoutDate: "March 10, 2026",
    avatar: "",
    category: "Harassment",
  },
  {
    id: 4,
    name: "Lea Navarro",
    email: "lea.navarro@example.com",
    timeoutReason: "Repeated spam posting in comments",
    timeoutDate: "March 11, 2026",
    avatar: "",
    category: "Spam",
  },
  {
    id: 5,
    name: "Kevin Park",
    email: "kevin.park@example.com",
    timeoutReason: "Hate speech detected in multiple posts",
    timeoutDate: "March 12, 2026",
    avatar: "",
    category: "Hate Speech",
  },
];

const CATEGORIES = ["All", "Spam", "Inappropriate", "Harassment", "Hate Speech"];

export default function TimeoutUsers() {
  const [users, setUsers]         = useState(MOCK_USERS);
  const [searchTerm, setSearch]   = useState("");
  const [activeFilter, setFilter] = useState("All");

  const handleApprove = (id) => setUsers((u) => u.filter((x) => x.id !== id));
  const handleReject  = (id) => setUsers((u) => u.filter((x) => x.id !== id));

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = activeFilter === "All" || u.category === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-[#FDFCF9] p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <motion.h1 initial={{ x: -20 }} animate={{ x: 0 }}
            className="text-4xl font-black text-[#0060A9] mb-2 tracking-tighter uppercase">
            Timeout Users
          </motion.h1>
          <p className="text-gray-500 font-medium">Review and manage users in timeout status</p>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
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
                  ({users.filter(u => u.category === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Timeout</p>
            <p className="text-2xl font-black text-[#0060A9]">{users.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Showing</p>
            <p className="text-2xl font-black text-green-600">{filtered.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Pending Review</p>
            <p className="text-2xl font-black text-[#F57600]">{users.length}</p>
          </div>
        </div>

        {/* User List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((user) => (
              <TimeoutUserCard
                key={user.id}
                user={user}
                onApprove={() => handleApprove(user.id)}
                onReject={() => handleReject(user.id)}
              />
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-400 font-bold">No users found</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}