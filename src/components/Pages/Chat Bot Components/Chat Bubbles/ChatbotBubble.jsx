import React, { useEffect, useState } from "react";
import AILogo from "../../../Assets/AILogo.png";

/**
 * BotMessageBubble
 * Props:
 *   message      (string)  — text content
 *   time         (string)  — timestamp
 *   isLoading    (boolean) — show typing dots
 *   hideActions  (boolean) — suppress the hover action row
 */
export default function BotMessageBubble({ message, time, isLoading = false, hideActions = false }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (isLoading || !message) return;
    setDisplayed("");
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      setDisplayed(message.slice(0, i + 1));
      i++;
      if (i >= message.length) { clearInterval(id); setDone(true); }
    }, 18);
    return () => clearInterval(id);
  }, [message, isLoading]);

  return (
    <div className="flex gap-2 sm:gap-4 px-3 sm:px-8 group">
      {/* AI Avatar */}
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#1A2B5F] to-[#2563EB] flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
        <img src={AILogo} alt="AI" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain" />
      </div>

      {/* Prose */}
      <div className="flex-1 min-w-0">
        {isLoading ? (
          <span className="flex items-center gap-1 h-5 mt-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </span>
        ) : (
          <p className="text-xs sm:text-sm text-gray-800 leading-6 sm:leading-7">
            {displayed}
            {!done && <span className="inline-block w-[2px] h-[14px] bg-gray-500 ml-0.5 align-middle animate-pulse" />}
          </p>
        )}

        {/* Action row — tap-visible on mobile (always show), hover on desktop */}
        {done && !hideActions && (
          <div className="flex items-center gap-1 sm:gap-1.5 mt-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
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
        )}
      </div>
    </div>
  );
}