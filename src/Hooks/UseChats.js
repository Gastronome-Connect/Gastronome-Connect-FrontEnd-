import { useCallback, useState, useEffect, useRef } from "react";
import { useChatContext } from "../Context/ChatContext";
import { sendMessageToBot } from "../Services/ChatAPI";

function formatTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function useChat() {
  const { activeSessionId, activeSession, dispatch } = useChatContext();
  const [isBotTyping, setIsBotTyping] = useState(false);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    const ac = abortControllerRef.current;
    return () => {
      if (ac) {
        ac.abort();
      }
    };
  }, []);

  const startNewSession = useCallback(() => {
    dispatch({ type: "SET_ACTIVE_SESSION", payload: null });
  }, [dispatch]);

  const switchSession = useCallback(
    (sessionId) => {
      dispatch({ type: "SET_ACTIVE_SESSION", payload: sessionId });
    },
    [dispatch],
  );

  const deleteSession = useCallback(
    (sessionId) => {
      dispatch({ type: "DELETE_SESSION", payload: sessionId });
    },
    [dispatch],
  );

  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || isBotTyping) return;

      let sessionId = activeSessionId;

      if (!sessionId) {
        const newId = Date.now().toString();
        dispatch({
          type: "NEW_SESSION",
          payload: { title: text.slice(0, 40), id: newId },
        });
        sessionId = newId;
      }

      const userMsg = {
        id: Date.now().toString(),
        role: "user",
        type: "text",
        text,
        time: formatTime(),
      };

      dispatch({
        type: "ADD_MESSAGE",
        payload: { sessionId, message: userMsg },
      });

      setIsBotTyping(true);

      try {
        const botMsg = await sendMessageToBot(text, formatTime);

        dispatch({
          type: "ADD_MESSAGE",
          payload: {
            sessionId,
            message: {
              ...botMsg,
              id: (Date.now() + 1).toString(),
              isNew: true, // ← mark as new so typewriter plays once
            },
          },
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Bot response error:", err);
        }
      } finally {
        setIsBotTyping(false);
      }
    },
    [activeSessionId, dispatch, isBotTyping],
  );

  return {
    messages: activeSession?.messages || [],
    isBotTyping,
    sendMessage,
    startNewSession,
    switchSession,
    deleteSession,
  };
}
