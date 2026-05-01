import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShieldCheck,
  BarChart3,
  LogOut,
  Clock,
  RefreshCw,
  Flag,
  MessageSquareWarning,
  UsersRound,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import LogoutModal from "./AdminLogOutModal";
import { useNotifications } from "../Context/NotificationContext";

const AUTH_STATE_EVENT = "auth-state-changed";

export default function AdminSidebar({ onCollapse }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const { unreadCount, isAdminSession } = useNotifications();

  const toggle = () => {
    setCollapsed((c) => {
      onCollapse?.(!c);
      return !c;
    });
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin",
    },
    {
      id: "timeout",
      label: "Timeout Users",
      icon: Clock,
      path: "/admin/timeout",
    },
    {
      id: "restore",
      label: "Restore Account",
      icon: RefreshCw,
      path: "/admin/restore",
    },
    {
      id: "flagged",
      label: "Flagged Posts",
      icon: Flag,
      path: "/admin/flagged",
    },
    {
      id: "reported",
      label: "Reported Comments",
      icon: MessageSquareWarning,
      path: "/admin/reported",
    },
    {
      id: "profiles",
      label: "Reported Profiles",
      icon: UsersRound,
      path: "/admin/reported-profiles",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      path: "/admin/notifications",
      badgeCount: isAdminSession ? unreadCount : 0,
    },
    {
      id: "statistics",
      label: "Statistics",
      icon: BarChart3,
      path: "/admin/statistics",
    },
  ];

  const handleLogout = () => {
    setShowLogout(false);
    localStorage.removeItem("adminAccessToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    window.dispatchEvent(new Event(AUTH_STATE_EVENT));
    navigate("/", { replace: true });
  };

  return (
    <>
      {/* Outer wrapper just reserves the layout width */}
      <div
        className="relative shrink-0"
        style={{ width: collapsed ? 72 : 240, transition: "width 0.25s ease" }}
      >
        <motion.aside
          animate={{ width: collapsed ? 72 : 240 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="h-screen bg-white border-r-2 border-gray-100 flex flex-col sticky top-0 overflow-visible"
          style={{ width: collapsed ? 72 : 240 }}
        >
          {/* ── Floating circular chevron — inside the sticky aside so it never scrolls away ── */}
          <button
            onClick={toggle}
            className="absolute top-[32px] -right-[14px] z-50 w-7 h-7 rounded-full bg-white border-2 border-gray-200 shadow-md flex items-center justify-center text-gray-500 hover:text-[#0060A9] hover:border-[#0060A9] transition-all"
          >
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>

          {/* ── Header ── */}
          <div className="h-[64px] border-b-2 border-gray-100 flex items-center px-3 shrink-0 overflow-hidden">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0060A9] to-[#00B4FA] flex items-center justify-center shadow-md shrink-0">
                <ShieldCheck
                  size={18}
                  className="text-white"
                  strokeWidth={2.5}
                />
              </div>
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.div
                    key="logo-text"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    <p className="text-[11px] font-black text-[#0060A9] uppercase tracking-tight leading-tight">
                      Admin Panel
                    </p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                      Gastronome
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Nav ── */}
          <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  whileTap={{ scale: 0.97 }}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all
                    ${collapsed ? "justify-center" : ""}
                    ${
                      isActive
                        ? "bg-gradient-to-r from-[#0060A9] to-[#00B4FA] text-white shadow-md shadow-blue-900/20"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                >
                  <Icon size={17} strokeWidth={2.5} className="shrink-0" />
                  <AnimatePresence initial={false}>
                    {!collapsed && (
                      <motion.span
                        key="label"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.18 }}
                        className="text-[11px] font-black uppercase tracking-wider whitespace-nowrap overflow-hidden flex-1 text-left"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {!collapsed && Number(item.badgeCount || 0) > 0 && (
                    <span className="ml-auto min-w-[20px] rounded-full bg-[#F57600] px-1.5 py-0.5 text-center text-[10px] font-black text-white">
                      {item.badgeCount}
                    </span>
                  )}
                  {!collapsed && isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-[#F57600] shrink-0"
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* ── User + Logout ── */}
          <div className="p-2 border-t-2 border-gray-100 space-y-1.5 shrink-0">
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  key="user-info"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-gray-50 overflow-hidden"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F57600] to-[#F0AE35] flex items-center justify-center text-white font-black text-sm shrink-0">
                    A
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-gray-900 truncate">
                      Admin User
                    </p>
                    <p className="text-[9px] text-gray-400 font-bold">
                      Super Admin
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => setShowLogout(true)}
              aria-label="Open admin logout modal"
              title={collapsed ? "Logout" : undefined}
              className="w-full py-2.5 rounded-xl bg-red-50 text-red-600 text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
            >
              <LogOut size={14} className="shrink-0" />
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    key="logout-label"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </motion.aside>
      </div>

      <AnimatePresence>
        {showLogout && (
          <LogoutModal
            onConfirm={handleLogout}
            onCancel={() => setShowLogout(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
