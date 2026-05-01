import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AILogo from "../Assets/AILogo.png";
import { sendMessageToBot } from "../../Services/ChatAPI";

const SUGGESTIONS = [
  "Tell me something interesting",
  "What can I cook with chicken?",
  "Help me plan a quick dinner",
];

const formatTime = () =>
  new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

export default function AIChatbotWidget({ onExpandChange }) {
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const textareaRef = useRef(null);
  const bottomRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    const currentAbortController = abortControllerRef.current;

    return () => {
      currentAbortController?.abort();
    };
  }, []);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 60)}px`;
  }, [input]);

  useEffect(() => {
    if (expanded) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, expanded]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isBotTyping) return;

    if (!expanded) {
      setExpanded(true);
      onExpandChange?.(true);
    }

    const nextUserMessage = {
      id: Date.now().toString(),
      role: "user",
      type: "text",
      text: trimmed,
      time: formatTime(),
    };

    const nextMessages = [...messages, nextUserMessage];

    setMessages(nextMessages);
    setIsBotTyping(true);
    setInput("");

    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const history = nextMessages.map((message) => ({
        role: message.role === "ai" ? "assistant" : "user",
        content: message.text,
      }));

      const botMessage = await sendMessageToBot(
        trimmed,
        formatTime,
        history,
        abortController.signal,
      );

      setMessages((prev) => [
        ...prev,
        {
          ...botMessage,
          role: "ai",
        },
      ]);
    } catch (error) {
      if (error.name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "ai",
            type: "text",
            text:
              error.message ||
              "I couldn't reach Gastro AI right now. Please try again.",
            time: formatTime(),
          },
        ]);
      }
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }

      setIsBotTyping(false);
    }
  };

  const handleSend = () => sendMessage(input);

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleExpand = (state) => {
    setExpanded(state);
    onExpandChange?.(state);
  };

  return (
    <div className="w-full flex-shrink-0 font-sans">
      <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col overflow-hidden transition-all duration-300">
        {/* ── Header ── */}
        <button
          onClick={() => toggleExpand(!expanded)}
          className="flex items-center gap-3 p-4 w-full text-left group"
        >
          <div className="relative shrink-0 w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center p-1.5 shadow-sm">
            <img
              src={AILogo}
              alt="AI"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-[9px] font-black text-[#F57600] tracking-[0.15em] uppercase">
              AI Assistant
            </span>
            <h3 className="font-black text-[#0060A9] text-[13px] leading-tight">
              Gastronome Connect
            </h3>
          </div>

          <div
            className={`p-1.5 rounded-lg transition-transform duration-200 ${expanded ? "rotate-180 bg-[#0060A9]/5 text-[#0060A9]" : "text-gray-400"}`}
          >
            <ChevronDown size={16} strokeWidth={3} />
          </div>
        </button>

        {/* ── Chat Block ── */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <div
                className="overflow-y-auto px-4 py-2 flex flex-col gap-3 custom-scrollbar"
                style={{ height: "200px" }}
              >
                {messages.length === 0 ? (
                  <div className="space-y-2 py-1">
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest px-1">
                      Quick Start
                    </p>
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSuggestionClick(s)}
                        className="w-full text-left bg-gray-50/50 border border-gray-100 text-gray-500 text-[11px] py-2 px-3 rounded-xl hover:border-[#00B4FA] hover:text-[#0060A9] transition-all flex items-center justify-between group"
                      >
                        <span className="font-medium truncate">{s}</span>
                        <Sparkles
                          size={10}
                          className="text-[#F57600] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  messages.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-end gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] px-3 py-2 rounded-xl text-[12px] font-medium leading-relaxed shadow-sm ${
                          m.role === "user"
                            ? "bg-[#0060A9] text-white rounded-br-none"
                            : "bg-gray-100 text-gray-700 rounded-bl-none border border-gray-200"
                        }`}
                      >
                        {m.text}
                      </div>

                      {m.role === "ai" &&
                      m.type === "recipe" &&
                      Array.isArray(m.recipes) &&
                      m.recipes.length > 0 ? (
                        <div className="max-w-[85%] space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#F57600] px-1">
                            {m.recipes.length} recipe
                            {m.recipes.length !== 1 ? "s" : ""} found
                          </p>
                          <div className="space-y-1.5">
                            {m.recipes.slice(0, 3).map((recipe, index) => (
                              <div
                                key={`${m.id}-recipe-${index}`}
                                className="rounded-xl border border-orange-100 bg-white px-3 py-2 text-[11px] shadow-sm"
                              >
                                <p className="font-bold text-gray-900 line-clamp-1">
                                  {recipe.title || recipe.name || "Recipe"}
                                </p>
                                <p className="text-[10px] text-gray-500 line-clamp-2 mt-0.5">
                                  {recipe.description ||
                                    recipe.caption ||
                                    "Tap the full AI chat to explore more details."}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </motion.div>
                  ))
                )}

                {isBotTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-end gap-2 justify-start"
                  >
                    <div className="max-w-[85%] px-3 py-2 rounded-xl text-[12px] font-medium leading-relaxed shadow-sm bg-gray-100 text-gray-700 rounded-bl-none border border-gray-200">
                      Thinking...
                    </div>
                  </motion.div>
                )}

                <div ref={bottomRef} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Input Box ── */}
        <div className="px-4 pb-4 pt-1">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 focus-within:bg-white focus-within:border-[#00B4FA] transition-all">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (!expanded) toggleExpand(true);
              }}
              placeholder="Ask anything..."
              className="flex-1 text-[12px] text-gray-600 placeholder-gray-400 bg-transparent border-none focus:ring-0 outline-none resize-none leading-tight py-1"
              style={{ minHeight: "18px", maxHeight: "60px" }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isBotTyping}
              className={`p-1.5 rounded-lg transition-all ${
                input.trim() && !isBotTyping
                  ? "text-[#0060A9] hover:scale-110 active:scale-95"
                  : "text-gray-300"
              }`}
            >
              <Send size={14} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Subtle Bottom Accent */}
        <div className="h-1 w-full bg-gradient-to-r from-[#0060A9] via-[#00B4FA] to-[#F57600]" />
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
