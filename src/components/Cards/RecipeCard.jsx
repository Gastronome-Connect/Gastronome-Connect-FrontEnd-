import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Calendar, Heart, Archive, ChevronRight, X } from "lucide-react";
import CardExpandedView from "./CardViewer";

const RecipeCard = ({ recipe, onDelete, variant, onArchive, onReport, onSave }) => {
  const [expanded, setExpanded] = useState(false);

  const {
    title: recipeTitle,
    author,
    dateCreate,
    date,
    savedAt,
    description,
    caption,
    mediaItems = [],
  } = recipe || {};

  // ── Pick the first media item that has an image/video ──
  const firstMedia = mediaItems.find((m) => m.url) ?? null;
  const image = firstMedia?.url ?? recipe?.image ?? "";

  // ── Pick the first media item that has a title or caption ──
  const firstWithContent = mediaItems.length > 1
    ? mediaItems.find((m) => m.title || m.caption)
    : null;

  const title = firstWithContent?.title ?? recipeTitle;
  const resolvedDescription =
    firstWithContent?.caption ??
    caption ??
    description ??
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit...";

  const resolvedDate = savedAt
    ? new Date(savedAt).toLocaleDateString()
    : (dateCreate ?? date ?? "01/10/01");

  const colors = {
    blue:        "#0060A9",
    lightBlue:   "#00B4FA",
    orange:      "#F57600",
    lightOrange: "#F0AE35",
  };

  const post = {
    id:          recipe?.id ?? recipe?._id,
    _id:         recipe?._id,
    title,
    caption:     resolvedDescription,
    author,
    avatar:      recipe?.avatar ?? image,
    date:        resolvedDate,
    ingredients: recipe?.ingredients ?? [],
    mediaItems:  mediaItems.length > 0
                   ? mediaItems
                   : (image ? [{ type: "image", url: image }] : []),
  };

  return (
    <>
      <motion.div
        layout="position"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.15 } }}
        whileHover={{ y: -4 }}
        transition={{
          type: "spring", stiffness: 300, damping: 20,
          layout: { type: "spring", stiffness: 260, damping: 28, mass: 1 },
        }}
        onClick={() => setExpanded(true)}
        className="group relative bg-white rounded-2xl lg:rounded-3xl overflow-hidden cursor-pointer border border-gray-100/50 w-full"
        style={{ boxShadow: "0 10px 30px -15px rgba(0, 96, 169, 0.2)" }}
      >
        {/* IMAGE SECTION */}
        <div className="relative h-28 lg:h-24 xl:h-36 2xl:h-44 overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${colors.lightBlue}20, ${colors.blue}20)` }}
            >
              <Archive size={40} style={{ color: colors.blue }} strokeWidth={1} opacity={0.3} />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Action Button */}
          <div className="absolute top-3 right-3 z-10">
            {variant === "favorite" ? (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                className="p-1.5 lg:p-1.5 xl:p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-90
                           bg-red-500 text-white hover:bg-white/90 hover:text-red-500"
              >
                <Heart size={14} className="xl:size-[18px]" fill="currentColor" />
              </button>
            ) : variant === "archive" ? (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                className="p-1.5 lg:p-1.5 xl:p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-90 text-white"
                style={{ backgroundColor: colors.orange }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.9)";
                  e.currentTarget.style.color = colors.orange;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.orange;
                  e.currentTarget.style.color = "white";
                }}
              >
                <Archive size={14} className="xl:size-[18px]" />
              </button>
            ) : (
              onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                  className="p-1.5 xl:p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-90 bg-white/90 text-gray-400 hover:bg-red-500 hover:text-white"
                >
                  <X size={14} className="xl:size-[18px]" />
                </button>
              )
            )}
          </div>
        </div>

        {/* CONTENT SECTION */}
        <div className="p-2.5 xl:p-5 relative">
          <div
            className="absolute -top-2.5 left-3 xl:left-5 px-2 xl:px-3 py-0.5 xl:py-1 rounded-full text-[8px] xl:text-[10px] font-bold uppercase tracking-widest text-white shadow-lg"
            style={{ background: `linear-gradient(90deg, ${colors.orange}, ${colors.lightOrange})` }}
          >
            Recipe
          </div>

          <h3
            className="text-xs xl:text-lg font-extrabold mb-0.5 xl:mb-2 line-clamp-1 transition-colors duration-300"
            style={{ color: colors.blue }}
          >
            {title}
          </h3>

          <p className="text-gray-500 text-[9px] xl:text-xs leading-relaxed line-clamp-2 mb-2 xl:mb-4">
            {resolvedDescription}
          </p>

          <div className="h-px w-full bg-gray-100 mb-2 xl:mb-4" />

          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5 xl:gap-1">
              <div className="flex items-center gap-1 xl:gap-2">
                <div className="p-0.5 xl:p-1 rounded-md bg-blue-50">
                  <User size={9} style={{ color: colors.blue }} className="xl:size-3 transition-all duration-500 group-hover:drop-shadow-[0_0_4px_rgba(0,180,250,0.8)]" />
                </div>
                <span className="text-[9px] xl:text-xs font-semibold text-gray-700">{author}</span>
              </div>
              <div className="flex items-center gap-1 xl:gap-2">
                <div className="p-0.5 xl:p-1 rounded-md bg-orange-50">
                  <Calendar size={9} style={{ color: colors.orange }} className="xl:size-3 transition-all duration-500 group-hover:drop-shadow-[0_0_4px_rgba(245,118,0,0.8)]" />
                </div>
                <span className="text-[8px] xl:text-[10px] font-medium text-gray-400">{resolvedDate}</span>
              </div>
            </div>

            <div
              className="w-6 h-6 xl:w-8 xl:h-8 rounded-full flex items-center justify-center transition-all group-hover:translate-x-1"
              style={{ backgroundColor: `${colors.blue}10` }}
            >
              <ChevronRight size={12} style={{ color: colors.blue }} className="xl:size-[18px] transition-all duration-300 group-hover:drop-shadow-[0_0_5px_rgba(0,180,250,0.8)]" />
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: `linear-gradient(90deg, ${colors.blue}, ${colors.orange})` }}
        />
      </motion.div>

      {expanded && (
        <CardExpandedView
          post={post}
          onClose={() => setExpanded(false)}
          onArchive={() => onArchive?.(recipe)}
          onReport={() => onReport?.(recipe)}
          onSave={(isSaved) => onSave?.(recipe, isSaved)}
          hideFavoriteAndOptions
        />
      )}
    </>
  );
};

export default RecipeCard;

export const RecipeGrid = ({ recipes, onDelete, variant, onArchive, onReport, onSave }) => {
  return (
    <div className="overflow-hidden">
      <motion.div
        layout
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 xl:gap-4"
      >
        <AnimatePresence mode="popLayout">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              variant={variant}
              onDelete={() => onDelete?.(recipe.id)}
              onArchive={onArchive}
              onReport={onReport}
              onSave={onSave}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};