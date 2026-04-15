import React from "react";
import { X, ChevronLeft } from "lucide-react";
import MediaCaptionEditor from "../../Editor/MediaCaptionEditor";
import IngredientInput from "../IngredientsInput";

const CaptionsStep = ({
  mediaItems,
  isPostEmpty,
  onBack,
  onAttemptClose,
  onPost,
  onCaptionsChange,
  ingredients,
  setIngredients,
  skipIngredientPrompt,
  setSkipIngredientPrompt,
}) => {
  return (
    <div
      className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
      style={{ maxHeight: "calc(100dvh - 32px)" }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="relative px-4 py-3.5 sm:p-5 border-b-2 border-[#F57600] flex items-center justify-center shrink-0">
        <button
          onClick={onBack}
          className="absolute left-4 sm:left-5 p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-orange-50 hover:text-[#F57600] transition-colors"
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
        </button>
        <h2 className="text-base sm:text-xl font-bold text-gray-800">Edit Media</h2>
        <button
          onClick={onAttemptClose}
          className="absolute right-4 sm:right-5 p-1 rounded-full bg-orange-50 text-[#F57600] hover:bg-orange-100 transition-colors"
        >
          <X size={20} strokeWidth={3} />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-4 sm:p-6 overflow-y-auto flex-1 min-h-0">
        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
          Add a title and caption to each photo or video individually.
        </p>

        {/* Ingredients — shared state with ComposeStep */}
        <div className="mb-4">
          <IngredientInput
            ingredients={ingredients}
            setIngredients={setIngredients}
            skipPromptChecked={skipIngredientPrompt}
            onSkipChange={setSkipIngredientPrompt}
          />
        </div>

        <MediaCaptionEditor mediaItems={mediaItems} onCaptionsChange={onCaptionsChange} />
      </div>

      {/* Footer */}
      <div className="px-4 py-3 sm:p-5 border-t border-gray-100 bg-white shrink-0 flex gap-2 sm:gap-3">
        <button
          onClick={onBack}
          className="flex-1 font-bold py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-sm border-2 border-gray-200 text-gray-600
                     hover:border-[#F57600] hover:text-[#F57600] transition-all"
        >
          Back
        </button>
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

export default CaptionsStep;