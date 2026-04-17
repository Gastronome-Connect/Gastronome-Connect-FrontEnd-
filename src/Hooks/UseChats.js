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
      const history = (activeSession?.messages || []).map((message) => ({
        role: message.role === "bot" ? "assistant" : "user",
        content: message.text,
      }));

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
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const botMsg = await sendMessageToBot(
          text,
          formatTime,
          history,
          abortController.signal,
        );

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

          dispatch({
            type: "ADD_MESSAGE",
            payload: {
              sessionId,
              message: {
                id: (Date.now() + 1).toString(),
                role: "bot",
                type: "text",
                text:
                  err.message ||
                  "I couldn't reach Gastro AI right now. Please try again.",
                time: formatTime(),
              },
            },
          });
        }
      } finally {
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null;
        }
        setIsBotTyping(false);
      }
    },
    [activeSession?.messages, activeSessionId, dispatch, isBotTyping],
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
