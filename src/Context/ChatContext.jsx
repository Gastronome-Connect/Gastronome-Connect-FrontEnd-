import React, { createContext, useContext, useReducer, useEffect } from "react";

const STORAGE_KEY = "gastro_chat_sessions";

function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {}
}

const initialState = {
  sessions: loadSessions(),
  activeSessionId: null,
};

function reducer(state, action) {
  switch (action.type) {

    case "NEW_SESSION": {
      const session = {
        // Use provided id if given, otherwise generate one
        id: action.payload?.id || Date.now().toString(),
        title: action.payload?.title || "New chat",
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return {
        sessions: [session, ...state.sessions],
        activeSessionId: session.id,
      };
    }

    case "SET_ACTIVE_SESSION":
      return { ...state, activeSessionId: action.payload };

    case "ADD_MESSAGE": {
      const sessions = state.sessions.map((s) => {
        if (s.id !== action.payload.sessionId) return s;
        const messages = [...s.messages, action.payload.message];
        // Auto-title from first user message
        const title =
          s.title === "New chat" && action.payload.message.role === "user"
            ? action.payload.message.text.slice(0, 40)
            : s.title;
        return {
          ...s,
          messages,
          title,
          updatedAt: new Date().toISOString(),
        };
      });
      return { ...state, sessions };
    }

    case "DELETE_SESSION":
      return {
        sessions: state.sessions.filter((s) => s.id !== action.payload),
        activeSessionId:
          state.activeSessionId === action.payload
            ? null
            : state.activeSessionId,
      };

    default:
      return state;
  }
}

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    saveSessions(state.sessions);
  }, [state.sessions]);

  const activeSession =
    state.sessions.find((s) => s.id === state.activeSessionId) || null;

  return (
    <ChatContext.Provider value={{ ...state, activeSession, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used inside <ChatProvider>");
  return ctx;
}