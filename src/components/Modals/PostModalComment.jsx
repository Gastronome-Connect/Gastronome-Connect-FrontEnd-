import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Send, Play } from "lucide-react";
import { UtensilsCrossed, ChevronDown, ChevronUp } from "lucide-react";
import { FaEllipsisH } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

import Avatar from "../../Feed/Post Card/Post Header/Avatar";
import FavoriteButton from "../../Feed/Post Card/Post Header/FavoriteButton";
import PostMenu from "../../Feed/Post Card/Post Header/PostMenu";
import PostActions from "../../Feed/Post Card/Post Action/PostActions";
import CommentSection from "../../Feed/Post Card/Comment Section/CommentSection";
import ExpandedView from "../../Feed/Post Card/Expanded View/ExpandedView";

// ── Safe parse helper (same as PostContent) ──────────────────────────────────
const parseIngredients = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const p = JSON.parse(raw);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }
  return [];
};

const fmtMeasure = (ing) => {
  if (ing.unit === "to taste") return "to taste";
  return [ing.amount, ing.unit].filter(Boolean).join(" ");
};

// ── Inline ingredient list (read-only, collapsible) ──────────────────────────
const IngredientList = ({ ingredients }) => {
  const [expanded, setExpanded] = useState(false);
  const safe = parseIngredients(ingredients);
  if (safe.length === 0) return null;

  const PREVIEW = 4;
  const showToggle = safe.length > PREVIEW;
  const visible = expanded ? safe : safe.slice(0, PREVIEW);

  return (
    <div className="mx-4 mb-2 rounded-2xl border border-orange-100 bg-orange-50/60 px-3.5 py-3">
      <div className="flex items-center gap-1.5 mb-2">
        <UtensilsCrossed size={13} className="text-[#F57600]" />
        <span className="text-xs font-extrabold text-[#F57600] uppercase tracking-wide">
          Ingredients
        </span>
        <span className="ml-auto text-[10px] text-orange-400 font-medium">
          {safe.length} item{safe.length !== 1 ? "s" : ""}
        </span>
      </div>
      <ul className="space-y-1">
        {visible.map((ing, i) => {
          const m = fmtMeasure(ing);
          return (
            <li key={ing.id ?? i} className="flex items-baseline gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F57600] shrink-0 mt-1.5" />
              {m && (
                <span className="text-[11px] font-bold text-[#F57600] shrink-0 min-w-[52px]">
                  {m}
                </span>
              )}
              <span className="text-sm text-gray-700 leading-snug">
                {ing.name}
              </span>
            </li>
          );
        })}
      </ul>
      {showToggle && (
        <button
          onClick={() => setExpanded((p) => !p)}
          className="mt-2 flex items-center gap-1 text-[#F57600] text-xs font-bold hover:underline"
        >
          {expanded ? (
            <>
              <ChevronUp size={12} /> Show less
            </>
          ) : (
            <>
              <ChevronDown size={12} /> +{safe.length - PREVIEW} more
            </>
          )}
        </button>
      )}
    </div>
  );
};

// ── Inline media thumb ────────────────────────────────────────────────────────
const Thumb = ({ item, index, onClick, overlayCnt = 0, className = "" }) => (
  <div
    className={`relative bg-gray-100 cursor-pointer overflow-hidden ${className}`}
    onClick={() => onClick(index)}
  >
    {item.type === "image" ? (
      <img
        src={item.url}
        alt=""
        className="w-full h-full object-cover hover:brightness-90 transition duration-200"
      />
    ) : (
      <div className="relative w-full h-full bg-black">
        <video src={item.url} className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
            <Play size={18} className="text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>
    )}
    {overlayCnt > 0 && (
      <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
        <span className="text-white text-2xl font-bold">+{overlayCnt}</span>
      </div>
    )}
  </div>
);

const MediaGrid = ({ media, onExpand }) => {
  if (!media.length) return null;
  const extra = media.length > 3 ? media.length - 3 : 0;
  if (media.length === 1)
    return (
      <Thumb
        item={media[0]}
        index={0}
        onClick={onExpand}
        className="w-full"
        style={{ maxHeight: 400 }}
      />
    );
  if (media.length === 2)
    return (
      <div className="grid grid-cols-2 gap-0.5" style={{ height: 280 }}>
        <Thumb
          item={media[0]}
          index={0}
          onClick={onExpand}
          className="h-full"
        />
        <Thumb
          item={media[1]}
          index={1}
          onClick={onExpand}
          className="h-full"
        />
      </div>
    );
  return (
    <div className="grid grid-cols-2 gap-0.5" style={{ height: 320 }}>
      <Thumb
        item={media[0]}
        index={0}
        onClick={onExpand}
        className="h-full row-span-2"
      />
      <Thumb item={media[1]} index={1} onClick={onExpand} className="h-full" />
      <Thumb
        item={media[2]}
        index={2}
        onClick={onExpand}
        className="h-full"
        overlayCnt={extra}
      />
    </div>
  );
};

// ── Main modal ────────────────────────────────────────────────────────────────
const PostCommentModal = ({
  post,
  isOpen = true,
  isOwner = false,
  onClose,
  onPostUpdate,
  onLike,
  onDislike,
  onRepost,
  onEdit,
  onDelete,
  onArchive,
  onReport,
}) => {
  const [visible, setVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pinnedInput, setPinnedInput] = useState("");
  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 380);
  }, [onClose]);

  const menuRef = useRef(null);
  const commentSectionRef = useRef(null);
  const pinnedTextareaRef = useRef(null);

  const media =
    post.mediaItems ??
    (post.image ? [{ id: "m0", url: post.image, type: "image" }] : []);

  useEffect(() => {
    const el = pinnedTextareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [pinnedInput]);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape" && expandedIndex === null) handleClose();
    };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", h);
      document.body.style.overflow = "unset";
    };
  }, [expandedIndex, handleClose]);

  useEffect(() => {
    const h = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const submitComment = async () => {
    const text = pinnedInput.trim();
    if (!text) return;
    await commentSectionRef.current?.addComment(text);
    setPinnedInput("");
    if (pinnedTextareaRef.current)
      pinnedTextareaRef.current.style.height = "auto";
  };

  return createPortal(
    <div>
      <AnimatePresence>
        {visible && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
              onClick={handleClose}
            >
              <motion.div
                key="sheet"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 36 }}
                className="bg-white w-full sm:max-w-[560px] sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
                style={{ height: "92dvh" }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* ── HEADER ── */}
                <div className="relative flex items-center justify-center px-5 py-3 border-b border-gray-100 shrink-0">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gray-200 sm:hidden" />
                  <p className="text-sm font-bold text-gray-900 mt-2 sm:mt-0">
                    {post.author ? `${post.author}'s Post` : "Post"}
                  </p>
                  <button
                    onClick={handleClose}
                    className="absolute right-4 p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-orange-50 hover:text-[#F57600] transition-colors"
                  >
                    <X size={16} strokeWidth={2.5} />
                  </button>
                </div>

                {/* ── SCROLLABLE BODY ── */}
                <div className="flex-1 overflow-y-auto min-h-0">
                  {/* Media */}
                  {media.length > 0 && (
                    <MediaGrid
                      media={media}
                      onExpand={(i) => setExpandedIndex(i)}
                    />
                  )}

                  {/* Author row */}
                  <div className="flex items-center justify-between px-4 pt-3 pb-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar src={post.avatar} alt={post.author} size={9} />
                      <div>
                        <p className="text-sm font-bold text-gray-900 leading-tight">
                          {post.author}
                        </p>
                        <p className="text-xs text-gray-400">{post.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <FavoriteButton />
                      <div className="relative" ref={menuRef}>
                        <button
                          onClick={() => setMenuOpen((o) => !o)}
                          className={`p-2 rounded-full transition-colors ${menuOpen ? "bg-orange-50 text-[#F57600]" : "text-gray-400 hover:bg-orange-50"}`}
                        >
                          <FaEllipsisH size={13} />
                        </button>
                        {menuOpen && (
                          <PostMenu
                            isOwner={isOwner}
                            onEdit={() => {
                              setMenuOpen(false);
                              onEdit?.();
                              handleClose();
                            }}
                            onDelete={() => {
                              setMenuOpen(false);
                              onDelete?.();
                              handleClose();
                            }}
                            onArchive={() => {
                              setMenuOpen(false);
                              onArchive?.();
                            }}
                            onReport={() => {
                              setMenuOpen(false);
                              onReport?.();
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── ORDER: title → ingredients → caption ── */}

                  {/* 1. TITLE */}
                  {post.title && (
                    <div className="px-4 pb-1">
                      <p className="text-sm font-bold text-gray-900">
                        {post.title}
                      </p>
                    </div>
                  )}

                  {/* 2. INGREDIENTS */}
                  <IngredientList ingredients={post.ingredients} />

                  {/* 3. CAPTION */}
                  {post.caption && (
                    <div className="px-4 pb-3">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {post.caption}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="border-t border-b border-gray-100">
                    <PostActions
                      post={post}
                      onComment={() => {}}
                      commentsOpen={true}
                      onLike={onLike}
                      onDislike={onDislike}
                      onRepost={onRepost}
                    />
                  </div>

                  {/* Comments */}
                  <div className="px-4 pt-3 pb-3">
                    <CommentSection
                      ref={commentSectionRef}
                      postId={post.id}
                      initialComments={post.comments || []}
                      onPostUpdate={onPostUpdate}
                      hideInput
                    />
                  </div>
                </div>

                {/* ── PINNED INPUT ── */}
                <div
                  className="border-t border-gray-100 shrink-0 px-4 py-3 flex items-center gap-2 bg-white"
                  style={{
                    paddingBottom:
                      "calc(12px + env(safe-area-inset-bottom, 0px))",
                  }}
                >
                  <img
                    src="https://i.pravatar.cc/100?img=12"
                    alt="You"
                    className="w-8 h-8 rounded-full object-cover shrink-0 border border-orange-200"
                  />
                  <div className="flex-1 flex items-center bg-gray-50 rounded-2xl border border-gray-200 px-3 py-2 gap-2 focus-within:border-[#F57600] transition-colors">
                    <textarea
                      ref={pinnedTextareaRef}
                      rows={1}
                      value={pinnedInput}
                      onChange={(e) => setPinnedInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          submitComment();
                        }
                      }}
                      placeholder="Write a comment..."
                      className="flex-1 text-sm text-gray-700 placeholder-gray-400 border-none focus:ring-0 outline-none bg-transparent resize-none overflow-y-auto leading-relaxed"
                      style={{ minHeight: "18px", maxHeight: "100px" }}
                    />
                    <button
                      onClick={submitComment}
                      disabled={!pinnedInput.trim()}
                      className={`transition-colors shrink-0 ${pinnedInput.trim() ? "text-[#F57600]" : "text-gray-300"}`}
                    >
                      <Send size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {expandedIndex !== null && (
              <ExpandedView
                post={post}
                startIndex={expandedIndex}
                isOwner={isOwner}
                onClose={() => setExpandedIndex(null)}
                onEdit={onEdit}
                onDelete={onDelete}
                onArchive={onArchive}
                onReport={onReport}
              />
            )}
          </>
        )}
      </AnimatePresence>
    </div>,
    document.body,
  );
};

export default PostCommentModal;
