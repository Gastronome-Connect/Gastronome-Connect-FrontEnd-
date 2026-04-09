import { createPortal } from "react-dom";
import { UtensilsCrossed, X } from "lucide-react";

/**
 * IngredientPromptModal
 *
 * Shown when the user tries to post without adding any ingredients
 * (and has NOT checked the "don't remind me" checkbox).
 *
 * @param {Function} onAddIngredients  - close the modal and let user add ingredients
 * @param {Function} onProceed         - proceed with posting anyway
 * @param {Function} onDismiss         - close via "X" without doing anything
 */
const IngredientPromptModal = ({ onAddIngredients, onProceed, onDismiss }) => {
  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onDismiss}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#F57600] to-[#F0AE35]" />

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
              <UtensilsCrossed size={18} className="text-[#F57600]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900 leading-tight">
                Add Ingredients?
              </h2>
              <p className="text-[11px] text-orange-400 font-semibold">Recommended for recipes</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5 p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Your post looks great! For recipe posts, adding an ingredient list
            helps your readers know exactly what they need.
          </p>

          {/* Visual ingredient preview hint */}
          <div className="mt-3 rounded-2xl border border-orange-100 bg-orange-50/60 px-3.5 py-3 space-y-1.5">
            {[
              { measure: "2 cups",  name: "all-purpose flour" },
              { measure: "1 tsp",   name: "baking powder" },
              { measure: "to taste",name: "salt" },
            ].map((eg, i) => (
              <div key={i} className="flex items-center gap-2 opacity-50">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F57600] shrink-0" />
                <span className="text-[11px] font-bold text-[#F57600] min-w-[56px]">{eg.measure}</span>
                <span className="text-xs text-gray-600">{eg.name}</span>
              </div>
            ))}
            <p className="text-[10px] text-orange-300 font-semibold pt-1 italic">
              Example ingredient list preview…
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex flex-col gap-2.5">
          <button
            onClick={onAddIngredients}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#F57600] to-[#F0AE35] text-white font-bold text-sm shadow hover:opacity-90 transition-all"
          >
            + Add Ingredients
          </button>
          <button
            onClick={onProceed}
            className="w-full py-2.5 rounded-2xl border border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-50 transition-all"
          >
            Post Without Ingredients
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default IngredientPromptModal;