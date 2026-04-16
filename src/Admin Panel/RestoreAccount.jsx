import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import RestoreAccountCard from "./RestoreAccountCard";
import adminApi from "../utils/adminApi";
import { SkeletonAdminCardList } from "../components/Skeletons";

const CATEGORIES = ["All", "User Request", "Accidental", "Compromised"];

export default function RestoreAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [initialTotal, setInitialTotal] = useState(0);
  const [searchTerm, setSearch] = useState("");
  const [activeFilter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await adminApi.get("/admin/deleted-accounts");
        setAccounts(response.data);
        setInitialTotal(response.data.length);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch accounts.");
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleRestore = async (id) => {
    try {
      await adminApi.post("/admin/restore-account", { userId: id });
      setAccounts((a) => a.filter((x) => x.id !== id));
    } catch (err) {
      alert("Failed to restore account.");
    }
  };

  const filtered = accounts.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = activeFilter === "All" || a.category === activeFilter;
    return matchSearch && matchFilter;
  });

  if (error) {
    return <div>Error: {error}</div>;
  }

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
            Restore Accounts
          </motion.h1>
          <p className="text-gray-500 font-medium">
            Recover deleted accounts and restore user data
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
                ${
                  activeFilter === cat
                    ? "bg-gradient-to-r from-[#0060A9] to-[#00B4FA] text-white shadow-sm shadow-blue-200"
                    : "bg-white border border-gray-200 text-gray-500 hover:border-[#0060A9] hover:text-[#0060A9]"
                }`}
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
        {!loading && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">
                Restore Requests
              </p>
              <p className="text-2xl font-black text-[#F57600]">
                {accounts.length}
              </p>
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
                Restored Today
              </p>
              <p className="text-2xl font-black text-green-600">
                {initialTotal - accounts.length}
              </p>
            </div>
          </div>
        )}

        {/* Account List */}
        {loading ? (
          <SkeletonAdminCardList count={5} />
        ) : (
          <>
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
          </>
        )}
      </motion.div>
    </div>
  );
}
