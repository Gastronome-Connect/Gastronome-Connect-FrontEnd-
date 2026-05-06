export const escapeMentionRegExp = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getActiveMention = (text = "", caretPosition = 0) => {
  const safeText = String(text || "");
  const safeCaret = Number.isFinite(caretPosition)
    ? caretPosition
    : safeText.length;
  const prefix = safeText.slice(0, safeCaret);
  const match = prefix.match(/(^|\s)@([A-Za-z0-9._-]*)$/);

  if (!match) {
    return null;
  }

  const query = match[2] || "";
  const tokenStart = prefix.length - query.length - 1;
  const tokenEnd = safeCaret;

  return {
    query,
    tokenStart,
    tokenEnd,
  };
};

export const replaceActiveMention = (
  text = "",
  caretPosition = 0,
  username = "",
) => {
  const mention = getActiveMention(text, caretPosition);
  const normalizedUsername = String(username || "").trim();

  if (!mention || !normalizedUsername) {
    return {
      value: text,
      nextCaretPosition: caretPosition,
    };
  }

  const safeText = String(text || "");
  const nextToken = `@${normalizedUsername} `;
  const value =
    safeText.slice(0, mention.tokenStart) +
    nextToken +
    safeText.slice(mention.tokenEnd);
  const nextCaretPosition = mention.tokenStart + nextToken.length;

  return {
    value,
    nextCaretPosition,
  };
};

export const renderMentionParts = (text = "", mentions = []) => {
  const safeText = String(text || "");
  const mentionSet = new Set(
    (Array.isArray(mentions) ? mentions : [])
      .map((mention) => String(mention?.username || "").toLowerCase())
      .filter(Boolean),
  );

  if (!safeText) {
    return [];
  }

  const parts = [];
  const regex = /(@[A-Za-z0-9._-]{2,50})/g;
  let lastIndex = 0;
  let match = regex.exec(safeText);

  while (match) {
    const token = match[0];
    const start = match.index;

    if (start > lastIndex) {
      parts.push({
        type: "text",
        value: safeText.slice(lastIndex, start),
      });
    }

    const username = token.slice(1).toLowerCase();
    parts.push({
      type: mentionSet.has(username) ? "mention" : "text",
      value: token,
    });

    lastIndex = start + token.length;
    match = regex.exec(safeText);
  }

  if (lastIndex < safeText.length) {
    parts.push({
      type: "text",
      value: safeText.slice(lastIndex),
    });
  }

  return parts;
};
