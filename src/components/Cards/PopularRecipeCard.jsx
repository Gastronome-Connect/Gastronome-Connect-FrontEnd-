import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Trophy } from "lucide-react";
import SparkleEffect from "./SparkleEffect";
import CardExpandedView from "./CardViewer";

/**
 * getPodiumStyles - returns styling config for top 3 ranks, null for the rest
 */
export const getPodiumStyles = (index) => {
  switch (index) {
    case 0: return {
      bg:           "bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-transparent",
      border:       "border-yellow-400/50",
      glow:         "shadow-[0_0_20px_rgba(234,179,8,0.25)]",
      text:         "text-yellow-600",
      trophyClass:  "text-yellow-500 animate-bounce",
      sparkleColor: "#EAB308",
    };
    case 1: return {
      bg:           "bg-gradient-to-r from-slate-400/10 via-slate-400/5 to-transparent",
      border:       "border-slate-300",
      glow:         "shadow-[0_0_20px_rgba(148,163,184,0.2)]",
      text:         "text-slate-500",
      trophyClass:  "text-slate-400",
      sparkleColor: "#94A3B8",
    };
    case 2: return {
      bg:           "bg-gradient-to-r from-orange-700/10 via-orange-700/5 to-transparent",
      border:       "border-orange-600/30",
      glow:         "shadow-[0_0_20px_rgba(194,65,12,0.15)]",
      text:         "text-orange-700",
      trophyClass:  "text-orange-600",
      sparkleColor: "#C2410C",
    };
    default: return null;
  }
};

/**
 * PopularRecipeCard
 * Props:
 *   recipe  - { id, name, author, img, title, caption, ingredients, avatar, date, mediaItems }
 *   index   - position in list (0-based)
 *   onArchive - (recipe) => void
 *   onReport  - (recipe) => void
 *   onSave    - (recipe, isSaved) => void
 */
const PopularRecipeCard = ({ recipe, index, onArchive, onReport, onSave }) => {
  const [expanded, setExpanded] = useState(false);
  const podium = getPodiumStyles(index);
  const rank   = index + 1;

  // Normalize recipe shape for CardExpandedView.
  const post = {
    id:          recipe.id,
    title:       recipe.title    ?? recipe.name,
    caption:     recipe.caption  ?? recipe.description ?? "",
    author:      recipe.author,
    avatar:      recipe.avatar   ?? recipe.img,
    date:        recipe.date     ?? "",
    ingredients: recipe.ingredients ?? [],
    mediaItems:  recipe.mediaItems  ?? [{ type: "image", url: recipe.img }],
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06, duration: 0.3, ease: "easeOut" }}
        whileHover={podium ? { scale: 1.04, x: 5, y: -3 } : { scale: 1.01, x: 4 }}
        onClick={() => setExpanded(true)}
        className={`flex items-center gap-4 p-3 rounded-[22px] transition-all duration-500 group cursor-pointer border relative
          ${podium
            ? `${podium.bg} ${podium.border} ${podium.glow}`
            : "bg-white border-transparent hover:border-gray-50 hover:shadow-md"
          }`}
      >
        {/* Sparkles for top 3 */}
        {podium && (
          <>
            <div className="absolute top-2 left-10">
              <SparkleEffect color={podium.sparkleColor} />
            </div>
            <div className="absolute bottom-2 right-20">
              <SparkleEffect color={podium.sparkleColor} />
            </div>
          </>
        )}

        {/* Rank */}
        <div className="flex-shrink-0 w-8 flex flex-col items-center relative">
          {podium && (
            <Trophy size={14} className={`mb-0.5 ${podium.trophyClass}`} />
          )}
          <span className={`text-sm font-black transition-colors
            ${podium ? podium.text : "text-gray-300 group-hover:text-[#0060A9]"}`}>
            {rank}
          </span>
        </div>

        {/* Thumbnail */}
        <div className={`relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shadow-sm border-2
          ${podium ? podium.border : "border-white"}`}>
          <img
            src={recipe.img}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            alt={recipe.name}
          />
          {podium && (
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20 pointer-events-none" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 relative z-10">
          <h4 className={`font-black text-sm sm:text-base truncate transition-colors leading-tight
            ${podium ? "text-gray-900" : "text-gray-800 group-hover:text-[#0060A9]"}`}>
            {recipe.name}
          </h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`text-[9px] font-black uppercase tracking-tighter
              ${podium ? podium.text : "text-[#00B4FA]"}`}>
              Chef
            </span>
            <p className="text-[11px] text-gray-500 font-bold truncate">{recipe.author}</p>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <div className="bg-[#0060A9] p-2 rounded-xl text-white shadow-lg shadow-[#0060A9]/30">
            <ChevronRight size={14} strokeWidth={3} />
          </div>
        </div>
      </motion.div>

      {expanded && (
        <CardExpandedView
          post={post}
          onClose={() => setExpanded(false)}
          onArchive={() => onArchive?.(recipe)}
          onReport={() => onReport?.(recipe)}
          onSave={(isSaved) => onSave?.(recipe, isSaved)}
        />
      )}
    </>
  );
};

export default PopularRecipeCard;