import { MOCK_RECIPES, TEXT_REPLIES, RECIPE_KEYWORDS } from "../Constants/Constants";

function shouldShowRecipes(text) {
  return RECIPE_KEYWORDS.some((kw) => text.toLowerCase().trim().includes(kw));
}

function getRandomRecipes() {
  const count = Math.floor(Math.random() * 10) + 1;
  return [...MOCK_RECIPES].sort(() => Math.random() - 0.5).slice(0, count);
}

/**
 * Simulates an API call. Swap internals with real fetch() later.
 * Returns a bot message object.
 */
export async function sendMessageToBot(userText, formatTime) {
  const delay = 1400 + Math.random() * 600;
  await new Promise((res) => setTimeout(res, delay));

  if (shouldShowRecipes(userText)) {
    return {
      id: Date.now().toString(),
      role: "bot",
      type: "recipe",
      text: "Here are some recipes you might enjoy! 🍳",
      recipes: getRandomRecipes(),
      time: formatTime(),
    };
  }

  return {
    id: Date.now().toString(),
    role: "bot",
    type: "text",
    text: TEXT_REPLIES[Math.floor(Math.random() * TEXT_REPLIES.length)],
    time: formatTime(),
  };
}