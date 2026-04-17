import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import RecommendationCard from "../Cards/RecommendedRecipeCard";
import { SkeletonLoader } from "../Skeletons";
import { useUserLibrary } from "../../Context/UserLibraryContext";
import { apiFetch, resolveUploadUrl } from "../../utils/api";

const getSourceLabel = (sourceUrl) => {
  if (!sourceUrl) {
    return "";
  }

  try {
    return new URL(sourceUrl).hostname.replace(/^www\./i, "");
  } catch {
    return sourceUrl;
  }
};

const mapRecommendedRecipe = (recipe) => {
  const image = resolveUploadUrl(recipe?.recipeImg || recipe?.image || "");
  const instructions = recipe?.instructions || recipe?.description || "";

  return {
    id: recipe?.id || recipe?._id,
    _id: recipe?._id || recipe?.id,
    spoonacularId: recipe?.spoonacularId ?? null,
    name: recipe?.recipeName || recipe?.title || "Recipe",
    title: recipe?.recipeName || recipe?.title || "Recipe",
    author: recipe?.sourceName || recipe?.author || "Spoonacular",
    sourceLabel: getSourceLabel(recipe?.sourceUrl || ""),
    img: image,
    image,
    avatar: image,
    caption: instructions,
    description: instructions,
    ingredients: Array.isArray(recipe?.ingredients) ? recipe.ingredients : [],
    date: recipe?.createdAt
      ? new Date(recipe.createdAt).toLocaleDateString()
      : "",
    mediaItems: image
      ? [
          {
            type: "image",
            url: image,
            title: recipe?.recipeName || recipe?.title || "Recipe",
            caption: instructions,
          },
        ]
      : [],
  };
};

/**
 * SkeletonRecommendationCard
 * Matches the exact width, height, and shape of RecommendationCard
 * so the layout doesn't shift when real cards appear.
 */
const SkeletonRecommendationCard = () => (
  <div
    className="flex-shrink-0 min-w-[160px] sm:min-w-[200px] md:min-w-[220px] xl:min-w-[240px] h-[224px] sm:h-[258px] xl:h-[288px]
               rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden bg-white border border-gray-50 shadow-sm"
  >
    {/* Image block */}
    <div className="h-24 sm:h-28 xl:h-36 w-full">
      <SkeletonLoader width="100%" height="100%" borderRadius="0" />
    </div>

    {/* Content block */}
    <div className="p-3 sm:p-4 flex flex-col h-[calc(100%-6rem)] sm:h-[calc(100%-7rem)] xl:h-[calc(100%-9rem)] gap-2">
      {/* Accent line */}
      <SkeletonLoader width="32px" height="4px" borderRadius="9999px" />
      {/* Title */}
      <SkeletonLoader width="80%" height="16px" borderRadius="6px" />
      <SkeletonLoader width="100%" height="11px" borderRadius="4px" />
      <SkeletonLoader width="88%" height="11px" borderRadius="4px" />
      {/* Bottom row */}
      <div className="mt-auto pt-3 border-t border-gray-50 flex justify-between items-center">
        <SkeletonLoader width="72px" height="12px" borderRadius="4px" />
        <div className="flex gap-1">
          <SkeletonLoader width="6px" height="6px" borderRadius="9999px" />
          <SkeletonLoader width="6px" height="6px" borderRadius="9999px" />
        </div>
      </div>
    </div>
  </div>
);

export default function Recommendation() {
  const scrollRef               = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recipes, setRecipes] = useState([]);
  const { isSuppressedByArchive } = useUserLibrary();

  useEffect(() => {
    let cancelled = false;

    const loadDailyPicks = async () => {
      setIsLoading(true);

      try {
        const response = await apiFetch("/api/recipes/daily-picks");
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load daily pick recipes.");
        }

        if (!cancelled) {
          setRecipes(
            Array.isArray(data?.recipes)
              ? data.recipes.map(mapRecommendedRecipe)
              : [],
          );
        }
      } catch (error) {
        if (!cancelled) {
          setRecipes([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadDailyPicks();

    return () => {
      cancelled = true;
    };
  }, []);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    scrollRef.current.scrollTo({
      left: direction === "left"
        ? scrollLeft - clientWidth * 0.8
        : scrollLeft + clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  const visibleRecommendedRecipes = recipes.filter(
    (recipe) => !isSuppressedByArchive(recipe),
  );

  return (
    <section className="w-full relative">
      {/* Header */}
      <div className="px-2">
        <span className="text-[#F57600] text-[10px] sm:text-xs font-black tracking-widest uppercase">
          Daily Picks
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#0060A9] tracking-tight">
          Recommendation
        </h2>
      </div>

      <div className="relative group/slider">
        {/* Left arrow — only when loaded */}
        {!isLoading && (
          <button
            onClick={() => scroll("left")}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-white rounded-full shadow-xl border border-gray-50 text-[#0060A9] hover:bg-[#F57600] hover:text-white transition-all opacity-0 group-hover/slider:opacity-100 focus:outline-none hidden md:block active:scale-90"
          >
            <ChevronLeft size={24} strokeWidth={3} />
          </button>
        )}

        {/*
          Same horizontal scroll container for both states so
          the row height never jumps between skeleton and real cards.
        */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-8 overflow-x-auto py-4 sm:py-6 px-2 scroll-smooth no-scrollbar"
        >
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRecommendationCard key={`skeleton-${i}`} />
              ))
            : visibleRecommendedRecipes.map((recipe, index) => (
                <RecommendationCard key={recipe.id || `recipe-${recipe.name}-${index}`} recipe={recipe} />
              ))
          }
          <div className="min-w-[24px] sm:min-w-[40px] flex-shrink-0" />
        </div>

        {/* Right arrow — only when loaded */}
        {!isLoading && (
          <button
            onClick={() => scroll("right")}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-white rounded-full shadow-xl border border-gray-50 text-[#0060A9] hover:bg-[#F57600] hover:text-white transition-all opacity-0 group-hover/slider:opacity-100 focus:outline-none hidden md:block active:scale-90"
          >
            <ChevronRight size={24} strokeWidth={3} />
          </button>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}
