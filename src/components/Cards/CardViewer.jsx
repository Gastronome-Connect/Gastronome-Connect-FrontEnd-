import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Heart, Archive, Flag, ChevronDown, ChevronUp, Volume2 } from "lucide-react";
import { FaEllipsisH } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useUserLibrary } from "../../Context/UserLibraryContext";
import { useChat } from "../../Hooks/UseChats"; // ← adjust path if needed
import AILogo from "../Assets/AILogo.png";

/* ── Inline avatar ── */
const Avatar = ({ src, alt, size = 9 }) => {
  const px = size * 4;
  const initials = alt ? alt.charAt(0).toUpperCase() : "?";
  return src ? (
    <img
      src={src}
      alt={alt}
      style={{ width: px, height: px }}
      className="rounded-full object-cover border-2 border-orange-200 shrink-0"
    />
  ) : (
    <div
      style={{ width: px, height: px, background: "#F0AE35" }}
      className="rounded-full flex items-center justify-center shrink-0 border-2 border-orange-200"
    >
      <span style={{ fontSize: px * 0.4, color: "#fff", fontWeight: 700 }}>{initials}</span>
    </div>
  );
};

/* ── Ingredient list ── */
const IngredientList = ({ ingredients }) => {
  const [expanded, setExpanded] = useState(false);
  if (!ingredients || ingredients.length === 0) return null;

  const PREVIEW = 4;
  const showToggle = ingredients.length > PREVIEW;
  const visible = expanded ? ingredients : ingredients.slice(0, PREVIEW);

  const fmt = (ing) => {
    if (ing.unit === "to taste") return "to taste";
    return [ing.amount, ing.unit].filter(Boolean).join(" ");
  };

  return (
    <div className="mx-4 sm:mx-5 mb-3 rounded-2xl border border-orange-100 bg-orange-50/60 px-3.5 py-3">
      <div className="flex items-center gap-1.5 mb-2">
        <svg width="13" height="13" fill="none" stroke="#F57600" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
          <path d="M7 2v20" /><path d="M21 15V2" />
          <path d="M18 2h3a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4 4 4 0 0 1-4-4V3a1 1 0 0 1 1-1h3z" />
        </svg>
        <span className="text-xs font-extrabold text-[#F57600] uppercase tracking-wide">Ingredients</span>
        <span className="ml-auto text-[10px] text-orange-400 font-medium">
          {ingredients.length} item{ingredients.length !== 1 ? "s" : ""}
        </span>
      </div>
      <ul className="space-y-1 pr-0.5">
        {visible.map((ing) => {
          const measure = fmt(ing);
          const displayName = ing.name ? ing.name.charAt(0).toUpperCase() + ing.name.slice(1) : ing.name;
          return (
            <li key={ing.id} className="flex items-baseline gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F57600] shrink-0 mt-1.5" />
              {measure && (
                <span className="text-[11px] font-bold text-[#F57600] shrink-0 min-w-[52px]">{measure}</span>
              )}
              <span className="text-sm text-gray-700 leading-snug">{displayName}</span>
            </li>
          );
        })}
      </ul>
      {showToggle && (
        <button
          onClick={() => setExpanded((p) => !p)}
          className="mt-2 flex items-center gap-1 text-[#F57600] text-xs font-bold hover:underline"
        >
          {expanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> +{ingredients.length - PREVIEW} more</>}
        </button>
      )}
    </div>
  );
};

/* ── Main CardExpandedView ── */
const CardExpandedView = ({
  post,
  startIndex = 0,
  onClose,
  onReport,
  hideFavoriteAndOptions = false,
  hideOptionsMenu = false,
}) => {
  const navigate = useNavigate();
  const { startNewSession } = useChat(); // ← new
  const {
    isFavorited, toggleFavorite,
    isArchived, addToArchives, removeFromArchives,
    addToHistory,
  } = useUserLibrary();

  const [current, setCurrent] = useState(startIndex);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const menuRef = useRef(null);
  const historyTimerRef = useRef(null);
  const historyAddedRef = useRef(false);
  const speechChunksRef = useRef([]);
  const speechIndexRef = useRef(0);
  const speechActiveRef = useRef(false);
  const speechTimeoutRef = useRef(null);
  const currentUtteranceRef = useRef(null);

  const media = post.mediaItems ?? [];
  const hasMultiple = media.length > 1;
  const item = media[current] ?? null;
  const postId = post.id ?? post._id;
  const saved = isFavorited(post);
  const archived = isArchived(postId);

  useEffect(() => {
    historyAddedRef.current = false;
    historyTimerRef.current = setTimeout(() => {
      if (!historyAddedRef.current) {
        addToHistory(post);
        historyAddedRef.current = true;
      }
    }, 5000);
    return () => clearTimeout(historyTimerRef.current);
  }, [post, addToHistory]);

  const goPrev = (e) => { e.stopPropagation(); setCurrent((p) => (p - 1 + media.length) % media.length); };
  const goNext = (e) => { e.stopPropagation(); setCurrent((p) => (p + 1) % media.length); };

  const handleSave = () => toggleFavorite(post);

  const handleArchive = () => {
    if (archived) removeFromArchives(postId);
    else addToArchives(post);
    setMenuOpen(false);
  };

  const stopSpeaking = React.useCallback(() => {
    speechActiveRef.current = false;
    speechChunksRef.current = [];
    speechIndexRef.current = 0;
    currentUtteranceRef.current = null;
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const queueNextChunk = React.useCallback((nextIndex) => {
    if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
    speechTimeoutRef.current = setTimeout(() => {
      speakChunk(nextIndex);
    }, 75);
  }, []);

  const speakChunk = React.useCallback((index = 0) => {
    const chunks = speechChunksRef.current;
    if (!speechActiveRef.current || index >= chunks.length) {
      currentUtteranceRef.current = null;
      setIsSpeaking(false);
      setIsPaused(false);
      speechActiveRef.current = false;
      return;
    }

    speechIndexRef.current = index;
    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    currentUtteranceRef.current = utterance;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = "en-US";

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      if (!speechActiveRef.current) return;
      queueNextChunk(index + 1);
    };

    utterance.onerror = (e) => {
      if (e.error === "interrupted" || e.error === "canceled") return;
      queueNextChunk(index + 1);
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [queueNextChunk]);

  const handleSpeak = () => {
    if (!window?.speechSynthesis) return;

    if (isSpeaking) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
      return;
    }

    const ingredientsText =
      post.ingredients?.length > 0
        ? post.ingredients
            .map((ing) => {
              const measure =
                ing.unit === "to taste"
                  ? "to taste"
                  : [ing.amount, ing.unit].filter(Boolean).join(" ");
              return `${measure ? `${measure} ` : ""}${ing.name}`;
            })
            .join(", ")
        : "";

    const parts = [`Title: ${post.title}`];
    if (ingredientsText) parts.push(`Ingredients: ${ingredientsText}`);
    if (post.caption) parts.push(`Description: ${post.caption}`);
    const textToSpeak = parts.join(". ");

    const chunks = textToSpeak
      .split(/(?<=[.!?])\s+/)
      .map((chunk) => chunk.trim())
      .filter(Boolean);

    if (chunks.length === 0) return;

    window.speechSynthesis.cancel();
    speechChunksRef.current = chunks;
    speechIndexRef.current = 0;
    speechActiveRef.current = true;
    speakChunk(0);
  };

  // ← new: start a fresh session then navigate with prefill
  const handleChatbot = () => {
    const ingredientsText = post.ingredients?.length > 0
      ? post.ingredients.map((ing) => {
          const measure = ing.unit === "to taste"
            ? "to taste"
            : [ing.amount, ing.unit].filter(Boolean).join(" ");
          const optional = ing.optional ? " (optional)" : "";
          return `${measure ? `${measure} ` : ""}${ing.name}${optional}`;
        }).join("\n")
      : "";

    const recipeInfo = [
      post.title     ? `Title:\n${post.title}`           : "",
      ingredientsText ? `\nIngredients:\n${ingredientsText}` : "",
      post.caption   ? `\nDescription:\n${post.caption}` : "",
    ].filter(Boolean).join("\n");

    startNewSession();
    onClose();
    navigate("/chatbot", { state: { prefill: recipeInfo } });
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") { stopSpeaking(); onClose(); }
      if (e.key === "ArrowLeft"  && hasMultiple) setCurrent((p) => (p - 1 + media.length) % media.length);
      if (e.key === "ArrowRight" && hasMultiple) setCurrent((p) => (p + 1) % media.length);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "unset";
      stopSpeaking();
    };
  }, [onClose, hasMultiple, media.length, stopSpeaking]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
  <div className="flex items-center gap-1.5">
    <p className="text-sm font-bold text-gray-900 leading-tight">{post.author}</p>
    {post.username && (
      <p className="text-xs text-gray-400">@{post.username}</p>
    )}
  </div>
  <p className="text-xs text-gray-400">{post.date}</p>
</div>
            </div>

            <div className="flex items-center gap-1.5">
              {!hideFavoriteAndOptions && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSave(); }}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-200
                      ${saved
                        ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
                        : "border-gray-200 text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-400"
                      }`}
                    title={saved ? "Unsave" : "Save recipe"}
                  >
                    <Heart size={15} fill={saved ? "currentColor" : "none"} strokeWidth={saved ? 0 : 2} />
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleArchive(); }}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-200
                      ${archived
                        ? "bg-orange-50 border-orange-200 text-[#F57600] hover:bg-orange-100"
                        : "border-gray-200 text-gray-400 hover:bg-orange-50 hover:border-orange-200 hover:text-[#F57600]"
                      }`}
                    title={archived ? "Unarchive recipe" : "Archive recipe"}
                  >
                    <Archive size={15} fill={archived ? "currentColor" : "none"} strokeWidth={archived ? 0 : 2} />
                  </button>
                </>
              )}

              <button
                onClick={handleSpeak}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-200
                  ${isSpeaking && !isPaused
                    ? "bg-blue-50 border-blue-200 text-blue-500 hover:bg-blue-100"
                    : "border-gray-200 text-gray-400 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-400"
                  }`}
                title={!isSpeaking ? "Read recipe aloud" : isPaused ? "Resume reading" : "Pause reading"}
              >
                <Volume2 size={15} fill={isSpeaking && !isPaused ? "currentColor" : "none"} strokeWidth={isSpeaking && !isPaused ? 0 : 2} />
              </button>

              {/* ── Updated Chatbot button ── */}
              <button
                onClick={handleChatbot}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-all duration-200 hover:border-orange-200 hover:bg-orange-50"
                title="Ask chatbot about recipe"
              >
                <img src={AILogo} alt="AI Chatbot" className="w-4 h-4 object-contain" />
              </button>

              {!hideFavoriteAndOptions && !hideOptionsMenu && (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((o) => !o)}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors
                      ${menuOpen ? "bg-orange-50 border-orange-200 text-[#F57600]" : "border-gray-200 text-gray-400 hover:bg-gray-50"}`}
                  >
                    <FaEllipsisH size={13} />
                  </button>
                  {menuOpen && (
                    <div className="absolute top-10 right-0 z-50 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xl min-w-[140px]">
                      <button
                        onClick={handleArchive}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-orange-50 transition-colors"
                      >
                        <Archive size={14} className="text-[#F57600]" />
                        {archived ? "Unarchive" : "Archive"}
                      </button>
                      <div className="h-px bg-gray-100 mx-2" />
                      <button
                        onClick={() => { setMenuOpen(false); onReport?.(); }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Flag size={14} /> Report
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* Title */}
            {(() => {
              const hasPerMedia  = media.length > 1 && (item?.title || item?.caption);
              const displayTitle = hasPerMedia ? item.title : post.title;
              if (!displayTitle) return null;
              return (
                <div className="px-4 sm:px-5 pt-4 pb-1">
                  {hasPerMedia && (
                    <p className="text-[10px] font-bold text-[#F57600] uppercase tracking-wide mb-1">
                      Photo {current + 1} of {media.length}
                    </p>
                  )}
                  <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-snug">{displayTitle}</h3>
                </div>
              );
            })()}

            <IngredientList ingredients={post.ingredients} />

            {/* Caption */}
            {(() => {
              const hasPerMedia    = media.length > 1 && (item?.title || item?.caption);
              const displayCaption = hasPerMedia ? item.caption : post.caption;
              const sharedCaption  = hasPerMedia ? post.caption : null;
              return (
                <div className="px-4 sm:px-5 pb-6">
                  {displayCaption && (
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{displayCaption}</p>
                  )}
                  {sharedCaption && (
                    <p className="text-gray-400 text-xs leading-relaxed mt-3 pt-3 border-t border-gray-100 whitespace-pre-wrap">{sharedCaption}</p>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CardExpandedView;
