import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { FaThumbsUp } from "react-icons/fa";
import { MoreMenu, CURRENT_USER } from "./CommentItem"; // shared ··· menu + identity

// ─── Auto-growing textarea ────────────────────────────────────────────────────
const AutoTextarea = ({ value, onChange, onKeyDown, placeholder, inputRef }) => {
  useEffect(() => {
    if (!inputRef?.current) return;
    inputRef.current.style.height = "auto";
    inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
  }, [value, inputRef]);

  return (
    <textarea
      ref={inputRef}
      rows={1}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className="w-full text-xs text-gray-700 placeholder-gray-400 border-none focus:ring-0 outline-none bg-transparent resize-none overflow-y-auto leading-relaxed"
      style={{ minHeight: "18px", maxHeight: "100px" }}
    />
  );
};

// ─── ReplyBubble ──────────────────────────────────────────────────────────────
const ReplyBubble = ({ reply, depth = 0 }) => {
  const [vote,          setVote]          = useState("none");
  const [likes,         setLikes]         = useState(reply.likes ?? 0);
  const [showInput,     setShowInput]     = useState(false);
  const [input,         setInput]         = useState("");
  const [nested,        setNested]        = useState(reply.replies ?? []);
  const [nestedVisible, setNestedVisible] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    if (showInput && inputRef.current) inputRef.current.focus();
  }, [showInput]);

  const handleLike = () => {
    if (vote === "liked") { setVote("none"); setLikes((l) => l - 1); }
    else { setVote("liked"); setLikes((l) => l + (vote === "disliked" ? 1 : 1)); }
  };
  const handleDislike = () => {
    if (vote === "disliked") setVote("none");
    else { if (vote === "liked") setLikes((l) => l - 1); setVote("disliked"); }
  };

  const handleSubmit = () => {
    const text = input.trim();
    if (!text) return;
    setNested((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        author: CURRENT_USER,
        avatar: "https://i.pravatar.cc/100?img=12",
        text,
        replyingTo: reply.author,
        time: "Just now",
        likes: 0,
        replies: [],
      },
    ]);
    setNestedVisible(true);
    setInput("");
    setShowInput(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
    if (e.key === "Escape") { setShowInput(false); setInput(""); }
  };

  return (
    <div className="flex gap-2 w-full">
      <img
        src={reply.avatar}
        alt={reply.author}
        className="w-7 h-7 rounded-full object-cover border border-gray-200 shrink-0 mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="bg-gray-100 rounded-2xl px-3 py-2 w-full">
          <p className="text-xs font-bold text-gray-800 mb-0.5">
            {reply.replyingTo && (
              <span className="text-[#F57600] mr-1">@{reply.replyingTo}</span>
            )}
            {reply.author}
          </p>
          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
            {reply.text}
          </p>
        </div>

        <div className="flex items-center gap-3 mt-1 ml-1 flex-wrap">
          <span className="text-[10px] text-gray-400">{reply.time}</span>

          <button
            onClick={handleLike}
            className={`text-[10px] font-bold transition-colors flex items-center gap-0.5 ${
              vote === "liked" ? "text-[#F57600]" : "text-gray-500 hover:text-[#F57600]"
            }`}
          >
            {vote === "liked" && <FaThumbsUp size={9} />}
            Like {likes > 0 && `· ${likes}`}
          </button>

          <button
            onClick={handleDislike}
            className={`text-[10px] font-bold transition-colors ${
              vote === "disliked" ? "text-blue-500" : "text-gray-500 hover:text-blue-500"
            }`}
          >
            Dislike
          </button>

          <button
            onClick={() => setShowInput((v) => !v)}
            className={`text-[10px] font-bold transition-colors ${
              showInput ? "text-[#F57600]" : "text-gray-500 hover:text-[#F57600]"
            }`}
          >
            Reply
          </button>

          {/* Pass author — MoreMenu hides Report when author === CURRENT_USER */}
          <MoreMenu
            text={reply.text}
            author={reply.author}
            reportLabel="Report reply"
            subject="this reply"
          />
        </div>

        {/* Nested replies toggle */}
        {nested.length > 0 && (
          <div className="mt-1.5 ml-1 flex flex-col gap-2">
            <button
              onClick={() => setNestedVisible((v) => !v)}
              className="text-[10px] font-bold text-[#F57600] hover:underline self-start"
            >
              {nestedVisible
                ? "Hide replies"
                : `View ${nested.length} ${nested.length === 1 ? "reply" : "replies"}`}
            </button>
            {nestedVisible && (
              <div className="flex flex-col gap-2">
                {nested.map((r) => (
                  <ReplyBubble key={r.id} reply={r} depth={depth + 1} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inline reply input */}
        {showInput && (
          <div className="mt-2 flex items-center gap-2">
            <img
              src="https://i.pravatar.cc/100?img=12"
              alt="You"
              className="w-7 h-7 rounded-full object-cover shrink-0 border border-orange-300"
            />
            <div className="flex-1 min-w-0 flex items-center bg-white rounded-2xl border border-gray-200 px-3 py-1.5 gap-2 focus-within:border-[#F57600] transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-[#F57600] font-semibold mb-0.5">
                  @{reply.author}
                </p>
                <AutoTextarea
                  inputRef={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Reply to ${reply.author}...`}
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className={`shrink-0 transition-colors ${
                  input.trim() ? "text-[#F57600]" : "text-gray-300"
                }`}
              >
                <Send size={11} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── ReplySection ─────────────────────────────────────────────────────────────
const ReplySection = ({
  parentId,
  parentAuthor,
  replies      = [],
  showInput    = false,
  onAdd,
  onCloseInput,
}) => {
  const [visible,      setVisible]      = useState(true);
  const [localReplies, setLocalReplies] = useState(replies);
  const [input,        setInput]        = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (showInput && inputRef.current) inputRef.current.focus();
  }, [showInput]);

  const handleSubmit = () => {
    const text = input.trim();
    if (!text) return;
    setLocalReplies((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        author: CURRENT_USER,
        avatar: "https://i.pravatar.cc/100?img=12",
        text,
        replyingTo: null,
        time: "Just now",
        likes: 0,
        replies: [],
      },
    ]);
    setVisible(true);
    onAdd?.(text);
    setInput("");
    onCloseInput?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
    if (e.key === "Escape") { onCloseInput?.(); setInput(""); }
  };

  const hasReplies = localReplies.length > 0;
  if (!hasReplies && !showInput) return null;

  return (
    <div className="mt-1.5 ml-1 flex flex-col gap-2">
      {hasReplies && (
        <button
          onClick={() => setVisible((v) => !v)}
          className="text-[10px] font-bold text-[#F57600] hover:underline self-start"
        >
          {visible
            ? "Hide replies"
            : `View ${localReplies.length} ${localReplies.length === 1 ? "reply" : "replies"}`}
        </button>
      )}

      {visible && localReplies.map((r) => (
        <ReplyBubble key={r.id} reply={r} depth={0} />
      ))}

      {showInput && (
        <div className="flex items-center gap-2">
          <img
            src="https://i.pravatar.cc/100?img=12"
            alt="You"
            className="w-7 h-7 rounded-full object-cover shrink-0 border border-orange-300"
          />
          <div className="flex-1 min-w-0 flex items-center bg-white rounded-2xl border border-gray-200 px-3 py-1.5 gap-2 focus-within:border-[#F57600] transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-[#F57600] font-semibold mb-0.5">
                @{parentAuthor}
              </p>
              <AutoTextarea
                inputRef={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Reply to ${parentAuthor}...`}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className={`shrink-0 transition-colors ${
                input.trim() ? "text-[#F57600]" : "text-gray-300"
              }`}
            >
              <Send size={11} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReplySection;