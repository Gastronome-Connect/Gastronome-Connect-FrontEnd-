import React, { useRef, useEffect, useState } from "react";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { useChat } from "../../../../Hooks/UseChats";

export default function ChatWindow({ className = "" }) {
  const { messages, isBotTyping, sendMessage } = useChat();
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
      {/* Messages area — scrollable */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <MessageList
          messages={messages}
          isBotTyping={isBotTyping}
          bottomRef={bottomRef}
        />
      </div>

      {/* Input — pinned to bottom */}
      <div className="flex-shrink-0 flex justify-center px-3 sm:px-4 pb-3 sm:pb-4 pt-2">
        <div className="w-full max-w-2xl">
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
            disabled={isBotTyping}
          />
        </div>
      </div>
    </div>
  );
}