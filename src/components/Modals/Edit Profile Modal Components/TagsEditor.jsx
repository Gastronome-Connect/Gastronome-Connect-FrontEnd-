import React, { useState } from "react";
import { X, Plus, Hash } from "lucide-react";

const TagEditor = ({ label, items, onAdd, onRemove, placeholder }) => {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const val = input.trim();
    if (val && !items.includes(val)) { onAdd(val); setInput(""); }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-[#F57600] rounded-full" />
        <p className="text-[11px] font-black text-gray-800 uppercase tracking-widest">{label}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {items.map((item) => (
          <span key={item} className="group flex items-center gap-2 pl-3 pr-2 py-1.5 bg-gradient-to-br from-gray-50 to-white border border-gray-200 text-gray-700 rounded-xl text-[11px] font-bold shadow-sm hover:border-[#0060A9] transition-all">
            {item}
            <button onClick={() => onRemove(item)} className="p-1 rounded-md hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors">
              <X size={12} />
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-2 relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#0060A9] transition-colors">
            <Hash size={14} />
        </div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder={placeholder}
          className="flex-1 text-xs bg-gray-50 border-2 border-gray-100 rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#0060A9] focus:bg-white transition-all font-medium"
        />
        <button onClick={handleAdd} className="p-3 bg-[#0060A9] text-white rounded-2xl hover:bg-[#F57600] transition-all shadow-md active:scale-90">
          <Plus size={18} />
        </button>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 20px; }
      `}</style>
    </div>
  );
};

export default TagEditor;