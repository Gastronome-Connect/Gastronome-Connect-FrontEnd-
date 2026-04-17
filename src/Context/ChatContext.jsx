import React, { createContext, useContext, useReducer, useEffect } from "react";

const STORAGE_KEY = "gastro_chat_sessions";
const AUTH_STATE_EVENT = "auth-state-changed";
const DEFAULT_STORAGE_OWNER = "guest";

function getStorageOwner() {
  try {
    return localStorage.getItem("userId") || DEFAULT_STORAGE_OWNER;
  } catch {
    return DEFAULT_STORAGE_OWNER;
  }
}

function getScopedStorageKey(owner = getStorageOwner()) {
  return `${STORAGE_KEY}:${owner}`;
}

function loadSessions(owner = getStorageOwner()) {
  try {
    const raw = localStorage.getItem(getScopedStorageKey(owner));
    if (raw) {
      return JSON.parse(raw);
    }

    const legacy = localStorage.getItem(STORAGE_KEY);
    if (legacy) {
      localStorage.setItem(getScopedStorageKey(owner), legacy);
      localStorage.removeItem(STORAGE_KEY);
      return JSON.parse(legacy);
    }

    return [];
  } catch {
    return [];
  }
}

function saveSessions(owner, sessions) {
  try {
    const nonEmptySessions = sessions.filter(
      (session) => session.messages.length > 0,
    );
    localStorage.setItem(
      getScopedStorageKey(owner),
      JSON.stringify(nonEmptySessions),
    );
  } catch {}
}

function buildInitialState(owner = getStorageOwner()) {
  const sessions = loadSessions(owner);
  return {
    storageOwner: owner,
    sessions,
    activeSessionId: sessions.length > 0 ? sessions[0].id : null,
  };
}

const initialState = buildInitialState();

function reducer(state, action) {
  switch (action.type) {
    case "HYDRATE_FROM_STORAGE":
      return buildInitialState(action.payload || getStorageOwner());

    case "NEW_SESSION": {
      const session = {
        id: action.payload?.id || Date.now().toString(),
        title: action.payload?.title || "New chat",
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return {
        ...state,
        sessions: [session, ...state.sessions],
        activeSessionId: session.id,
      };
    }

    case "SET_ACTIVE_SESSION":
      return { ...state, activeSessionId: action.payload };

    case "ADD_MESSAGE": {
      const sessions = state.sessions.map((session) => {
        if (session.id !== action.payload.sessionId) return session;
        const messages = [...session.messages, action.payload.message];
        const title =
          session.title === "New chat" && action.payload.message.role === "user"
            ? action.payload.message.text.slice(0, 40)
            : session.title;
        return {
          ...session,
          messages,
          title,
          updatedAt: new Date().toISOString(),
        };
      });
      return { ...state, sessions };
    }

    case "DELETE_SESSION":
      return {
        ...state,
        sessions: state.sessions.filter(
          (session) => session.id !== action.payload,
        ),
        activeSessionId:
          state.activeSessionId === action.payload
            ? null
            : state.activeSessionId,
      };

    case "MARK_MESSAGE_SEEN": {
      const { sessionId, messageId } = action.payload;
      return {
        ...state,
        sessions: state.sessions.map((session) =>
          session.id !== sessionId
            ? session
            : {
                ...session,
                messages: session.messages.map((message) =>
                  message.id !== messageId
                    ? message
                    : { ...message, isNew: false },
                ),
              },
        ),
      };
    }

    default:
      return state;
  }
}

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    saveSessions(state.storageOwner, state.sessions);
  }, [state.sessions, state.storageOwner]);

  useEffect(() => {
    const hydrate = () => {
      dispatch({ type: "HYDRATE_FROM_STORAGE", payload: getStorageOwner() });
    };

    const handleStorage = (event) => {
      if (
        event?.key &&
        event.key !== "userId" &&
        !event.key.startsWith(STORAGE_KEY)
      ) {
        return;
      }

      hydrate();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(AUTH_STATE_EVENT, hydrate);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(AUTH_STATE_EVENT, hydrate);
    };
  }, []);

  const activeSession =
    state.sessions.find((session) => session.id === state.activeSessionId) ||
    null;

  return (
    <ChatContext.Provider value={{ ...state, activeSession, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx)
    throw new Error("useChatContext must be used inside <ChatProvider>");
  return ctx;
}
