import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Sidebar        from "../../Feed/SideBar";
import AILogo         from "../Assets/AILogo.png";
import MessageList    from "../Pages/Chat Bot Components/MessageList";
import ChatInput      from "../Pages/Chat Bot Components/ChatInput";
import PopularRecipes from "../Feed Components/PopularRecipePanel";
import UploadProgressToast from "../Toast/UploadProgressToast";
import UploadFailedModal   from "../Modals/Create Post Components/UploadFailedModal";
import useUpload           from "../../Hooks/UseUpload";

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_RECIPES = [
  { title: "Kare-kare",      author: "Lola Rosa",      dateCreate: "01/10/01", image: "", description: "Rich peanut sauce with tender oxtail and fresh vegetables." },
  { title: "Adobo",          author: "Chef Boy Logro", dateCreate: "03/22/02", image: "", description: "Classic soy-vinegar braised chicken, a Filipino staple." },
  { title: "Sinigang",       author: "Nanay Maria",    dateCreate: "06/15/03", image: "", description: "Sour tamarind soup with tender pork and fresh vegetables." },
  { title: "Lechong Kawali", author: "Mang Tomas",     dateCreate: "09/08/04", image: "", description: "Crispy deep-fried pork belly, perfectly crunchy outside." },
  { title: "Bicol Express",  author: "Bicol's Finest", dateCreate: "12/01/05", image: "", description: "Spicy coconut cream pork stew from the Bicol region." },
  { title: "Sisig",          author: "Aling Lucing",   dateCreate: "02/14/06", image: "", description: "The iconic sizzling pork delicacy from Pampanga." },
  { title: "Pancit Canton",  author: "Lolo Pepe",      dateCreate: "04/30/07", image: "", description: "Traditional stir-fried noodles with mixed vegetables." },
  { title: "Laing",          author: "Gata Master",    dateCreate: "07/19/08", image: "", description: "Taro leaves slow-cooked in spicy coconut milk." },
  { title: "Binangkal",      author: "Cebu Sweets",    dateCreate: "10/25/09", image: "", description: "Sesame-coated fried flour balls, a Cebuano street snack." },
  { title: "Tinola",         author: "Lola Caring",    dateCreate: "11/11/10", image: "", description: "Ginger-based chicken soup with green papaya and malunggay." },
];

const RECIPE_KEYWORDS = ["recipe", "recipes", "show", "suggest", "recommend", "food", "cook", "dish", "meal", "find", "what can", "give me", "list"];
function shouldShowRecipes(text) {
  return RECIPE_KEYWORDS.some((kw) => text.toLowerCase().trim().includes(kw));
}
function getRandomRecipes() {
  const count = Math.floor(Math.random() * 10) + 1;
  return [...MOCK_RECIPES].sort(() => Math.random() - 0.5).slice(0, count);
}
const TEXT_REPLIES = [
  "Great choice! That dish pairs wonderfully with a light salad or crusty bread.",
  "I'd suggest marinating for at least 30 minutes to let the flavors develop.",
  "You can substitute that with a plant-based alternative without losing flavor.",
  "That's a classic combination! Here's how I'd prepare it step by step...",
  "Cooking time is usually around 45 minutes for best results.",
];
function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-3 sm:gap-4 select-none pointer-events-none px-4">
      <img src={AILogo} alt="AI" className="w-20 h-20 sm:w-32 sm:h-32 object-contain" />
      <div className="text-center">
        <p className="text-lg sm:text-2xl font-black text-[#F57600] tracking-tight italic">
          "Search, cook, enjoy."
        </p>
        <p className="text-xs sm:text-sm text-gray-400 mt-1.5 sm:mt-2 max-w-[260px] sm:max-w-xs leading-relaxed">
          Ask me anything about recipes, ingredients, cooking tips, or meal planning.
        </p>
      </div>
    </div>
  );
}

export default function ChatbotPage() {
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );
  const [messages, setMessages]       = useState([]);
  const [inputValue, setInputValue]   = useState(location.state?.prefill ?? "");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const bottomRef = useRef(null);

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
    const handler = () =>
      setIsCollapsed(localStorage.getItem("sidebar-collapsed") === "true");
    window.addEventListener("sidebarStateChange", handler);
    return () => window.removeEventListener("sidebarStateChange", handler);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotTyping]);

  const handleSend = (text) => {
    if (!text.trim() || isBotTyping) return;
    const userMsg = { id: Date.now(), role: "user", type: "text", text, time: formatTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsBotTyping(true);

    setTimeout(() => {
      const isRecipe = shouldShowRecipes(text);
      const botMsg = isRecipe
        ? { id: Date.now() + 1, role: "bot", type: "recipe", text: "Here are some recipes you might enjoy! 🍳", recipes: getRandomRecipes(), time: formatTime() }
        : { id: Date.now() + 1, role: "bot", type: "text", text: TEXT_REPLIES[Math.floor(Math.random() * TEXT_REPLIES.length)], time: formatTime() };
      setMessages((prev) => [...prev, botMsg]);
      setIsBotTyping(false);
    }, 1400 + Math.random() * 600);
  };

  const isEmpty = messages.length === 0 && !isBotTyping;

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      <Sidebar onNewPost={handleNewPost} />

      <main className="flex-1 overflow-hidden flex flex-col">

        {/* ── Mobile layout ── */}
        <div
          className="flex flex-col lg:hidden"
          style={{ height: "calc(100dvh - 72px - env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="flex items-center gap-3 px-4 pt-4 pb-2 flex-shrink-0">
            <h1 className="text-xl font-black text-gray-800 tracking-tight">Gastro AI Chat</h1>
            <div className="flex-1 h-[2px] bg-gradient-to-r from-orange-400/30 to-transparent rounded-full" />
          </div>

          <div className="flex-1 min-h-0 bg-white mx-3 rounded-2xl overflow-hidden flex flex-col mb-2">
            {isEmpty ? (
              <EmptyState />
            ) : (
              <MessageList
                messages={messages}
                isBotTyping={isBotTyping}
                bottomRef={bottomRef}
              />
            )}
            <div className="flex-shrink-0 px-3 pb-3 pt-2">
              <ChatInput
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSend}
                disabled={isBotTyping}
              />
            </div>
          </div>
        </div>

        {/* ── Desktop layout ── */}
        <div
          className="hidden lg:grid gap-10 p-6 max-w-[1600px] mx-auto w-full overflow-y-auto"
          style={{ gridTemplateColumns: "1fr 400px" }}
        >
          <div className="flex flex-col gap-4 min-w-0" style={{ height: "calc(100vh - 48px)" }}>
            <div className="flex items-center gap-4 flex-shrink-0">
              <h1 className="text-3xl font-black text-gray-800 tracking-tight">AI Chat</h1>
              <div className="flex-1 h-[2px] bg-gradient-to-r from-orange-400/30 to-transparent rounded-full" />
            </div>

            <div className="flex-1 min-h-0 rounded-[1.75rem] bg-white flex flex-col overflow-hidden">
              {isEmpty ? (
                <EmptyState />
              ) : (
                <MessageList
                  messages={messages}
                  isBotTyping={isBotTyping}
                  bottomRef={bottomRef}
                />
              )}
              <div className="flex-shrink-0 flex justify-center px-4 pb-4 pt-2">
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

      {/* Upload progress toast + failed modal */}
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