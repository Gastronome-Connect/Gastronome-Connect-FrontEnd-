import React, { useEffect, useState } from "react";
import AILogo from "../../../Assets/AILogo.png";

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
      index < fieldPositions.length - 1 ? fieldPositions[index + 1].index : text.length;

    parsed[entry.field] = text.slice(start, end).trim();
  });

  return parsed;
};

const parseIngredients = (value = "") =>
  String(value || "")
    .split(/\n+/)
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);

const parseProcedureSteps = (value = "") => {
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

  return normalized
    .split(/(?=\d+[.)]\s)/)
    .map((part) => part.replace(/^\d+[.)]\s*/, "").trim())
    .filter(Boolean);
};

function RecipeMessageLayout({ recipe }) {
  const title = recipe["Title of the dish"] || "Recipe";
  const author = recipe["Author"] || "Not available in the source data.";
  const ingredients = parseIngredients(recipe["Ingredients and Measurement"]);
  const steps = parseProcedureSteps(recipe["Procedure/Description"]);
  const websiteLink = recipe["Website link (if any)"] || "Not available in the source data.";
  const otherInfo = recipe["Other information or AI's chat"] || "";
  const hasLink = websiteLink && websiteLink !== "Not available in the source data.";

  return (
    <div className="space-y-4 rounded-[22px] border border-orange-100 bg-white/95 p-4 sm:p-5 shadow-[0_12px_30px_-20px_rgba(245,118,0,0.45)]">
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#F57600]">
          Recipe Result
        </p>
        <h3 className="mt-1 text-sm sm:text-base font-black text-gray-900 leading-snug">
          {title}
        </h3>
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
            {ingredients.map((item, index) => (
              <li key={`${index}-${item.slice(0, 18)}`} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#F57600] shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs sm:text-sm text-gray-500">Not available in the source data.</p>
        )}
      </div>

      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#F57600] mb-2">
          Procedure / Description
        </p>
        {steps.length > 0 ? (
          <ol className="space-y-2.5">
            {steps.map((step, index) => (
              <li key={`${index}-${step.slice(0, 18)}`} className="flex items-start gap-3">
                <span className="shrink-0 text-xs font-extrabold text-[#F57600]">
                  {index + 1}.
                </span>
                <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-xs sm:text-sm text-gray-500">Not available in the source data.</p>
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
        <p className="text-xs sm:text-sm text-gray-700 leading-6 whitespace-pre-line break-words">
          {otherInfo || "Ask me if you want substitutions, serving ideas, or a simpler version of this dish."}
        </p>
      </div>
    </div>
  );
}

export default function BotMessageBubble({
  message,
  time,
  isLoading = false,
  hideActions = false,
  isNew = false,
  onTypingDone,
}) {
  const [displayed, setDisplayed] = useState(isNew ? "" : (message ?? ""));
  const [done, setDone] = useState(!isNew);
  const parsedRecipe = done ? parseRecipeMessage(displayed) : null;

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
        ) : (
          parsedRecipe ? (
            <div>
              <RecipeMessageLayout recipe={parsedRecipe} />
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-gray-800 leading-6 sm:leading-7 whitespace-pre-line break-words">
              {displayed}
              {!done && (
                <span className="inline-block w-[2px] h-[14px] bg-gray-500 ml-0.5 align-middle animate-pulse" />
              )}
            </p>
          )
        )}

        {done && !hideActions && (
          <div className="flex items-center gap-1 sm:gap-1.5 mt-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
            {[
              <svg
                key="copy"
                className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>,
              <svg
                key="up"
                className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"
                />
              </svg>,
              <svg
                key="down"
                className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"
                />
              </svg>,
              <svg
                key="regen"
                className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>,
            ].map((icon, i) => (
              <button
                key={i}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {icon}
              </button>
            ))}
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
