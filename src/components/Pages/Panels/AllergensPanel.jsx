import InfoPill from "./Pills";

// isOwner: when false, empty-state placeholder is hidden (no point showing
// "no allergens set" on someone else's profile)
const AllergensPanel = ({ allergens = [], dislikes = [], compressed, isOwner = true }) => {
  const hasContent = allergens.length > 0 || dislikes.length > 0;

  // Nothing to show and we're not the owner — don't render the panel at all
  if (!hasContent && !isOwner) return null;

  return (
    <div className="font-sans xl:h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-3 flex-shrink-0">
        <h3 className="text-2xl font-extrabold tracking-tight text-gray-950">
          Allergens & Dislikes
        </h3>
        <div className="flex-1 h-[3px] bg-orange-400 rounded-full mt-2 opacity-90" />
      </div>

      <div className="bg-white rounded-2xl border-gray-100/50 transition-all duration-300 xl:flex-1 xl:min-h-0 flex flex-col">
        <div className="xl:flex-1 xl:min-h-0 xl:overflow-y-auto custom-scrollbar p-5 sm:p-6">
          {allergens.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 flex-shrink-0" />
                <p className="font-bold text-gray-950 text-base tracking-tight">
                  Strict Allergens:
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5 pl-4">
                {allergens.map((item) => (
                  <InfoPill key={item} text={item} variant="allergen" />
                ))}
              </div>
            </div>
          )}

          {dislikes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-300 flex-shrink-0" />
                <p className="font-bold text-gray-950 text-base tracking-tight">
                  Dietary Dislikes:
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5 pl-4">
                {dislikes.map((item) => (
                  <InfoPill key={item} text={item} variant="dislike" />
                ))}
              </div>
            </div>
          )}

          {/* Empty state — only shown to the owner */}
          {!hasContent && isOwner && (
            <div className="flex flex-col items-center justify-center py-10 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-sm font-semibold text-gray-600">Clear Palette</p>
              <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                No strict allergens or dietary dislikes set.
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f9fafb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c7d2fe;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #0060A9;
        }
      `}</style>
    </div>
  );
};

export default AllergensPanel;