import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import TimeoutUserCard from "./TimeoutUserCard";
import adminApi from "../utils/adminApi";
import { SkeletonAdminCardList } from "../components/Skeletons";

const CATEGORIES = [
  "All",
  "Spam",
  "Inappropriate",
  "Harassment",
  "Hate Speech",
  "Other",
];

export default function TimeoutUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearch] = useState("");
  const [activeFilter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await adminApi.get("/admin/timeout-users");
        const mappedUsers = response.data.map((user) => ({
          id: user._id || user.id,
          name: user.username || user.name || "Unknown User",
          email: user.email || "No email",
          timeoutReason: user.timeoutReason || "No reason provided",
          timeoutDate: user.timeoutDate
            ? new Date(user.timeoutDate).toLocaleDateString()
            : "Unknown date",
          avatar: user.avatar || "",
          category: user.category || "Other",
        }));
        setUsers(mappedUsers);
      } catch (err) {
        setError("Failed to load timeout users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const updateTimeout = async (id, action) => {
    try {
      await adminApi.post("/admin/timeout-users", { userId: id, action });
      setUsers((currentUsers) => currentUsers.filter((user) => user.id !== id));
    } catch (err) {
      setError(`Failed to ${action} timeout user.`);
    }
  };

  const filtered = users.filter((user) => {
    const matchSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter =
      activeFilter === "All" || user.category === activeFilter;
    return matchSearch && matchFilter;
  });

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
            Timeout Users
          </motion.h1>
          <p className="text-gray-500 font-medium">
            Review and manage users in timeout status
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
              placeholder="Search by name or email..."
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
              {cat !== "All" && (
                <span className="ml-1.5 opacity-60">
                  ({users.filter((user) => user.category === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {!loading && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">
                Total Timeout
              </p>
              <p className="text-2xl font-black text-[#0060A9]">{users.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">
                Showing
              </p>
              <p className="text-2xl font-black text-green-600">
                {filtered.length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">
                Pending Review
              </p>
              <p className="text-2xl font-black text-[#F57600]">{users.length}</p>
            </div>
          </div>
        )}

        {loading ? (
          <SkeletonAdminCardList count={5} />
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((user) => (
                <TimeoutUserCard
                  key={user.id}
                  user={user}
                  onApprove={() => updateTimeout(user.id, "approve")}
                  onReject={() => updateTimeout(user.id, "reject")}
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
        )}
      </motion.div>
    </div>
  );
}
