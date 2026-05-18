import React, { useEffect, useState, useMemo } from "react";
import AILogo from "../../../Assets/AILogo.png";
import { Heart, Archive, Volume2, AlertCircle } from "lucide-react";
import { useUserLibrary } from "../../../../Context/UserLibraryContext";
import ReportModal from "../ReportModal";

const copyTextToClipboard = async (text = "") => {
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
};

const INLINE_TOKEN_REGEX =
  /(\*\*([^*]+)\*\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+))/g;

const RECIPE_FIELDS = [
  "Title of the dish",
  "Author",
  "Ingredients and Measurement",
  "Procedure/Description",
  "Website link (if any)",
  "Other information or AI's chat",
];

const parseRecipeMessage = (message = "") => {
  const text = String(message || "").trim();

  if (!text || !RECIPE_FIELDS.every((field) => text.includes(`${field}:`))) {
    return null;
  }

  const fieldPositions = RECIPE_FIELDS.map((field) => ({
    field,
    index: text.indexOf(`${field}:`),
  }));

  if (fieldPositions.some((entry) => entry.index === -1)) {
    return null;
  }

  const parsed = {};

  fieldPositions.forEach((entry, index) => {
    const start = entry.index + entry.field.length + 1;
    const end =
      index < fieldPositions.length - 1
        ? fieldPositions[index + 1].index
        : text.length;

    parsed[entry.field] = text.slice(start, end).trim();
  });

  return parsed;
};

const parseIngredients = (value = "") =>
  String(value || "")
    .split(/\n+/)
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);

const formatIngredientItem = (item) => {
  if (!item) {
    return "";
  }

  if (typeof item === "string") {
    return String(item)
      .replace(/^[-*]\s*/, "")
      .trim();
  }

  const amount = String(item.amount || "").trim();
  const unit = String(item.unit || "").trim();
  const name = String(item.name || item.original || "").trim();
  const note = String(item.note || "").trim();

  return [amount, unit, name, note].filter(Boolean).join(" ").trim();
};

const parseProcedureSteps = (value = "") => {
  if (Array.isArray(value)) {
    return value
      .map((step) =>
        String(
          typeof step === "string" ? step : step?.text || step?.name || "",
        ).trim(),
      )
      .filter(Boolean);
  }

  const normalized = String(value || "").trim();

  if (!normalized) {
    return [];
  }

  const numbered = normalized
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^\d+[.)]\s*/, ""));

  if (numbered.length > 1) {
    return numbered;
  }

  const sentenceSteps = normalized
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (sentenceSteps.length > 1) {
    return sentenceSteps;
  }

  return normalized
    .split(/(?=\d+[.)]\s)/)
    .map((part) => part.replace(/^\d+[.)]\s*/, "").trim())
    .filter(Boolean);
};

const normalizeMessageText = (value = "") =>
  String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/([^\n])\s+(\d+[.)]\s+)/g, "$1\n$2")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const stripTrailingPunctuation = (url = "") => {
  let normalizedUrl = String(url || "");
  let trailing = "";

  while (/[.,!?;:]$/.test(normalizedUrl)) {
    trailing = normalizedUrl.slice(-1) + trailing;
    normalizedUrl = normalizedUrl.slice(0, -1);
  }

  return { normalizedUrl, trailing };
};

function renderInlineContent(text = "", keyPrefix = "inline") {
  const value = String(text || "");
  const nodes = [];
  let lastIndex = 0;
  let match;
  let tokenIndex = 0;

  while ((match = INLINE_TOKEN_REGEX.exec(value)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(value.slice(lastIndex, match.index));
    }

    if (match[2]) {
      nodes.push(
        <strong
          key={`${keyPrefix}-bold-${tokenIndex}`}
          className="font-extrabold text-gray-900"
        >
          {match[2]}
        </strong>,
      );
    } else if (match[3] && match[4]) {
      nodes.push(
        <a
          key={`${keyPrefix}-md-link-${tokenIndex}`}
          href={match[4]}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-[#0060A9] underline decoration-[#0060A9]/40 underline-offset-2 break-all hover:text-[#F57600]"
        >
          {match[3]}
        </a>,
      );
    } else if (match[5]) {
      const { normalizedUrl, trailing } = stripTrailingPunctuation(match[5]);
      nodes.push(
        <a
          key={`${keyPrefix}-raw-link-${tokenIndex}`}
          href={normalizedUrl}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-[#0060A9] underline decoration-[#0060A9]/40 underline-offset-2 break-all hover:text-[#F57600]"
        >
          {normalizedUrl}
        </a>,
      );

      if (trailing) {
        nodes.push(trailing);
      }
    }

    lastIndex = INLINE_TOKEN_REGEX.lastIndex;
    tokenIndex += 1;
  }

  if (lastIndex < value.length) {
    nodes.push(value.slice(lastIndex));
  }

  return nodes;
}

function FormattedMessage({ text, showCursor = false }) {
  const normalized = normalizeMessageText(text);
  const lines = normalized ? normalized.split("\n") : [];

  if (lines.length === 0) {
    return showCursor ? (
      <span className="inline-block w-[2px] h-[14px] bg-gray-500 ml-0.5 align-middle animate-pulse" />
    ) : null;
  }

  return (
    <div className="space-y-2 text-xs sm:text-sm text-gray-800 leading-6 sm:leading-7 break-words">
      {lines.map((line, index) => {
        const numberedMatch = line.match(/^(\d+[.)])\s+(.*)$/);

        if (!line.trim()) {
          return <div key={`line-${index}`} className="h-2" />;
        }

        if (numberedMatch) {
          return (
            <div key={`line-${index}`} className="flex items-start gap-2.5">
              <span className="shrink-0 font-extrabold text-[#F57600]">
                {numberedMatch[1]}
              </span>
              <span className="min-w-0">
                {renderInlineContent(numberedMatch[2], `line-${index}`)}
                {showCursor && index === lines.length - 1 && (
                  <span className="inline-block w-[2px] h-[14px] bg-gray-500 ml-0.5 align-middle animate-pulse" />
                )}
              </span>
            </div>
          );
        }

        return (
          <p key={`line-${index}`}>
            {renderInlineContent(line, `line-${index}`)}
            {showCursor && index === lines.length - 1 && (
              <span className="inline-block w-[2px] h-[14px] bg-gray-500 ml-0.5 align-middle animate-pulse" />
            )}
          </p>
        );
      })}
    </div>
  );
}

function RecipeMessageLayout({ recipe }) {
  const title = recipe["Title of the dish"] || "Recipe";
  const author = recipe["Author"] || "Not available in the source data.";
  const ingredients = parseIngredients(recipe["Ingredients and Measurement"]);
  const steps = parseProcedureSteps(recipe["Procedure/Description"]);
  const websiteLink =
    recipe["Website link (if any)"] || "Not available in the source data.";
  const otherInfo = recipe["Other information or AI's chat"] || "";
  const hasLink =
    websiteLink && websiteLink !== "Not available in the source data.";
  
  const { addToFavorites, removeFromFavorites, isFavorited, addToArchives, removeFromArchives, isArchived } = useUserLibrary();
  const [isFav, setIsFav] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = React.useRef(null);

  const recipeData = useMemo(
    () => ({
      id: `recipe-${title.toLowerCase().replace(/\s+/g, "-")}`,
      title,
      author,
      caption: steps.join("\n"),
      description: ingredients.join("\n"),
      image: "",
      ingredients,
    }),
    [title, author, steps, ingredients]
  );

  useEffect(() => {
    setIsFav(isFavorited(recipeData));
  }, [recipeData, isFavorited]);

  useEffect(() => {
    return () => {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
      }
    };
  }, [isSpeaking]);

  const handleToggleFavorite = () => {
    if (isFav) {
      removeFromFavorites(recipeData.id);
    } else {
      addToFavorites(recipeData);
    }
    setIsFav(!isFav);
  };

  const handleArchive = () => {
    if (isArchived(recipeData.id)) {
      removeFromArchives(recipeData.id);
    } else {
      addToArchives(recipeData);
    }
  };

  const handleTextToSpeech = () => {
    const textToSpeak = `${title}. Ingredients: ${ingredients.join(", ")}. Steps: ${steps.join(" ")}`;
    
    if ("speechSynthesis" in window) {
      if (isSpeaking) {
        if (isPaused) {
          window.speechSynthesis.resume();
          setIsPaused(false);
        } else {
          window.speechSynthesis.pause();
          setIsPaused(true);
        }
      } else {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        utterance.onstart = () => {
          setIsSpeaking(true);
          setIsPaused(false);
        };
        
        utterance.onend = () => {
          setIsSpeaking(false);
          setIsPaused(false);
        };
        
        utterance.onerror = () => {
          setIsSpeaking(false);
          setIsPaused(false);
        };
        
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const handleReportSubmit = async (reportData) => {
    console.log("Report submitted:", reportData);
  };

  return (
    <div className="space-y-4 rounded-[22px] border border-orange-100 bg-white/95 p-4 sm:p-5 shadow-[0_12px_30px_-20px_rgba(245,118,0,0.45)] relative">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#F57600]">
              Recipe Result
            </p>
            <h3 className="mt-1 text-sm sm:text-base font-black text-gray-900 leading-snug">
              {title}
            </h3>
          </div>
          
          {/* Action buttons in header */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleToggleFavorite}
              title={isFav ? "Remove from favorites" : "Add to favorites"}
              className={`p-1.5 rounded-lg transition-all ${
                isFav
                  ? "bg-red-100 text-red-600"
                  : "bg-red-50 text-red-500 hover:bg-red-100"
              }`}
            >
              <Heart size={14} fill={isFav ? "currentColor" : "none"} />
            </button>

            <button
              onClick={handleArchive}
              title={isArchived(recipeData.id) ? "Remove from archive" : "Add to archive"}
              className={`p-1.5 rounded-lg transition-all ${
                isArchived(recipeData.id)
                  ? "bg-orange-100 text-orange-600"
                  : "bg-orange-50 text-orange-500 hover:bg-orange-100"
              }`}
            >
              <Archive size={14} />
            </button>

            <button
              onClick={handleTextToSpeech}
              title={isSpeaking ? (isPaused ? "Resume reading" : "Pause reading") : "Read aloud"}
              className={`p-1.5 rounded-lg transition-all ${
                isSpeaking && !isPaused
                  ? "bg-blue-100 text-blue-600"
                  : "bg-blue-50 text-blue-500 hover:bg-blue-100"
              }`}
            >
              <Volume2 size={14} />
            </button>

            <button
              onClick={() => setShowReportModal(true)}
              title="Report recipe"
              className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
            >
              <AlertCircle size={14} />
            </button>
          </div>
        </div>
        <p className="mt-2 text-[11px] sm:text-xs text-gray-500 leading-5">
          <span className="font-bold text-gray-700">Author:</span> {author}
        </p>
      </div>

      <div className="rounded-2xl border border-orange-100 bg-orange-50/70 px-3.5 py-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wide text-[#F57600]">
            Ingredients and Measurement
          </span>
          <span className="text-[10px] text-orange-400 font-semibold">
            {ingredients.length || 0} item{ingredients.length === 1 ? "" : "s"}
          </span>
        </div>

        {ingredients.length > 0 ? (
          <ul className="space-y-1.5">
            {ingredients.map((item, index) => {
              const formattedItem = formatIngredientItem(item);
              if (!formattedItem) {
                return null;
              }

              return (
                <li
                  key={`${index}-${formattedItem.slice(0, 18)}`}
                  className="flex items-start gap-2"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#F57600] shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    {formattedItem}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-xs sm:text-sm text-gray-500">
            Not available in the source data.
          </p>
        )}
      </div>

      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#F57600] mb-2">
          Procedure / Description
        </p>
        {steps.length > 0 ? (
          <ol className="space-y-2.5">
            {steps.map((step, index) => (
              <li
                key={`${index}-${step.slice(0, 18)}`}
                className="flex items-start gap-3"
              >
                <span className="shrink-0 text-xs font-extrabold text-[#F57600]">
                  {index + 1}.
                </span>
                <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-xs sm:text-sm text-gray-500">
            Not available in the source data.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#F57600]">
          Website Link
        </p>
        {hasLink ? (
          <a
            href={websiteLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex max-w-full text-xs sm:text-sm text-[#0060A9] hover:text-[#F57600] font-semibold break-all"
          >
            {websiteLink}
          </a>
        ) : (
          <p className="text-xs sm:text-sm text-gray-500">{websiteLink}</p>
        )}
      </div>

      <div className="border-t border-gray-100 pt-3">
        <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#F57600] mb-2">
          Other Information or AI's Chat
        </p>
        <FormattedMessage
          text={
            otherInfo ||
            "Ask me if you want substitutions, serving ideas, or a simpler version of this dish."
          }
        />
      </div>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        recipeName={title}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
}

// ─── Web Recipe Card ──────────────────────────────────────────────────────────
// Rendered when the AI found a recipe online (type = "web_recipe").
// The structured webRecipe object is passed directly — no text-parsing needed.

function WebRecipeCard({ recipe }) {
  const {
    title = "Recipe",
    author = "",
    sourceSite = "",
    sourceUrl = "",
    image = "",
    images = [],
    ingredients = [],
    procedure = "",
    otherInfo = "",
  } = recipe || {};

  const steps = parseProcedureSteps(
    Array.isArray(procedure) ? procedure.join("\n") : procedure,
  );
  const parsedIngredients = ingredients
    .map(formatIngredientItem)
    .filter(Boolean);
  const authorLine = [author, sourceSite !== author ? sourceSite : ""]
    .filter(Boolean)
    .join(" · ");
  const hasLink =
    sourceUrl && !sourceUrl.toLowerCase().includes("not available");
  const previewImage = [image, ...(Array.isArray(images) ? images : [])].find(
    Boolean,
  );

  const { addToFavorites, removeFromFavorites, isFavorited, addToArchives, removeFromArchives, isArchived } = useUserLibrary();
  const [isFav, setIsFav] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = React.useRef(null);

  const recipeData = useMemo(
    () => ({
      id: `recipe-${title.toLowerCase().replace(/\s+/g, "-")}`,
      title,
      author,
      caption: steps.join("\n"),
      description: parsedIngredients.join("\n"),
      image: previewImage || "",
      ingredients: parsedIngredients,
    }),
    [title, author, steps, parsedIngredients, previewImage]
  );

  useEffect(() => {
    setIsFav(isFavorited(recipeData));
  }, [recipeData, isFavorited]);

  useEffect(() => {
    return () => {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
      }
    };
  }, [isSpeaking]);

  const handleToggleFavorite = () => {
    if (isFav) {
      removeFromFavorites(recipeData.id);
    } else {
      addToFavorites(recipeData);
    }
    setIsFav(!isFav);
  };

  const handleArchive = () => {
    if (isArchived(recipeData.id)) {
      removeFromArchives(recipeData.id);
    } else {
      addToArchives(recipeData);
    }
  };

  const handleTextToSpeech = () => {
    const textToSpeak = `${title}. Ingredients: ${parsedIngredients.join(", ")}. Steps: ${steps.join(" ")}`;
    
    if ("speechSynthesis" in window) {
      if (isSpeaking) {
        if (isPaused) {
          window.speechSynthesis.resume();
          setIsPaused(false);
        } else {
          window.speechSynthesis.pause();
          setIsPaused(true);
        }
      } else {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        utterance.onstart = () => {
          setIsSpeaking(true);
          setIsPaused(false);
        };
        
        utterance.onend = () => {
          setIsSpeaking(false);
          setIsPaused(false);
        };
        
        utterance.onerror = () => {
          setIsSpeaking(false);
          setIsPaused(false);
        };
        
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const handleReportSubmit = async (reportData) => {
    console.log("Report submitted:", reportData);
  };

  return (
    <div className="rounded-[24px] overflow-hidden shadow-[0_16px_40px_-16px_rgba(245,118,0,0.35)] border border-orange-100 bg-white">
      {/* Header band */}
      <div className="relative bg-gradient-to-r from-[#F57600] to-[#FF9A3C] px-4 sm:px-5 py-3 sm:py-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] font-extrabold tracking-[0.18em] uppercase text-white/80 block mb-0.5">
            Recipe Found Online
          </span>
          <h3 className="text-sm sm:text-base font-black text-white leading-snug break-words">
            {title}
          </h3>
        </div>

        {/* Action buttons in header */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2 z-10">
          <button
            onClick={handleToggleFavorite}
            title={isFav ? "Remove from favorites" : "Add to favorites"}
            className={`p-2 rounded-lg transition-all hover:scale-110 ${
              isFav
                ? "bg-red-500/50 text-white"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            <Heart size={16} fill={isFav ? "currentColor" : "none"} />
          </button>

          <button
            onClick={handleArchive}
            title={isArchived(recipeData.id) ? "Remove from archive" : "Add to archive"}
            className={`p-2 rounded-lg transition-all hover:scale-110 ${
              isArchived(recipeData.id)
                ? "bg-orange-500/50 text-white"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            <Archive size={16} />
          </button>

          <button
            onClick={handleTextToSpeech}
            title={isSpeaking ? (isPaused ? "Resume reading" : "Pause reading") : "Read aloud"}
            className={`p-2 rounded-lg transition-all hover:scale-110 ${
              isSpeaking && !isPaused
                ? "bg-blue-500/50 text-white"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            <Volume2 size={16} />
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            title="Report recipe"
            className="p-2 rounded-lg bg-white/20 text-white hover:bg-red-400/50 transition-all hover:scale-110"
          >
            <AlertCircle size={16} />
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-5 py-4 space-y-4">
        {/* Source line */}
        {(authorLine || hasLink) && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] sm:text-xs">
            {authorLine && (
              <span className="text-gray-500">
                <span className="font-semibold text-gray-700">Source:</span>{" "}
                {authorLine}
              </span>
            )}
            {hasLink && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[#0060A9] hover:text-[#F57600] transition-colors break-all"
              >
                <svg
                  className="w-3 h-3 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                View source
              </a>
            )}
          </div>
        )}

        {previewImage && (
          <div className="overflow-hidden rounded-2xl border border-orange-100 bg-orange-50">
            <img
              src={previewImage}
              alt={`${title} preview`}
              className="h-40 w-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Ingredients */}
        <div className="rounded-2xl border border-orange-100 bg-orange-50/60 px-3.5 py-3">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              {/* Utensils icon */}
              <svg
                className="w-3.5 h-3.5 text-[#F57600]"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 3v11m0 0a3 3 0 003 3h0a3 3 0 003-3V3m-3 11V21M5 3v4a3 3 0 003 3h0"
                />
              </svg>
              <span className="text-[10px] font-extrabold uppercase tracking-wide text-[#F57600]">
                Ingredients
              </span>
            </div>
            <span className="text-[10px] font-semibold text-orange-400 bg-orange-100 rounded-full px-2 py-0.5">
              {parsedIngredients.length} item
              {parsedIngredients.length === 1 ? "" : "s"}
            </span>
          </div>

          {parsedIngredients.length > 0 ? (
            <ul className="space-y-1.5">
              {parsedIngredients.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#F57600] shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-400 italic">
              Not available in the source data.
            </p>
          )}
        </div>

        {/* Procedure */}
        <div>
          <div className="flex items-center gap-1.5 mb-2.5">
            <svg
              className="w-3.5 h-3.5 text-[#F57600]"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-[#F57600]">
              Procedure / Description
            </span>
          </div>

          {steps.length > 0 ? (
            <ol className="space-y-2.5">
              {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="shrink-0 min-w-[20px] text-center text-[11px] font-extrabold text-white bg-[#F57600] rounded-full w-5 h-5 flex items-center justify-center leading-none mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-xs text-gray-400 italic">
              Not available in the source data.
            </p>
          )}
        </div>

        {/* AI tips / other info */}
        {otherInfo && (
          <div className="rounded-2xl bg-gradient-to-br from-[#FFF7ED] to-[#FEF3C7] border border-amber-100 px-3.5 py-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <svg
                className="w-3.5 h-3.5 text-amber-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <span className="text-[10px] font-extrabold uppercase tracking-wide text-amber-600">
                Gastro AI Tips
              </span>
            </div>
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
              {otherInfo}
            </p>
          </div>
        )}
      </div>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        recipeName={title}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
}

export default function BotMessageBubble({
  message,
  webRecipe = null,
  time,
  isLoading = false,
  hideActions = false,
  isNew = false,
  onTypingDone,
}) {
  const [displayed, setDisplayed] = useState(isNew ? "" : (message ?? ""));
  const [done, setDone] = useState(!isNew);
  const [copied, setCopied] = useState(false);
  const parsedRecipe =
    done && !webRecipe ? parseRecipeMessage(displayed) : null;

  useEffect(() => {
    if (isLoading || !message) return;

    if (!isNew) {
      setDisplayed(message);
      setDone(true);
      return;
    }

    setDisplayed("");
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      setDisplayed(message.slice(0, i + 1));
      i++;
      if (i >= message.length) {
        clearInterval(id);
        setDone(true);
        onTypingDone?.();
      }
    }, 18);
    return () => clearInterval(id);
  }, [message, isLoading, isNew, onTypingDone]);

  useEffect(() => {
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
      const didCopy = await copyTextToClipboard(message);
      if (didCopy) {
        setCopied(true);
      }
    } catch (error) {
      console.error("Failed to copy chatbot response:", error);
    }
  };

  return (
    <div className="flex gap-2 sm:gap-4 px-3 sm:px-8 group">
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#1A2B5F] to-[#2563EB] flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
        <img
          src={AILogo}
          alt="AI"
          className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain"
        />
      </div>

      <div className="flex-1 min-w-0">
        {isLoading ? (
          <span className="flex items-center gap-1 h-5 mt-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </span>
        ) : webRecipe ? (
          <WebRecipeCard recipe={webRecipe} />
        ) : parsedRecipe ? (
          <div>
            <RecipeMessageLayout recipe={parsedRecipe} />
          </div>
        ) : (
          <FormattedMessage text={displayed} showCursor={!done} />
        )}

        {done && !hideActions && (
          <div className="flex items-center gap-1 sm:gap-1.5 mt-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
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
              <span className="text-[10px] text-gray-400 ml-1 sm:ml-2">
                {time}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
