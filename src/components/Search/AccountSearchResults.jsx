import React from "react";
import {
  Clock3,
  ExternalLink,
  Loader2,
  Search,
  UserRound,
  UtensilsCrossed,
} from "lucide-react";
import { resolveAvatarUrl, resolveUploadUrl } from "../../utils/api";

export default function AccountSearchResults({
  query,
  sections,
  interactiveItems,
  isLoading,
  hasSearched,
  minimumQueryLength = 2,
  activeIndex = -1,
  onActiveIndexChange,
  onSelect,
  onClearRecent,
  className = "",
}) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery && sections.length === 0) {
    return null;
  }

  if (trimmedQuery && trimmedQuery.length < minimumQueryLength) {
    return (
      <div
        className={`rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl ${className}`}
      >
        <p className="text-xs font-medium text-gray-500">
          Type at least {minimumQueryLength} characters to search people and
          recipes.
        </p>
      </div>
    );
  }

  const hasItems = interactiveItems.length > 0;

  const renderItem = (item, index) => {
    const isActive = index === activeIndex;
    const isAccount = item.type === "account";
    const imageSrc = isAccount
      ? resolveAvatarUrl(item.image)
      : resolveUploadUrl(item.image) || "";

    return (
      <button
        key={`${item.type}:${item.id || item.sourceUrl || item.title}`}
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onMouseEnter={() => onActiveIndexChange?.(index)}
        onClick={() => onSelect?.(item)}
        className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${isActive ? "bg-blue-50/90" : "hover:bg-blue-50/70"}`}
      >
        <div className="relative mt-0.5 h-11 w-11 flex-shrink-0 overflow-hidden rounded-full border border-blue-100 bg-white">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          ) : isAccount ? (
            <div className="flex h-full w-full items-center justify-center bg-blue-50 text-[#0060A9]">
              <UserRound size={18} />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-orange-50 text-[#F57600]">
              <UtensilsCrossed size={18} />
            </div>
          )}
        </div>

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="block truncate text-sm font-black text-gray-800">
              {item.title}
            </span>
            {item.type === "recipe" && item.sourceUrl && (
              <ExternalLink size={12} className="text-gray-400" />
            )}
          </span>
          {!!item.subtitle && (
            <span className="block truncate text-xs font-medium text-[#0060A9]">
              {item.subtitle}
            </span>
          )}
          <span className="mt-1 block truncate text-xs text-gray-500">
            {item.description ||
              (item.type === "recipe"
                ? "Open recipe source"
                : "View this foodie profile")}
          </span>
        </span>
      </button>
    );
  };

  let runningIndex = -1;

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl ${className}`}
    >
      {!trimmedQuery && sections.length > 0 && (
        <div className="border-b border-gray-100 bg-gray-50/80 px-4 py-2.5">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0060A9]">
            Search Suggestions
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 px-4 py-4 text-sm text-gray-500">
          <Loader2 size={16} className="animate-spin text-[#0060A9]" />
          Searching people and recipes...
        </div>
      ) : hasItems ? (
        <div className="max-h-[360px] overflow-y-auto">
          {sections.map((section) => (
            <div key={section.id}>
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-4 py-2.5">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0060A9]">
                  {section.label}
                </p>
                {section.clearable && (
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => onClearRecent?.()}
                    className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 transition-colors hover:text-red-500"
                  >
                    Clear Recent
                  </button>
                )}
              </div>
              <div>
                {section.items.map((item) => {
                  runningIndex += 1;
                  return renderItem(item, runningIndex);
                })}
              </div>
            </div>
          ))}
        </div>
      ) : hasSearched ? (
        <div className="flex items-center gap-2 px-4 py-4 text-sm text-gray-500">
          <Search size={16} className="text-[#0060A9]" />
          No matching people or recipes found.
        </div>
      ) : !trimmedQuery ? (
        <div className="flex items-center gap-2 px-4 py-4 text-sm text-gray-500">
          <Clock3 size={16} className="text-[#0060A9]" />
          Recent searches will appear here.
        </div>
      ) : null}
    </div>
  );
}
