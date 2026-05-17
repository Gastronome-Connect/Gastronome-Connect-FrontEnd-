import { apiFetch } from "../utils/api";

export async function sendMessageToBot(
  userText,
  formatTime,
  sessionId,
  history = [],
  signal,
) {
  const response = await apiFetch("/api/chatbot/message", {
    method: "POST",
    signal,
    body: JSON.stringify({
      sessionId,
      message: userText,
      history,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "Failed to contact Gastro AI.");
  }

  const recipes = Array.isArray(data?.recipes) ? data.recipes : [];
  const isWebRecipe = data?.type === "web_recipe";
  const type = isWebRecipe
    ? "web_recipe"
    : data?.type === "recipe"
      ? "recipe"
      : "text";

  return {
    id: Date.now().toString(),
    sessionId: data?.sessionId || sessionId,
    role: "bot",
    type,
    text:
      data?.reply ||
      "I'm Gastro AI 🍗 — I can help with recipes, ingredients, cooking tips, meal ideas, and food discovery. What are you craving today?",
    recipes: type === "recipe" ? recipes : [],
    webRecipe: isWebRecipe ? data?.webRecipe || null : null,
    time: formatTime(),
  };
}

export async function fetchChatSessions() {
  const response = await apiFetch("/api/chatbot/sessions");
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "Failed to load chat sessions.");
  }

  return Array.isArray(data?.sessions) ? data.sessions : [];
}

export async function deleteChatSession(sessionId) {
  const response = await apiFetch(`/api/chatbot/sessions/${sessionId}`, {
    method: "DELETE",
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "Failed to delete chat session.");
  }

  return data;
}
