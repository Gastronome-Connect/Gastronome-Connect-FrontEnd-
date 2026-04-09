/**
 * ComposeStep — UI matches EditPostModal exactly.
 * Layout order: Title → Ingredients → Description → Media grid
 *
 * Drop-in replacement. All props are identical to the original.
 */
import { X, Plus, Play, Image as ImageIcon, Video, Pencil, ChevronLeft } from "lucide-react";
import IngredientInput from "../IngredientsInput"; // adjust path as needed

const TITLE_MAX = 60;

export default function ComposeStep({
  userName,
  title,          setTitle,
  postText,       setPostText,
  mediaItems,
  hasMultiple,
  captionedCount,
  onEditCaptions,
  onAddMedia,
  onRemoveMedia,
  fileInputRef,
  onFileChange,
  ingredients,
  setIngredients,
  skipIngredientPrompt,
  setSkipIngredientPrompt,
  isPostEmpty,
  onAttemptClose,
  onPost,
}) {
  return (
    <div
      className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl flex flex-col"
      style={{ maxHeight: "calc(100dvh - 32px)" }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* ── Header — matches EditPostModal exactly ── */}
      <div className="relative px-4 py-3.5 sm:p-5 border-b-2 border-[#F57600] flex justify-center items-center shrink-0">
        <h2 className="text-base sm:text-xl font-bold text-gray-800">Create Post</h2>
        <button
          onClick={onAttemptClose}
          className="absolute right-4 sm:right-5 p-1 rounded-full bg-orange-50 text-[#F57600] hover:bg-orange-100 transition-colors"
        >
          <X size={20} strokeWidth={3} />
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="px-4 py-4 sm:p-6 overflow-y-auto flex-1 min-h-0">

        {/* Avatar + username */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-[#F57600] shrink-0 overflow-hidden">
            {userName?.[0]?.toUpperCase() ?? "?"}
          </div>
          <span className="font-bold text-sm sm:text-base text-gray-800">{userName}</span>
        </div>

        {/* ── 1. TITLE ── */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
          placeholder="Title (optional)"
          className="w-full text-sm sm:text-base font-semibold text-gray-800 placeholder-gray-300 border-none focus:ring-0 outline-none"
        />
        <div className="flex justify-end mb-1">
          <span className={`text-xs font-medium ${title.length >= TITLE_MAX ? "text-red-400" : "text-gray-300"}`}>
            {title.length}/{TITLE_MAX}
          </span>
        </div>
        <div className="border-b border-gray-100 mb-3" />

        {/* ── 2. INGREDIENTS ── */}
        <div className="mb-4">
          <IngredientInput
            ingredients={ingredients}
            setIngredients={setIngredients}
            skipPromptChecked={skipIngredientPrompt}
            onSkipChange={setSkipIngredientPrompt}
          />
        </div>

        {/* ── 3. DESCRIPTION / caption ── */}
        <textarea
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          placeholder="What's your recipe?"
          className="w-full min-h-[70px] sm:min-h-[90px] text-sm text-gray-700 placeholder-gray-400 border-none focus:ring-0 resize-none outline-none mb-4"
        />

        {/* ── 4. MEDIA — 3-col grid with "Add More" tile ── */}
        {mediaItems.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {mediaItems.map((item) => (
              <div
                key={item.id}
                className="relative group aspect-square rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 bg-gray-50"
              >
                <button
                  onClick={() => onRemoveMedia(item.id)}
                  className="absolute top-1.5 right-1.5 z-20 p-1 bg-black/50 hover:bg-red-500 text-white
                             rounded-full transition-all opacity-0 group-hover:opacity-100"
                >
                  <X size={12} />
                </button>
                {item.type === "image" ? (
                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="relative w-full h-full bg-gray-900">
                    <video src={item.url} className="w-full h-full object-cover opacity-80" muted />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play size={24} className="text-white fill-white opacity-90" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Add More tile */}
            <button
              onClick={onAddMedia}
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200
                         rounded-xl sm:rounded-2xl hover:border-[#F57600] hover:bg-orange-50
                         transition-all aspect-square text-gray-400 gap-1"
            >
              <Plus size={20} />
              <span className="text-xs font-semibold">Add More</span>
            </button>
          </div>
        ) : (
          /* Empty-state upload zone */
          <button
            type="button"
            onClick={onAddMedia}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl sm:rounded-2xl
                       hover:border-[#F57600] hover:bg-orange-50 transition-all p-5 sm:p-7
                       flex flex-col items-center gap-2 text-gray-400 mb-4"
          >
            <div className="flex gap-3">
              <ImageIcon size={24} className="text-[#F57600]" />
              <Video     size={24} className="text-[#0060A9]" />
            </div>
            <span className="text-sm font-semibold">Add photos &amp; videos</span>
            <span className="text-xs text-gray-300">PNG, JPEG · All video formats</span>
          </button>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,video/*"
          multiple
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      {/* ── Footer — matches EditPostModal exactly ── */}
      <div className="px-4 py-3 sm:p-5 border-t border-gray-100 shrink-0 flex flex-col gap-2 sm:gap-3">

        {/* "Edit titles & captions" pill — shown whenever media is present */}
        {mediaItems.length > 0 && (
          <button
            onClick={onEditCaptions}
            className="w-full flex items-center justify-between bg-gradient-to-r from-[#F57600] to-[#F0AE35]
                       text-white rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5
                       hover:opacity-90 transition-all active:scale-[0.98] shadow-md"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center">
                <Pencil size={11} />
              </div>
              <span className="text-xs sm:text-sm font-bold">
                {mediaItems.length === 1
                  ? "Edit title & caption"
                  : "Edit titles & captions per photo"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {captionedCount > 0 && (
                <span className="bg-white/25 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {captionedCount}/{mediaItems.length} edited
                </span>
              )}
              <ChevronLeft size={14} className="rotate-180 opacity-70" />
            </div>
          </button>
        )}

        {/* Post button */}
        <button
          onClick={onPost}
          disabled={isPostEmpty}
          className={`w-full py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-sm font-bold shadow transition-all
            ${isPostEmpty
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-[#F57600] to-[#F0AE35] text-white hover:opacity-90 active:scale-[0.98]"
            }`}
        >
          Post
        </button>
      </div>
    </div>
  );
}