const MentionSuggestionsDropdown = ({ suggestions = [], onSelect }) => {
  if (!Array.isArray(suggestions) || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute left-0 right-0 bottom-full mb-2 rounded-2xl border border-orange-100 bg-white shadow-2xl overflow-hidden z-[250]">
      <div className="px-3 py-2 border-b border-orange-50 bg-orange-50/60 text-[10px] font-bold uppercase tracking-wide text-[#F57600]">
        Mention a user
      </div>
      <div className="max-h-56 overflow-y-auto">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              onSelect?.(suggestion);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-orange-50 transition-colors"
          >
            <img
              src={suggestion.image}
              alt={suggestion.displayName || suggestion.username}
              className="w-8 h-8 rounded-full object-cover border border-orange-100 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-800 truncate">
                {suggestion.displayName || suggestion.username}
              </p>
              <p className="text-xs text-[#F57600] truncate">
                @{suggestion.username}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MentionSuggestionsDropdown;
