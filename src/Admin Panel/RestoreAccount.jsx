import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import RestoreAccountCard from "./RestoreAccountCard";

const MOCK_ACCOUNTS = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    deletedDate: "March 5, 2026",
    reason: "User requested account deletion",
    avatar: "",
    category: "User Request",
  },
  {
    id: 2,
    name: "Carlos Rivera",
    email: "carlos.rivera@example.com",
    deletedDate: "March 7, 2026",
    reason: "Accidental deletion - restore requested",
    avatar: "",
    category: "Accidental",
  },
  {
    id: 3,
    name: "Emma Wilson",
    email: "emma.wilson@example.com",
    deletedDate: "March 8, 2026",
    reason: "Account compromised - user wants to restore",
    avatar: "",
    category: "Compromised",
  },
  {
    id: 4,
    name: "David Kim",
    email: "david.kim@example.com",
    deletedDate: "March 9, 2026",
    reason: "Changed mind after deletion",
    avatar: "",
    category: "User Request",
  },
  {
    id: 5,
    name: "Sofia Reyes",
    email: "sofia.reyes@example.com",
    deletedDate: "March 10, 2026",
    reason: "Accidental deletion during account settings update",
    avatar: "",
    category: "Accidental",
  },
];

const CATEGORIES = ["All", "User Request", "Accidental", "Compromised"];

export default function RestoreAccounts() {
  const [accounts, setAccounts]   = useState(MOCK_ACCOUNTS);
  const [searchTerm, setSearch]   = useState("");
  const [activeFilter, setFilter] = useState("All");

  const handleRestore = (id) => setAccounts((a) => a.filter((x) => x.id !== id));

  const filtered = accounts.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        a.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = activeFilter === "All" || a.category === activeFilter;
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
            Restore Accounts
          </motion.h1>
          <p className="text-gray-500 font-medium">Recover deleted accounts and restore user data</p>
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
                  ({accounts.filter((a) => a.category === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Restore Requests</p>
            <p className="text-2xl font-black text-[#F57600]">{accounts.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Showing</p>
            <p className="text-2xl font-black text-[#0060A9]">{filtered.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Restored Today</p>
            <p className="text-2xl font-black text-green-600">{MOCK_ACCOUNTS.length - accounts.length}</p>
          </div>
        </div>

        {/* Account List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((account) => (
              <RestoreAccountCard
                key={account.id}
                account={account}
                onRestore={() => handleRestore(account.id)}
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
              <Search size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-400 font-bold">No accounts found</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}