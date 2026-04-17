import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const UserLibraryContext = createContext(null);
const AUTH_STATE_EVENT = "auth-state-changed";
const STORAGE_KEY_PREFIX = "gastro";
const DEFAULT_STORAGE_OWNER = "guest";

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
  "is", "it", "its", "this", "that", "i", "my", "we", "you", "he", "she", "they",
  "was", "are", "be", "been", "as", "by", "from", "up", "out", "so", "if", "do",
  "not", "no", "can", "has", "have", "had", "will", "just", "also", "very", "into",
]);

export const extractKeywords = (text = "") => {
  if (!text) return new Set();
  return new Set(
    text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
      .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
  );
};

const normalizeCompareText = (raw = "") =>
  String(raw)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const sharedKeywordCount = (postA, postB) => {
  const textA = `${postA.title ?? postA.name ?? ""} ${postA.caption ?? postA.description ?? ""}`;
  const textB = `${postB.title ?? postB.name ?? ""} ${postB.caption ?? postB.description ?? ""}`;
  const kwA = extractKeywords(textA);
  const kwB = extractKeywords(textB);
  let count = 0;

  for (const keyword of kwA) {
    if (kwB.has(keyword)) count += 1;
  }

  return count;
};

const hasSameCoreContent = (postA, postB) => {
  const titleA = normalizeCompareText(postA.title ?? postA.name ?? "");
  const titleB = normalizeCompareText(postB.title ?? postB.name ?? "");
  const descA = normalizeCompareText(postA.caption ?? postA.description ?? "");
  const descB = normalizeCompareText(postB.caption ?? postB.description ?? "");

  const sameTitle = !!titleA && !!titleB && titleA === titleB;
  const sameDescription = !!descA && !!descB && descA === descB;
  const titleContains = !!titleA && !!titleB && (titleA.includes(titleB) || titleB.includes(titleA));
  const descContains = !!descA && !!descB && (descA.includes(descB) || descB.includes(descA));

  return sameTitle || sameDescription || (titleContains && sameDescription) || (sameTitle && descContains);
};

export const SIMILARITY_THRESHOLD = 2;

const getStorageOwner = () => {
  try {
    return localStorage.getItem("userId") || DEFAULT_STORAGE_OWNER;
  } catch {
    return DEFAULT_STORAGE_OWNER;
  }
};

const getScopedStorageKey = (bucket, owner = getStorageOwner()) =>
  `${STORAGE_KEY_PREFIX}_${bucket}:${owner}`;

const loadScopedEntries = (bucket, owner = getStorageOwner()) => {
  const scopedKey = getScopedStorageKey(bucket, owner);

  try {
    const scopedValue = JSON.parse(localStorage.getItem(scopedKey));
    if (Array.isArray(scopedValue)) {
      return scopedValue;
    }

    const legacyKey = `${STORAGE_KEY_PREFIX}_${bucket}`;
    const legacyValue = JSON.parse(localStorage.getItem(legacyKey));
    if (Array.isArray(legacyValue) && legacyValue.length > 0) {
      localStorage.setItem(scopedKey, JSON.stringify(legacyValue));
      localStorage.removeItem(legacyKey);
      return legacyValue;
    }
  } catch {}

  return [];
};

const saveScopedEntries = (bucket, owner, value) => {
  try {
    localStorage.setItem(getScopedStorageKey(bucket, owner), JSON.stringify(value));
  } catch {}
};

const resolveId = (raw) => {
  if (!raw) return null;
  if (typeof raw === "string") return raw;
  if (typeof raw === "number") return String(raw);

  return (
    raw.id ??
    raw._id?.$oid ??
    raw._id?._str ??
    (typeof raw._id === "string" ? raw._id : null) ??
    (raw._id ? String(raw._id) : null)
  );
};

export const normalizeEntry = (raw) => {
  const id = resolveId(raw) ?? String(Date.now());
  return {
    id,
    title: raw.title ?? raw.name ?? "",
    caption: raw.caption ?? raw.description ?? "",
    author: raw.author ?? "",
    avatar: raw.avatar ?? raw.img ?? "",
    date: raw.date ?? raw.dateCreate ?? new Date().toLocaleDateString(),
    ingredients: raw.ingredients ?? [],
    image: raw.image ?? raw.img ?? raw.mediaItems?.[0]?.url ?? "",
    mediaItems: raw.mediaItems ?? (raw.image
      ? [{ type: "image", url: raw.image }]
      : raw.img
        ? [{ type: "image", url: raw.img }]
        : []),
    savedAt: raw.savedAt ?? Date.now(),
  };
};

export const UserLibraryProvider = ({ children }) => {
  const [storageOwner, setStorageOwner] = useState(() => getStorageOwner());
  const [favorites, setFavorites] = useState(() => loadScopedEntries("favorites"));
  const [archives, setArchives] = useState(() => loadScopedEntries("archives"));
  const [history, setHistory] = useState(() => loadScopedEntries("history"));

  const hydrateFromStorage = useCallback(() => {
    const nextOwner = getStorageOwner();
    setStorageOwner(nextOwner);
    setFavorites(loadScopedEntries("favorites", nextOwner));
    setArchives(loadScopedEntries("archives", nextOwner));
    setHistory(loadScopedEntries("history", nextOwner));
  }, []);

  useEffect(() => {
    saveScopedEntries("favorites", storageOwner, favorites);
  }, [favorites, storageOwner]);

  useEffect(() => {
    saveScopedEntries("archives", storageOwner, archives);
  }, [archives, storageOwner]);

  useEffect(() => {
    saveScopedEntries("history", storageOwner, history);
  }, [history, storageOwner]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event?.key && event.key !== "userId" && !event.key.startsWith(`${STORAGE_KEY_PREFIX}_`)) {
        return;
      }

      hydrateFromStorage();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(AUTH_STATE_EVENT, hydrateFromStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(AUTH_STATE_EVENT, hydrateFromStorage);
    };
  }, [hydrateFromStorage]);

  const addToFavorites = useCallback((post) => {
    const entry = normalizeEntry(post);
    setFavorites((prev) =>
      prev.some((item) => item.id === entry.id) ? prev : [entry, ...prev]
    );
  }, []);

  const removeFromFavorites = useCallback((id) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const isFavorited = useCallback(
    (postOrId) => {
      const id = resolveId(postOrId);
      if (!id) return false;
      return favorites.some((item) => item.id === id);
    },
    [favorites]
  );

  const toggleFavorite = useCallback((post) => {
    const entry = normalizeEntry(post);
    setFavorites((prev) =>
      prev.some((item) => item.id === entry.id)
        ? prev.filter((item) => item.id !== entry.id)
        : [entry, ...prev]
    );
  }, []);

  const addToArchives = useCallback((post) => {
    const entry = normalizeEntry(post);
    setArchives((prev) =>
      prev.some((item) => item.id === entry.id) ? prev : [entry, ...prev]
    );
  }, []);

  const removeFromArchives = useCallback((id) => {
    setArchives((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const isArchived = useCallback(
    (id) => archives.some((item) => item.id === id),
    [archives]
  );

  const isSuppressedByArchive = useCallback(
    (feedPost) => {
      if (!feedPost) return false;
      const feedId = resolveId(feedPost);

      if (archives.some((item) => item.id === feedId)) return true;

      return archives.some((archivedPost) =>
        hasSameCoreContent(archivedPost, feedPost) ||
        sharedKeywordCount(archivedPost, feedPost) >= SIMILARITY_THRESHOLD
      );
    },
    [archives]
  );

  const addToHistory = useCallback((post) => {
    const entry = normalizeEntry(post);
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.id !== entry.id);
      return [{ ...entry, savedAt: Date.now() }, ...filtered].slice(0, 200);
    });
  }, []);

  const removeFromHistory = useCallback((id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const restoreHistory = useCallback((entries) => {
    const normalizedEntries = (Array.isArray(entries) ? entries : [entries])
      .filter(Boolean)
      .map((entry) => normalizeEntry(entry));

    setHistory(normalizedEntries);
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  return (
    <UserLibraryContext.Provider
      value={{
        favorites, addToFavorites, removeFromFavorites, isFavorited, toggleFavorite,
        archives, addToArchives, removeFromArchives, isArchived, isSuppressedByArchive,
        history, addToHistory, removeFromHistory, restoreHistory, clearHistory,
      }}
    >
      {children}
    </UserLibraryContext.Provider>
  );
};

export const useUserLibrary = () => {
  const ctx = useContext(UserLibraryContext);
  if (!ctx) throw new Error("useUserLibrary must be used inside <UserLibraryProvider>");
  return ctx;
};

export default UserLibraryContext;
