import React, { useState, useEffect } from "react";
import { Flame } from "lucide-react";
import PopularRecipeCard from "../Cards/PopularRecipeCard";
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

const mapWeeklyRecipe = (recipe) => {
  const image = resolveUploadUrl(recipe?.recipeImg || recipe?.image || "");
  const instructions = recipe?.instructions || recipe?.description || "";
  const sourceLabel = getSourceLabel(recipe?.sourceUrl || "");

  return {
    id: recipe?.id || recipe?._id,
    _id: recipe?._id || recipe?.id,
    name: recipe?.recipeName || recipe?.title || "Recipe",
    title: recipe?.recipeName || recipe?.title || "Recipe",
    author: recipe?.sourceName || recipe?.author || "Spoonacular",
    sourceLabel,
    img: image,
    image,
    avatar: image,
    caption: instructions,
    description: instructions,
    ingredients: Array.isArray(recipe?.ingredients) ? recipe.ingredients : [],
    date: recipe?.weeklyTop?.syncedAt
      ? new Date(recipe.weeklyTop.syncedAt).toLocaleDateString()
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

// Skeleton row that mirrors PopularRecipeCard's layout
const SkeletonPopularRow = () => (
  <div className="flex items-center gap-4 p-3 rounded-[22px] border border-transparent">
    {/* Rank */}
    <SkeletonLoader width="20px" height="14px" borderRadius="4px" />
    {/* Thumbnail */}
    <SkeletonLoader width="56px" height="56px" borderRadius="16px" />
    {/* Text */}
    <div className="flex-1 flex flex-col gap-1.5">
      <SkeletonLoader width="70%" height="14px" borderRadius="4px" />
      <SkeletonLoader width="50%" height="11px" borderRadius="4px" />
    </div>
  </div>
);

export default function PopularRecipes() {
  const [isLoading, setIsLoading] = useState(true);
  const [recipes, setRecipes] = useState([]);
  const { isSuppressedByArchive } = useUserLibrary();

  useEffect(() => {
    let cancelled = false;

    const loadWeeklyRecipes = async () => {
      setIsLoading(true);

      try {
        const response = await apiFetch("/api/recipes/weekly-top");
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data?.message || "Failed to load weekly top recipes.",
          );
        }

        if (!cancelled) {
          setRecipes(
            Array.isArray(data?.recipes)
              ? data.recipes.map(mapWeeklyRecipe)
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

    loadWeeklyRecipes();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleRecipes = recipes.filter(
    (recipe) => !isSuppressedByArchive(recipe),
  );

  return (
    <div className="bg-white p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 flex flex-col h-full min-h-0 shadow-[0_20px_40px_-15px_rgba(0,96,169,0.08)] relative overflow-hidden">
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#0060A9]/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#F57600]/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-end mb-4 sm:mb-8 px-1 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame size={14} className="text-[#F57600] animate-pulse" />
            <span className="text-[#F57600] text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">
              Weekly Top 10
            </span>
          </div>
          <h3 className="font-black text-2xl sm:text-3xl text-[#0060A9] tracking-tighter leading-none">
            Popular Recipes
          </h3>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-2 sm:pr-3 custom-scrollbar space-y-2 sm:space-y-3 relative z-10">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <SkeletonPopularRow key={i} />
            ))
          : visibleRecipes.map((recipe, index) => (
              <PopularRecipeCard
                key={recipe.id || recipe._id || index}
                recipe={recipe}
                index={index}
              />
            ))}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 20px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: #cbd5e1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #0060a9;
        }
      `}</style>
    </div>
  );
}
