import React from "react";

/**
 * UserMessageBubble — right-aligned bubble for user messages.
 */
export default function UserMessageBubble({ message, avatar, time }) {
  const renderMessage = (text) => {
    if (!text) return null;
    const paragraphs = text.split(/\n\n+/);
    return paragraphs.map((para, pIdx) => (
      <p key={pIdx} className={pIdx > 0 ? "mt-2" : ""}>
        {para.split("\n").map((line, lIdx) => (
          <React.Fragment key={lIdx}>
            {lIdx > 0 && <br />}
            {line}
          </React.Fragment>
        ))}
      </p>
    ));
  };

  return (
    <div className="flex items-start justify-end gap-2 sm:gap-2.5 px-3 sm:px-8 py-1 group">

      {/* Bubble + timestamp */}
      <div className="flex flex-col items-end gap-1 max-w-[85%] sm:max-w-[70%]">
        <div
          className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl
                     bg-gradient-to-br from-[#F57600] to-[#F0AE35]
                     text-white text-xs sm:text-sm font-medium leading-relaxed
                     shadow-md shadow-orange-200/60"
        >
          {renderMessage(message)}
        </div>
        {time && (
          <span className="text-[10px] text-gray-400 pr-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
            {time}
          </span>
        )}
      </div>

      {/* Avatar */}
      {avatar ? (
        <img
          src={avatar}
          alt="You"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-orange-200 flex-shrink-0"
        />
      ) : (
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#F57600] to-[#F0AE35] flex items-center justify-center flex-shrink-0 ring-2 ring-orange-100">
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 1114 0H3z" />
          </svg>
        </div>
      )}
    </div>
  );
}