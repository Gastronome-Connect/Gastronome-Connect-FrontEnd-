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
  const type = data?.type === "recipe" ? "recipe" : "text";

  return {
    id: Date.now().toString(),
    sessionId: data?.sessionId || sessionId,
    role: "bot",
    type,
    text:
      data?.reply ||
      "I can chat freely, and I can also help with recipes, ingredients, and cooking tips whenever you need.",
    recipes: type === "recipe" ? recipes : [],
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
