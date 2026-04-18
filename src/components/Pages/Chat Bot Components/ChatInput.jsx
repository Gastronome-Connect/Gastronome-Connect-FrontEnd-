import React, { useRef, useEffect } from "react";

export default function ChatInput({
  value,
  onChange,
  onSend,
  placeholder = "Ask me about recipes...",
  disabled = false,
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
  };

  return (
    <div className="w-full">
      <div
        className={`flex items-end gap-1.5 sm:gap-2 bg-white rounded-2xl sm:rounded-[1.75rem] border
                   ${disabled ? "border-gray-200" : "border-gray-300 focus-within:border-blue-400"}
                   px-3 sm:px-4 py-2.5 sm:py-3 transition-all duration-200 shadow-sm`}
      >
        {/* Attach */}
        <button
          type="button"
          tabIndex={-1}
          className="flex-shrink-0 mb-0.5 w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Attach"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder-gray-400
                     outline-none leading-relaxed max-h-[140px] overflow-y-auto py-0.5
                     disabled:opacity-50"
        />

        {/* Mic + Send */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0 mb-0.5">
          {/* Mic — always visible */}
          {/* <button
            type="button"
            tabIndex={-1}
            aria-label="Voice input"
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a4 4 0 014 4v6a4 4 0 01-8 0V5a4 4 0 014-4z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v1a7 7 0 01-14 0v-1M12 18v4m-3 0h6" />
            </svg>
          </button> */}

          <button
            type="button"
            onClick={handleSend}
            disabled={!value.trim() || disabled}
            aria-label="Send"
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-150
                       ${
                         value.trim() && !disabled
                           ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                           : "bg-gray-200 text-gray-400 cursor-not-allowed"
                       }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14M13 6l6 6-6 6"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
