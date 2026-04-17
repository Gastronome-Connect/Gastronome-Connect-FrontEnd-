import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal, Trash2, EyeOff, Eye, Heart, MessageCircle, MessageSquareReply, UserPlus, Repeat2 } from "lucide-react";

const ROUTE_MAP = {
  like: "/feed",
  comment: "/feed",
  reply: "/feed",
  follow: "/profile",
  repost: "/feed",
};

const TYPE_CONFIG = {
  like: { color: "#F57600", label: "liked your recipe", Icon: Heart },
  comment: { color: "#0060A9", label: "commented on your post", Icon: MessageCircle },
  reply: { color: "#00B4FA", label: "replied to your comment", Icon: MessageSquareReply },
  follow: { color: "#22C55E", label: "started following you", Icon: UserPlus },
  repost: { color: "#F0AE35", label: "shared your post", Icon: Repeat2 },
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

export default function NotificationCard({
  notification,
  isHidden = false,
  onClick,
  onDelete,
  onHide,
  onUnhide,
}) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const {
    images = [],
    image,
    actorAvatar = "https://i.pravatar.cc/100",
    actorName = "Someone",
    actorUsername = "",
    content = "interacted with your post.",
    caption = "There is new activity on your account.",
    timeAgo = "just now",
    timestamp,
    type = "like",
    targetRoute,
    read = true,
  } = notification || {};

  const normalizedImages =
    Array.isArray(images) && images.length > 0
      ? images
      : image
        ? [image]
        : [];

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.like;
  const visibleImages = normalizedImages.slice(0, 3);
  const hiddenCount = normalizedImages.length > 3 ? normalizedImages.length - 3 : 0;
  const destination = targetRoute || ROUTE_MAP[type] || "/feed";
  const displayTime = timeAgo || (timestamp ? new Date(timestamp).toLocaleString() : "just now");
  const Icon = config.Icon;

  const handleCardClick = (e) => {
    if (buttonRef.current?.contains(e.target)) return;
    if (dropdownRef.current?.contains(e.target)) return;
    onClick?.();
    if (destination) navigate(destination);
  };

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
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  if (isHidden) {
    return (
      <>
        <motion.div
          layout
          onClick={handleCardClick}
          whileHover={{ y: -2, boxShadow: "0 8px 20px -8px rgba(0,0,0,0.10)" }}
          className="group relative flex items-center gap-3 w-full rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-3 cursor-pointer select-none transition-all duration-300"
        >
          <div className="relative shrink-0">
            <img
              src={actorAvatar}
              alt={actorName}
              className="h-9 w-9 rounded-full border-2 border-white object-cover shadow-sm ring-1 ring-gray-100 grayscale"
            />
            <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white flex items-center justify-center bg-gray-300">
              <Icon size={9} className="text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-gray-500 truncate">{actorName}</p>
            <p className="text-xs text-gray-600 truncate mt-0.5">{content || caption}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <EyeOff size={9} className="text-gray-300" />
              <span className="text-[10px] text-gray-400 font-semibold">Hidden · {displayTime}</span>
            </div>
          </div>

          <button
            ref={buttonRef}
            onClick={handleMenuToggle}
            className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              menuOpen
                ? "bg-[#0060A9] text-white"
                : "bg-gray-100 text-gray-400 hover:bg-[#0060A9] hover:text-white"
            }`}
          >
            <MoreHorizontal size={14} />
          </button>
        </motion.div>

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
                onClick={() => {
                  onUnhide?.();
                  setMenuOpen(false);
                }}
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
                onClick={() => {
                  setShowDelete(true);
                  setMenuOpen(false);
                }}
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
              onConfirm={() => {
                setShowDelete(false);
                onDelete?.();
              }}
              onCancel={() => setShowDelete(false)}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      <motion.div
        layout
        onClick={handleCardClick}
        whileHover={{ y: -4, boxShadow: "0 12px 24px -10px rgba(0, 96, 169, 0.15)" }}
        whileTap={{ scale: 0.99 }}
        className={`group relative flex w-full rounded-2xl border transition-all duration-300 cursor-pointer select-none ${
          read ? "border-gray-100 bg-white" : "border-orange-200 bg-gradient-to-r from-orange-50/60 via-white to-white"
        }`}
        style={{ boxShadow: "0 2px 12px rgba(0,96,169,0.07), 0 1px 3px rgba(0,0,0,0.05)" }}
      >
        <div
          className="absolute left-0 top-0 h-full w-1 sm:w-1.5 rounded-l-2xl transition-all group-hover:w-1.5 sm:group-hover:w-2"
          style={{ backgroundColor: config.color }}
        />

        {!read && (
          <div className="absolute left-3 sm:left-4 top-3 sm:top-4 z-10 h-2.5 w-2.5 rounded-full bg-[#F57600] shadow-[0_0_0_4px_rgba(245,118,0,0.12)]" />
        )}

        <button
          ref={buttonRef}
          onClick={handleMenuToggle}
          className={`absolute top-2 sm:top-2.5 right-2 sm:right-2.5 z-20 w-6 sm:w-7 h-6 sm:h-7 rounded-full flex items-center justify-center transition-all ${
            menuOpen
              ? "bg-[#0060A9] text-white"
              : "bg-[#0060A9]/10 text-[#0060A9] hover:bg-[#0060A9] hover:text-white"
          }`}
        >
          <MoreHorizontal size={13} className="sm:hidden" />
          <MoreHorizontal size={14} className="hidden sm:block" />
        </button>

        <div className="flex-shrink-0 w-28 sm:w-36 md:w-44 lg:w-48 p-2 sm:p-3">
          <div className="relative h-20 sm:h-24 md:h-28 lg:h-32 w-full overflow-hidden rounded-lg sm:rounded-xl bg-gray-50 shadow-sm">
            {visibleImages.length === 0 ? (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-300 text-xs italic">
                No media
              </div>
            ) : visibleImages.length === 1 ? (
              <img
                src={visibleImages[0]}
                alt="notification"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
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

        <div className="my-3 sm:my-4 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent" />

        <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-4 min-w-0 pr-8 sm:pr-10">
          <div>
            <div className="flex items-center mb-1">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <div className="relative flex-shrink-0">
                  <img
                    src={actorAvatar}
                    alt={actorName}
                    className="h-6 sm:h-8 w-6 sm:w-8 rounded-full border-2 border-white object-cover shadow-sm ring-1 ring-gray-100"
                  />
                  <div
                    className="absolute -bottom-0.5 -right-0.5 h-3.5 sm:h-4 w-3.5 sm:w-4 rounded-full border-2 border-white flex items-center justify-center"
                    style={{ backgroundColor: config.color }}
                  >
                    <Icon size={8} className="text-white sm:hidden" />
                    <Icon size={9} className="text-white hidden sm:block" />
                  </div>
                </div>
                <div className="truncate min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`text-xs sm:text-sm font-black truncate ${read ? "text-[#0060A9]" : "text-gray-900"}`}>
                      {actorName}
                    </span>
                    {actorUsername && (
                      <span className="text-[10px] sm:text-xs text-gray-400 font-semibold truncate">
                        {actorUsername}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] sm:text-[13px] text-gray-500 font-medium">
                    {content || config.label}
                  </span>
                </div>
              </div>
            </div>

            {caption && (
              <p className="mt-1 line-clamp-2 text-[11px] sm:text-[13px] leading-snug text-gray-600 group-hover:text-gray-900 transition-colors">
                {caption}
              </p>
            )}
          </div>

          <div className="mt-2 sm:mt-3 flex items-center justify-between gap-2">
            <span
              className="rounded-full px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: `${config.color}15`, color: config.color }}
            >
              {type}
            </span>
            <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest ${read ? "text-gray-400" : "text-[#F57600]"}`}>
              {displayTime}
            </span>
          </div>
        </div>
      </motion.div>

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
              onClick={() => {
                isHidden ? onUnhide?.() : onHide?.();
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                {isHidden ? <Eye size={13} className="text-[#0060A9]" /> : <EyeOff size={13} className="text-[#0060A9]" />}
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-bold text-gray-700">{isHidden ? "Unhide" : "Hide"}</p>
                <p className="text-[9px] sm:text-[10px] text-gray-400 font-normal">
                  {isHidden ? "Move back to main feed" : "Move to Hidden tab"}
                </p>
              </div>
            </button>

            <div className="mx-3 h-px bg-gray-100" />

            <button
              onClick={() => {
                setShowDelete(true);
                setMenuOpen(false);
              }}
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
            onConfirm={() => {
              setShowDelete(false);
              onDelete?.();
            }}
            onCancel={() => setShowDelete(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}