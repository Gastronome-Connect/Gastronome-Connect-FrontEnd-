import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Bot, Send, UtensilsCrossed } from "lucide-react";
import { FaEllipsisH } from "react-icons/fa";

import Avatar from "../Post Header/Avatar";
import PostMenu from "../Post Header/PostMenu";
import FavoriteButton from "../Post Header/FavoriteButton";
import PostActions from "../Post Action/PostActions";
import CommentSection from "../Comment Section/CommentSection";

/* ── Inline ingredient list for the expanded panel ── */
const IngredientList = ({ ingredients }) => {
  const [expanded, setExpanded] = useState(false);
  if (!ingredients || ingredients.length === 0) return null;

  const PREVIEW = 4;
  const showToggle = ingredients.length > PREVIEW;
  const visible    = expanded ? ingredients : ingredients.slice(0, PREVIEW);

  const fmt = (ing) => {
    if (ing.unit === "to taste") return "to taste";
    return [ing.amount, ing.unit].filter(Boolean).join(" ");
  };

  return (
    <div className="mx-4 sm:mx-5 mb-3 rounded-2xl border border-orange-100 bg-orange-50/60 px-3.5 py-3">
      <div className="flex items-center gap-1.5 mb-2">
        <UtensilsCrossed size={13} className="text-[#F57600]" />
        <span className="text-xs font-extrabold text-[#F57600] uppercase tracking-wide">
          Ingredients
        </span>
        <span className="ml-auto text-[10px] text-orange-400 font-medium">
          {ingredients.length} item{ingredients.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Scrollable list when > 4 items */}
      <ul
        className="space-y-1 overflow-y-auto pr-0.5"
        style={{ maxHeight: expanded ? "none" : undefined }}
      >
        {visible.map((ing) => {
          const measure = fmt(ing);
          return (
            <li key={ing.id} className="flex items-baseline gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F57600] shrink-0 mt-1.5" />
              {measure && (
                <span className="text-[11px] font-bold text-[#F57600] shrink-0 min-w-[52px]">
                  {measure}
                </span>
              )}
              <span className="text-sm text-gray-700 leading-snug">{ing.name}</span>
            </li>
          );
        })}
      </ul>

      {showToggle && (
        <button
          onClick={() => setExpanded((p) => !p)}
          className="mt-2 flex items-center gap-1 text-[#F57600] text-xs font-bold hover:underline"
        >
          {expanded
            ? <><ChevronUp size={12} /> Show less</>
            : <><ChevronDown size={12} /> +{ingredients.length - PREVIEW} more</>
          }
        </button>
      )}
    </div>
  );
};

/* ── Main ExpandedView ── */
const ExpandedView = ({
  post,
  startIndex = 0,
  isOwner = false,
  onClose,
  onEdit,
  onDelete,
  onArchive,
  onReport,
}) => {
  const navigate = useNavigate();
  const [current, setCurrent]       = useState(startIndex);
  const [showComments, setShowComments] = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);

  const menuRef            = useRef(null);
  const commentSectionRef  = useRef(null);
  const pinnedTextareaRef  = useRef(null);
  const [pinnedInput, setPinnedInput] = useState("");

  const media       = post.mediaItems ?? [];
  const hasMultiple = media.length > 1;
  const item        = media[current] ?? null;

  const goPrev = (e) => { e.stopPropagation(); setCurrent((p) => (p - 1 + media.length) % media.length); };
  const goNext = (e) => { e.stopPropagation(); setCurrent((p) => (p + 1) % media.length); };

  useEffect(() => {
    const el = pinnedTextareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [pinnedInput]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft"  && hasMultiple) setCurrent((p) => (p - 1 + media.length) % media.length);
      if (e.key === "ArrowRight" && hasMultiple) setCurrent((p) => (p + 1) % media.length);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKeyDown); document.body.style.overflow = "unset"; };
  }, [onClose, hasMultiple, media.length]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const submitComment = () => {
    const text = pinnedInput.trim();
    if (!text) return;
    commentSectionRef.current?.addComment(text);
    setPinnedInput("");
    if (pinnedTextareaRef.current) pinnedTextareaRef.current.style.height = "auto";
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-stretch sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full h-full sm:rounded-3xl overflow-hidden flex flex-col sm:flex-row shadow-2xl sm:w-[92vw] sm:h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── LEFT: media carousel ── */}
        <div className="relative bg-black shrink-0 h-[45dvh] sm:h-full sm:w-[55%]">
          <button
            onClick={onClose}
            className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-1.5 bg-[#F57600] hover:bg-orange-600 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-colors shadow-lg"
          >
            <ChevronLeft size={14} /> Back
          </button>

          {hasMultiple && (
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-black/50 text-white text-xs font-bold px-3 py-1 rounded-full">
              {current + 1} / {media.length}
            </div>
          )}

          {item && (item.type === "image" ? (
            <img src={item.url} alt="" className="absolute inset-0 w-full h-full object-contain" />
          ) : (
            <video key={item.url} src={item.url} controls autoPlay className="absolute inset-0 w-full h-full object-contain" />
          ))}

          {hasMultiple && (
            <>
              <button onClick={goPrev} className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 rounded-full bg-black/40 hover:bg-black/60 text-white">
                <ChevronLeft size={22} className="sm:hidden" />
                <ChevronLeft size={28} className="hidden sm:block" />
              </button>
              <button onClick={goNext} className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 rounded-full bg-black/40 hover:bg-black/60 text-white">
                <ChevronRight size={22} className="sm:hidden" />
                <ChevronRight size={28} className="hidden sm:block" />
              </button>
            </>
          )}

          {hasMultiple && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {media.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                  className={`rounded-full transition-all ${i === current ? "bg-white w-5 h-2" : "bg-white/40 w-2 h-2"}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: content panel ── */}
        <div className="flex flex-col flex-1 sm:w-[45%] bg-white overflow-hidden min-h-0">

          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <Avatar src={post.avatar} alt={post.author} size={9} />
              <div>
                <p className="text-sm font-bold text-gray-900 leading-tight">{post.author}</p>
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
                    onEdit={() => { setMenuOpen(false); onEdit?.(); onClose(); }}
                    onDelete={() => { setMenuOpen(false); onDelete?.(); onClose(); }}
                    onArchive={() => { setMenuOpen(false); onArchive?.(); }}
                    onReport={() => { setMenuOpen(false); onReport?.(); }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto min-h-0">

            {/* ── 1. TITLE ── */}
            {(() => {
              const hasPerMedia  = media.length > 1 && (item?.title || item?.caption);
              const displayTitle = hasPerMedia ? item.title : post.title;
              if (!displayTitle) return null;
              return (
                <div className="px-4 sm:px-5 pt-3 sm:pt-4 pb-1">
                  {hasPerMedia && (
                    <p className="text-[10px] font-bold text-[#F57600] uppercase tracking-wide mb-1">
                      Photo {current + 1} of {media.length}
                    </p>
                  )}
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">{displayTitle}</h3>
                </div>
              );
            })()}

            {/* ── 2. INGREDIENTS ── */}
            <IngredientList ingredients={post.ingredients} />

            {/* ── 3. DESCRIPTION / caption ── */}
            {(() => {
              const hasPerMedia    = media.length > 1 && (item?.title || item?.caption);
              const displayCaption = hasPerMedia ? item.caption : post.caption;
              if (!displayCaption && !(hasPerMedia && post.caption)) return null;
              return (
                <div className="px-4 sm:px-5 pb-3 sm:pb-4">
                  {displayCaption && (
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{displayCaption}</p>
                  )}
                  {hasPerMedia && post.caption && (
                    <p className="text-gray-400 text-xs leading-relaxed mt-3 pt-3 border-t border-gray-100 whitespace-pre-wrap">{post.caption}</p>
                  )}
                </div>
              );
            })()}

            {/* Actions bar */}
            <div className="sticky top-0 bg-white z-10 border-t border-b border-gray-100 flex items-center justify-between pr-3 sm:pr-5">
              <PostActions
                post={post}
                onComment={() => setShowComments((s) => !s)}
                commentsOpen={showComments}
              />
              <button
                onClick={() => navigate("/chatbot", { state: { prefill: post.caption || post.title || "" } })}
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#F57600] to-[#F0AE35] text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-full shadow hover:opacity-90 transition-all shrink-0"
              >
                <Bot size={13} />
                <span className="hidden xs:inline">Chatbot</span>
              </button>
            </div>

            {showComments && (
              <CommentSection
                ref={commentSectionRef}
                postId={post.id}
                initialComments={post.commentsList ?? [
                  { id: "s1", author: "FoodieChef", avatar: "https://i.pravatar.cc/100?img=5", text: "This looks absolutely delicious! 😍", time: "2h ago", replies: [] },
                  { id: "s2", author: "RecipeLover", avatar: "https://i.pravatar.cc/100?img=9", text: "Can I substitute the butter with olive oil?", time: "1h ago", replies: [] },
                ]}
                hideInput
              />
            )}
          </div>

          {/* Pinned comment input */}
          {showComments && (
            <div
              className="border-t border-gray-100 shrink-0 px-3 sm:px-4 pb-3 pt-2 flex items-center gap-2 bg-white"
              style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}
            >
              <img
                src="https://i.pravatar.cc/100?img=12"
                alt="You"
                className="w-7 h-7 rounded-full object-cover shrink-0 border border-orange-200"
              />
              <div className="flex-1 flex items-center bg-gray-50 rounded-2xl border border-gray-200 px-3 py-2 gap-2 focus-within:border-[#F57600] transition-colors">
                <textarea
                  ref={pinnedTextareaRef}
                  rows={1}
                  value={pinnedInput}
                  onChange={(e) => setPinnedInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment(); } }}
                  placeholder="Write a comment..."
                  className="flex-1 text-xs text-gray-700 placeholder-gray-400 border-none focus:ring-0 outline-none bg-transparent resize-none overflow-y-auto leading-relaxed"
                  style={{ minHeight: "18px", maxHeight: "100px" }}
                />
                <button
                  onClick={submitComment}
                  disabled={!pinnedInput.trim()}
                  className={`transition-colors shrink-0 ${pinnedInput.trim() ? "text-[#F57600] hover:text-orange-600" : "text-gray-300"}`}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ExpandedView;