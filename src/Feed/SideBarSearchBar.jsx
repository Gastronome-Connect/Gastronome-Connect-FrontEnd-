import React from "react";
import { Search } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative w-full group">
      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
        <Search 
          size={16} 
          className="stroke-[url(#search-gradient)] transition-transform group-focus-within:scale-110" 
        />
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id="search-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0060A9" />
              <stop offset="100%" stopColor="#00B4FA" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <input
        type="text"
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder ?? "Search..."}
        className="w-full bg-[#F3F4F6] text-gray-700 text-xs font-medium rounded-lg py-2 pl-9 pr-2 border border-transparent focus:bg-white focus:border-[#00B4FA]/50 focus:ring-2 focus:ring-[#00B4FA]/10 outline-none transition-all"
      />
    </div>
  );
}