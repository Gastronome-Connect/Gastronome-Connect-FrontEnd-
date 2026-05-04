import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../utils/api";
import { getActiveMention, replaceActiveMention } from "../utils/mentions";

const useMentionSuggestions = ({ value, setValue, textareaRef }) => {
  const [caretPosition, setCaretPosition] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const activeMention = useMemo(
    () => getActiveMention(value, caretPosition),
    [value, caretPosition],
  );

  useEffect(() => {
    let cancelled = false;

    const loadSuggestions = async () => {
      const query = String(activeMention?.query || "").trim();
      if (!activeMention || query.length < 1) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      try {
        const response = await apiFetch(
          `/api/search/universal?query=${encodeURIComponent(query)}`,
        );
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "Failed to load mention suggestions");
        }

        if (cancelled) {
          return;
        }

        const nextSuggestions = Array.isArray(data.items)
          ? data.items.filter((item) => item.type === "account")
          : [];

        setSuggestions(nextSuggestions);
        setIsOpen(nextSuggestions.length > 0);
      } catch {
        if (!cancelled) {
          setSuggestions([]);
          setIsOpen(false);
        }
      }
    };

    loadSuggestions();

    return () => {
      cancelled = true;
    };
  }, [activeMention]);

  const syncCaretPosition = (eventOrPosition) => {
    if (typeof eventOrPosition === "number") {
      setCaretPosition(eventOrPosition);
      return;
    }

    const nextPosition = eventOrPosition?.target?.selectionStart;
    setCaretPosition(Number.isFinite(nextPosition) ? nextPosition : 0);
  };

  const selectMention = (username) => {
    const textarea = textareaRef?.current;
    const currentCaretPosition = Number.isFinite(textarea?.selectionStart)
      ? textarea.selectionStart
      : caretPosition;
    const replacement = replaceActiveMention(
      value,
      currentCaretPosition,
      username,
    );

    setValue(replacement.value);
    setSuggestions([]);
    setIsOpen(false);

    requestAnimationFrame(() => {
      if (textareaRef?.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          replacement.nextCaretPosition,
          replacement.nextCaretPosition,
        );
        setCaretPosition(replacement.nextCaretPosition);
      }
    });
  };

  return {
    activeMention,
    suggestions,
    isOpen,
    setIsOpen,
    selectMention,
    syncCaretPosition,
  };
};

export default useMentionSuggestions;
