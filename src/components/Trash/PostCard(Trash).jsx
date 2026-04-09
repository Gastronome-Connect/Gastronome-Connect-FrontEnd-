import { useState, useRef, useEffect } from "react";
import {
  FaRegThumbsUp, FaThumbsUp, FaThumbsDown,
  FaRegCommentDots, FaEllipsisH, FaHeart, FaRegHeart,
  FaEdit, FaTrash, FaArchive, FaRetweet,
} from "react-icons/fa";
import { Play, ChevronLeft, ChevronRight, X, Image as ImageIcon, Video, Plus, Send, Bot } from "lucide-react";
import { createPortal } from "react-dom";

// ─── Dropdown Menu ────────────────────────────────────────────────────────────
const DropdownMenu = ({ onEdit, onDelete, onArchive, onClose }) => {
  const ref = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute right-0 top-10 z-50 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden w-48">
      <button onClick={onEdit} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-[#F57600] transition-colors">
        <FaEdit size={14} /> Edit Post
      </button>
      <div className="border-t border-gray-100" />
      <button onClick={onArchive} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-[#F57600] transition-colors">
        <FaArchive size={14} /> Archive Recipe
      </button>
      <div className="border-t border-gray-100" />
      <button onClick={onDelete} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
        <FaTrash size={14} /> Delete Post
      </button>
    </div>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteConfirmModal = ({ onConfirm, onCancel }) => createPortal(
  <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onCancel}>
    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
      <h3 className="text-lg font-extrabold text-gray-900 mb-2">Delete Post?</h3>
      <p className="text-sm text-gray-500 mb-6">This action cannot be undone. Your post will be permanently removed.</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors">Delete</button>
      </div>
    </div>
  </div>,
  document.body
);

// ─── Archive Confirm Modal ────────────────────────────────────────────────────
const ArchiveConfirmModal = ({ onConfirm, onCancel }) => createPortal(
  <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onCancel}>
    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
      <h3 className="text-lg font-extrabold text-gray-900 mb-2">Archive Recipe?</h3>
      <p className="text-sm text-gray-500 mb-6">This recipe will be moved to your archive. You can restore it anytime.</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#F57600] to-[#F0AE35] text-white text-sm font-bold transition-colors">Archive</button>
      </div>
    </div>
  </div>,
  document.body
);

// ─── Edit Post Modal ──────────────────────────────────────────────────────────
const EditPostModal = ({ post, onSave, onClose }) => {
  const [title, setTitle] = useState(post.title || "");
  const [caption, setCaption] = useState(post.caption || "");
  const [mediaItems, setMediaItems] = useState(post.mediaItems ?? []);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newItems = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video") ? "video" : "image",
    }));
    setMediaItems((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeMedia = (id) => setMediaItems((prev) => prev.filter((i) => i.id !== id));

  const handleSave = () => {
    onSave({
      ...post,
      title: title.trim() || null,
      caption,
      mediaItems,
      image: mediaItems.length > 0 ? mediaItems[0].url : null,
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="relative p-5 border-b-2 border-[#F57600] flex justify-center items-center shrink-0">
          <h2 className="text-xl font-bold text-gray-800">Edit Post</h2>
          <button onClick={onClose} className="absolute right-5 p-1 rounded-full bg-orange-50 text-[#F57600] hover:bg-orange-100 transition-colors">
            <X size={22} strokeWidth={3} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex items-center gap-3 mb-4">
            <img src={post.avatar || "https://i.pravatar.cc/100"} alt="User" className="w-10 h-10 rounded-full border border-gray-100 object-cover" />
            <span className="font-bold text-gray-800">{post.author}</span>
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 60))}
            placeholder="Title (optional)"
            className="w-full text-base font-semibold text-gray-800 placeholder-gray-300 border-none focus:ring-0 outline-none"
          />
          <div className="flex justify-end mb-1">
            <span className={`text-xs font-medium ${title.length >= 60 ? "text-red-400" : "text-gray-300"}`}>
              {title.length}/60
            </span>
          </div>
          <div className="border-b border-gray-100 mb-3" />

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What's your recipe?"
            className="w-full min-h-[90px] text-sm text-gray-700 placeholder-gray-400 border-none focus:ring-0 resize-none outline-none mb-4"
          />

          {mediaItems.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {mediaItems.map((item) => (
                <div key={item.id} className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                  <button onClick={() => removeMedia(item.id)} className="absolute top-1.5 right-1.5 z-20 p-1 bg-black/50 hover:bg-red-500 text-white rounded-full transition-all opacity-0 group-hover:opacity-100">
                    <X size={12} />
                  </button>
                  {item.type === "image" ? (
                    <img src={item.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="relative w-full h-full bg-gray-900">
                      <video src={item.url} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play size={24} className="text-white fill-white opacity-90" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl hover:border-[#F57600] hover:bg-orange-50 transition-all aspect-square text-gray-400 gap-1">
                <Plus size={22} />
                <span className="text-xs font-semibold">Add More</span>
              </button>
            </div>
          )}

          {mediaItems.length === 0 && (
            <button onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-200 rounded-2xl hover:border-[#F57600] hover:bg-orange-50 transition-all p-7 flex flex-col items-center gap-2 text-gray-400 mb-4">
              <div className="flex gap-3">
                <ImageIcon size={24} className="text-[#F57600]" />
                <Video size={24} className="text-[#0060A9]" />
              </div>
              <span className="text-sm font-semibold">Add photos & videos</span>
              <span className="text-xs text-gray-300">PNG, JPEG · All video formats</span>
            </button>
          )}

          <input type="file" ref={fileInputRef} className="hidden" accept="image/png,image/jpeg,video/*" multiple onChange={handleFileChange} />
        </div>

        <div className="p-5 border-t border-gray-100 shrink-0 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSave} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#F57600] to-[#F0AE35] text-white text-sm font-bold shadow hover:opacity-90 transition-all">Save Changes</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ─── Comment Section ──────────────────────────────────────────────────────────
const CommentSection = ({ postId, initialComments = [] }) => {
  const [comments, setComments] = useState(initialComments);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  const handleSubmit = () => {
    const text = input.trim();
    if (!text) return;
    const newComment = {
      id: Math.random().toString(36).substr(2, 9),
      author: "You",
      avatar: "https://i.pravatar.cc/100?img=12",
      text,
      time: "Just now",
    };
    setComments((prev) => [...prev, newComment]);
    setInput("");
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-gray-100 bg-gray-50/60">
      {/* Comment list */}
      <div className="max-h-56 overflow-y-auto px-4 pt-3 pb-2 flex flex-col gap-3">
        {comments.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">No comments yet. Be the first to comment!</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="flex gap-2.5 items-start">
            <img src={c.avatar} alt={c.author} className="w-7 h-7 rounded-full object-cover shrink-0 border border-gray-200" />
            <div className="flex-1">
              <div className="bg-white rounded-2xl px-3 py-2 shadow-sm border border-gray-100">
                <p className="text-xs font-bold text-gray-800 mb-0.5">{c.author}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{c.text}</p>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 ml-2">{c.time}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 flex items-center gap-2">
        <img src="https://i.pravatar.cc/100?img=12" alt="You" className="w-7 h-7 rounded-full object-cover shrink-0 border border-orange-200" />
        <div className="flex-1 flex items-center bg-white rounded-full border border-gray-200 px-4 py-2 gap-2 focus-within:border-[#F57600] transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a comment..."
            className="flex-1 text-xs text-gray-700 placeholder-gray-400 border-none focus:ring-0 outline-none bg-transparent"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className={`transition-colors ${input.trim() ? "text-[#F57600] hover:text-orange-600" : "text-gray-300"}`}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Chatbot Modal ────────────────────────────────────────────────────────────
const ChatbotModal = ({ post, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "assistant",
      text: `Hi! I'm your recipe assistant 🍳 Ask me anything about "${post.title || "this recipe"}"!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  const scrollToBottom = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg = { id: Date.now().toString(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    scrollToBottom();

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a friendly recipe assistant. The user is asking about a recipe post titled "${post.title || "Untitled Recipe"}". Recipe description: "${post.caption || "No description provided"}". Help them with cooking questions, substitutions, techniques, and tips related to this recipe. Keep answers concise and friendly.`,
          messages: [
            ...messages
              .filter((m) => !(m.role === "assistant" && m.id === "1"))
              .map((m) => ({ role: m.role, content: m.text })),
            { role: "user", content: text },
          ],
        }),
      });
      const data = await response.json();
      const reply = data.content?.map((b) => b.text || "").join("") || "Sorry, I couldn't respond right now.";
      setMessages((prev) => [...prev, { id: Date.now().toString() + "r", role: "assistant", text: reply }]);
    } catch {
      setMessages((prev) => [...prev, { id: Date.now().toString() + "e", role: "assistant", text: "Oops! Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col" style={{ height: "70vh" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="relative p-5 border-b border-gray-100 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F57600] to-[#F0AE35] flex items-center justify-center shadow">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <p className="font-extrabold text-gray-900 text-sm">Recipe Assistant</p>
            <p className="text-xs text-gray-400">Ask me anything about this recipe</p>
          </div>
          <button onClick={onClose} className="absolute right-5 p-1 rounded-full bg-orange-50 text-[#F57600] hover:bg-orange-100 transition-colors">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-2 items-end ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              {m.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F57600] to-[#F0AE35] flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-white" />
                </div>
              )}
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-gradient-to-r from-[#F57600] to-[#F0AE35] text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-700 rounded-bl-sm"
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2 items-end">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F57600] to-[#F0AE35] flex items-center justify-center shrink-0">
                <Bot size={14} className="text-white" />
              </div>
              <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100 shrink-0">
          <div className="flex items-center bg-gray-50 rounded-2xl border border-gray-200 px-4 py-3 gap-2 focus-within:border-[#F57600] transition-colors">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about this recipe..."
              className="flex-1 text-sm text-gray-700 placeholder-gray-400 border-none focus:ring-0 outline-none bg-transparent"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className={`p-1.5 rounded-xl transition-all ${input.trim() && !loading ? "bg-gradient-to-r from-[#F57600] to-[#F0AE35] text-white shadow hover:opacity-90" : "text-gray-300"}`}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ─── Expanded Post View ───────────────────────────────────────────────────────
const ExpandedView = ({ post, startIndex, onClose }) => {
  const [current, setCurrent] = useState(startIndex);
  const [vote, setVote] = useState(null);
  const [likes, setLikes] = useState(post.likes ?? 0);
  const [saved, setSaved] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(post.reposts ?? 0);
  const [commentCount] = useState(post.comments ?? 0);
  const [showComments, setShowComments] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const menuRef = useRef(null);

  const media = post.mediaItems ?? [];
  const hasMultiple = media.length > 1;
  const item = media[current] ?? null;

  const handleVote = (type) => {
    if (type === "down") return;
    if (vote === "up") {
      setVote(null);
      setLikes((prev) => prev - 1);
    } else {
      setVote("up");
      setLikes((prev) => prev + 1);
    }
  };

  const handleRepost = () => {
    setReposted((r) => {
      setRepostCount((c) => r ? c - 1 : c + 1);
      return !r;
    });
  };

  const goPrev = (e) => { e.stopPropagation(); setCurrent((prev) => (prev - 1 + media.length) % media.length); };
  const goNext = (e) => { e.stopPropagation(); setCurrent((prev) => (prev + 1) % media.length); };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return createPortal(
    <>
      <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-3xl overflow-hidden flex shadow-2xl" style={{ width: "85vw", maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>

          {/* LEFT: media */}
          <div className="relative bg-black shrink-0" style={{ width: "55%", minHeight: "500px" }}>
            <button onClick={onClose} className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-[#F57600] hover:bg-orange-600 text-white text-sm font-bold px-4 py-2 rounded-full transition-colors shadow-lg">
              <ChevronLeft size={16} /> Back
            </button>
            {hasMultiple && (
              <div className="absolute top-4 right-4 z-10 bg-black/50 text-white text-xs font-bold px-3 py-1 rounded-full">
                {current + 1} / {media.length}
              </div>
            )}
            {item && (item.type === "image" ? (
              <img src={item.url} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />
            ) : (
              <video key={item.url} src={item.url} controls autoPlay style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />
            ))}
            <button onClick={goPrev} disabled={!hasMultiple} className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full transition-all ${hasMultiple ? "bg-black/40 hover:bg-black/60 text-white" : "opacity-0 pointer-events-none"}`}>
              <ChevronLeft size={28} />
            </button>
            <button onClick={goNext} disabled={!hasMultiple} className={`absolute right-3 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full transition-all ${hasMultiple ? "bg-black/40 hover:bg-black/60 text-white" : "opacity-0 pointer-events-none"}`}>
              <ChevronRight size={28} />
            </button>
            {hasMultiple && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {media.map((_, i) => (
                  <button key={i} onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                    className={`rounded-full transition-all ${i === current ? "bg-white w-5 h-2" : "bg-white/40 w-2 h-2"}`} />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: content */}
          <div className="flex flex-col overflow-hidden" style={{ width: "45%" }}>
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full border-2 border-orange-400 overflow-hidden shadow-sm shrink-0">
                  <img src={post.avatar || "https://i.pravatar.cc/100"} alt="author" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Author: {post.author}</p>
                  <p className="text-xs text-gray-500">Date Created: {post.date}</p>
                </div>
              </div>
              <div className="relative" ref={menuRef}>
                <button onClick={() => setMenuOpen((o) => !o)} className={`p-2 rounded-full transition-colors ${menuOpen ? "bg-orange-50 text-[#F57600]" : "text-orange-800 hover:bg-orange-50"}`}>
                  <FaEllipsisH size={14} />
                </button>
                {menuOpen && (
                  <DropdownMenu
                    onEdit={() => setMenuOpen(false)}
                    onDelete={() => setMenuOpen(false)}
                    onArchive={() => { setMenuOpen(false); setShowArchive(true); }}
                    onClose={() => setMenuOpen(false)}
                  />
                )}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-5">
                {post.title && <h3 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h3>}
                {post.caption && <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{post.caption}</p>}
              </div>

              {showComments && (
                <CommentSection
                  postId={post.id}
                  initialComments={post.commentsList ?? [
                    { id: "s1", author: "FoodieChef", avatar: "https://i.pravatar.cc/100?img=5", text: "This looks absolutely delicious! 😍", time: "2h ago" },
                    { id: "s2", author: "RecipeLover", avatar: "https://i.pravatar.cc/100?img=9", text: "Can I substitute the butter with olive oil?", time: "1h ago" },
                  ]}
                />
              )}
            </div>

            {/* Action bar */}
            <div className="p-5 border-t border-gray-100 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Like / Dislike */}
                <div className="flex items-center bg-orange-50 rounded-full px-4 py-2.5 gap-3">
                  <button onClick={() => handleVote("up")} className={`flex items-center gap-2 transition-colors ${vote === "up" ? "text-orange-500" : "text-gray-500 hover:text-orange-500"}`}>
                    {vote === "up" ? <FaThumbsUp size={14} /> : <FaRegThumbsUp size={14} />}
                    <span className="font-bold text-sm">{likes}</span>
                  </button>
                  <div className="w-[1px] h-4 bg-gray-300" />
                  {/* Dislike — no counter */}
                  <button onClick={() => handleVote("down")} className="text-gray-500 hover:text-blue-500 transition-colors">
                    <FaThumbsDown size={14} />
                  </button>
                </div>

                {/* Comment */}
                <button
                  onClick={() => setShowComments((s) => !s)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2.5 transition-colors ${showComments ? "bg-orange-100 text-[#F57600]" : "bg-orange-50 text-gray-500 hover:text-[#F57600]"}`}
                >
                  <FaRegCommentDots size={14} />
                  <span className="font-bold text-sm">{commentCount}</span>
                </button>

                {/* Repost */}
                <button
                  onClick={handleRepost}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 transition-colors ${reposted ? "bg-green-100 text-green-600" : "bg-orange-50 text-gray-500 hover:text-green-600"}`}
                >
                  <FaRetweet size={15} />
                  <span className="font-bold text-sm">{repostCount}</span>
                </button>

                {/* Heart / Save */}
                <button
                  onClick={() => setSaved((s) => !s)}
                  className={`p-2.5 rounded-full transition-colors ${saved ? "bg-red-50 text-red-500" : "bg-orange-50 text-gray-400 hover:text-red-500"}`}
                >
                  {saved ? <FaHeart size={14} /> : <FaRegHeart size={14} />}
                </button>

                {/* Chatbot */}
                <button
                  onClick={() => setShowChatbot(true)}
                  className="ml-auto flex items-center gap-2 bg-gradient-to-r from-[#F57600] to-[#F0AE35] text-white text-sm font-bold px-5 py-2.5 rounded-full shadow hover:opacity-90 transition-all"
                >
                  🤖 Chatbot
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showArchive && (
        <ArchiveConfirmModal
          onConfirm={() => setShowArchive(false)}
          onCancel={() => setShowArchive(false)}
        />
      )}
      {showChatbot && <ChatbotModal post={post} onClose={() => setShowChatbot(false)} />}
    </>,
    document.body
  );
};

// ─── PostCard ─────────────────────────────────────────────────────────────────
const PostCard = ({ post, onDelete, onUpdate }) => {
  const [vote, setVote] = useState(null);
  const [likes, setLikes] = useState(post.likes ?? 0);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [saved, setSaved] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(post.reposts ?? 0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount] = useState(post.comments ?? 0);

  const handleVote = (type) => {
    if (type === "down") return;
    if (vote === "up") {
      setVote(null);
      setLikes((prev) => prev - 1);
    } else {
      setVote("up");
      setLikes((prev) => prev + 1);
    }
  };

  const handleRepost = () => {
    setReposted((r) => {
      setRepostCount((c) => r ? c - 1 : c + 1);
      return !r;
    });
  };

  const media = post.mediaItems ?? [];
  const visibleMedia = media.slice(0, 3);
  const hiddenCount = media.length > 3 ? media.length - 3 : 0;

  const MediaThumb = ({ item, index, className = "" }) => {
    const isLast = index === visibleMedia.length - 1 && hiddenCount > 0;
    return (
      <div className={`relative bg-black cursor-pointer overflow-hidden ${className}`} onClick={() => setExpandedIndex(index)}>
        {item.type === "image" ? (
          <img src={item.url} alt="" className="w-full h-full object-contain hover:opacity-90 transition-opacity duration-200" />
        ) : (
          <div className="relative w-full h-full">
            <video src={item.url} className="w-full h-full object-contain" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Play size={36} className="text-white fill-white" />
            </div>
          </div>
        )}
        {isLast && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">+{hiddenCount}</span>
          </div>
        )}
      </div>
    );
  };

  const renderMediaGrid = () => {
    if (media.length === 0) return null;
    if (media.length === 1) {
      return (
        <div className="w-full rounded-2xl overflow-hidden bg-black cursor-pointer flex items-center justify-center" onClick={() => setExpandedIndex(0)}>
          {media[0].type === "image" ? (
            <img src={media[0].url} alt="" className="w-full h-auto object-contain hover:opacity-90 transition-opacity duration-200" />
          ) : (
            <div className="relative w-full" style={{ height: "520px" }}>
              <video src={media[0].url} className="w-full h-full object-contain" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Play size={56} className="text-white fill-white opacity-90" />
              </div>
            </div>
          )}
        </div>
      );
    }
    if (media.length === 2) {
      return (
        <div className="w-full grid grid-cols-2 gap-1 rounded-2xl overflow-hidden" style={{ height: "480px" }}>
          <MediaThumb item={visibleMedia[0]} index={0} className="h-full" />
          <MediaThumb item={visibleMedia[1]} index={1} className="h-full" />
        </div>
      );
    }
    return (
      <div className="w-full grid grid-cols-2 gap-1 rounded-2xl overflow-hidden" style={{ height: "520px" }}>
        <div className="relative bg-black cursor-pointer overflow-hidden row-span-2" onClick={() => setExpandedIndex(0)}>
          {visibleMedia[0].type === "image" ? (
            <img src={visibleMedia[0].url} alt="" className="w-full h-full object-contain hover:opacity-90 transition-opacity duration-200" />
          ) : (
            <div className="relative w-full h-full">
              <video src={visibleMedia[0].url} className="w-full h-full object-contain" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play size={44} className="text-white fill-white" />
              </div>
            </div>
          )}
        </div>
        <MediaThumb item={visibleMedia[1]} index={1} className="h-full" />
        <MediaThumb item={visibleMedia[2]} index={2} className="h-full" />
      </div>
    );
  };

  const CAPTION_LIMIT = 200;
  const isLongCaption = (post.caption?.length ?? 0) > CAPTION_LIMIT;

  const renderCaption = () => {
    if (!post.caption) return null;
    return (
      <div className="mb-3">
        <p className="text-gray-500 text-sm leading-relaxed">
          {isLongCaption && !captionExpanded
            ? post.caption.slice(0, CAPTION_LIMIT) + "..."
            : post.caption}
        </p>
        {isLongCaption && (
          <button
            onClick={() => setCaptionExpanded((prev) => !prev)}
            className="text-[#F57600] text-xs font-bold mt-1 hover:underline transition-all"
          >
            {captionExpanded ? "See less" : "See more"}
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 mb-5 overflow-hidden">
        <div className="p-4 pb-3">

          {/* Author row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-orange-400 overflow-hidden shrink-0">
                <img src={post.avatar || "https://i.pravatar.cc/100"} alt="author" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 leading-tight">{post.author}</p>
                <p className="text-xs text-gray-400">{post.date}</p>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className={`p-2 rounded-full transition-colors ${menuOpen ? "bg-orange-50 text-[#F57600]" : "hover:bg-gray-100 text-gray-400"}`}
              >
                <FaEllipsisH size={15} />
              </button>
              {menuOpen && (
                <DropdownMenu
                  onEdit={() => { setMenuOpen(false); setShowEditModal(true); }}
                  onDelete={() => { setMenuOpen(false); setShowDeleteConfirm(true); }}
                  onArchive={() => { setMenuOpen(false); setShowArchiveConfirm(true); }}
                  onClose={() => setMenuOpen(false)}
                />
              )}
            </div>
          </div>

          {/* Title */}
          {post.title && (
            <h2 className="text-xl font-extrabold text-gray-900 mb-1 leading-snug">{post.title}</h2>
          )}

          {/* Caption */}
          {renderCaption()}
        </div>

        {/* Media */}
        {media.length > 0 && <div className="pb-3">{renderMediaGrid()}</div>}

        {/* Interaction bar */}
        <div className="px-4 pt-2 flex items-center gap-3">
          {/* Upvote / Dislike */}
          <div className="flex items-center bg-gray-100 rounded-full px-5 py-3 gap-3">
            <button
              onClick={() => handleVote("up")}
              className={`flex items-center gap-2 transition-colors ${vote === "up" ? "text-orange-500" : "text-gray-500 hover:text-orange-500"}`}
            >
              {vote === "up" ? <FaThumbsUp size={18} /> : <FaRegThumbsUp size={18} />}
              <span className="font-bold text-base">{likes}</span>
            </button>
            <div className="w-[1px] h-5 bg-gray-300" />
            {/* Dislike — just an icon, no counter */}
            <button
              onClick={() => handleVote("down")}
              className="text-gray-500 hover:text-blue-500 transition-colors"
            >
              <FaThumbsDown size={18} />
            </button>
          </div>

          {/* Comment */}
          <button
            onClick={() => setShowComments((s) => !s)}
            className={`flex items-center gap-2 rounded-full px-5 py-3 transition-colors ${showComments ? "bg-orange-100 text-[#F57600]" : "bg-gray-100 text-gray-500 hover:text-[#F57600]"}`}
          >
            <FaRegCommentDots size={18} />
            <span className="font-bold text-base">{commentCount}</span>
          </button>

          {/* Repost */}
          <button
            onClick={handleRepost}
            className={`flex items-center gap-1.5 rounded-full px-5 py-3 transition-colors ${reposted ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500 hover:text-green-600"}`}
          >
            <FaRetweet size={20} />
            <span className="font-bold text-base">{repostCount}</span>
          </button>

          {/* Heart / Save */}
          <button
            onClick={() => setSaved((s) => !s)}
            className={`p-3 rounded-full transition-colors ${saved ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-400 hover:text-red-500"}`}
          >
            {saved ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
          </button>
        </div>

        {/* Inline Comment Section */}
        {showComments && (
          <div className="mt-2">
            <CommentSection
              postId={post.id}
              initialComments={post.commentsList ?? [
                { id: "s1", author: "FoodieChef", avatar: "https://i.pravatar.cc/100?img=5", text: "This looks absolutely delicious! 😍", time: "2h ago" },
                { id: "s2", author: "RecipeLover", avatar: "https://i.pravatar.cc/100?img=9", text: "Can I substitute the butter with olive oil?", time: "1h ago" },
              ]}
            />
          </div>
        )}

        <div className="pb-1" />
      </div>

      {expandedIndex !== null && <ExpandedView post={post} startIndex={expandedIndex} onClose={() => setExpandedIndex(null)} />}
      {showDeleteConfirm && <DeleteConfirmModal onConfirm={() => { setShowDeleteConfirm(false); onDelete?.(post.id); }} onCancel={() => setShowDeleteConfirm(false)} />}
      {showArchiveConfirm && <ArchiveConfirmModal onConfirm={() => setShowArchiveConfirm(false)} onCancel={() => setShowArchiveConfirm(false)} />}
      {showEditModal && <EditPostModal post={post} onSave={(updated) => onUpdate?.(updated)} onClose={() => setShowEditModal(false)} />}
    </>
  );
};

export default PostCard;