import React, { useState, useRef } from "react";
import UserMessageBubble from "../Chat Bot Components/Chat Bubbles/UserBubble";
import BotMessageBubble  from "../Chat Bot Components/Chat Bubbles/ChatbotBubble";

// ── SmallRecipeCard ───────────────────────────────────────────────────────────
function SmallRecipeCard({ recipe }) {
  const { title = "Recipe", image = "", author = "Unknown", dateCreate = "", description = "" } = recipe || {};

  return (
    <div className="bg-white rounded-[16px] sm:rounded-[20px] shadow-md border border-gray-100 p-2.5 sm:p-3 w-[140px] sm:w-[160px] flex-shrink-0 hover:scale-[1.02] transition-transform">
      <div className="w-full h-16 sm:h-20 rounded-xl overflow-hidden mb-2 bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <svg className="w-6 h-6 sm:w-7 sm:h-7 text-orange-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-1.5-.454M9 6l3-3 3 3M12 3v12" />
          </svg>
        )}
      </div>
      <div className="w-2/3 h-[2px] bg-orange-500 rounded-full mb-1.5" />
      <h4 className="font-black text-[11px] sm:text-xs text-gray-900 leading-tight mb-1 truncate">{title}</h4>
      <p className="text-[9px] sm:text-[10px] font-semibold text-gray-700">Author: <span className="font-medium">{author}</span></p>
      <p className="text-[9px] sm:text-[10px] font-semibold text-gray-700 mb-1">Date: <span className="font-medium">{dateCreate}</span></p>
      <p className="text-[9px] sm:text-[10px] text-gray-400 line-clamp-2 leading-snug">{description}</p>
    </div>
  );
}

// ── RecipeCarousel ─────────────────────────────────────────────────────────────
// Desktop: paginated with chevron buttons (3 per page)
// Mobile:  free-scroll horizontal swipe, no pagination buttons
const PAGE_SIZE = 3;

function RecipeCarousel({ recipes }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(recipes.length / PAGE_SIZE);
  const canPrev = page > 0;
  const canNext = page < totalPages - 1;
  const visible = recipes.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  // Touch swipe state for mobile scroll container
  const scrollRef   = useRef(null);

  return (
    <>
      {/* ── Mobile: free horizontal scroll ── */}
      <div
        ref={scrollRef}
        className="flex sm:hidden gap-2 overflow-x-auto pb-2 -mx-1 px-1"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",          // Firefox
          msOverflowStyle: "none",         // IE
        }}
      >
        <style>{`.recipe-scroll::-webkit-scrollbar { display: none; }`}</style>
        <div className="recipe-scroll flex gap-2">
          {recipes.map((recipe, i) => (
            <div key={i} style={{ scrollSnapAlign: "start" }}>
              <SmallRecipeCard recipe={recipe} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Desktop: paginated with chevrons ── */}
      <div className="hidden sm:flex items-center" style={{ gap: "6px" }}>
        <button
          onClick={() => setPage((p) => p - 1)}
          disabled={!canPrev}
          className={`flex-shrink-0 transition-all ${canPrev ? "text-orange-500 hover:text-orange-600" : "text-gray-200 cursor-not-allowed"}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex" style={{ gap: "8px" }}>
          {visible.map((recipe, i) => <SmallRecipeCard key={i} recipe={recipe} />)}
        </div>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!canNext}
          className={`flex-shrink-0 transition-all ${canNext ? "text-orange-500 hover:text-orange-600" : "text-gray-200 cursor-not-allowed"}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </>
  );
}

// ── ActionBar ─────────────────────────────────────────────────────────────────
function ActionBar({ time }) {
  return (
    // pl offset matches the avatar width + gap on each breakpoint
    <div className="flex items-center gap-1 sm:gap-1.5 pl-9 sm:pl-20">
      {[
        <svg key="copy"  className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
        <svg key="up"    className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/><path strokeLinecap="round" strokeLinejoin="round" d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>,
        <svg key="down"  className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z"/><path strokeLinecap="round" strokeLinejoin="round" d="M17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/></svg>,
        <svg key="regen" className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>,
      ].map((icon, i) => (
        <button key={i} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">{icon}</button>
      ))}
      {time && <span className="text-[10px] text-gray-400 ml-1 sm:ml-2">{time}</span>}
    </div>
  );
}

// ── MessageList ───────────────────────────────────────────────────────────────
export default function MessageList({ messages, isBotTyping, bottomRef }) {
  return (
    <div className="flex-1 overflow-y-auto flex flex-col py-3 sm:py-4">
      {messages.map((msg) => {
        if (msg.role === "user") {
          return <UserMessageBubble key={msg.id} message={msg.text} time={msg.time} />;
        }

        if (msg.type === "text") {
          return <BotMessageBubble key={msg.id} message={msg.text} time={msg.time} />;
        }

        if (msg.type === "recipe") {
          return (
            <div key={msg.id} className="flex flex-col gap-2 py-2 group">
              {/* Bot intro text */}
              <BotMessageBubble message={msg.text} hideActions />

              {/* Recipe count */}
              <p className="text-[11px] text-gray-400 pl-9 sm:pl-20">
                {msg.recipes.length} recipe{msg.recipes.length !== 1 ? "s" : ""} found
                {/* On desktop show pagination hint; on mobile show swipe hint */}
                <span className="hidden sm:inline">
                  {Math.ceil(msg.recipes.length / PAGE_SIZE) > 1 && ` · use arrows to browse`}
                </span>
                <span className="inline sm:hidden"> · swipe to browse</span>
              </p>

              {/* Recipe carousel */}
              <div className="pl-9 sm:pl-20 overflow-hidden">
                <RecipeCarousel recipes={msg.recipes} />
              </div>

              {/* Action bar */}
              <ActionBar time={msg.time} />
            </div>
          );
        }

        return null;
      })}

      {isBotTyping && <BotMessageBubble isLoading />}
      <div ref={bottomRef} />
    </div>
  );
}