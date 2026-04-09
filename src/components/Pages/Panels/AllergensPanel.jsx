import React from "react";

const InfoPill = ({ text }) => (
  <span
    title={text}
    className="
      inline-block px-4 py-1.5
      bg-[#FFF2E7] text-gray-800
      border border-orange-100 rounded-full
      text-xs font-semibold
      transition-all duration-200
      hover:border-orange-200 hover:bg-orange-50
      truncate max-w-[150px] align-middle
    "
  >
    {text}
  </span>
);

const AllergensPanel = ({ allergens = [], dislikes = [], compressed = false }) => {
  const hasContent = allergens.length > 0 || dislikes.length > 0;

  return (
    /*
      Desktop (inside fixed right column): h-full + flex flex-col fills the wrapper.
      Mobile (inline in flow): h-auto, no flex-1 stretching needed.
      We use xl:h-full to switch between the two modes.
    */
    <div className="font-sans xl:h-full flex flex-col">

      {/* Header */}
      <div className="flex items-center gap-4 mb-3 flex-shrink-0">
        <h3 className="text-2xl font-extrabold tracking-tight text-gray-950">
          Allergens & Dislikes
        </h3>
        <div className="flex-1 h-[3px] bg-orange-400 rounded-full mt-2 opacity-90" />
      </div>

      {/*
        Card:
        - Desktop: flex-1 + min-h-0 so it fills remaining column height
        - Mobile: auto height, just wraps content
      */}
      <div className="bg-white rounded-2xl border-gray-100/50 transition-all duration-300 xl:flex-1 xl:min-h-0 flex flex-col">
        {/* Scrollable inner — on desktop scrolls within fixed height, on mobile just flows */}
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
                {allergens.map((item) => <InfoPill key={item} text={item} />)}
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
                {dislikes.map((item) => <InfoPill key={item} text={item} />)}
              </div>
            </div>
          )}

          {!hasContent && (
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
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f9fafb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #c7d2fe; border-radius: 10px; transition: background 0.2s; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #0060A9; }
      `}</style>
    </div>
  );
};

export default AllergensPanel;