  import { useState, useRef, useEffect } from "react";
  import { FaThumbsUp } from "react-icons/fa";
  import { ChevronRight, Copy, Flag } from "lucide-react";
  import ReplySection from "./ReplySection";
  import ReportModal from "../../../components/Modals/MoreOptionsModal";
  import ReportToast from "../../../components/Toast/ReportToast";

  // ─── Current user identity ─────────────────────────────────────────────────────
  // In a real app, pull this from your auth context / store.
  // We export it so ReplySection can import the same value.
  export const CURRENT_USER = "You";

  // ─── Smart-positioning hook ────────────────────────────────────────────────────
  const useSmartPosition = (triggerRef, open) => {
    const [style, setStyle] = useState({});

    useEffect(() => {
      if (!open || !triggerRef.current) return;
      const rect  = triggerRef.current.getBoundingClientRect();
      const vw    = window.innerWidth;
      const vh    = window.innerHeight;
      const menuW = 220;
      const menuH = 120;
      const pos   = {};

      if (vw - rect.right >= menuW)  pos.left  = 0;
      else if (rect.left  >= menuW)  pos.right = 0;
      else                           pos.left  = Math.max(8 - rect.left, 0);

      if (vh - rect.bottom >= menuH) pos.top    = "calc(100% + 4px)";
      else                           pos.bottom = "calc(100% + 4px)";

      setStyle({ position: "absolute", zIndex: 200, width: `${menuW}px`, ...pos });
    }, [open, triggerRef]);

    return style;
  };

  // ─── Options dropdown ──────────────────────────────────────────────────────────
  // `canReport` — false when the viewer owns the content
  const OptionsDropdown = ({ onCopy, onReport, reportLabel = "Report", canReport = true }) => (
    <div
      className="bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden py-1"
      style={{ minWidth: 220 }}
    >
      <button
        onClick={onCopy}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-left"
      >
        <Copy size={14} className="text-gray-400 shrink-0" />
        Copy
      </button>

      {canReport && (
        <>
          <div className="h-px bg-gray-100 mx-2" />
          <button
            onClick={onReport}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-[#F57600] transition-colors text-left"
          >
            <span className="flex items-center gap-3">
              <Flag size={14} className="text-gray-400 shrink-0" />
              {reportLabel}
            </span>
            <ChevronRight size={14} className="text-gray-300 shrink-0" />
          </button>
        </>
      )}
    </div>
  );

  // ─── Reusable ••• trigger ──────────────────────────────────────────────────────
  // `author`  — who wrote the content
  // `canReport` derived here: viewer is NOT the author
  export const MoreMenu = ({
    text,
    author,
    reportLabel = "Report",
    subject = "this",
      comment  = null,   // ← ADD
  postTitle = "",    // ← ADD
  }) => {
    const isOwner  = author === CURRENT_USER;   // owner cannot report their own content
    const canReport = !isOwner;

    const [dropOpen,     setDropOpen]     = useState(false);
    const [modalOpen,    setModalOpen]    = useState(false);
    const [toastVisible, setToastVisible] = useState(false);

    const btnRef    = useRef(null);
    const wrapRef   = useRef(null);
    const menuStyle = useSmartPosition(btnRef, dropOpen);

    // Close dropdown on outside click
    useEffect(() => {
      if (!dropOpen) return;
      const h = (e) => {
        if (wrapRef.current && !wrapRef.current.contains(e.target)) setDropOpen(false);
      };
      document.addEventListener("mousedown", h);
      return () => document.removeEventListener("mousedown", h);
    }, [dropOpen]);

    const handleCopy = () => {
      navigator.clipboard?.writeText(text ?? "").catch(() => {});
      setDropOpen(false);
    };

    const handleOpenReport = () => {
      setDropOpen(false);
      setModalOpen(true);
    };

    const handleSubmitReport = (reasonId, detail) => {
      console.log("Report submitted:", { reasonId, detail });
      setToastVisible(true);
    };

    return (
      <>
        <div className="relative" ref={wrapRef}>
          <button
            ref={btnRef}
            onClick={() => setDropOpen((v) => !v)}
            className={`text-[11px] font-bold leading-none transition-colors ${
              dropOpen ? "text-[#F57600]" : "text-gray-400 hover:text-[#F57600]"
            }`}
            aria-label="More options"
          >
            •••
          </button>

          {dropOpen && (
            <div style={menuStyle}>
              <OptionsDropdown
                onCopy={handleCopy}
                onReport={handleOpenReport}
                reportLabel={reportLabel}
                canReport={canReport}
              />
            </div>
          )}
        </div>

        {/* Only render modal when reporting is allowed */}
        {canReport && (
          <ReportModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onSubmit={handleSubmitReport}
            subject={subject}
            comment={comment}     // ← ADD
           postTitle={postTitle} // ← ADD
          />
        )}

        <ReportToast
          visible={toastVisible}
          onDone={() => setToastVisible(false)}
        />
      </>
    );
  };

  // ─── CommentItem ───────────────────────────────────────────────────────────────
  const CommentItem = ({ comment }) => {
    const [vote,           setVote]           = useState("none");
    const [likes,          setLikes]          = useState(comment.likes ?? 0);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replies,        setReplies]        = useState(comment.replies ?? []);

    const handleLike = () => {
      if (vote === "liked") { setVote("none"); setLikes((l) => l - 1); }
      else { setVote("liked"); setLikes((l) => l + (vote === "disliked" ? 1 : 1)); }
    };
    const handleDislike = () => {
      if (vote === "disliked") setVote("none");
      else { if (vote === "liked") setLikes((l) => l - 1); setVote("disliked"); }
    };
    const handleAddReply = (text) => {
      setReplies((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          author: CURRENT_USER,
          avatar: "https://i.pravatar.cc/100?img=12",
          text,
          time: "Just now",
          likes: 0,
          replies: [],
        },
      ]);
      setShowReplyInput(false);
    };

    return (
      <div className="flex gap-2 sm:gap-2.5 w-full">
        <img
          src={comment.avatar}
          alt={comment.author}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-200 shrink-0 mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <div className="bg-gray-100 rounded-2xl px-3 py-2 w-full">
            <p className="text-xs font-bold text-gray-800 mb-0.5">{comment.author}</p>
            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
              {comment.text}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-1 ml-1 flex-wrap">
            <span className="text-[10px] text-gray-400">{comment.time}</span>

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
              onClick={() => setShowReplyInput((v) => !v)}
              className={`text-[10px] font-bold transition-colors ${
                showReplyInput ? "text-[#F57600]" : "text-gray-500 hover:text-[#F57600]"
              }`}
            >
              Reply
            </button>

            {/* Pass author so MoreMenu can decide whether to show Report */}
            <MoreMenu
              text={comment.text}
              author={comment.author}
              reportLabel="Report comment"
              subject="this comment"
              comment={comment} 
              postTitle=""
            />
          </div>

          <ReplySection
            parentId={comment.id}
            parentAuthor={comment.author}
            replies={replies}
            showInput={showReplyInput}
            onAdd={handleAddReply}
            onCloseInput={() => setShowReplyInput(false)}
          />
        </div>
      </div>
    );
  };

  export default CommentItem;