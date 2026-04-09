import { useState } from "react";
import {
  FaRegThumbsUp,
  FaRegThumbsDown,
  FaRegCommentDots,
  FaShareAlt,
  FaEllipsisH,
} from "react-icons/fa";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { createPortal } from "react-dom";

// ─── Expanded Post View ───────────────────────────────────────────────────────
const ExpandedView = ({ post, startIndex, onClose }) => {
  const [current, setCurrent] = useState(startIndex);
  const media = post.mediaItems ?? [];
  const hasMultiple = media.length > 1;
  const item = media[current] ?? null;

  const goPrev = (e) => {
    e.stopPropagation();
    setCurrent((prev) => (prev - 1 + media.length) % media.length);
  };

  const goNext = (e) => {
    e.stopPropagation();
    setCurrent((prev) => (prev + 1) % media.length);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Container: fixed 85vw x 85vh — never resizes */}
      <div
        className="bg-white rounded-3xl overflow-hidden flex shadow-2xl"
        style={{ width: "85vw", height: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* LEFT: Fixed image panel — always the same size */}
        <div
          className="relative bg-black shrink-0 flex items-center justify-center"
          style={{ width: "55%", height: "100%" }}
        >
          {/* Back button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-[#F57600] hover:bg-orange-600 text-white text-sm font-bold px-4 py-2 rounded-full transition-colors shadow-lg"
          >
            <ChevronLeft size={16} />
            Back
          </button>

          {/* Counter badge */}
          {hasMultiple && (
            <div className="absolute top-4 right-4 z-10 bg-black/50 text-white text-xs font-bold px-3 py-1 rounded-full">
              {current + 1} / {media.length}
            </div>
          )}

          {/* Media — always fills the fixed box, never resizes the container */}
          {item && (
            item.type === "image" ? (
              <img
                src={item.url}
                alt=""
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <video
                key={item.url}
                src={item.url}
                controls
                autoPlay
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            )
          )}

          {/* Left chevron */}
          <button
            onClick={goPrev}
            disabled={!hasMultiple}
            className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full transition-all
              ${hasMultiple
                ? "bg-black/40 hover:bg-black/60 text-white cursor-pointer"
                : "opacity-0 pointer-events-none"
              }`}
          >
            <ChevronLeft size={28} />
          </button>

          {/* Right chevron */}
          <button
            onClick={goNext}
            disabled={!hasMultiple}
            className={`absolute right-3 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full transition-all
              ${hasMultiple
                ? "bg-black/40 hover:bg-black/60 text-white cursor-pointer"
                : "opacity-0 pointer-events-none"
              }`}
          >
            <ChevronRight size={28} />
          </button>

          {/* Dot indicators */}
          {hasMultiple && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {media.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                  className={`rounded-full transition-all ${
                    i === current ? "bg-white w-5 h-2" : "bg-white/40 w-2 h-2"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Post content — fills remaining width, fixed height */}
        <div
          className="flex flex-col overflow-hidden"
          style={{ width: "45%", height: "100%" }}
        >
          {/* Author header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full border-2 border-orange-400 overflow-hidden shadow-sm shrink-0">
                <img
                  src={post.avatar || "https://i.pravatar.cc/100"}
                  alt="author"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  Author: {post.author}
                </p>
                <p className="text-xs text-gray-500">
                  Date Create: {post.date}
                </p>
              </div>
            </div>
            <button className="p-2 bg-orange-50 rounded-full text-orange-800 hover:bg-orange-100 transition-colors">
              <FaEllipsisH size={14} />
            </button>
          </div>

          {/* Scrollable caption — takes remaining space */}
          <div className="flex-1 overflow-y-auto p-5">
            {post.caption && (
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {post.caption}
              </p>
            )}
          </div>

          {/* Interaction buttons — always pinned to bottom */}
          <div className="p-5 border-t border-gray-100 shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-orange-50 rounded-full px-4 py-2.5 gap-3">
                <button className="flex items-center gap-2 hover:text-orange-600 transition-colors">
                  <FaRegThumbsUp size={14} />
                  <span className="font-bold text-sm">{post.likes ?? 0}</span>
                </button>
                <div className="w-[1px] h-4 bg-gray-300" />
                <button className="hover:text-orange-600 transition-colors">
                  <FaRegThumbsDown size={14} />
                </button>
              </div>

              <div className="flex items-center bg-orange-50 rounded-full px-4 py-2.5 gap-2">
                <FaRegCommentDots size={14} />
                <span className="font-bold text-sm">{post.comments ?? 0}</span>
              </div>

              <button className="p-2.5 bg-orange-50 rounded-full hover:bg-orange-100 transition-colors">
                <FaShareAlt size={14} />
              </button>

              <button className="ml-auto flex items-center gap-2 bg-gradient-to-r from-[#F57600] to-[#F0AE35] text-white text-sm font-bold px-5 py-2.5 rounded-full shadow hover:opacity-90 transition-all">
                🤖 Chatbot
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ─── PostCard ─────────────────────────────────────────────────────────────────
const PostCard = ({ post }) => {
  const [likes, setLikes] = useState(post.likes ?? 0);
  const [liked, setLiked] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
  };

  const media = post.mediaItems ?? [];
  const visibleMedia = media.slice(0, 3);
  const hiddenCount = media.length > 3 ? media.length - 3 : 0;

  const MediaThumb = ({ item, index, className = "" }) => {
    const isLast = index === visibleMedia.length - 1 && hiddenCount > 0;
    return (
      <div
        className={`relative overflow-hidden bg-gray-100 cursor-pointer ${className}`}
        onClick={() => setExpandedIndex(index)}
      >
        {item.type === "image" ? (
          <img
            src={item.url}
            alt=""
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="relative w-full h-full bg-gray-900">
            <video src={item.url} className="w-full h-full object-cover opacity-90" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Play size={22} className="text-white fill-white opacity-90" />
            </div>
          </div>
        )}
        {isLast && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
            <span className="text-white text-xl font-bold">+{hiddenCount}</span>
          </div>
        )}
      </div>
    );
  };

  const renderMediaGrid = () => {
    if (media.length === 0) return null;

    if (media.length === 1) {
      return (
        <div
          className="w-1/3 shrink-0 rounded-2xl overflow-hidden cursor-pointer"
          style={{ minHeight: "160px" }}
          onClick={() => setExpandedIndex(0)}
        >
          {media[0].type === "image" ? (
            <img src={media[0].url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="relative w-full h-full bg-gray-900">
              <video src={media[0].url} className="w-full h-full object-cover opacity-90" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Play size={28} className="text-white fill-white" />
              </div>
            </div>
          )}
        </div>
      );
    }

    if (media.length === 2) {
      return (
        <div className="w-1/3 shrink-0 rounded-2xl overflow-hidden flex flex-col gap-0.5" style={{ minHeight: "160px" }}>
          <MediaThumb item={visibleMedia[0]} index={0} className="flex-1" />
          <MediaThumb item={visibleMedia[1]} index={1} className="flex-1" />
        </div>
      );
    }

    return (
      <div className="w-1/3 shrink-0 rounded-2xl overflow-hidden" style={{ minHeight: "160px" }}>
        <div className="grid grid-cols-2 gap-0.5 h-full">
          <div
            className="relative overflow-hidden bg-gray-100 cursor-pointer row-span-2"
            onClick={() => setExpandedIndex(0)}
          >
            {visibleMedia[0].type === "image" ? (
              <img src={visibleMedia[0].url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="relative w-full h-full bg-gray-900">
                <video src={visibleMedia[0].url} className="w-full h-full object-cover opacity-90" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Play size={22} className="text-white fill-white opacity-90" />
                </div>
              </div>
            )}
          </div>
          <MediaThumb item={visibleMedia[1]} index={1} className="aspect-square" />
          <MediaThumb item={visibleMedia[2]} index={2} className="aspect-square" />
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-3xl shadow-md overflow-hidden border border-gray-100 mb-6">
        <div className="flex flex-row p-4 gap-4">

          {media.length > 0 && renderMediaGrid()}

          <div className="flex-1 flex flex-col justify-between py-1 relative min-w-0">
            <div className="absolute top-0 right-0 p-2 bg-orange-50 rounded-full text-orange-800 cursor-pointer hover:bg-orange-100 transition-colors">
              <FaEllipsisH size={14} />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full border-2 border-orange-400 overflow-hidden shadow-sm shrink-0">
                  <img
                    src={post.avatar || "https://i.pravatar.cc/100"}
                    alt="author"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 leading-tight">{post.author}</h4>
                  <p className="text-xs text-gray-500">{post.date}</p>
                </div>
              </div>

              {post.caption && (
                <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">
                  {post.caption}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <div className="flex items-center bg-orange-50 rounded-full px-3 py-2 gap-2">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 transition-colors ${liked ? "text-orange-500" : "hover:text-orange-600"}`}
                >
                  <FaRegThumbsUp size={13} />
                  <span className="font-bold text-sm">{likes}</span>
                </button> 
                <div className="w-[1px] h-4 bg-gray-300" />
                <button className="hover:text-orange-600 transition-colors">
                  <FaRegThumbsDown size={13} />
                </button>
              </div>

              <div className="flex items-center bg-orange-50 rounded-full px-3 py-2 gap-1.5">
                <FaRegCommentDots size={13} />
                <span className="font-bold text-sm">{post.comments ?? 0}</span>
              </div>

              <button className="p-2.5 bg-orange-50 rounded-full hover:bg-orange-100 transition-colors">
                <FaShareAlt size={13} />
              </button>

              <span className="ml-auto text-xs text-gray-400">{post.date}</span>
            </div>
          </div>

        </div>
      </div>

      {expandedIndex !== null && (
        <ExpandedView
          post={post}
          startIndex={expandedIndex}
          onClose={() => setExpandedIndex(null)}
        />
      )}
    </>
  );
};

export default PostCard;