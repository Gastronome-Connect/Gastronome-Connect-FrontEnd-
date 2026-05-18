import React, { useRef, useEffect, useState } from "react";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { useChat } from "../../../../Hooks/UseChats";

export default function ChatWindow({ className = "" }) {
  const {
    messages,
    isBotTyping,
    sendMessage,
    useSavedPreferences,
    canUseSavedPreferences,
    setUseSavedPreferences,
  } = useChat();
  const [inputValue, setInputValue] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotTyping]);

  const handleSend = (text) => {
    if (!text.trim() || isBotTyping) return;
    sendMessage(text);
    setInputValue("");
  };

  return (
    <div className={`flex flex-col h-full overflow-hidden ${className}`}>
      <style>{`
        .chat-scroll-area::-webkit-scrollbar { width: 6px; }
        .chat-scroll-area::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll-area::-webkit-scrollbar-thumb {
          background: #F0AE35;
          border-radius: 999px;
        }
        .chat-scroll-area::-webkit-scrollbar-thumb:hover { background: #F57600; }
      `}</style>

      {/* Messages area — scrollable with visible scrollbar */}
      <div
        className="chat-scroll-area flex-1 min-h-0 overflow-y-auto"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#F57600 transparent",
        }}
      >
        <MessageList
          messages={messages}
          isBotTyping={isBotTyping}
          bottomRef={bottomRef}
        />
      </div>

      {/* Input — pinned to bottom */}
      <div className="flex-shrink-0 flex justify-center px-3 sm:px-4 pb-3 sm:pb-4 pt-2 border-t border-gray-100">
        <div className="w-full max-w-2xl">
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
            disabled={isBotTyping}
            showSavedPreferencesToggle={canUseSavedPreferences}
            useSavedPreferences={useSavedPreferences}
            onToggleSavedPreferences={setUseSavedPreferences}
          />
        </div>
      </div>
    </div>
  );
}
