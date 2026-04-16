import { useState, useRef, useEffect, useCallback } from "react";
import { UtensilsCrossed, Plus, X, ChevronDown, ChevronUp } from "lucide-react";

// ─── Units ───────────────────────────────────────────────────────────────────
const UNITS = [
  { value: "tsp",      label: "tsp" },
  { value: "tbsp",     label: "tbsp" },
  { value: "cup",      label: "cup" },
  { value: "ml",       label: "ml" },
  { value: "l",        label: "L" },
  { value: "g",        label: "g" },
  { value: "kg",       label: "kg" },
  { value: "oz",       label: "oz" },
  { value: "lb",       label: "lb" },
  { value: "piece",    label: "pc" },
  { value: "pinch",    label: "pinch" },
  { value: "to taste", label: "to taste" },
];

// ─── Pluralize unit based on amount ──────────────────────────────────────────
const pluralizeUnit = (unit, amount) => {
  if (!unit || unit === "to taste") return unit;
  const num = parseFloat(amount);
  if (!num || num <= 1) return unit;
  const plurals = {
    cup:   "cups",
    tsp:   "tsps",
    tbsp:  "tbsps",
    piece: "pieces",
    pinch: "pinches",
    oz:    "ozs",
    lb:    "lbs",
  };
  return plurals[unit] ?? unit;
};

// ─── Common ingredient dictionary ────────────────────────────────────────────
const INGREDIENT_DICT = [
  "chicken breast", "chicken thigh", "chicken wings", "ground beef", "ground turkey",
  "beef steak", "pork chops", "pork belly", "bacon", "sausage", "ham",
  "salmon", "tuna", "shrimp", "cod", "tilapia", "crab", "lobster",
  "eggs", "tofu", "tempeh", "chicken",
  "garlic", "onion", "red onion", "green onion", "shallot",
  "tomato", "cherry tomatoes", "roma tomatoes",
  "carrot", "celery", "bell pepper", "red bell pepper", "green bell pepper",
  "broccoli", "cauliflower", "spinach", "kale", "lettuce", "arugula",
  "zucchini", "eggplant", "mushroom", "shiitake mushrooms", "portobello mushrooms",
  "corn", "peas", "green beans", "asparagus", "artichoke",
  "potato", "sweet potato", "butternut squash", "pumpkin",
  "cucumber", "avocado", "jalapeño", "chili pepper",
  "butter", "milk", "heavy cream", "sour cream", "cream cheese",
  "cheddar cheese", "mozzarella", "parmesan", "feta cheese", "ricotta",
  "greek yogurt", "yogurt",
  "all-purpose flour", "bread flour", "whole wheat flour",
  "rice", "brown rice", "jasmine rice", "basmati rice",
  "pasta", "spaghetti", "penne", "fettuccine", "lasagna noodles",
  "bread", "panko breadcrumbs", "breadcrumbs",
  "oats", "quinoa", "couscous", "lentils", "chickpeas", "black beans", "kidney beans",
  "olive oil", "vegetable oil", "coconut oil", "sesame oil",
  "soy sauce", "fish sauce", "oyster sauce", "worcestershire sauce",
  "tomato sauce", "tomato paste", "ketchup", "mustard", "mayonnaise",
  "hot sauce", "sriracha", "hoisin sauce", "teriyaki sauce",
  "balsamic vinegar", "red wine vinegar", "apple cider vinegar", "white vinegar",
  "honey", "maple syrup", "sugar", "brown sugar", "powdered sugar",
  "salt", "black pepper", "white pepper", "red pepper flakes",
  "basil", "oregano", "thyme", "rosemary", "parsley", "cilantro", "mint",
  "cumin", "coriander", "paprika", "smoked paprika", "turmeric", "chili powder",
  "garlic powder", "onion powder", "ginger powder", "cinnamon", "nutmeg",
  "bay leaves", "cardamom", "cloves", "star anise",
  "fresh ginger", "lemongrass",
  "lemon", "lime", "orange", "lemon juice", "lime juice",
  "apple", "banana", "strawberries", "blueberries", "raspberries",
  "mango", "pineapple", "peach", "pear",
  "baking powder", "baking soda", "yeast", "cornstarch", "vanilla extract",
  "cocoa powder", "chocolate chips", "dark chocolate",
  "water", "chicken broth", "beef broth", "vegetable broth", "coconut milk",
  "white wine", "red wine", "beer",
];

// ─── Fuzzy helpers ────────────────────────────────────────────────────────────
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

function getSuggestions(query, limit = 6) {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  const scored = INGREDIENT_DICT.map((ing) => {
    const lower = ing.toLowerCase();
    let score = Infinity;
    if (lower === q)             return { ing, score: -2 };
    if (lower.startsWith(q))    return { ing, score: -1 };
    if (lower.includes(q))      return { ing, score: 0  };
    if (lower.split(" ").some((w) => w.startsWith(q))) return { ing, score: 0.5 };
    const minDist = Math.min(...lower.split(" ").map((w) => levenshtein(q, w)));
    const threshold = q.length <= 3 ? 1 : q.length <= 5 ? 2 : 3;
    if (minDist <= threshold) score = minDist;
    return { ing, score };
  });
  return scored
    .filter(({ score }) => score !== Infinity)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map(({ ing }) => ing);
}

const isValidAmount = (val) => {
  if (!val.trim()) return true;
  return /^(\d+\s+)?\d+\/\d+$|^\d+(\.\d+)?$/.test(val.trim());
};

// ─── Component ────────────────────────────────────────────────────────────────
const IngredientInput = ({
  ingredients = [],
  setIngredients,
  skipPromptChecked = false,
  onSkipChange,
}) => {
  const [name,        setName]        = useState("");
  const [amount,      setAmount]      = useState("");
  const [unit,        setUnit]        = useState("cup");
  const [isOptional,  setIsOptional]  = useState(false);
  const [amountErr,   setAmountErr]   = useState(false);
  const [collapsed,   setCollapsed]   = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [activeIdx,   setActiveIdx]   = useState(-1);

  const nameRef      = useRef(null);
  const suggestRef   = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (name.trim().length >= 2) {
      const s = getSuggestions(name);
      setSuggestions(s);
      setShowSuggest(s.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggest(false);
    }
    setActiveIdx(-1);
  }, [name]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setShowSuggest(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAmountChange = (e) => {
    const val = e.target.value;
    if (/^[\d\s/.]*$/.test(val)) { setAmount(val); setAmountErr(false); }
  };

  const handleNameChange = (e) => { setName(e.target.value); };

  const pickSuggestion = (s) => {
    setName(s);
    setSuggestions([]);
    setShowSuggest(false);
    nameRef.current?.focus();
  };

  const toggleOptional = (id) => {
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id === id ? { ...ing, optional: !ing.optional } : ing
      )
    );
  };

  const addIngredient = useCallback(() => {
    const raw = name.trim();
    if (!raw) return;
    if (amount.trim() && !isValidAmount(amount)) { setAmountErr(true); return; }

    // Capitalize first letter
    const capitalizedName = raw.charAt(0).toUpperCase() + raw.slice(1);

    setIngredients((prev) => [
      ...prev,
      {
        id:       Math.random().toString(36).substr(2, 9),
        name:     capitalizedName,
        amount:   amount.trim(),
        unit,
        optional: isOptional,
      },
    ]);

    setName("");
    setAmount("");
    setAmountErr(false);
    setIsOptional(false);
    setShowSuggest(false);
  }, [name, amount, unit, isOptional, setIngredients]);

  const removeIngredient = (id) =>
    setIngredients((prev) => prev.filter((i) => i.id !== id));

  const handleKeyDown = (e) => {
    if (showSuggest && suggestions.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1)); return; }
      if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, -1)); return; }
      if (e.key === "Enter" && activeIdx >= 0) { e.preventDefault(); pickSuggestion(suggestions[activeIdx]); return; }
      if (e.key === "Escape") { setShowSuggest(false); return; }
    }
    if (e.key === "Enter") { e.preventDefault(); addIngredient(); }
  };

  const formatMeasure = (ing) => {
    if (ing.unit === "to taste") return "to taste";
    const pluralUnit = pluralizeUnit(ing.unit, ing.amount);
    return [ing.amount, pluralUnit].filter(Boolean).join(" ");
  };

  return (
    <div className="rounded-2xl border border-orange-100 bg-orange-50/50 overflow-visible">

      {/* ── Header ── */}
      <button
        type="button"
        onClick={() => setCollapsed((p) => !p)}
        className="w-full flex items-center gap-2 px-3.5 py-2.5 hover:bg-orange-50 transition-colors rounded-2xl"
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
        <span className="text-[10px] text-orange-400 font-semibold">Recommended</span>
        {collapsed
          ? <ChevronDown size={13} className="text-orange-400 shrink-0" />
          : <ChevronUp   size={13} className="text-orange-400 shrink-0" />
        }
      </button>

      {!collapsed && (
        <div className="px-3.5 pb-3 pt-1 space-y-3">

          {/* ── Existing ingredients ── */}
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

                  <span className="text-sm text-gray-700 flex-1 leading-snug capitalize">
                    {ing.name}
                  </span>

                  {/* ── Optional badge / toggle ── */}
                  <button
                    type="button"
                    onClick={() => toggleOptional(ing.id)}
                    title={ing.optional ? "Mark as required" : "Mark as optional"}
                    className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full border transition-all
                      ${ing.optional
                        ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
                        : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-amber-50 hover:text-amber-500 hover:border-amber-200 opacity-0 group-hover:opacity-100"
                      }`}
                  >
                    {ing.optional ? "optional" : "set optional"}
                  </button>

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

          {/* ── Add row ── */}
          <div ref={containerRef} className="relative">
            <div className="flex gap-1.5 items-start">

              {/* Amount */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Amt"
                  inputMode="text"
                  className={`w-14 text-xs text-center border rounded-xl px-2 py-2 bg-white focus:outline-none placeholder-gray-300 text-gray-700 h-[34px]
                    ${amountErr
                      ? "border-red-400 focus:border-red-400 ring-1 ring-red-200"
                      : "border-orange-200 focus:border-[#F57600]"}`}
                />
                {amountErr && (
                  <span className="text-[9px] text-red-400 font-semibold text-center leading-tight">e.g. 1/2</span>
                )}
              </div>

              {/* Unit */}
              <div className="relative shrink-0">
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="appearance-none text-xs border border-orange-200 rounded-xl pl-2.5 pr-6 py-2 bg-white focus:outline-none focus:border-[#F57600] text-gray-700 cursor-pointer h-[34px]"
                >
                  {UNITS.map((u) => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
                <ChevronDown size={11} className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-orange-400" />
              </div>

              {/* Name */}
              <div className="flex-1 flex flex-col gap-0.5 relative">
                <input
                  ref={nameRef}
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => suggestions.length > 0 && setShowSuggest(true)}
                  placeholder="Ingredient name"
                  autoComplete="off"
                  className="w-full text-xs border border-orange-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-[#F57600] placeholder-gray-300 text-gray-700 h-[34px]"
                />

                {/* Autocomplete */}
                {showSuggest && suggestions.length > 0 && (
                  <ul
                    ref={suggestRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-orange-200 rounded-xl shadow-lg z-50 overflow-hidden"
                  >
                    {suggestions.map((s, idx) => (
                      <li
                        key={s}
                        onMouseDown={(e) => { e.preventDefault(); pickSuggestion(s); }}
                        className={`flex items-center gap-2 px-3 py-2 text-xs cursor-pointer transition-colors
                          ${idx === activeIdx
                            ? "bg-orange-50 text-[#F57600] font-semibold"
                            : "text-gray-700 hover:bg-orange-50 hover:text-[#F57600]"}`}
                      >
                        <span className="w-1 h-1 rounded-full bg-orange-300 shrink-0" />
                        <span className="capitalize">{s}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Add button */}
              <button
                type="button"
                onClick={() => addIngredient()}
                disabled={!name.trim()}
                className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-xl transition-all self-start mt-px
                  ${name.trim()
                    ? "bg-[#F57600] text-white hover:bg-orange-600 shadow-sm"
                    : "bg-orange-100 text-orange-300 cursor-not-allowed"}`}
              >
                <Plus size={15} />
              </button>
            </div>

            {/* ── Optional checkbox for the ingredient being added ── */}
            <label className="flex items-center gap-2 cursor-pointer select-none mt-2 pl-0.5 group/opt">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isOptional}
                  onChange={(e) => setIsOptional(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-colors
                    ${isOptional
                      ? "bg-amber-400 border-amber-400"
                      : "bg-white border-orange-300 group-hover/opt:border-amber-300"}`}
                >
                  {isOptional && (
                    <svg viewBox="0 0 10 8" className="w-2 h-1.5 fill-none stroke-white stroke-2">
                      <polyline points="1,4 4,7 9,1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-gray-500 leading-tight">
                Mark this ingredient as{" "}
                <span className="font-bold text-amber-500">optional</span>
                {" "}— viewers will see it labelled as optional in your post
              </span>
            </label>
          </div>

          {/* Hint */}
          <p className="text-[10px] text-gray-400 -mt-1">
            Amount: whole numbers or fractions (e.g.{" "}
            <span className="font-semibold text-orange-400">1/2</span>,{" "}
            <span className="font-semibold text-orange-400">1 1/2</span>
            ) · Start typing to see suggestions
          </p>

          {/* Skip prompt checkbox */}
          <label className="flex items-center gap-2 cursor-pointer select-none pt-0.5">
            <div className="relative">
              <input
                type="checkbox"
                checked={skipPromptChecked}
                onChange={(e) => onSkipChange?.(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
                  ${skipPromptChecked
                    ? "bg-[#F57600] border-[#F57600]"
                    : "bg-white border-orange-300"}`}
              >
                {skipPromptChecked && (
                  <svg viewBox="0 0 10 8" className="w-2.5 h-2 fill-none stroke-white stroke-2">
                    <polyline points="1,4 4,7 9,1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-[11px] text-gray-500 leading-tight">
              Don't remind me to add ingredients
            </span>
          </label>
        </div>
      )}
    </div>
  );
};

export default IngredientInput; 