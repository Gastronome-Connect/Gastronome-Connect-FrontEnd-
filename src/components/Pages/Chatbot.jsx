import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../../Feed/SideBar";
import AILogo from "../Assets/AILogo.png";
import ChatWindow from "./Chat Bot Components/Chats/ChatWindow";
import ChatInput from "./Chat Bot Components/Chats/ChatInput";
import PopularRecipes from "../Feed Components/PopularRecipePanel";
import UploadProgressToast from "../Toast/UploadProgressToast";
import UploadFailedModal from "../Modals/Create Post Components/UploadFailedModal";
import useUpload from "../../Hooks/UseUpload";
import { useChat } from "../../Hooks/UseChats";

function EmptyStateWithInput({ initialValue = "", isBotTyping }) {
  const { sendMessage } = useChat();
  const [inputValue, setInputValue] = useState(initialValue);

  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  const handleSend = (text) => {
    if (!text.trim() || isBotTyping) return;
    sendMessage(text);
    setInputValue("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col items-center justify-center flex-1 gap-3 sm:gap-4 select-none pointer-events-none px-4">
        <img
          src={AILogo}
          alt="AI"
          className="w-20 h-20 sm:w-32 sm:h-32 object-contain"
        />
        <div className="text-center">
          <p className="text-lg sm:text-2xl font-black text-[#F57600] tracking-tight italic">
            "Search, cook, enjoy."
          </p>
          <p className="text-xs sm:text-sm text-gray-400 mt-1.5 sm:mt-2 max-w-[260px] sm:max-w-xs leading-relaxed">
            Ask me anything about recipes, ingredients, cooking tips, or meal
            planning.
          </p>
        </div>
      </div>

      <div className="flex-shrink-0 flex justify-center px-3 sm:px-4 pb-3 sm:pb-4 pt-2 border-t border-gray-100">
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

export default function ChatbotPage() {
  const location = useLocation();
  const { messages, isBotTyping } = useChat();

  const {
    uploadState,
    progress,
    startUpload,
    retryUpload,
    cancelUpload,
    resetUpload,
  } = useUpload();

  const handleNewPost = (newPost) => {
    startUpload(newPost, () => {});
  };

  useEffect(() => {
    if (location.state?.prefill) {
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  const isEmpty = messages.length === 0 && !isBotTyping;

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      <Sidebar onNewPost={handleNewPost} />

      <main className="flex-1 overflow-hidden flex flex-col">
        <div
          className="flex flex-col lg:hidden"
          style={{
            height: "calc(100dvh - 72px - env(safe-area-inset-bottom, 0px))",
          }}
        >
          <div className="flex items-center gap-3 px-4 pt-4 pb-2 flex-shrink-0">
            <h1 className="text-xl font-black text-gray-800 tracking-tight">
              Gastro AI Chat
            </h1>
            <div className="flex-1 h-[2px] bg-gradient-to-r from-orange-400/30 to-transparent rounded-full" />
          </div>

          <div className="flex-1 min-h-0 bg-white mx-3 rounded-2xl overflow-hidden flex flex-col mb-2">
            {isEmpty ? (
              <EmptyStateWithInput
                initialValue={location.state?.prefill ?? ""}
                isBotTyping={isBotTyping}
              />
            ) : (
              <div className="flex-1 min-h-0 overflow-hidden">
                <ChatWindow className="h-full" />
              </div>
            )}
          </div>
        </div>

        <div
          className="hidden lg:grid gap-10 p-6 max-w-[1600px] mx-auto w-full"
          style={{ gridTemplateColumns: "1fr 400px", height: "100vh" }}
        >
          <div className="flex flex-col gap-4 min-w-0 min-h-0">
            <div className="flex items-center gap-4 flex-shrink-0">
              <h1 className="text-3xl font-black text-gray-800 tracking-tight">
                AI Chat
              </h1>
              <div className="flex-1 h-[2px] bg-gradient-to-r from-orange-400/30 to-transparent rounded-full" />
            </div>

            <div className="flex-1 min-h-0 rounded-[1.75rem] bg-white flex flex-col overflow-hidden">
              {isEmpty ? (
                <EmptyStateWithInput
                  initialValue={location.state?.prefill ?? ""}
                  isBotTyping={isBotTyping}
                />
              ) : (
                <div className="flex-1 min-h-0 overflow-hidden">
                  <ChatWindow className="h-full" />
                </div>
              )}
            </div>
          </div>

          <div
            className="fixed top-6 bottom-6 z-40 flex flex-col"
            style={{ width: "400px", right: "24px" }}
          >
            <div className="flex-1 min-h-0 overflow-hidden">
              <PopularRecipes />
            </div>
          </div>
        </div>
      </main>

      <UploadProgressToast
        uploadState={uploadState === "failed" ? "idle" : uploadState}
        progress={progress}
        onDone={resetUpload}
      />
      <UploadFailedModal
        isOpen={uploadState === "failed"}
        onRetry={retryUpload}
        onCancel={cancelUpload}
      />
    </div>
  );
}
