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

// ─── Expanded ingredient dictionary ──────────────────────────────────────────
const INGREDIENT_DICT = [
  // ── Poultry ──
  "chicken breast", "chicken thigh", "chicken wings", "chicken drumsticks",
  "chicken liver", "ground chicken", "duck breast", "duck legs", "turkey breast",
  "ground turkey", "turkey legs", "quail", "chicken",

  // ── Beef ──
  "ground beef", "beef steak", "ribeye steak", "sirloin steak", "flank steak",
  "beef tenderloin", "beef brisket", "beef short ribs", "beef chuck", "beef liver",
  "beef tongue", "corned beef", "veal",

  // ── Pork ──
  "pork chops", "pork belly", "pork shoulder", "pork tenderloin", "pork ribs",
  "pork loin", "ground pork", "bacon", "pancetta", "prosciutto", "ham",
  "sausage", "chorizo", "salami", "pepperoni", "hot dog",

  // ── Seafood ──
  "salmon", "tuna", "shrimp", "cod", "tilapia", "crab", "lobster",
  "halibut", "sea bass", "mahi mahi", "snapper", "trout", "sardines",
  "anchovies", "mackerel", "catfish", "clams", "mussels", "oysters",
  "scallops", "squid", "octopus", "crayfish", "imitation crab",

  // ── Plant proteins ──
  "eggs", "tofu", "firm tofu", "silken tofu", "tempeh", "edamame",
  "seitan", "lentils", "chickpeas", "black beans", "kidney beans",
  "pinto beans", "white beans", "navy beans", "fava beans", "split peas",
  "mung beans", "adzuki beans",

  // ── Alliums ──
  "garlic", "onion", "red onion", "yellow onion", "white onion",
  "green onion", "scallion", "shallot", "leek", "chives",

  // ── Tomatoes ──
  "tomato", "cherry tomatoes", "roma tomatoes", "grape tomatoes",
  "heirloom tomatoes", "sun-dried tomatoes", "beefsteak tomato",

  // ── Vegetables ──
  "carrot", "celery", "bell pepper", "red bell pepper", "green bell pepper",
  "yellow bell pepper", "orange bell pepper", "broccoli", "cauliflower",
  "broccolini", "spinach", "kale", "baby spinach", "swiss chard", "collard greens",
  "bok choy", "napa cabbage", "green cabbage", "red cabbage", "brussels sprouts",
  "lettuce", "romaine lettuce", "iceberg lettuce", "arugula", "radicchio",
  "endive", "watercress", "zucchini", "yellow squash", "eggplant",
  "mushroom", "shiitake mushrooms", "portobello mushrooms", "cremini mushrooms",
  "button mushrooms", "oyster mushrooms", "enoki mushrooms", "porcini mushrooms",
  "corn", "peas", "snow peas", "sugar snap peas", "green beans", "asparagus",
  "artichoke", "hearts of palm", "bamboo shoots", "water chestnuts",
  "potato", "russet potato", "yukon gold potato", "red potato", "fingerling potato",
  "sweet potato", "yam", "butternut squash", "acorn squash", "spaghetti squash",
  "pumpkin", "delicata squash", "cucumber", "english cucumber", "persian cucumber",
  "avocado", "jalapeño", "serrano pepper", "habanero", "chili pepper",
  "anaheim pepper", "poblano pepper", "banana pepper", "radish", "daikon",
  "turnip", "parsnip", "beet", "fennel", "celery root", "kohlrabi",
  "okra", "taro", "jicama", "lotus root",

  // ── Dairy & Eggs ──
  "butter", "unsalted butter", "salted butter", "ghee", "milk", "whole milk",
  "2% milk", "skim milk", "heavy cream", "heavy whipping cream", "half and half",
  "sour cream", "cream cheese", "cheddar cheese", "mozzarella", "parmesan",
  "feta cheese", "ricotta", "gouda", "brie", "camembert", "gruyere",
  "swiss cheese", "provolone", "manchego", "blue cheese", "gorgonzola",
  "cottage cheese", "mascarpone", "burrata", "halloumi", "paneer",
  "greek yogurt", "yogurt", "plain yogurt", "condensed milk", "evaporated milk",
  "powdered milk", "whipping cream",

  // ── Flours & Grains ──
  "all-purpose flour", "bread flour", "whole wheat flour", "cake flour",
  "pastry flour", "almond flour", "coconut flour", "rice flour",
  "chickpea flour", "cornmeal", "corn flour", "semolina", "tapioca flour",
  "arrowroot powder", "oat flour",

  // ── Rice & Grains ──
  "rice", "brown rice", "jasmine rice", "basmati rice", "arborio rice",
  "sushi rice", "wild rice", "black rice", "forbidden rice", "sticky rice",
  "oats", "rolled oats", "steel-cut oats", "instant oats",
  "quinoa", "couscous", "farro", "barley", "bulgur", "millet",
  "buckwheat", "polenta",

  // ── Pasta & Noodles ──
  "pasta", "spaghetti", "penne", "fettuccine", "lasagna noodles",
  "linguine", "rigatoni", "farfalle", "orzo", "angel hair pasta",
  "rotini", "cavatappi", "gnocchi", "udon noodles", "soba noodles",
  "rice noodles", "glass noodles", "ramen noodles", "egg noodles",
  "lo mein noodles", "pad thai noodles", "vermicelli",

  // ── Bread & Bakery ──
  "bread", "white bread", "whole wheat bread", "sourdough bread",
  "baguette", "ciabatta", "focaccia", "pita bread", "naan",
  "tortilla", "flour tortilla", "corn tortilla", "panko breadcrumbs",
  "breadcrumbs", "croutons", "phyllo dough", "puff pastry",
  "pie crust", "pizza dough",

  // ── Oils & Fats ──
  "olive oil", "extra virgin olive oil", "vegetable oil", "canola oil",
  "coconut oil", "sesame oil", "avocado oil", "grapeseed oil",
  "sunflower oil", "peanut oil", "walnut oil", "flaxseed oil",
  "lard", "shortening",

  // ── Sauces & Condiments ──
  "soy sauce", "low sodium soy sauce", "tamari", "fish sauce",
  "oyster sauce", "worcestershire sauce", "tomato sauce", "marinara sauce",
  "tomato paste", "crushed tomatoes", "diced tomatoes", "ketchup",
  "mustard", "dijon mustard", "yellow mustard", "whole grain mustard",
  "mayonnaise", "hot sauce", "sriracha", "hoisin sauce", "teriyaki sauce",
  "barbecue sauce", "buffalo sauce", "tahini", "miso paste",
  "gochujang", "sambal oelek", "chili garlic sauce", "sweet chili sauce",
  "ponzu sauce", "pesto", "alfredo sauce",

  // ── Vinegars ──
  "balsamic vinegar", "red wine vinegar", "apple cider vinegar",
  "white vinegar", "rice vinegar", "white wine vinegar", "sherry vinegar",
  "champagne vinegar",

  // ── Sweeteners ──
  "honey", "maple syrup", "sugar", "brown sugar", "powdered sugar",
  "granulated sugar", "raw sugar", "coconut sugar", "agave nectar",
  "molasses", "corn syrup", "golden syrup", "stevia",

  // ── Salt & Pepper ──
  "salt", "kosher salt", "sea salt", "flaky salt", "himalayan salt",
  "black pepper", "white pepper", "red pepper flakes", "cayenne pepper",

  // ── Dried herbs ──
  "basil", "dried basil", "oregano", "dried oregano", "thyme", "dried thyme",
  "rosemary", "dried rosemary", "parsley", "dried parsley", "bay leaves",
  "tarragon", "sage", "dried sage", "marjoram", "dill", "dried dill",
  "chervil",

  // ── Fresh herbs ──
  "fresh basil", "fresh parsley", "cilantro", "fresh cilantro", "mint",
  "fresh mint", "fresh thyme", "fresh rosemary", "fresh dill", "fresh oregano",
  "fresh sage", "fresh tarragon", "lemongrass", "kaffir lime leaves",
  "curry leaves",

  // ── Ground spices ──
  "cumin", "ground cumin", "coriander", "ground coriander", "paprika",
  "smoked paprika", "sweet paprika", "turmeric", "chili powder",
  "garlic powder", "onion powder", "ginger powder", "ground ginger",
  "cinnamon", "ground cinnamon", "nutmeg", "ground nutmeg", "allspice",
  "cardamom", "ground cardamom", "cloves", "ground cloves",
  "five spice powder", "garam masala", "curry powder", "za'atar",
  "sumac", "berbere", "harissa powder", "ras el hanout", "old bay seasoning",
  "italian seasoning", "herbs de provence", "cajun seasoning",

  // ── Whole spices ──
  "star anise", "whole cloves", "whole cardamom", "whole peppercorns",
  "mustard seeds", "fennel seeds", "caraway seeds", "cumin seeds",
  "coriander seeds", "fenugreek seeds",

  // ── Fresh aromatics ──
  "fresh ginger", "ginger root", "galangal", "turmeric root",
  "horseradish", "wasabi",

  // ── Citrus & Zest ──
  "lemon", "lime", "orange", "grapefruit", "blood orange",
  "lemon juice", "lime juice", "orange juice", "lemon zest", "lime zest",
  "orange zest",

  // ── Fruits ──
  "apple", "granny smith apple", "fuji apple", "honeycrisp apple",
  "banana", "strawberries", "blueberries", "raspberries", "blackberries",
  "mango", "pineapple", "peach", "nectarine", "pear", "plum",
  "apricot", "cherry", "grapes", "watermelon", "cantaloupe", "honeydew",
  "papaya", "kiwi", "fig", "pomegranate", "passion fruit", "guava",
  "dragon fruit", "lychee", "jackfruit", "durian", "dates", "raisins",
  "dried cranberries", "dried apricots", "prunes",

  // ── Nuts & Seeds ──
  "almonds", "walnuts", "pecans", "cashews", "peanuts", "pistachios",
  "pine nuts", "macadamia nuts", "hazelnuts", "brazil nuts",
  "sunflower seeds", "pumpkin seeds", "sesame seeds", "chia seeds",
  "flaxseeds", "hemp seeds", "poppy seeds",

  // ── Nut & Seed butters ──
  "peanut butter", "almond butter", "cashew butter", "sunflower seed butter",
  "tahini",

  // ── Baking ──
  "baking powder", "baking soda", "yeast", "instant yeast", "active dry yeast",
  "cornstarch", "vanilla extract", "vanilla bean", "almond extract",
  "cocoa powder", "unsweetened cocoa powder", "dutch process cocoa",
  "chocolate chips", "dark chocolate", "milk chocolate", "white chocolate",
  "bittersweet chocolate", "semi-sweet chocolate", "cocoa nibs",
  "gelatin", "agar agar", "cream of tartar",

  // ── Liquids & Broths ──
  "water", "sparkling water", "chicken broth", "chicken stock",
  "beef broth", "beef stock", "vegetable broth", "vegetable stock",
  "fish stock", "dashi", "coconut milk", "coconut cream", "almond milk",
  "oat milk", "soy milk",

  // ── Alcohol ──
  "white wine", "red wine", "dry white wine", "dry red wine", "rosé wine",
  "beer", "lager", "stout", "sake", "mirin", "shaoxing wine",
  "brandy", "bourbon", "whiskey", "rum", "vodka", "gin", "tequila",
  "kahlua", "amaretto", "grand marnier", "dry sherry", "marsala wine",

  // ── Canned & Pantry ──
  "canned tomatoes", "canned chickpeas", "canned black beans",
  "canned kidney beans", "canned tuna", "canned salmon", "canned corn",
  "canned coconut milk", "canned pumpkin", "canned artichoke hearts",
  "roasted red peppers", "capers", "olives", "green olives", "kalamata olives",
  "sundried tomatoes in oil", "anchovies in oil", "hearts of palm",

  // ── Asian pantry ──
  "rice vinegar", "sesame paste", "doubanjiang", "black bean sauce",
  "XO sauce", "shrimp paste", "bonito flakes", "kombu", "nori",
  "miso", "white miso", "red miso",

  // ── Cheese extras ──
  "romano cheese", "asiago", "fontina", "jack cheese", "pepper jack",
  "colby jack", "american cheese",

  // ── Garnishes & Extras ──
  "microgreens", "edible flowers", "truffle oil", "truffle salt",
  "nutritional yeast", "liquid smoke", "coconut aminos",
  "worcestershire sauce", "anchovy paste",
].sort((a, b) => a.localeCompare(b));

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

function getSuggestions(query, limit = 8) {
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
  const [nameErr,     setNameErr]     = useState(false);
  const [collapsed,   setCollapsed]   = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [activeIdx,   setActiveIdx]   = useState(-1);

  const nameRef      = useRef(null);
  const suggestRef   = useRef(null);
  const containerRef = useRef(null);

  // Show all ingredients alphabetically when input is empty, otherwise filter
  useEffect(() => {
    if (name.trim().length === 0) {
      // Show all options when field is focused and empty
      setSuggestions(INGREDIENT_DICT);
    } else if (name.trim().length >= 1) {
      const s = getSuggestions(name, 10);
      setSuggestions(s);
    }
    setActiveIdx(-1);
  }, [name]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggest(false);
        // Validate on blur — if typed value isn't in dictionary, show error
        if (name.trim() && !INGREDIENT_DICT.includes(name.toLowerCase().trim())) {
          const matched = INGREDIENT_DICT.find(
            (o) => o.toLowerCase() === name.toLowerCase().trim()
          );
          if (!matched) setNameErr(true);
        }
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [name]);

  const handleAmountChange = (e) => {
    const val = e.target.value;
    if (/^[\d\s/.]*$/.test(val)) { setAmount(val); setAmountErr(false); }
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    setNameErr(false);
  };

  const pickSuggestion = (s) => {
    setName(s);
    setNameErr(false);
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

    // ── Restrict to dictionary only ──
    const matched = INGREDIENT_DICT.find(
      (o) => o.toLowerCase() === raw.toLowerCase()
    );
    if (!matched) {
      setNameErr(true);
      return;
    }

    if (amount.trim() && !isValidAmount(amount)) { setAmountErr(true); return; }

    const capitalizedName = matched.charAt(0).toUpperCase() + matched.slice(1);

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
    setNameErr(false);
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
                  onFocus={() => setShowSuggest(true)}
                  placeholder="Ingredient name"
                  autoComplete="off"
                  className={`w-full text-xs border rounded-xl px-3 py-2 bg-white focus:outline-none placeholder-gray-300 text-gray-700 h-[34px]
                    ${nameErr
                      ? "border-red-400 focus:border-red-400 ring-1 ring-red-200"
                      : "border-orange-200 focus:border-[#F57600]"}`}
                />
                {nameErr && (
                  <span className="text-[9px] text-red-400 font-semibold leading-tight">
                    Choose an ingredient from the list.
                  </span>
                )}

                {/* Autocomplete — scrollable, max height */}
                {showSuggest && suggestions.length > 0 && (
                  <ul
                    ref={suggestRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-orange-200 rounded-xl shadow-lg z-50 overflow-y-auto"
                    style={{ maxHeight: "180px" }}
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
            ) · Click the ingredient field to browse all options
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