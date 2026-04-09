import { useState, useEffect, useRef } from "react";
import { Search, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Searchbar({ scrollContainer }) {
  const [scrolled, setScrolled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

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
      if (expanded && wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setExpanded(false);
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

  return (
    <div ref={wrapperRef} className="relative h-11 flex items-center justify-start">
      <motion.div
        onClick={handleClick}
        onMouseEnter={() => isMinimized && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        layout
        initial={false}
        animate={{
          width: isMinimized ? "140px" : "100%",
          backgroundColor: isMinimized ? "#0060A9" : "#FFFFFF",
          borderColor: isMinimized ? "transparent" : "#F3F4F6"
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
          placeholder="Search..."
          readOnly={isMinimized}
          className={`w-full bg-transparent border-none focus:ring-0 outline-none text-sm font-medium text-gray-700 placeholder-gray-400 pr-4 transition-opacity duration-200 ${
            isMinimized ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        />
      </motion.div>

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