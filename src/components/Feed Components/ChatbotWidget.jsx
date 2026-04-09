import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, ChevronDown, User, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AILogo from "../Assets/AILogo.png";

const SUGGESTIONS = [
  "Generate a recipe",
  "What can I cook with chicken?",
  "15-min meal idea",
];

export default function AIChatbotWidget({ onExpandChange }) {
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const textareaRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 60)}px`;
  }, [input]);

  useEffect(() => {
    if (expanded) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, expanded]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text }]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "ai", text: "I'm learning your tastes! 🍳" },
      ]);
    }, 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
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
             <img src={AILogo} alt="AI" className="w-full h-full object-contain" />
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-[9px] font-black text-[#F57600] tracking-[0.15em] uppercase">AI Assistant</span>
            <h3 className="font-black text-[#0060A9] text-[13px] leading-tight">Gastronome Connect</h3>
          </div>

          <div className={`p-1.5 rounded-lg transition-transform duration-200 ${expanded ? "rotate-180 bg-[#0060A9]/5 text-[#0060A9]" : "text-gray-400"}`}>
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
              transition={{ duration: 0.2, ease: "easeInOut" }} // Fast Exit/Entry
            >
              <div className="overflow-y-auto px-4 py-2 flex flex-col gap-3 custom-scrollbar" style={{ height: "200px" }}>
                {messages.length === 0 ? (
                  <div className="space-y-2 py-1">
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest px-1">Quick Start</p>
                    {SUGGESTIONS.map((s, i) => (
                      <button
                        key={s}
                        onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                        className="w-full text-left bg-gray-50/50 border border-gray-100 text-gray-500 text-[11px] py-2 px-3 rounded-xl hover:border-[#00B4FA] hover:text-[#0060A9] transition-all flex items-center justify-between group"
                      >
                        <span className="font-medium truncate">{s}</span>
                        <Sparkles size={10} className="text-[#F57600] opacity-0 group-hover:opacity-100 transition-opacity" />
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
                      <div className={`max-w-[85%] px-3 py-2 rounded-xl text-[12px] font-medium leading-relaxed shadow-sm ${
                        m.role === "user"
                          ? "bg-[#0060A9] text-white rounded-br-none"
                          : "bg-gray-100 text-gray-700 rounded-bl-none border border-gray-200"
                      }`}>
                        {m.text}
                      </div>
                    </motion.div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Compact Input Box ── */}
        <div className="px-4 pb-4 pt-1">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 focus-within:bg-white focus-within:border-[#00B4FA] transition-all">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => { if (!expanded) toggleExpand(true); }}
              placeholder="Ask AI..."
              className="flex-1 text-[12px] text-gray-600 placeholder-gray-400 bg-transparent border-none focus:ring-0 outline-none resize-none leading-tight py-1"
              style={{ minHeight: "18px", maxHeight: "60px" }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={`p-1.5 rounded-lg transition-all ${
                input.trim() 
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
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}</style>
    </div>
  );
}