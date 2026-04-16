import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

/**
 * Auto-growing textarea input — expands as user types, just like Facebook.
 * @param {Function} onSubmit   - called with text string on send
 * @param {string}   placeholder
 * @param {string}   avatarSrc
 */
const CommentInput = ({ onSubmit, placeholder = "Write a comment...", avatarSrc = "https://i.pravatar.cc/100?img=12" }) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);

  // Auto-resize textarea to fit content
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [input]);

  const handleSubmit = () => {
    const text = input.trim();
    if (!text) return;
    onSubmit?.(text);
    setInput("");
    // reset height after clear
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="px-4 pb-3 pt-2 flex items-center gap-2">
      <img
        src={avatarSrc}
        alt="You"
        className="w-7 h-7 rounded-full object-cover shrink-0 border border-orange-200"
      />
      <div className="flex-1 flex items-center bg-white rounded-2xl border border-gray-200 px-3 py-2 gap-2 focus-within:border-[#F57600] transition-colors">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 text-xs text-gray-700 placeholder-gray-400 border-none focus:ring-0 outline-none bg-transparent resize-none overflow-y-auto leading-relaxed"
          style={{ minHeight: "18px", maxHeight: "120px" }}
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim()}
          className={`transition-colors shrink-0 ${
            input.trim() ? "text-[#F57600] hover:text-orange-600" : "text-gray-300"
          }`}
          aria-label="Send"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};

export default CommentInput;