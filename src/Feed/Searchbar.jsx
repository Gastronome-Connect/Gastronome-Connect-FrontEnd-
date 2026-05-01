import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useAccountSearch from "../Hooks/useAccountSearch";
import AccountSearchResults from "../components/Search/AccountSearchResults";

export default function Searchbar({
  scrollContainer,
  value,
  onChange,
  placeholder,
}) {
  const [scrolled, setScrolled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();
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
    const el = scrollContainer?.current;
    if (!el) return;
    const handleScroll = () => {
      const isScrolled = el.scrollTop > 60;
      setScrolled(isScrolled);
      if (!isScrolled) setExpanded(false);
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [scrollContainer]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        expanded &&
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target)
      ) {
        setExpanded(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expanded]);

  const isMinimized = scrolled && !expanded;

  const handleClick = () => {
    if (isMinimized) {
      setExpanded(true);
      setShowTooltip(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSelectUser = (user) => {
    recordRecentSearch(user);
    clearSearch();
    setExpanded(false);
    setActiveIndex(-1);
    if (user.type === "recipe" && user.sourceUrl) {
      window.open(user.sourceUrl, "_blank", "noopener,noreferrer");
      return;
    }
    navigate(`/profile/${user.id || user._id}`);
  };

  const handleChange = (event) => {
    setQuery(event.target.value);
    setActiveIndex(-1);
    onChange?.(event);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setExpanded(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setExpanded(true);
      if (interactiveItems.length > 0) {
        setActiveIndex((current) =>
          current < interactiveItems.length - 1 ? current + 1 : 0,
        );
      }
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setExpanded(true);
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
    <div
      ref={wrapperRef}
      className="relative h-11 flex items-center justify-start"
    >
      <motion.div
        onClick={handleClick}
        onMouseEnter={() => isMinimized && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        layout
        initial={false}
        animate={{
          width: isMinimized ? "140px" : "100%",
          backgroundColor: isMinimized ? "#0060A9" : "#FFFFFF",
          borderColor: isMinimized ? "transparent" : "#F3F4F6",
        }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className={`relative h-full flex items-center rounded-full cursor-pointer overflow-hidden border shadow-sm ${
          isMinimized
            ? "shadow-blue-900/10"
            : "focus-within:border-[#00B4FA] focus-within:ring-2 focus-within:ring-[#00B4FA]/5"
        }`}
      >
        {/* Search Icon */}
        <div className="pl-4 pr-2 flex items-center justify-center shrink-0 relative z-10">
          <Search
            size={18}
            strokeWidth={2.5}
            className={`transition-colors duration-300 ${isMinimized ? "text-white" : "text-gray-400"}`}
          />
        </div>

        {/* Minimized Label */}
        <AnimatePresence>
          {isMinimized && (
            <motion.span
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              className="text-white text-[11px] font-black uppercase tracking-widest whitespace-nowrap pr-4"
            >
              Search
            </motion.span>
          )}
        </AnimatePresence>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder ?? "Search..."}
          readOnly={isMinimized}
          value={query}
          onFocus={() => setExpanded(true)}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={`w-full bg-transparent border-none focus:ring-0 outline-none text-sm font-medium text-gray-700 placeholder-gray-400 pr-4 transition-opacity duration-200 ${
            isMinimized ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        />
      </motion.div>

      {expanded && (
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
          className="absolute left-0 right-0 top-full mt-3 z-50"
        />
      )}

      {/* "Lively" Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-[120%] left-0 z-50 flex items-center gap-2 bg-[#F57600] text-white text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-lg shadow-orange-500/20"
          >
            <Sparkles size={10} />
            Quick Access
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
