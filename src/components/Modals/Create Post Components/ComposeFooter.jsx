import React from "react";
import { Video, Image as ImageIcon, ChevronLeft, Pencil } from "lucide-react";

const ComposeFooter = ({
  mediaItems,
  isPostEmpty,
  hasMultiple,
  captionedCount,
  onPost,
  onEditCaptions,
  onAddMedia,
}) => {
  const imageCount = mediaItems.filter((i) => i.type === "image").length;
  const videoCount = mediaItems.filter((i) => i.type === "video").length;

  return (
    <div className="px-4 py-3 sm:p-5 border-t border-gray-100 bg-white shrink-0 flex flex-col gap-2 sm:gap-3">

      {/* Per-media captions button — only when 2+ media */}
      {hasMultiple && (
        <button
          onClick={onEditCaptions}
          className="w-full flex items-center justify-between bg-gradient-to-r from-[#F57600] to-[#F0AE35]
                     text-white rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 hover:opacity-90 transition-all active:scale-[0.98] shadow-md"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Pencil size={11} />
            </div>
            <span className="text-xs sm:text-sm font-bold">Add titles &amp; captions per photo</span>
          </div>
          <div className="flex items-center gap-2">
            {captionedCount > 0 && (
              <span className="bg-white/25 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {captionedCount}/{mediaItems.length} done
              </span>
            )}
            <ChevronLeft size={14} className="rotate-180 opacity-70" />
          </div>
        </button>
      )}

      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {/* Media counter / add shortcut */}
        <div className="flex items-center gap-2 sm:gap-3 bg-gray-50 px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl border border-gray-200 flex-shrink-0">
          {mediaItems.length === 0 ? (
            <>
              <span className="text-xs sm:text-sm font-bold text-gray-600 hidden xs:block">Add media</span>
              <div className="flex gap-2 sm:gap-3">
                <button onClick={onAddMedia} className="text-[#0060A9] hover:scale-110 transition-transform">
                  <Video size={20} />
                </button>
                <button onClick={onAddMedia} className="text-[#F57600] hover:scale-110 transition-transform">
                  <ImageIcon size={20} />
                </button>
              </div>
            </>
          ) : (
            <span className="text-xs sm:text-sm font-bold text-gray-600 whitespace-nowrap">
              {imageCount} photo{imageCount !== 1 ? "s" : ""},{" "}
              {videoCount} vid{videoCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Post button */}
        <button
          onClick={onPost}
          disabled={isPostEmpty}
          className={`flex-1 font-bold py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-sm shadow-lg transition-all active:scale-95 ${
            isPostEmpty
              ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
              : "bg-gradient-to-r from-[#F57600] to-[#F0AE35] text-white hover:opacity-90"
          }`}
        >
          Post Recipe
        </button>
      </div>
    </div>
  );
};

export default ComposeFooter;