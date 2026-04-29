import { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "../utils/api";

const MINIMUM_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 220;
const RECENT_SEARCHES_STORAGE_KEY = "gc-universal-recent-searches";
const MAX_RECENT_SEARCHES = 8;

const normalizeText = (value = "") => String(value || "").trim();

const loadRecentSearches = () => {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const persistRecentSearches = (items) => {
  try {
    localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(items));
  } catch {}
};

const toRecentItem = (item) => ({
  id: item.id,
  type: item.type,
  title: item.title,
  subtitle: item.subtitle || "",
  description: item.description || "",
  image: item.image || "",
  sourceUrl: item.sourceUrl || "",
  sourceName: item.sourceName || item.subtitle || "",
  provider: item.provider || "",
  username: item.username || "",
  displayName: item.displayName || item.title || "",
  recentKey: `${item.type}:${item.id || item.sourceUrl || item.title}`,
});

export default function useAccountSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() =>
    loadRecentSearches(),
  );
  const requestIdRef = useRef(0);

  useEffect(() => {
    persistRecentSearches(recentSearches);
  }, [recentSearches]);

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < MINIMUM_QUERY_LENGTH) {
      setResults([]);
      setIsLoading(false);
      setHasSearched(false);
      return undefined;
    }

    const currentRequestId = requestIdRef.current + 1;
    requestIdRef.current = currentRequestId;

    const timeoutId = window.setTimeout(async () => {
      try {
        setIsLoading(true);
        const response = await apiFetch(
          `/api/search/universal?query=${encodeURIComponent(normalizedQuery)}`,
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to search");
        }

        if (requestIdRef.current === currentRequestId) {
          setResults(Array.isArray(data.items) ? data.items : []);
          setHasSearched(true);
        }
      } catch (error) {
        console.error("Failed to run universal search:", error);
        if (requestIdRef.current === currentRequestId) {
          setResults([]);
          setHasSearched(true);
        }
      } finally {
        if (requestIdRef.current === currentRequestId) {
          setIsLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  const clearSearch = () => {
    requestIdRef.current += 1;
    setQuery("");
    setResults([]);
    setIsLoading(false);
    setHasSearched(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const recordRecentSearch = (item) => {
    if (!item?.type) {
      return;
    }

    const normalized = toRecentItem(item);
    setRecentSearches((current) => {
      const next = [
        normalized,
        ...current.filter((entry) => entry.recentKey !== normalized.recentKey),
      ];
      return next.slice(0, MAX_RECENT_SEARCHES);
    });
  };

  const sections = useMemo(() => {
    const trimmedQuery = normalizeText(query);

    if (!trimmedQuery) {
      return recentSearches.length > 0
        ? [
            {
              id: "recent",
              label: "Recent Searches",
              items: recentSearches,
              clearable: true,
            },
          ]
        : [];
    }

    const accounts = results.filter((item) => item.type === "account");
    const recipes = results.filter((item) => item.type === "recipe");
    const nextSections = [];

    if (accounts.length > 0) {
      nextSections.push({ id: "accounts", label: "Accounts", items: accounts });
    }

    if (recipes.length > 0) {
      nextSections.push({ id: "recipes", label: "Recipes", items: recipes });
    }

    return nextSections;
  }, [query, recentSearches, results]);

  const interactiveItems = useMemo(
    () => sections.flatMap((section) => section.items || []),
    [sections],
  );

  return {
    query,
    setQuery,
    results,
    sections,
    interactiveItems,
    recentSearches,
    isLoading,
    hasSearched,
    minimumQueryLength: MINIMUM_QUERY_LENGTH,
    clearSearch,
    clearRecentSearches,
    recordRecentSearch,
  };
}
