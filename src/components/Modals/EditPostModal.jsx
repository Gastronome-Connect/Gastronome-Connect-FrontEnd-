import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Plus,
  Play,
  Image as ImageIcon,
  Video,
  ChevronLeft,
  Pencil,
  UtensilsCrossed,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import MediaCaptionEditor from "../Editor/MediaCaptionEditor";
import DiscardChangesModal from "../Modals/DiscardChangesModal";
import SaveToast from "../Toast/SaveToast";

const TITLE_MAX = 60;
const STEP_COMPOSE = "compose";
const STEP_CAPTIONS = "captions";

// ─────────────────────────────────────────────────────────────────────────────
// IngredientEditor — inline, same UI as ComposeStep
// ─────────────────────────────────────────────────────────────────────────────
const UNITS = [
  { value: "tsp", label: "tsp" },
  { value: "tbsp", label: "tbsp" },
  { value: "cup", label: "cup" },
  { value: "ml", label: "ml" },
  { value: "l", label: "L" },
  { value: "g", label: "g" },
  { value: "kg", label: "kg" },
  { value: "oz", label: "oz" },
  { value: "lb", label: "lb" },
  { value: "piece", label: "pc" },
  { value: "pinch", label: "pinch" },
  { value: "to taste", label: "to taste" },
];

const isValidAmount = (val) => {
  if (!val.trim()) return true;
  return /^(\d+\s+)?\d+\/\d+$|^\d+$/.test(val.trim());
};

const formatMeasure = (ing) => {
  if (ing.unit === "to taste") return "to taste";
  return [ing.amount, ing.unit].filter(Boolean).join(" ");
};

const IngredientEditor = ({ ingredients, setIngredients }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("cup");
  const [amountErr, setAmountErr] = useState(false);

  const handleAmountChange = (e) => {
    const val = e.target.value;
    if (/^[\d\s/]*$/.test(val)) {
      setAmount(val);
      setAmountErr(false);
    }
  };

  const addIngredient = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (amount.trim() && !isValidAmount(amount)) {
      setAmountErr(true);
      return;
    }
    setIngredients((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        name: trimmed,
        amount: amount.trim(),
        unit,
      },
    ]);
    setName("");
    setAmount("");
  };

  const removeIngredient = (id) =>
    setIngredients((prev) => prev.filter((i) => i.id !== id));

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addIngredient();
    }
  };

  return (
    <div className="rounded-2xl border border-orange-100 bg-orange-50/50 overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setCollapsed((p) => !p)}
        className="w-full flex items-center gap-2 px-3.5 py-2.5 hover:bg-orange-50 transition-colors"
      >
        <UtensilsCrossed size={14} className="text-[#F57600] shrink-0" />
        <span className="text-xs font-extrabold text-[#F57600] uppercase tracking-wide flex-1 text-left">
          Ingredients
        </span>
        {ingredients.length > 0 && (
          <span className="text-[10px] bg-[#F57600] text-white font-bold px-2 py-0.5 rounded-full">
            {ingredients.length}
          </span>
        )}
        {collapsed ? (
          <ChevronDown size={13} className="text-orange-400 shrink-0" />
        ) : (
          <ChevronUp size={13} className="text-orange-400 shrink-0" />
        )}
      </button>

      {!collapsed && (
        <div className="px-3.5 pb-3 pt-1 space-y-3">
          {/* Existing list */}
          {ingredients.length > 0 && (
            <ul
              className="space-y-1.5 pr-1 overflow-y-auto"
              style={{ maxHeight: ingredients.length > 3 ? "120px" : "none" }}
            >
              {ingredients.map((ing) => (
                <li
                  key={ing.id}
                  className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-orange-100 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F57600] shrink-0" />
                  {formatMeasure(ing) && (
                    <span className="text-[11px] font-bold text-[#F57600] shrink-0 min-w-[52px]">
                      {formatMeasure(ing)}
                    </span>
                  )}
                  <span className="text-sm text-gray-700 flex-1 leading-snug">
                    {ing.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeIngredient(ing.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-400 shrink-0"
                  >
                    <X size={13} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Add row */}
          <div className="flex gap-1.5 items-start">
            {/* Amount */}
            <div className="flex flex-col gap-0.5">
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                onKeyDown={handleKeyDown}
                placeholder="Amt"
                inputMode="text"
                className={`w-14 text-xs text-center border rounded-xl px-2 py-2 bg-white focus:outline-none placeholder-gray-300 text-gray-700
                  ${amountErr ? "border-red-400 focus:border-red-400" : "border-orange-200 focus:border-[#F57600]"}`}
              />
              {amountErr && (
                <span className="text-[9px] text-red-400 font-semibold text-center leading-tight">
                  e.g. 1/2
                </span>
              )}
            </div>

            {/* Unit */}
            <div className="relative">
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="appearance-none text-xs border border-orange-200 rounded-xl pl-2.5 pr-6 py-2 bg-white focus:outline-none focus:border-[#F57600] text-gray-700 cursor-pointer h-[34px]"
              >
                {UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={11}
                className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-orange-400"
              />
            </div>

            {/* Name */}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ingredient name"
              className="flex-1 text-xs border border-orange-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-[#F57600] placeholder-gray-300 text-gray-700"
            />

            {/* Add button */}
            <button
              type="button"
              onClick={addIngredient}
              disabled={!name.trim()}
              className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-xl transition-all self-start mt-px
                ${
                  name.trim()
                    ? "bg-[#F57600] text-white hover:bg-orange-600 shadow-sm"
                    : "bg-orange-100 text-orange-300 cursor-not-allowed"
                }`}
            >
              <Plus size={15} />
            </button>
          </div>

          {/* Hint */}
          <p className="text-[10px] text-gray-400 -mt-1">
            Amount: whole numbers or fractions (e.g.{" "}
            <span className="font-semibold text-orange-400">1/2</span>,{" "}
            <span className="font-semibold text-orange-400">1 1/2</span>)
          </p>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EditPostModal
// ─────────────────────────────────────────────────────────────────────────────
const EditPostModal = ({ post, onSave, onClose }) => {
  const [step, setStep] = useState(STEP_COMPOSE);
  const [title, setTitle] = useState(post.title ?? "");
  const [caption, setCaption] = useState(post.caption ?? "");
  const [mediaItems, setMediaItems] = useState(
    (post.mediaItems ?? []).map((m) => ({
      ...m,
      title: m.title ?? "",
      caption: m.caption ?? "",
    })),
  );
  // ── Initialise ingredients from the existing post ──
  const [ingredients, setIngredients] = useState(
    Array.isArray(post.ingredients) ? post.ingredients : [],
  );
  const [showDiscard, setShowDiscard] = useState(false);
  const [saveToastVisible, setSaveToastVisible] = useState(false);
  const fileInputRef = useRef(null);

  const hasMultiple = mediaItems.length > 1;
  const captionedCount = mediaItems.filter((m) => m.title || m.caption).length;

  // ── Change detection — ingredients included ──
  const originalIngredients = Array.isArray(post.ingredients)
    ? post.ingredients
    : [];
  const ingredientsChanged =
    JSON.stringify(ingredients.map(({ id, ...r }) => r)) !==
    JSON.stringify(originalIngredients.map(({ id, ...r }) => r));

  const hasChanges =
    title !== (post.title ?? "") ||
    caption !== (post.caption ?? "") ||
    mediaItems.length !== (post.mediaItems ?? []).length ||
    ingredientsChanged;

  const attemptClose = useCallback(() => {
    if (hasChanges) setShowDiscard(true);
    else onClose();
  }, [hasChanges, onClose]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") attemptClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "unset";
    };
  }, [attemptClose]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setMediaItems((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video") ? "video" : "image",
        title: "",
        caption: "",
      })),
    ]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeMedia = (id) => {
    setMediaItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.file) URL.revokeObjectURL(item.url);
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleSave = () => {
    onSave({
      ...post,
      title: title.trim() || null,
      caption,
      mediaItems,
      ingredients, // ── persisted back to post
      image: mediaItems.length > 0 ? mediaItems[0].url : null,
    });

    if (!hasChanges) {
      onClose();
      return;
    }

    setSaveToastVisible(true);
  };

  const modalClass =
    "bg-white rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl flex flex-col";
  const modalStyle = { maxHeight: "calc(100dvh - 32px)" };

  /* ── CAPTIONS STEP ── */
  if (step === STEP_CAPTIONS) {
    return createPortal(
      <>
        <div
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={attemptClose}
        >
          <div
            className={modalClass}
            style={modalStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative px-4 py-3.5 sm:p-5 border-b-2 border-[#F57600] flex items-center justify-center shrink-0">
              <button
                onClick={() => setStep(STEP_COMPOSE)}
                className="absolute left-4 sm:left-5 p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-orange-50 hover:text-[#F57600] transition-colors"
              >
                <ChevronLeft size={18} strokeWidth={2.5} />
              </button>
              <h2 className="text-base sm:text-xl font-bold text-gray-800">
                Edit Media
              </h2>
              <button
                onClick={attemptClose}
                className="absolute right-4 sm:right-5 p-1 rounded-full bg-orange-50 text-[#F57600] hover:bg-orange-100 transition-colors"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <div className="px-4 py-4 sm:p-6 overflow-y-auto flex-1 min-h-0">
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                Add a title and caption to each photo or video individually.
              </p>
              <MediaCaptionEditor
                mediaItems={mediaItems}
                onCaptionsChange={setMediaItems}
              />
            </div>

            <div className="px-4 py-3 sm:p-5 border-t border-gray-100 shrink-0 flex gap-2 sm:gap-3">
              <button
                onClick={() => setStep(STEP_COMPOSE)}
                className="flex-1 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-sm border-2 border-gray-200 font-bold text-gray-600
                           hover:border-[#F57600] hover:text-[#F57600] transition-all"
              >
                Back
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-sm bg-gradient-to-r from-[#F57600] to-[#F0AE35] text-white
                           font-bold shadow hover:opacity-90 active:scale-95 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {showDiscard && (
          <DiscardChangesModal
            onDiscard={onClose}
            onKeepEditing={() => setShowDiscard(false)}
          />
        )}

        <SaveToast
          visible={saveToastVisible}
          message="Post updated"
          subLabel="Post"
          onDone={() => {
            setSaveToastVisible(false);
            onClose();
          }}
        />
      </>,
      document.body,
    );
  }

  /* ── COMPOSE STEP ── */
  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={attemptClose}
      >
        <div
          className={modalClass}
          style={modalStyle}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative px-4 py-3.5 sm:p-5 border-b-2 border-[#F57600] flex justify-center items-center shrink-0">
            <h2 className="text-base sm:text-xl font-bold text-gray-800">
              Edit Post
            </h2>
            <button
              onClick={attemptClose}
              className="absolute right-4 sm:right-5 p-1 rounded-full bg-orange-50 text-[#F57600] hover:bg-orange-100 transition-colors"
            >
              <X size={20} strokeWidth={3} />
            </button>
          </div>

          {/* Body */}
          <div className="px-4 py-4 sm:p-6 overflow-y-auto flex-1 min-h-0">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={post.avatar || "https://i.pravatar.cc/100"}
                alt="User"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-100 object-cover"
              />
              <span className="font-bold text-sm sm:text-base text-gray-800">
                {post.author}
              </span>
            </div>

            {/* 1. TITLE */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
              placeholder="Title (optional)"
              className="w-full text-sm sm:text-base font-semibold text-gray-800 placeholder-gray-300 border-none focus:ring-0 outline-none"
            />
            <div className="flex justify-end mb-1">
              <span
                className={`text-xs font-medium ${title.length >= TITLE_MAX ? "text-red-400" : "text-gray-300"}`}
              >
                {title.length}/{TITLE_MAX}
              </span>
            </div>
            <div className="border-b border-gray-100 mb-3" />

            {/* 2. INGREDIENTS ← moved above caption */}
            <div className="mb-4">
              <IngredientEditor
                ingredients={ingredients}
                setIngredients={setIngredients}
              />
            </div>

            {/* 3. CAPTION / DESCRIPTION ← now below ingredients */}
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's your recipe?"
              className="w-full min-h-[70px] sm:min-h-[90px] text-sm text-gray-700 placeholder-gray-400 border-none focus:ring-0 resize-none outline-none mb-4"
            />

            {/* 4. MEDIA */}
            {mediaItems.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {mediaItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative group aspect-square rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 bg-gray-50"
                  >
                    <button
                      onClick={() => removeMedia(item.id)}
                      className="absolute top-1.5 right-1.5 z-20 p-1 bg-black/50 hover:bg-red-500 text-white
                                 rounded-full transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X size={12} />
                    </button>
                    {item.type === "image" ? (
                      <img
                        src={item.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="relative w-full h-full bg-gray-900">
                        <video
                          src={item.url}
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play
                            size={24}
                            className="text-white fill-white opacity-90"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200
                             rounded-xl sm:rounded-2xl hover:border-[#F57600] hover:bg-orange-50 transition-all aspect-square text-gray-400 gap-1"
                >
                  <Plus size={20} />
                  <span className="text-xs font-semibold">Add More</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl sm:rounded-2xl hover:border-[#F57600]
                           hover:bg-orange-50 transition-all p-5 sm:p-7 flex flex-col items-center gap-2 text-gray-400 mb-4"
              >
                <div className="flex gap-3">
                  <ImageIcon size={24} className="text-[#F57600]" />
                  <Video size={24} className="text-[#0060A9]" />
                </div>
                <span className="text-sm font-semibold">
                  Add photos &amp; videos
                </span>
                <span className="text-xs text-gray-300">
                  PNG, JPEG · All video formats
                </span>
              </button>
            )}

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/png,image/jpeg,video/*"
              multiple
              onChange={handleFileChange}
            />
          </div>

          {/* Footer */}
          <div className="px-4 py-3 sm:p-5 border-t border-gray-100 shrink-0 flex flex-col gap-2 sm:gap-3">
            {hasMultiple && (
              <button
                onClick={() => setStep(STEP_CAPTIONS)}
                className="w-full flex items-center justify-between bg-gradient-to-r from-[#F57600] to-[#F0AE35]
                           text-white rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 hover:opacity-90 transition-all active:scale-[0.98] shadow-md"
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

            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={attemptClose}
                className="flex-1 py-3 rounded-xl sm:rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#F57600] to-[#F0AE35] text-white
                           text-sm font-bold shadow hover:opacity-90 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDiscard && (
        <DiscardChangesModal
          onDiscard={onClose}
          onKeepEditing={() => setShowDiscard(false)}
        />
      )}

      {/* Save toast — rendered outside the modal so it's never clipped */}
      <SaveToast
        visible={saveToastVisible}
        message="Post updated"
        subLabel="Post"
        onDone={() => {
          setSaveToastVisible(false);
          onClose();
        }}
      />
    </>,
    document.body,
  );
};

export default EditPostModal;
