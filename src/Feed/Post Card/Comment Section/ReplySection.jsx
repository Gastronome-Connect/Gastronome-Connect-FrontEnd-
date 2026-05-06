import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { FaThumbsUp } from "react-icons/fa";
import { MoreMenu } from "./CommentItem"; // shared ··· menu + identity
import useCurrentUserAvatar from "../../../Hooks/useCurrentUserAvatar";
import useMentionSuggestions from "../../../Hooks/useMentionSuggestions";
import MentionSuggestionsDropdown from "../../../components/Editor/MentionSuggestionsDropdown";
import MentionText from "../../../components/Editor/MentionText";

const buildMentionSeed = (username = "") => {
  const normalizedUsername = String(username || "").trim();
  return normalizedUsername ? `@${normalizedUsername} ` : "";
};

// ─── Auto-growing textarea ────────────────────────────────────────────────────
const AutoTextarea = ({
  value,
  onChange,
  onKeyDown,
  placeholder,
  inputRef,
  ...textareaProps
}) => {
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
      {...textareaProps}
      className="w-full text-xs text-gray-700 placeholder-gray-400 border-none focus:ring-0 outline-none bg-transparent resize-none overflow-y-auto leading-relaxed"
      style={{ minHeight: "18px", maxHeight: "100px" }}
    />
  );
};

// ─── ReplyBubble ──────────────────────────────────────────────────────────────
const ReplyBubble = ({
  reply,
  depth = 0,
  threadCommentId,
  onAddReply,
  onReact,
  postId,
  onDelete,
  currentUserAvatar,
}) => {
  const vote = reply.viewerReaction || "none";
  const likes = reply.likesCount ?? reply.likes ?? 0;
  const [showInput, setShowInput] = useState(false);
  const [input, setInput] = useState("");
  const [nestedVisible, setNestedVisible] = useState(true);
  const inputRef = useRef(null);
  const nested = Array.isArray(reply.replies) ? reply.replies : [];
  const replyTargetUsername = reply.username || reply.replyingToUsername || "";
  const { suggestions, isOpen, setIsOpen, selectMention, syncCaretPosition } =
    useMentionSuggestions({
      value: input,
      setValue: setInput,
      textareaRef: inputRef,
    });

  useEffect(() => {
    if (showInput && inputRef.current) inputRef.current.focus();
  }, [showInput]);

  useEffect(() => {
    if (!showInput) {
      return;
    }

    setInput((current) => current || buildMentionSeed(replyTargetUsername));
  }, [showInput, replyTargetUsername]);

  const handleLike = () => {
    onReact?.(reply.id, "like");
  };
  const handleDislike = () => {
    onReact?.(reply.id, "dislike");
  };

  const handleSubmit = () => {
    const text = input.trim();
    if (!text) return;
    onAddReply?.({
      commentId: threadCommentId,
      parentReplyId: reply.id,
      text,
    });
    setNestedVisible(true);
    setInput("");
    setIsOpen(false);
    setShowInput(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      setShowInput(false);
      setInput("");
    }
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
            {reply.author}
          </p>
          <MentionText
            text={reply.text}
            mentions={reply.mentions}
            className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap break-words"
          />
        </div>

        <div className="flex items-center gap-3 mt-1 ml-1 flex-wrap">
          <span className="text-[10px] text-gray-400">{reply.time}</span>

          <button
            onClick={handleLike}
            className={`text-[10px] font-bold transition-colors flex items-center gap-0.5 ${
              vote === "liked"
                ? "text-[#F57600]"
                : "text-gray-500 hover:text-[#F57600]"
            }`}
          >
            {vote === "liked" && <FaThumbsUp size={9} />}
            Like {likes > 0 && `· ${likes}`}
          </button>

          <button
            onClick={handleDislike}
            className={`text-[10px] font-bold transition-colors ${
              vote === "disliked"
                ? "text-blue-500"
                : "text-gray-500 hover:text-blue-500"
            }`}
          >
            Dislike
          </button>

          <button
            onClick={() => setShowInput((v) => !v)}
            className={`text-[10px] font-bold transition-colors ${
              showInput
                ? "text-[#F57600]"
                : "text-gray-500 hover:text-[#F57600]"
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
            canDelete={Boolean(reply.canDeleteByViewer)}
            onDelete={() => onDelete?.(reply.id)}
            deleteLabel="Delete reply"
            comment={{
              ...reply,
              postId,
              replyId: reply.id,
              commentId: threadCommentId,
              targetType: "reply",
            }}
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
                  <ReplyBubble
                    key={r.id}
                    reply={r}
                    depth={depth + 1}
                    threadCommentId={threadCommentId}
                    onAddReply={onAddReply}
                    onReact={onReact}
                    postId={postId}
                    onDelete={onDelete}
                    currentUserAvatar={currentUserAvatar}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inline reply input */}
        {showInput && (
          <div className="mt-2 flex items-center gap-2">
            <img
              src={currentUserAvatar}
              alt="You"
              className="w-7 h-7 rounded-full object-cover shrink-0 border border-orange-300"
            />
            <div className="relative flex-1 min-w-0 flex items-center bg-white rounded-2xl border border-gray-200 px-3 py-1.5 gap-2 focus-within:border-[#F57600] transition-colors">
              {isOpen && (
                <MentionSuggestionsDropdown
                  suggestions={suggestions}
                  onSelect={(suggestion) => selectMention(suggestion.username)}
                />
              )}
              <div className="flex-1 min-w-0">
                <AutoTextarea
                  inputRef={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    syncCaretPosition(e);
                  }}
                  onKeyDown={handleKeyDown}
                  onClick={syncCaretPosition}
                  onKeyUp={syncCaretPosition}
                  onSelect={syncCaretPosition}
                  onBlur={() => {
                    setTimeout(() => setIsOpen(false), 120);
                  }}
                  onFocus={syncCaretPosition}
                  placeholder={`Mention @${replyTargetUsername || "username"} and write a reply...`}
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
  threadCommentId,
  parentAuthor,
  parentUsername,
  replies = [],
  showInput = false,
  onAdd,
  onCloseInput,
  onReply,
  onReact,
  postId,
  onDelete,
}) => {
  const [visible, setVisible] = useState(true);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const localReplies = Array.isArray(replies) ? replies : [];
  const currentUserAvatar = useCurrentUserAvatar();
  const { suggestions, isOpen, setIsOpen, selectMention, syncCaretPosition } =
    useMentionSuggestions({
      value: input,
      setValue: setInput,
      textareaRef: inputRef,
    });

  useEffect(() => {
    if (!showInput) {
      return;
    }

    setInput((current) => current || buildMentionSeed(parentUsername));
  }, [showInput, parentUsername]);

  useEffect(() => {
    if (showInput && inputRef.current) inputRef.current.focus();
  }, [showInput]);

  const handleSubmit = () => {
    const text = input.trim();
    if (!text) return;
    setVisible(true);
    onAdd?.(text);
    setInput("");
    setIsOpen(false);
    onCloseInput?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      onCloseInput?.();
      setInput("");
    }
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

      {visible &&
        localReplies.map((r) => (
          <ReplyBubble
            key={r.id}
            reply={r}
            depth={0}
            threadCommentId={threadCommentId}
            onAddReply={onReply}
            onReact={onReact}
            postId={postId}
            onDelete={onDelete}
            currentUserAvatar={currentUserAvatar}
          />
        ))}

      {showInput && (
        <div className="flex items-center gap-2">
          <img
            src={currentUserAvatar}
            alt="You"
            className="w-7 h-7 rounded-full object-cover shrink-0 border border-orange-300"
          />
          <div className="relative flex-1 min-w-0 flex items-center bg-white rounded-2xl border border-gray-200 px-3 py-1.5 gap-2 focus-within:border-[#F57600] transition-colors">
            {isOpen && (
              <MentionSuggestionsDropdown
                suggestions={suggestions}
                onSelect={(suggestion) => selectMention(suggestion.username)}
              />
            )}
            <div className="flex-1 min-w-0">
              <AutoTextarea
                inputRef={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  syncCaretPosition(e);
                }}
                onKeyDown={handleKeyDown}
                onClick={syncCaretPosition}
                onKeyUp={syncCaretPosition}
                onSelect={syncCaretPosition}
                onBlur={() => {
                  setTimeout(() => setIsOpen(false), 120);
                }}
                onFocus={syncCaretPosition}
                placeholder={`Mention @${parentUsername || "username"} and write a reply...`}
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
