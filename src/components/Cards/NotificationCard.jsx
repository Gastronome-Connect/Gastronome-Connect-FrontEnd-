import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal, Trash2, EyeOff, Eye } from "lucide-react";

const ROUTE_MAP = {
  like: "/feed", conversation: "/feed", follow: "/profile", repost: "/feed",
};

const TYPE_CONFIG = {
  like:         { color: "#F57600", label: "liked your recipe" },
  conversation: { color: "#0060A9", label: "commented" },
  follow:       { color: "#00B4FA", label: "followed you" },
  repost:       { color: "#F0AE35", label: "shared your post" },
};

const DeleteModal = ({ onConfirm, onCancel }) => (
  <div
    className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={onCancel}
  >
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.85, opacity: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 260 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden"
    >
      <div className="bg-[#0060A9] text-white text-center py-8 sm:py-10 px-6">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="w-14 sm:w-16 h-14 sm:h-16 bg-white/20 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center mx-auto mb-4 backdrop-blur-md"
        >
          <Trash2 size={24} className="text-white sm:hidden" />
          <Trash2 size={28} className="text-white hidden sm:block" />
        </motion.div>
        <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight">Delete Notification</h2>
      </div>
      <div className="p-6 sm:p-10 text-center">
        <p className="text-gray-500 text-sm leading-relaxed mb-6 sm:mb-8">
          Are you sure you want to permanently delete this notification? This action cannot be undone.
        </p>
        <div className="flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onConfirm}
            className="w-full py-3 sm:py-4 rounded-2xl bg-red-600 text-white font-black text-xs tracking-widest shadow-lg shadow-red-100 uppercase"
          >
            Yes, Delete
          </motion.button>
          <button
            onClick={onCancel}
            className="py-2 text-gray-400 font-bold text-xs uppercase tracking-tighter hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  </div>
);

export default function NotificationCard({ notification, isHidden = false, onDelete, onHide, onUnhide }) {
  const navigate = useNavigate();
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [showDelete,  setShowDelete]  = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const buttonRef   = useRef(null);
  const dropdownRef = useRef(null);

  const {
    images   = [],
    avatar   = "https://i.pravatar.cc/100",
    author   = "Abdul Jakul",
    caption  = "Lorem ipsum dolor sit amet consectetur.",
    timeAgo  = "69 minutes ago",
    type     = "like",
  } = notification || {};

  const config        = TYPE_CONFIG[type] || TYPE_CONFIG.like;
  const visibleImages = images.slice(0, 3);
  const hiddenCount   = images.length > 3 ? images.length - 3 : 0;

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    if (!menuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
    setMenuOpen((o) => !o);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        buttonRef.current  && !buttonRef.current.contains(e.target)
      ) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  /* ── Compact hidden card — only avatar + name + unhide/delete menu ── */
  if (isHidden) {
    return (
      <>
        <motion.div
          layout
          whileHover={{ y: -2, boxShadow: "0 8px 20px -8px rgba(0,0,0,0.10)" }}
          className="group relative flex items-center gap-3 w-full rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-3 cursor-default select-none transition-all duration-300"
        >
          {/* Avatar */}
          <div className="relative shrink-0">
            <img
              src={avatar}
              alt={author}
              className="h-9 w-9 rounded-full border-2 border-white object-cover shadow-sm ring-1 ring-gray-100 grayscale"
            />
            <div
              className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-gray-300"
            />
          </div>

          {/* Name + hidden label + caption preview */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-gray-500 truncate">{author}</p>
            <p className="text-xs text-gray-600 truncate mt-0.5">
              {caption.split(" ").slice(0, 5).join(" ")}{caption.split(" ").length > 5 ? "…" : ""}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <EyeOff size={9} className="text-gray-300" />
              <span className="text-[10px] text-gray-400 font-semibold">Hidden · {timeAgo}</span>
            </div>
          </div>

          {/* Options button */}
          <button
            ref={buttonRef}
            onClick={handleMenuToggle}
            className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all
              ${menuOpen
                ? "bg-[#0060A9] text-white"
                : "bg-gray-100 text-gray-400 hover:bg-[#0060A9] hover:text-white"}`}
          >
            <MoreHorizontal size={14} />
          </button>
        </motion.div>

        {/* Dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, scale: 0.92, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -4 }}
              transition={{ duration: 0.15 }}
              className="fixed w-44 sm:w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-1"
              style={{ top: dropdownPos.top, right: dropdownPos.right, zIndex: 99999 }}
            >
              <button
                onClick={() => { onUnhide?.(); setMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <div className="w-7 h-7 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Eye size={13} className="text-[#0060A9]" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-gray-700">Unhide</p>
                  <p className="text-[10px] text-gray-400 font-normal">Move back to main feed</p>
                </div>
              </button>
              <div className="mx-3 h-px bg-gray-100" />
              <button
                onClick={() => { setShowDelete(true); setMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
              >
                <div className="w-7 h-7 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <Trash2 size={13} className="text-red-500" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-red-500">Delete</p>
                  <p className="text-[10px] text-red-300 font-normal">Permanently remove</p>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showDelete && (
            <DeleteModal
              onConfirm={() => { setShowDelete(false); onDelete?.(); }}
              onCancel={() => setShowDelete(false)}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  /* ── Full card — normal (non-hidden) view ── */
  return (
    <>
      <motion.div
        layout
        whileHover={{ y: -4, boxShadow: "0 12px 24px -10px rgba(0, 96, 169, 0.15)" }}
        whileTap={{ scale: 0.99 }}
        className="group relative flex w-full rounded-2xl border border-gray-100 bg-white transition-all duration-300 cursor-pointer select-none"
        style={{ boxShadow: "0 2px 12px rgba(0,96,169,0.07), 0 1px 3px rgba(0,0,0,0.05)" }}
      >
        {/* Left Accent Border */}
        <div
          className="absolute left-0 top-0 h-full w-1 sm:w-1.5 rounded-l-2xl transition-all group-hover:w-1.5 sm:group-hover:w-2"
          style={{ backgroundColor: config.color }}
        />

        {/* Options Button */}
        <button
          ref={buttonRef}
          onClick={handleMenuToggle}
          className={`absolute top-2 sm:top-2.5 right-2 sm:right-2.5 z-20 w-6 sm:w-7 h-6 sm:h-7 rounded-full flex items-center justify-center transition-all
            ${menuOpen
              ? "bg-[#0060A9] text-white"
              : "bg-[#0060A9]/10 text-[#0060A9] hover:bg-[#0060A9] hover:text-white"}`}
        >
          <MoreHorizontal size={13} className="sm:hidden" />
          <MoreHorizontal size={14} className="hidden sm:block" />
        </button>

        {/* Media Grid */}
        <div
          className="flex-shrink-0 w-28 sm:w-36 md:w-44 lg:w-48 p-2 sm:p-3"
          onClick={() => navigate(ROUTE_MAP[type] ?? "/feed")}
        >
          <div className="relative h-20 sm:h-24 md:h-28 lg:h-32 w-full overflow-hidden rounded-lg sm:rounded-xl bg-gray-50 shadow-sm">
            {visibleImages.length === 0 ? (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-300 text-xs italic">No media</div>
            ) : visibleImages.length === 1 ? (
              <img src={visibleImages[0]} alt="recipe" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
            ) : visibleImages.length === 2 ? (
              <div className="flex h-full gap-0.5">
                <img src={visibleImages[0]} alt="" className="h-full w-1/2 object-cover" />
                <img src={visibleImages[1]} alt="" className="h-full w-1/2 object-cover" />
              </div>
            ) : (
              <div className="flex h-full gap-0.5">
                <img src={visibleImages[0]} alt="" className="h-full w-[60%] object-cover" />
                <div className="flex w-[40%] flex-col gap-0.5">
                  <img src={visibleImages[1]} alt="" className="h-1/2 w-full object-cover" />
                  <div className="relative h-1/2 w-full">
                    <img src={visibleImages[2]} alt="" className="h-full w-full object-cover" />
                    {hiddenCount > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#0060A9]/60 backdrop-blur-[2px]">
                        <span className="text-xs font-bold text-white">+{hiddenCount}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="my-3 sm:my-4 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent" />

        {/* Content */}
        <div
          className="flex flex-1 flex-col justify-between p-2.5 sm:p-4 min-w-0 pr-8 sm:pr-10"
          onClick={() => navigate(ROUTE_MAP[type] ?? "/feed")}
        >
          <div>
            <div className="flex items-center mb-1">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <div className="relative flex-shrink-0">
                  <img
                    src={avatar} alt={author}
                    className="h-6 sm:h-8 w-6 sm:w-8 rounded-full border-2 border-white object-cover shadow-sm ring-1 ring-gray-100"
                  />
                  <div
                    className="absolute -bottom-0.5 -right-0.5 h-2.5 sm:h-3 w-2.5 sm:w-3 rounded-full border-2 border-white"
                    style={{ backgroundColor: config.color }}
                  />
                </div>
                <div className="truncate min-w-0">
                  <span className="text-xs sm:text-sm font-black text-[#0060A9]">{author}</span>
                  <span className="ml-1 text-[11px] sm:text-[13px] text-gray-500 font-medium lowercase">
                    {config.label}
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-1 line-clamp-2 text-[11px] sm:text-[13px] leading-snug text-gray-600 group-hover:text-gray-900 transition-colors">
              {caption}
            </p>
          </div>

          <div className="mt-2 sm:mt-3 flex items-center justify-between">
            <span
              className="rounded-full px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: `${config.color}15`, color: config.color }}
            >
              {type}
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {timeAgo}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.15 }}
            className="fixed w-44 sm:w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-1"
            style={{ top: dropdownPos.top, right: dropdownPos.right, zIndex: 99999 }}
          >
            {/* Hide / Unhide */}
            <button
              onClick={() => {
                isHidden ? onUnhide?.() : onHide?.();
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                {isHidden
                  ? <Eye size={13} className="text-[#0060A9]" />
                  : <EyeOff size={13} className="text-[#0060A9]" />}
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-bold text-gray-700">{isHidden ? "Unhide" : "Hide"}</p>
                <p className="text-[9px] sm:text-[10px] text-gray-400 font-normal">
                  {isHidden ? "Move back to main feed" : "Move to Hidden tab"}
                </p>
              </div>
            </button>

            <div className="mx-3 h-px bg-gray-100" />

            {/* Delete */}
            <button
              onClick={() => { setShowDelete(true); setMenuOpen(false); }}
              className="w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
            >
              <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 size={13} className="text-red-500" />
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-bold text-red-500">Delete</p>
                <p className="text-[9px] sm:text-[10px] text-red-300 font-normal">Permanently remove</p>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDelete && (
          <DeleteModal
            onConfirm={() => { setShowDelete(false); onDelete?.(); }}
            onCancel={() => setShowDelete(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}