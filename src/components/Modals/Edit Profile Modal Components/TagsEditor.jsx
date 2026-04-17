import React, { useId, useMemo, useState, useRef, useEffect } from "react";
import { X, Plus, Hash } from "lucide-react";

const TagEditor = ({
  label,
  items,
  onAdd,
  onRemove,
  placeholder,
  availableOptions = [],
  loading = false,
}) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const normalizedOptions = useMemo(
    () =>
      Array.isArray(availableOptions)
        ? availableOptions.filter((item) => typeof item === "string")
        : [],
    [availableOptions],
  );

  const filteredOptions = useMemo(
    () =>
      normalizedOptions.filter(
        (option) =>
          !items.includes(option) &&
          option.toLowerCase().includes(input.trim().toLowerCase()),
      ),
    [normalizedOptions, items, input],
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setHighlightedIdx(-1);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const commitValue = (val) => {
    const trimmed = val.trim();
    if (!trimmed) return;

    const matchedOption = normalizedOptions.find(
      (o) => o.toLowerCase() === trimmed.toLowerCase(),
    );
    const nextValue = matchedOption || trimmed;

    if (items.includes(nextValue)) {
      setInput("");
      setError("");
      setOpen(false);
      return;
    }

    if (normalizedOptions.length > 0 && !matchedOption) {
      setError(`Choose a valid ${label.toLowerCase()} from the list.`);
      return;
    }

    onAdd(nextValue);
    setInput("");
    setError("");
    setOpen(false);
    setHighlightedIdx(-1);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setOpen(true);
    setHighlightedIdx(-1);
    if (error) setError("");
  };

  const handleKeyDown = (e) => {
    if (!open || filteredOptions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        commitValue(input);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIdx((i) => (i + 1) % filteredOptions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIdx((i) =>
        i <= 0 ? filteredOptions.length - 1 : i - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIdx >= 0) {
        commitValue(filteredOptions[highlightedIdx]);
      } else {
        commitValue(input);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlightedIdx(-1);
    }
  };

  const showDropdown = open && filteredOptions.length > 0 && input.trim().length > 0;

  return (
    <div className="animate-in fade-in duration-500">
      {/* Label */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-[#F57600] rounded-full" />
        <p className="text-[11px] font-black text-gray-800 uppercase tracking-widest">
          {label}
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {items.map((item) => (
          <span
            key={item}
            className="group flex items-center gap-2 pl-3 pr-2 py-1.5 bg-gradient-to-br from-gray-50 to-white border border-gray-200 text-gray-700 rounded-xl text-[11px] font-bold shadow-sm hover:border-[#0060A9] transition-all"
          >
            {item}
            <button
              onClick={() => onRemove(item)}
              className="p-1 rounded-md hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>

      {/* Input + dropdown */}
      <div ref={containerRef} className="relative">
        <div className="flex gap-2 group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#0060A9] transition-colors z-10">
            <Hash size={14} />
          </div>
          <input
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => input.trim() && setOpen(true)}
            placeholder={placeholder}
            className="flex-1 text-xs bg-gray-50 border-2 border-gray-100 rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#0060A9] focus:bg-white transition-all font-medium"
          />
          <button
            onClick={() => commitValue(input)}
            className="p-3 bg-[#0060A9] text-white rounded-2xl hover:bg-[#F57600] transition-all shadow-md active:scale-90"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Custom suggestion dropdown */}
        {showDropdown && (
          <div className="absolute left-0 right-10 mt-1.5 z-50 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
            {filteredOptions.map((option, idx) => (
              <button
                key={option}
                onMouseDown={(e) => {
                  e.preventDefault(); // prevents input blur before we capture
                  commitValue(option);
                }}
                onMouseEnter={() => setHighlightedIdx(idx)}
                className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${
                  idx === highlightedIdx
                    ? "bg-[#0060A9]/10 text-[#0060A9]"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Helper text */}
      <div className="mt-2 min-h-[18px]">
        {error ? (
          <p className="text-[11px] font-medium text-red-500">{error}</p>
        ) : loading ? (
          <p className="text-[11px] font-medium text-gray-400">
            Loading options from MongoDB...
          </p>
        ) : normalizedOptions.length > 0 ? (
          <p className="text-[11px] font-medium text-gray-400">
            Start typing to see suggestions.
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default TagEditor;