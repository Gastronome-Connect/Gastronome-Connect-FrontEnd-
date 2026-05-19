import React from "react";
import UserMessageBubble from "../Chat Bubbles/UserBubble";
import BotMessageBubble from "../Chat Bubbles/ChatbotBubble";
import CardExpandedView from "../../../../components/Cards/CardViewer";
import { useChatContext } from "../../../../Context/ChatContext";
import { useUserLibrary } from "../../../../Context/UserLibraryContext";

const PAGE_SIZE = 3;

async function copyTextToClipboard(text = "") {
  const normalizedText = String(text || "");

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(normalizedText);
    return true;
  }

  if (typeof document === "undefined") {
    return false;
  }

  const textarea = document.createElement("textarea");
  textarea.value = normalizedText;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
}

function mapRecipeToViewerPost(recipe = {}) {
  const title = recipe.title || recipe.name || "Recipe";
  const image = recipe.image || recipe.img || recipe.mediaItems?.[0]?.url || "";
  const description = recipe.description || recipe.caption || "";
  const date = recipe.date || recipe.dateCreate || recipe.dateCreated || "";

  // If procedure exists (web recipe), use it as the caption so the CardViewer
  // shows the actual steps rather than the short meta description.
  const captionText = (() => {
    if (Array.isArray(recipe.procedure) && recipe.procedure.length > 0) {
      return recipe.procedure.join("\n");
    }
    if (typeof recipe.procedure === "string" && recipe.procedure.trim()) {
      return recipe.procedure.trim();
    }
    return description;
  })();

  // Spoonacular ingredients are structured objects { id, name, amount, unit }.
  // Web recipe ingredients are plain strings. Normalise both to the same shape
  // so IngredientList in CardViewer can always render them correctly.
  const ingredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients.map((ing, idx) => {
        if (ing && typeof ing === "object") return ing;
        const str = String(ing || "").trim();
        return { id: idx, name: str, amount: "", unit: "" };
      })
    : [];

  return {
    id: recipe.id || `chatbot-${title.toLowerCase().replace(/\s+/g, "-")}`,
    title,
    caption: captionText,
    author: recipe.author || "Unknown",
    avatar: recipe.avatar || image,
    date,
    sourceLabel: recipe.sourceSite || recipe.sourceName || "",
    ingredients,
    mediaItems:
      Array.isArray(recipe.mediaItems) && recipe.mediaItems.length > 0
        ? recipe.mediaItems
        : image
          ? [{ type: "image", url: image, title, caption: captionText }]
          : [],
  };
}

function SmallRecipeCard({ recipe, onClick }) {
  const {
    title = "Recipe",
    image = "",
    author = "Unknown",
    dateCreate = "",
    description = "",
    procedure = "",
  } = recipe || {};

  const previewText = Array.isArray(procedure)
    ? procedure.join(" ")
    : procedure || description;

  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white text-left rounded-[16px] sm:rounded-[20px] shadow-md border border-gray-100 p-2.5 sm:p-3 w-[180px] sm:w-[220px] flex-shrink-0 hover:scale-[1.02] hover:border-orange-200 transition-all"
    >
      <div className="w-full h-16 sm:h-20 rounded-xl overflow-hidden mb-2 bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <svg
            className="w-6 h-6 sm:w-7 sm:h-7 text-orange-300"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-1.5-.454M9 6l3-3 3 3M12 3v12"
            />
          </svg>
        )}
      </div>
      <div className="w-2/3 h-[2px] bg-orange-500 rounded-full mb-1.5" />
      <h4 className="font-black text-[11px] sm:text-xs text-gray-900 leading-tight mb-1 break-words whitespace-normal">
        {title}
      </h4>
      <p className="text-[9px] sm:text-[10px] font-semibold text-gray-700">
        Author: <span className="font-medium">{author}</span>
      </p>
      <p className="text-[9px] sm:text-[10px] font-semibold text-gray-700 mb-1">
        Date: <span className="font-medium">{dateCreate}</span>
      </p>
      <p className="text-[9px] sm:text-[10px] text-gray-400 leading-snug whitespace-normal break-words max-h-28 overflow-y-auto pr-1">
        {previewText}
      </p>
      <p className="mt-2 text-[9px] sm:text-[10px] font-bold text-[#F57600]">
        Tap to view recipe
      </p>
    </button>
  );
}

function RecipeCarousel({ recipes, onRecipeClick }) {
  const [page, setPage] = React.useState(0);
  const totalPages = Math.ceil(recipes.length / PAGE_SIZE);
  const canPrev = page > 0;
  const canNext = page < totalPages - 1;
  const visible = recipes.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const scrollRef = React.useRef(null);

  return (
    <>
      <div
        ref={scrollRef}
        className="flex sm:hidden gap-2 overflow-x-auto pb-2 -mx-1 px-1"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style>{`.recipe-scroll::-webkit-scrollbar { display: none; }`}</style>
        <div className="recipe-scroll flex gap-2">
          {recipes.map((recipe, i) => (
            <div key={i} style={{ scrollSnapAlign: "start" }}>
              <SmallRecipeCard
                recipe={recipe}
                onClick={() => onRecipeClick(recipe)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="hidden sm:flex items-center" style={{ gap: "6px" }}>
        <button
          onClick={() => setPage((p) => p - 1)}
          disabled={!canPrev}
          className={`flex-shrink-0 transition-all ${canPrev ? "text-orange-500 hover:text-orange-600" : "text-gray-200 cursor-not-allowed"}`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="flex" style={{ gap: "8px" }}>
          {visible.map((recipe, i) => (
            <SmallRecipeCard
              key={i}
              recipe={recipe}
              onClick={() => onRecipeClick(recipe)}
            />
          ))}
        </div>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!canNext}
          className={`flex-shrink-0 transition-all ${canNext ? "text-orange-500 hover:text-orange-600" : "text-gray-200 cursor-not-allowed"}`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </>
  );
}

function ActionBar({ time, text }) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setCopied(false);
    }, 1500);

    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  const handleCopy = async () => {
    try {
      const didCopy = await copyTextToClipboard(text);
      if (didCopy) {
        setCopied(true);
      }
    } catch (error) {
      console.error("Failed to copy chatbot response:", error);
    }
  };

  return (
    <div className="flex items-center gap-1 sm:gap-1.5 pl-9 sm:pl-20">
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy AI response"
        title={copied ? "Copied" : "Copy response"}
        className={`p-1 transition-colors ${copied ? "text-[#F57600]" : "text-gray-400 hover:text-gray-600"}`}
      >
        <svg
          className="w-3 h-3 sm:w-3.5 sm:h-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      </button>
      {time && (
        <span className="text-[10px] text-gray-400 ml-1 sm:ml-2">{time}</span>
      )}
    </div>
  );
}

export default function MessageList({ messages, isBotTyping, bottomRef }) {
  // ← Pull context so we can dispatch MARK_MESSAGE_SEEN
  const { activeSessionId, dispatch } = useChatContext();
  const { isArchived } = useUserLibrary();
  const [selectedRecipe, setSelectedRecipe] = React.useState(null);

  return (
    <div className="flex-1 overflow-y-auto flex flex-col py-3 sm:py-4">
      {messages.map((msg) => {
        if (msg.role === "user") {
          return (
            <UserMessageBubble
              key={msg.id}
              message={msg.text}
              time={msg.time}
            />
          );
        }

        if (msg.type === "text") {
          return (
            <BotMessageBubble
              key={msg.id}
              message={msg.text}
              time={msg.time}
              isNew={msg.isNew === true}
              onTypingDone={() =>
                dispatch({
                  type: "MARK_MESSAGE_SEEN",
                  payload: { sessionId: activeSessionId, messageId: msg.id },
                })
              }
            />
          );
        }

        if (msg.type === "web_recipe") {
          return (
            <BotMessageBubble
              key={msg.id}
              message={msg.text}
              webRecipe={msg.webRecipe || null}
              time={msg.time}
              isNew={msg.isNew === true}
              onTypingDone={() =>
                dispatch({
                  type: "MARK_MESSAGE_SEEN",
                  payload: { sessionId: activeSessionId, messageId: msg.id },
                })
              }
            />
          );
        }

        if (msg.type === "recipe") {
          const allRecipes = Array.isArray(msg.recipes) ? msg.recipes : [];
          const visibleRecipes = allRecipes.filter(
            (recipe) => !isArchived(mapRecipeToViewerPost(recipe).id),
          );

          return (
            <div key={msg.id} className="flex flex-col gap-2 py-2 group">
              <BotMessageBubble
                message={msg.text}
                hideActions
                isNew={msg.isNew === true}
                onTypingDone={() =>
                  dispatch({
                    type: "MARK_MESSAGE_SEEN",
                    payload: { sessionId: activeSessionId, messageId: msg.id },
                  })
                }
              />
              <p className="text-[11px] text-gray-400 pl-9 sm:pl-20">
                {visibleRecipes.length} recipe
                {visibleRecipes.length !== 1 ? "s" : ""} found
                <span className="hidden sm:inline">
                  {Math.ceil(visibleRecipes.length / PAGE_SIZE) > 1 &&
                    ` · use arrows to browse`}
                </span>
                <span className="inline sm:hidden"> · swipe to browse</span>
              </p>
              <div className="pl-9 sm:pl-20 overflow-hidden">
                {visibleRecipes.length > 0 ? (
                  <RecipeCarousel
                    recipes={visibleRecipes}
                    onRecipeClick={(recipe) => setSelectedRecipe(recipe)}
                  />
                ) : allRecipes.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    No recipe cards were attached to this message.
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">
                    All recipe cards from this message are archived.
                  </p>
                )}
              </div>
              <ActionBar time={msg.time} text={msg.text} />
            </div>
          );
        }

        return null;
      })}

      {isBotTyping && <BotMessageBubble isLoading />}
      <div ref={bottomRef} />

      {selectedRecipe && (
        <CardExpandedView
          post={mapRecipeToViewerPost(selectedRecipe)}
          onClose={() => setSelectedRecipe(null)}
          hideOptionsMenu
        />
      )}
    </div>
  );
}
