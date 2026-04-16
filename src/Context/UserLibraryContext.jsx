import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const UserLibraryContext = createContext(null);

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "is","it","its","this","that","i","my","we","you","he","she","they",
  "was","are","be","been","as","by","from","up","out","so","if","do",
  "not","no","can","has","have","had","will","just","also","very","into",
]);

export const extractKeywords = (text = "") => {
  if (!text) return new Set();
  return new Set(
    text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
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
  for (const kw of kwA) { if (kwB.has(kw)) count++; }
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

// ── Resolves any ID shape into a plain string ──────────────────────
const resolveId = (raw) => {
  if (!raw) return null;
  // If a plain string/number is passed directly
  if (typeof raw === "string") return raw;
  if (typeof raw === "number") return String(raw);
  // If a post/recipe object is passed
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
    title:       raw.title ?? raw.name ?? "",
    caption:     raw.caption ?? raw.description ?? "",
    author:      raw.author ?? "",
    avatar:      raw.avatar ?? raw.img ?? "",
    date:        raw.date ?? raw.dateCreate ?? new Date().toLocaleDateString(),
    ingredients: raw.ingredients ?? [],
    image:       raw.image ?? raw.img ?? raw.mediaItems?.[0]?.url ?? "",
    mediaItems:  raw.mediaItems ?? (raw.image ? [{ type: "image", url: raw.image }] : raw.img ? [{ type: "image", url: raw.img }] : []),
    savedAt:     raw.savedAt ?? Date.now(),
  };
};

const load = (key) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? []; }
  catch { return []; }
};
const save = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

export const UserLibraryProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => load("gastro_favorites"));
  const [archives,  setArchives]  = useState(() => load("gastro_archives"));
  const [history,   setHistory]   = useState(() => load("gastro_history"));

  useEffect(() => { save("gastro_favorites", favorites); }, [favorites]);
  useEffect(() => { save("gastro_archives",  archives);  }, [archives]);
  useEffect(() => { save("gastro_history",   history);   }, [history]);

  // ── FAVORITES ──────────────────────────────────────────────────
  const addToFavorites = useCallback((post) => {
    const entry = normalizeEntry(post);
    setFavorites((prev) =>
      prev.some((p) => p.id === entry.id) ? prev : [entry, ...prev]
    );
  }, []);

  const removeFromFavorites = useCallback((id) => {
    setFavorites((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // ── Accepts either a post object OR a plain id string ──
  const isFavorited = useCallback(
    (postOrId) => {
      const id = resolveId(postOrId);
      if (!id) return false;
      return favorites.some((p) => p.id === id);
    },
    [favorites]
  );

  // ── Toggles by resolved ID — NO duplicates ever ──
  const toggleFavorite = useCallback((post) => {
    const entry = normalizeEntry(post);
    setFavorites((prev) =>
      prev.some((p) => p.id === entry.id)
        ? prev.filter((p) => p.id !== entry.id)
        : [entry, ...prev]
    );
  }, []);

  // ── ARCHIVES ───────────────────────────────────────────────────
  const addToArchives = useCallback((post) => {
    const entry = normalizeEntry(post);
    setArchives((prev) =>
      prev.some((p) => p.id === entry.id) ? prev : [entry, ...prev]
    );
  }, []);

  const removeFromArchives = useCallback((id) => {
    setArchives((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const isArchived = useCallback(
    (id) => archives.some((p) => p.id === id),
    [archives]
  );

  const isSuppressedByArchive = useCallback(
    (feedPost) => {
      if (!feedPost) return false;
      const feedId = resolveId(feedPost);

      if (archives.some((p) => p.id === feedId)) return true;

      return archives.some((archivedPost) =>
        hasSameCoreContent(archivedPost, feedPost) ||
        sharedKeywordCount(archivedPost, feedPost) >= SIMILARITY_THRESHOLD
      );
    },
    [archives]
  );

  // ── HISTORY ────────────────────────────────────────────────────
  const addToHistory = useCallback((post) => {
    const entry = normalizeEntry(post);
    setHistory((prev) => {
      const filtered = prev.filter((p) => p.id !== entry.id);
      return [{ ...entry, savedAt: Date.now() }, ...filtered].slice(0, 200);
    });
  }, []);

  const removeFromHistory = useCallback((id) => {
    setHistory((prev) => prev.filter((p) => p.id !== id));
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
