import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Bell,
  Heart,
  Archive,
  History,
  Search,
  ChevronLeft,
  LogOut,
  Plus,
  Sparkles,
  X,
  MessageSquare,
  ChevronRight,
  Menu,
} from "lucide-react";
import { useChatContext } from "../Context/ChatContext";
import { Trash2 } from "lucide-react";
import { apiFetch, resolveUploadUrl } from "../utils/api";

import LogoImage from "../components/Assets/Gastro.png";
import AILogo from "../components/Assets/AILogo.png";
import SearchBar from "../Feed/SideBarSearchBar";
import CreatePostModal from "../components/Modals/CreatePostModal";
import LogOutModal from "../components/Modals/LogOutModal";
import PopularRecipes from "../components/Feed Components/PopularRecipePanel";

const AUTH_STATE_EVENT = "auth-state-changed";

// ── Shared helpers ────────────────────────────────────────────────────────────
function useUserInfo() {
  const [userName, setUserName] = useState("");
  const [userUsername, setUserUsername] = useState("");
  const [userAvatar, setUserAvatar] = useState(null);

  useEffect(() => {
    const updateFromProfile = (profile = {}) => {
      const nextName = profile.displayName || profile.name || profile.username;
      if (nextName) {
        setUserName(nextName);
      }
      if (profile.username) {
        setUserUsername(profile.username);
      }
      setUserAvatar(
        profile.avatarSrc ? resolveUploadUrl(profile.avatarSrc) : null,
      );
    };

    const fetchUser = async () => {
      try {
        const response = await apiFetch("/api/user");
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Failed to fetch sidebar user");

        setUserName(data.user?.displayName || data.user?.username || "");
        setUserUsername(data.user?.username || "");
        setUserAvatar(resolveUploadUrl(data.user?.avatar || ""));
      } catch (error) {
        console.error("Failed to fetch sidebar user:", error);
      }
    };

    fetchUser();

    const handleProfileUpdated = (e) => updateFromProfile(e.detail || {});
    window.addEventListener("profile-updated", handleProfileUpdated);
    window.addEventListener("storage", fetchUser);
    return () => {
      window.removeEventListener("profile-updated", handleProfileUpdated);
      window.removeEventListener("storage", fetchUser);
    };
  }, []);

  return { userName, userUsername, userAvatar };
}

// ─────────────────────────────────────────────────────────────────────────────
// DESKTOP SIDEBAR (lg+)
// ─────────────────────────────────────────────────────────────────────────────
function DesktopSidebar({ onNewPost, hasNotifications }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { userName, userUsername, userAvatar } = useUserInfo();
  const { sessions, activeSessionId, dispatch } = useChatContext();

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true",
  );
  const [chevronFlipped, setChevronFlipped] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true",
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    sessionId: null,
    sessionTitle: "",
  });

  const prevPathRef = useRef(location.pathname);
  const isHome = location.pathname === "/feed";
  const isProfile = location.pathname === "/profile";
  const wasHome = prevPathRef.current === "/feed";
  const shouldAnimateHeader = isHome !== wasHome;

  useEffect(() => {
    prevPathRef.current = location.pathname;
  }, [location.pathname]);
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", collapsed);
    window.dispatchEvent(new Event("sidebarStateChange"));
  }, [collapsed]);

  const handleToggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    setChevronFlipped(next);
  };

  const allNav = [
    { icon: Home, label: "Home", path: "/feed" },
    { icon: Bell, label: "Notifications", path: "/notifications", badge: true },
    { icon: Heart, label: "Favorites", path: "/favorites" },
    { icon: Archive, label: "Archives", path: "/archives" },
    { icon: History, label: "History", path: "/history" },
  ];

  const blueGradientText =
    "bg-gradient-to-r from-[#0060A9] to-[#00B4FA] bg-clip-text text-transparent";
  const orangeGradientText =
    "bg-gradient-to-r from-[#F57600] to-[#F0AE35] bg-clip-text text-transparent";
  const textTransitionClass = `transition-all duration-400 ease-[0.4,0,0.2,1] overflow-hidden whitespace-nowrap ${
    collapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[200px] opacity-100 ml-3"
  }`;
  const initials = userName ? userName.slice(0, 2).toUpperCase() : "GC";

  return (
    <>
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPost={onNewPost}
      />
      <LogOutModal
        isOpen={showLogoutConfirm}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("adminAccessToken");
          localStorage.removeItem("userId");
          window.dispatchEvent(new Event(AUTH_STATE_EVENT));
          navigate("/login?mode=login", { replace: true });
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <motion.div
        initial={false}
        animate={{ width: collapsed ? 80 : 288 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="relative hidden h-screen bg-white border-r-2 border-[#0060A9] shadow-sm z-[100] lg:flex lg:flex-col"
      >
        {/* Collapse toggle */}
        <button
          onClick={handleToggleCollapse}
          className="absolute -right-4 top-[45%] z-[999] bg-white border-2 border-[#0060A9] text-[#0060A9] rounded-full p-1 shadow-xl hover:bg-blue-50 active:scale-90 flex items-center justify-center"
          style={{ width: 32, height: 32 }}
        >
          <ChevronLeft
            size={20}
            style={{
              transform: chevronFlipped ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          />
        </button>

        <div className="flex flex-col h-full w-full overflow-hidden">
          {/* Header */}
          <div className="p-4 flex flex-col items-center z-20">
            <div className="flex items-center mb-6 h-12 w-full">
              <div className="w-[48px] h-12 flex items-center justify-center flex-shrink-0">
                <img
                  src={LogoImage}
                  alt="Gastro Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div className={`${textTransitionClass} flex-1 relative h-12`}>
                <AnimatePresence mode="wait">
                  {isHome ? (
                    <motion.div
                      key="logo-text"
                      initial={
                        shouldAnimateHeader ? { opacity: 0, x: -15 } : false
                      }
                      animate={{ opacity: 1, x: 0 }}
                      exit={
                        shouldAnimateHeader ? { opacity: 0, x: -15 } : false
                      }
                      transition={{ duration: 0.25 }}
                      className="absolute inset-0 flex items-center pointer-events-none"
                    >
                      <h1 className="text-[15px] font-black tracking-tighter leading-none min-w-[180px]">
                        <span className={blueGradientText}>GASTRONOME </span>
                        <span className={orangeGradientText}>CONNECT</span>
                      </h1>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="search-bar"
                      initial={
                        shouldAnimateHeader ? { opacity: 0, x: 15 } : false
                      }
                      animate={{ opacity: 1, x: 0 }}
                      exit={shouldAnimateHeader ? { opacity: 0, x: 15 } : false}
                      transition={{ duration: 0.25 }}
                      className="absolute inset-0 flex items-center"
                    >
                      <div className="w-44">
                        <SearchBar />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Create Post */}
            <div className="relative w-full">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center h-12 w-full relative overflow-hidden transition-all duration-200 font-bold rounded-xl shadow-md bg-gradient-to-r from-[#0060A9] to-[#00B4FA] text-white active:scale-95 cursor-pointer hover:brightness-110"
              >
                <div className="w-[48px] h-12 flex items-center justify-center flex-shrink-0 z-10">
                  <Plus size={24} />
                </div>
                <span className={textTransitionClass}>Create Post</span>
              </button>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 relative pt-2 flex flex-col min-h-0 overflow-hidden">
            <DesktopNavItem
              icon={
                <img src={AILogo} alt="AI" className="w-6 h-6 object-contain" />
              }
              label={
                <span>
                  Gastronome AI{" "}
                  <Sparkles
                    size={11}
                    className="inline ml-1.5 text-[#F57600]"
                  />
                </span>
              }
              isActive={location.pathname === "/chatbot"}
              collapsed={collapsed}
              onClick={() => navigate("/chatbot")}
              blueGradientText={blueGradientText}
            />
            <div className="border-t-2 border-[#0060A9]/20 my-3 mx-6" />
            {allNav.map((item) => (
              <DesktopNavItem
                key={item.label}
                icon={
                  <div className="relative">
                    <item.icon
                      size={22}
                      strokeWidth={location.pathname === item.path ? 2.5 : 2}
                    />
                    {item.badge && hasNotifications && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#F57600] rounded-full border-2 border-white" />
                    )}
                  </div>
                }
                label={item.label}
                isActive={location.pathname === item.path}
                collapsed={collapsed}
                onClick={() => navigate(item.path)}
                blueGradientText={blueGradientText}
              />
            ))}
            <div className="border-t-2 border-[#0060A9]/20 my-3 mx-6" />
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {!collapsed && (
                <>
                  <div className="flex items-center w-full h-10 px-4 flex-shrink-0">
                    <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap">
                      Chat History
                    </span>
                  </div>
                  {/* Scrollable chat history */}
                  <div className="flex-1 min-h-0 overflow-y-auto px-2 space-y-0.5 custom-scrollbar-sidebar">
                    <style>{`
                      .custom-scrollbar-sidebar::-webkit-scrollbar { width: 5px; }
                      .custom-scrollbar-sidebar::-webkit-scrollbar-track { background: transparent; }
                      .custom-scrollbar-sidebar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; }
                      .custom-scrollbar-sidebar:hover::-webkit-scrollbar-thumb { background: #CBD5E1; }
                      .custom-scrollbar-sidebar::-webkit-scrollbar-thumb:hover { background: #0060A9; }
                    `}</style>
                    <div>
                      {sessions.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">
                          No chat history
                        </p>
                      ) : (
                        sessions.map((session) => (
                          <div
                            key={session.id}
                            className="flex items-center gap-1 group"
                          >
                            <button
                              onClick={() => {
                                dispatch({
                                  type: "SET_ACTIVE_SESSION",
                                  payload: session.id,
                                });
                                navigate("/chatbot");
                              }}
                              className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-colors text-xs
                                ${
                                  activeSessionId === session.id
                                    ? "bg-orange-50 text-gray-700 font-medium"
                                    : "text-gray-500 hover:bg-gray-50"
                                }`}
                              title={session.title}
                            >
                              <MessageSquare
                                size={12}
                                className={
                                  activeSessionId === session.id
                                    ? "text-[#F57600]"
                                    : "text-gray-400"
                                }
                              />
                              <span className="flex-1 line-clamp-1 leading-tight">
                                {session.title}
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                setDeleteConfirm({
                                  open: true,
                                  sessionId: session.id,
                                  sessionTitle: session.title,
                                });
                              }}
                              className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                              title="Delete chat"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Profile footer */}
          <div className="mt-auto p-3">
            <div
              className={`w-full rounded-2xl flex items-center h-14 overflow-hidden transition-all duration-300 shadow-lg relative
              ${isProfile ? "bg-white border-2 border-[#0060A9] text-[#0060A9]" : "bg-gradient-to-r from-[#0060A9] to-[#00B4FA] text-white"}`}
            >
              {isProfile && (
                <motion.div
                  animate={{ opacity: [0.05, 0.15, 0.05] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-[#0060A9] pointer-events-none"
                />
              )}
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center flex-1 h-full min-w-0 overflow-hidden active:scale-[0.98] transition-transform"
              >
                <div className="w-[54px] flex-shrink-0 flex items-center justify-center z-10">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt="Profile"
                      className={`w-9 h-9 rounded-full object-cover block ${isProfile ? "border-2 border-[#0060A9]" : "border-2 border-white/40"}`}
                    />
                  ) : (
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold
                      ${isProfile ? "bg-[#0060A9]/10 text-[#0060A9] border-2 border-[#0060A9]" : "bg-white/20 text-white border-2 border-white/40"}`}
                    >
                      {initials}
                    </div>
                  )}
                </div>
                <div
                  className={`${textTransitionClass} flex flex-col items-start min-w-0 z-10`}
                >
                  <span
                    className={`font-bold text-sm truncate w-full leading-tight ${isProfile ? "text-[#0060A9]" : "text-white"}`}
                  >
                    {userName || "User"}
                  </span>
                  {userUsername && !isProfile && (
                    <span
                      className={`text-[10px] font-medium truncate w-full opacity-70 text-white`}
                    >
                      @{userUsername}
                    </span>
                  )}
                  {isProfile && (
                    <span className="text-[10px] font-medium uppercase tracking-widest opacity-70">
                      Active Profile
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLogoutConfirm(true);
                }}
                className={`group/logout flex-shrink-0 rounded-xl flex items-center justify-center z-10 hover:bg-red-500 hover:text-white transition-all duration-200
                  ${isProfile ? "text-[#0060A9]" : "text-white/80"}
                  ${collapsed ? "w-0 h-0 opacity-0 pointer-events-none overflow-hidden p-0 m-0" : "w-10 h-10 mr-2"}`}
              >
                <LogOut
                  size={17}
                  className="transition-transform duration-200 group-hover/logout:translate-x-0.5"
                />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() =>
            setDeleteConfirm({ open: false, sessionId: null, sessionTitle: "" })
          }
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  Delete chat?
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  This will permanently delete "
                  <span className="font-semibold">
                    {deleteConfirm.sessionTitle}
                  </span>
                  " and all its messages.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() =>
                  setDeleteConfirm({
                    open: false,
                    sessionId: null,
                    sessionTitle: "",
                  })
                }
                className="px-4 py-2.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm.sessionId) {
                    dispatch({
                      type: "DELETE_SESSION",
                      payload: deleteConfirm.sessionId,
                    });
                  }
                  setDeleteConfirm({
                    open: false,
                    sessionId: null,
                    sessionTitle: "",
                  });
                }}
                className="px-4 py-2.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

function DesktopNavItem({
  icon,
  label,
  isActive,
  collapsed,
  onClick,
  blueGradientText,
}) {
  const textClass = `transition-all duration-400 overflow-hidden whitespace-nowrap ${
    collapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[200px] opacity-100 ml-3"
  }`;
  return (
    <div
      onClick={onClick}
      className="group relative flex items-center h-14 cursor-pointer transition-colors"
    >
      {/* Blue background highlight */}
      <motion.div
        className="absolute inset-0 z-0 bg-blue-50/80"
        initial={false}
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
      {/* Blue pill on left edge — positioned directly on the row */}
      <motion.div
        className="absolute left-0 -translate-y-1/2 w-1.5 h-8 rounded-r-full bg-[#0060A9] z-10"
        initial={false}
        animate={{ opacity: isActive ? 1 : 0, scaleY: isActive ? 1 : 0.5 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
      <div
        className={`w-16 h-14 flex items-center justify-center flex-shrink-0 z-10 transition-colors duration-300 ${isActive ? "text-[#0060A9]" : "text-gray-400 group-hover:text-[#0060A9]"}`}
      >
        {icon}
      </div>
      <span
        className={`${textClass} text-[15px] z-10 transition-colors duration-200 ${isActive ? `font-bold ${blueGradientText}` : "text-gray-500 font-medium group-hover:text-[#0060A9]"}`}
      >
        {label}
      </span>
      {collapsed && (
        <div className="absolute left-full ml-4 px-3 py-1 bg-gray-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[200]">
          {label}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE — Twitter/X-style bottom nav + floating AI button + swipe panel
// ─────────────────────────────────────────────────────────────────────────────
function MobileBottomNav({ onNewPost, hasNotifications, onMobileSearch }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { userName, userUsername, userAvatar } = useUserInfo();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);

  const initials = userName ? userName.slice(0, 2).toUpperCase() : "GC";

  const EXTRA_NAV = [
    { icon: Heart, label: "Favorites", path: "/favorites" },
    { icon: Archive, label: "Archives", path: "/archives" },
    { icon: History, label: "History", path: "/history" },
  ];

  const { sessions, activeSessionId, dispatch } = useChatContext();

  // Helper: navigate and close search overlay
  const navTo = (path) => {
    setSearchOpen(false);
    onMobileSearch?.("");
    navigate(path);
  };

  // Screen-level swipe RIGHT from left edge to open panel
  const screenSwipeStartX = useRef(null);
  const screenSwipeStartY = useRef(null);

  useEffect(() => {
    const onTouchStart = (e) => {
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      // Only capture swipes that start in the left 48px edge zone
      if (x < 48) {
        screenSwipeStartX.current = x;
        screenSwipeStartY.current = y;
      }
    };
    const onTouchEnd = (e) => {
      if (screenSwipeStartX.current === null) return;
      const dx = e.changedTouches[0].clientX - screenSwipeStartX.current;
      const dy = Math.abs(
        e.changedTouches[0].clientY - screenSwipeStartY.current,
      );
      if (dx > 50 && dy < 80) setPanelOpen(true);
      screenSwipeStartX.current = null;
    };
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <>
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPost={onNewPost}
      />
      <LogOutModal
        isOpen={showLogoutConfirm}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("adminAccessToken");
          localStorage.removeItem("userId");
          window.dispatchEvent(new Event(AUTH_STATE_EVENT));
          navigate("/login?mode=login", { replace: true });
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      {/* ── Mobile Search overlay ── */}
      <AnimatePresence>
        {searchOpen && (
          <>
            {/* Backdrop — below nav so nav stays tappable */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery("");
              }}
              className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm lg:hidden"
            />

            {/* Search panel — input + conditional popular recipes list */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              className="fixed top-4 left-4 right-4 z-[115] lg:hidden flex flex-col"
              style={{
                height:
                  "calc(100dvh - 84px - env(safe-area-inset-bottom,0px) - 32px)",
              }}
            >
              {/* Input row */}
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-3 px-4 py-3 flex-shrink-0">
                <Search size={18} className="text-[#0060A9] flex-shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  placeholder="Search..."
                  className="flex-1 text-sm font-medium outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    onMobileSearch?.(e.target.value);
                  }}
                />
                {searchQuery ? (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      onMobileSearch?.("");
                    }}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                      onMobileSearch?.("");
                    }}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Popular Recipes — shown when query is empty, slides away when typing */}
              <AnimatePresence>
                {searchQuery.trim() === "" && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="mt-2 rounded-xl shadow-2xl overflow-hidden"
                    style={{ flex: "1 1 0", minHeight: 0 }}
                  >
                    {/* overflow-y-auto here + explicit height lets content scroll */}
                    <div
                      className="overflow-y-auto h-full [&>div]:rounded-none [&>div]:shadow-none [&>div]:border-0"
                      style={{ WebkitOverflowScrolling: "touch" }}
                    >
                      <PopularRecipes />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Full-height slide panel (swipe right from left edge) ── */}
      <AnimatePresence>
        {panelOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPanelOpen(false)}
              className="fixed inset-0 z-[140] bg-black/40 backdrop-blur-sm lg:hidden"
            />

            {/* Panel — full height, slides from left */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed inset-y-0 left-0 z-[141] flex flex-col bg-white lg:hidden"
              style={{
                width: "80vw",
                maxWidth: 320,
                boxShadow:
                  "8px 0 40px -4px rgba(0,96,169,0.18), 2px 0 0 rgba(0,96,169,0.06)",
                paddingTop: "env(safe-area-inset-top, 0px)",
                paddingBottom: "env(safe-area-inset-bottom, 0px)",
              }}
            >
              {/* Panel header */}
              <div
                className="flex items-center justify-between px-4 py-4 border-b border-gray-100 flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(245,118,0,0.06) 0%, rgba(240,174,53,0.06) 100%)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#F57600] to-[#F0AE35] flex items-center justify-center shadow-md shadow-orange-200">
                    <img
                      src={AILogo}
                      alt="AI"
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-800 leading-none">
                      Gastronome AI
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                      Your recipe assistant
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPanelOpen(false)}
                  className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-400 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Profile CTA — styled like the desktop footer card */}
              <div className="px-4 pt-4 pb-3 flex-shrink-0">
                <button
                  onClick={() => {
                    navigate("/profile");
                    setPanelOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#0060A9] to-[#00B4FA] text-white shadow-lg shadow-blue-200/60 active:scale-[0.98] transition-transform"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt="Profile"
                        className="w-9 h-9 rounded-full object-cover border-2 border-white/40"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-sm font-extrabold text-white">
                        {initials}
                      </div>
                    )}
                  </div>
                  {/* Name */}
                  <div className="flex-1 flex flex-col items-start min-w-0">
                    <span className="font-black text-sm text-white truncate w-full leading-tight">
                      {userName || "User"}
                    </span>
                    {userUsername && (
                      <span className="text-[10px] text-white/70 font-medium truncate w-full">
                        @{userUsername}
                      </span>
                    )}
                  </div>
                  {/* Arrow */}
                  <ChevronRight
                    size={18}
                    className="text-white/70 flex-shrink-0"
                  />
                </button>
              </div>

              <div className="h-px bg-gray-100 mx-4 flex-shrink-0" />

              {/* Pages — Favorites, Archives, History */}
              <div className="px-3 pt-3 pb-2 flex-shrink-0">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-2 mb-2">
                  Pages
                </p>
                {EXTRA_NAV.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setPanelOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all text-left mb-0.5
                        ${isActive ? "bg-blue-50" : "hover:bg-gray-50"}`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                        ${isActive ? "bg-[#0060A9] text-white" : "bg-gray-100 text-gray-500"}`}
                      >
                        <item.icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                      <span
                        className={`text-sm font-bold ${isActive ? "text-[#0060A9]" : "text-gray-600"}`}
                      >
                        {item.label}
                      </span>
                      {isActive && (
                        <ChevronRight
                          size={14}
                          className="ml-auto text-[#0060A9]/40"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="h-px bg-gray-100 mx-4 flex-shrink-0" />

              {/* Chat History — scrollable, fills remaining space */}
              <div className="flex flex-col flex-1 min-h-0 px-3 pt-3">
                <div className="flex items-center justify-between px-2 mb-2 flex-shrink-0">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                    Chat History
                  </p>
                </div>

                {/* Scrollable list */}
                <div
                  className="flex-1 overflow-y-auto pr-1"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "#F57600 #FFF3E6",
                  }}
                >
                  <style>{`
                    .chat-scroll::-webkit-scrollbar { width: 4px; }
                    .chat-scroll::-webkit-scrollbar-track { background: #FFF3E6; border-radius: 99px; }
                    .chat-scroll::-webkit-scrollbar-thumb { background: #F57600; border-radius: 99px; }
                  `}</style>
                  <div className="chat-scroll h-full overflow-y-auto space-y-0.5 pb-2">
                    {sessions.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">
                        No chat history yet
                      </p>
                    ) : (
                      sessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center gap-1 group"
                        >
                          <button
                            onClick={() => {
                              dispatch({
                                type: "SET_ACTIVE_SESSION",
                                payload: session.id,
                              });
                              navigate("/chatbot");
                              setPanelOpen(false);
                            }}
                            className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-colors text-left
                              ${
                                activeSessionId === session.id
                                  ? "bg-orange-50 border border-orange-200"
                                  : "hover:bg-gray-50"
                              }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
                              ${
                                activeSessionId === session.id
                                  ? "bg-[#F57600]"
                                  : "bg-orange-50"
                              }`}
                            >
                              <MessageSquare
                                size={14}
                                className={
                                  activeSessionId === session.id
                                    ? "text-white"
                                    : "text-[#F57600]"
                                }
                              />
                            </div>
                            <span
                              className={`text-xs font-medium flex-1 line-clamp-2 leading-snug
                              ${activeSessionId === session.id ? "text-gray-700" : "text-gray-500"}`}
                            >
                              {session.title}
                            </span>
                            <ChevronRight
                              size={12}
                              className="text-gray-300 group-hover:text-[#0060A9] flex-shrink-0 transition-colors"
                            />
                          </button>
                          <button
                            onClick={() => {
                              dispatch({
                                type: "DELETE_SESSION",
                                payload: session.id,
                              });
                            }}
                            className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Logout — full width, pinned to bottom */}
              <div className="px-4 py-4 border-t border-gray-100 flex-shrink-0">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setPanelOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-red-50 border border-red-100 text-red-500 font-black text-sm hover:bg-red-500 hover:text-white hover:border-red-500 active:bg-red-600 transition-all group"
                >
                  <LogOut
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                  Log Out
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Floating AI button — hidden on /chatbot page ── */}
      <div
        className={`fixed z-[130] lg:hidden select-none ${location.pathname === "/chatbot" ? "hidden" : ""}`}
        style={{
          bottom: "calc(84px + env(safe-area-inset-bottom, 0px) + 12px)",
          right: "16px",
        }}
      >
        <motion.button
          onClick={() => navigate("/chatbot")}
          whileTap={{ scale: 0.9 }}
          className="relative w-14 h-14 rounded-full flex items-center justify-center cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #F57600, #F0AE35)",
            boxShadow:
              "0 4px 20px rgba(245,118,0,0.45), 0 2px 8px rgba(0,0,0,0.12)",
          }}
        >
          {/* Pulse ring */}
          <motion.span
            animate={{ scale: [1, 1.6], opacity: [0.35, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
            className="absolute inset-0 rounded-full bg-[#F57600]"
          />
          <img
            src={AILogo}
            alt="AI"
            className="w-7 h-7 object-contain relative z-10"
          />
        </motion.button>
      </div>

      {/* ── Bottom bar (Twitter/X style) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-[120] lg:hidden">
        <div
          className="bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-[0_-4px_24px_-4px_rgba(0,96,169,0.10)]"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="flex items-center justify-around px-4 pt-3 pb-2">
            {/* Home — inactive while search overlay is open */}
            <XNavBtn
              icon={Home}
              isActive={!searchOpen && location.pathname === "/feed"}
              onClick={() => navTo("/feed")}
              label="Home"
            />

            {/* Search — only this one highlights while overlay is open */}
            <XNavBtn
              icon={Search}
              isActive={searchOpen}
              onClick={() => {
                if (searchOpen) {
                  setSearchQuery("");
                  onMobileSearch?.("");
                }
                setSearchOpen((s) => !s);
              }}
              label="Search"
            />

            {/* Create — circle FAB center */}
            <div className="flex flex-col items-center">
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => {
                  setSearchOpen(false);
                  setIsModalOpen(true);
                }}
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-[3px] border-white transition-all bg-gradient-to-br from-[#0060A9] to-[#00B4FA] shadow-[#0060A9]/30"
              >
                <Plus size={22} className="text-white" strokeWidth={2.8} />
              </motion.button>
            </div>

            {/* Notifications — inactive while search is open */}
            <XNavBtn
              icon={Bell}
              isActive={!searchOpen && location.pathname === "/notifications"}
              onClick={() => navTo("/notifications")}
              label="Notification"
              badge={hasNotifications}
            />

            {/* Menu — opens the slide panel; inactive while search is open */}
            <button
              onClick={() => {
                setSearchOpen(false);
                setPanelOpen(true);
              }}
              className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all active:scale-90"
            >
              <div className="relative">
                <Menu
                  size={24}
                  strokeWidth={!searchOpen && panelOpen ? 2.5 : 1.8}
                  className={
                    !searchOpen && panelOpen
                      ? "text-[#0060A9]"
                      : "text-gray-500"
                  }
                />
              </div>
              <span
                className={`text-[9px] font-bold ${!searchOpen && panelOpen ? "text-[#0060A9]" : "text-gray-400"}`}
              >
                Menu
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom spacer so content isn't hidden under nav */}
      <div className="h-[84px] lg:hidden" />
    </>
  );
}

// Slim Twitter/X-style icon button
function XNavBtn({ icon: Icon, isActive, onClick, label, badge }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all active:scale-90"
    >
      <div className="relative">
        <Icon
          size={24}
          strokeWidth={isActive ? 2.5 : 1.8}
          className={isActive ? "text-[#0060A9]" : "text-gray-500"}
          fill={isActive ? "rgba(0,96,169,0.08)" : "none"}
        />
        {badge && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#F57600] rounded-full border-2 border-white" />
        )}
      </div>
      <span
        className={`text-[9px] font-bold ${isActive ? "text-[#0060A9]" : "text-gray-400"}`}
      >
        {label}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT — renders both, CSS handles visibility
// ─────────────────────────────────────────────────────────────────────────────
export default function Sidebar({
  onNewPost,
  hasNotifications = false,
  onMobileSearch,
}) {
  return (
    <>
      <DesktopSidebar
        onNewPost={onNewPost}
        hasNotifications={hasNotifications}
      />
      <MobileBottomNav
        onNewPost={onNewPost}
        hasNotifications={hasNotifications}
        onMobileSearch={onMobileSearch}
      />
    </>
  );
}
