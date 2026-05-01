import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import useAccountSearch from "../Hooks/useAccountSearch";
import AccountSearchResults from "../components/Search/AccountSearchResults";

export default function SearchBar({
  value,
  onChange,
  placeholder,
  searchAccounts = false,
}) {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const {
    query,
    setQuery,
    sections,
    interactiveItems,
    isLoading,
    hasSearched,
    minimumQueryLength,
    clearSearch,
    clearRecentSearches,
    recordRecentSearch,
  } = useAccountSearch();
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const inputValue = searchAccounts ? query : (value ?? "");

  const handleInputChange = (event) => {
    if (searchAccounts) {
      setQuery(event.target.value);
      setActiveIndex(-1);
    }
    onChange?.(event);
  };

  const handleSelectUser = (user) => {
    recordRecentSearch(user);
    clearSearch();
    setIsFocused(false);
    setActiveIndex(-1);
    if (user.type === "recipe" && user.sourceUrl) {
      window.open(user.sourceUrl, "_blank", "noopener,noreferrer");
      return;
    }
    navigate(`/profile/${user.id || user._id}`);
  };

  const handleKeyDown = (event) => {
    if (!searchAccounts) {
      return;
    }

    if (event.key === "Escape") {
      setIsFocused(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsFocused(true);
      if (interactiveItems.length > 0) {
        setActiveIndex((current) =>
          current < interactiveItems.length - 1 ? current + 1 : 0,
        );
      }
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsFocused(true);
      if (interactiveItems.length > 0) {
        setActiveIndex((current) =>
          current > 0 ? current - 1 : interactiveItems.length - 1,
        );
      }
      return;
    }

    if (
      event.key === "Enter" &&
      activeIndex >= 0 &&
      interactiveItems[activeIndex]
    ) {
      event.preventDefault();
      handleSelectUser(interactiveItems[activeIndex]);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full group">
      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
        <Search
          size={16}
          className="stroke-[url(#search-gradient)] transition-transform group-focus-within:scale-110"
        />
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient
              id="search-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#0060A9" />
              <stop offset="100%" stopColor="#00B4FA" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <input
        type="text"
        value={inputValue}
        onFocus={() => setIsFocused(true)}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? "Search..."}
        className="w-full bg-[#F3F4F6] text-gray-700 text-xs font-medium rounded-lg py-2 pl-9 pr-2 border border-transparent focus:bg-white focus:border-[#00B4FA]/50 focus:ring-2 focus:ring-[#00B4FA]/10 outline-none transition-all"
      />

      {searchAccounts && isFocused && (
        <AccountSearchResults
          query={query}
          sections={sections}
          interactiveItems={interactiveItems}
          isLoading={isLoading}
          hasSearched={hasSearched}
          minimumQueryLength={minimumQueryLength}
          activeIndex={activeIndex}
          onActiveIndexChange={setActiveIndex}
          onSelect={handleSelectUser}
          onClearRecent={clearRecentSearches}
          className="absolute left-0 right-0 top-full mt-2 z-[220]"
        />
      )}
    </div>
  );
}
