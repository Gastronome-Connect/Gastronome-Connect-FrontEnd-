import { apiFetch } from "../utils/api";

export async function sendMessageToBot(
  userText,
  formatTime,
  history = [],
  signal,
) {
  const response = await apiFetch("/api/chatbot/message", {
    method: "POST",
    signal,
    body: JSON.stringify({
      message: userText,
      history,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "Failed to contact Gastro AI.");
  }

  const recipes = Array.isArray(data?.recipes) ? data.recipes : [];

  return {
    id: Date.now().toString(),
    role: "bot",
    type: recipes.length > 0 ? "recipe" : "text",
    text:
      data?.reply ||
      "I can chat freely, and I can also help with recipes, ingredients, and cooking tips whenever you need.",
    recipes,
    time: formatTime(),
  };
}
