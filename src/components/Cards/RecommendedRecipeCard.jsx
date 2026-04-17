import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, ArrowUpRight } from "lucide-react";
import CardExpandedView from "./CardViewer";
import ReportModal from "../Modals/ReportModal";

/**
 * RecommendationCard
 * Props:
 *   recipe    - { id, name, author, img, title, caption, ingredients, avatar, date, mediaItems }
 *   onArchive - (recipe) => void
 *   onReport  - (recipe) => void
 *   onSave    - (recipe, isSaved) => void
 */
const RecommendationCard = ({ recipe, onArchive, onReport, onSave }) => {
  const [expanded, setExpanded] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Normalize to the post shape CardExpandedView expects.
  const post = {
    id:          recipe.id ?? recipe._id,
    _id:         recipe._id,
    title:       recipe.title ?? recipe.name,
    caption:     recipe.caption ?? recipe.description ?? "",
    author:      recipe.author,
    avatar:      recipe.avatar ?? recipe.img,
    date:        recipe.date ?? "",
    ingredients: recipe.ingredients ?? [],
    mediaItems:  recipe.mediaItems ?? [{ type: "image", url: recipe.img }],
  };

  return (
    <>
      <div
        onClick={() => setExpanded(true)}
        className="group/card relative min-w-[160px] max-w-[160px] sm:min-w-[200px] sm:max-w-[200px] md:min-w-[220px] md:max-w-[220px] xl:min-w-[240px] xl:max-w-[240px] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden cursor-pointer"
      >
        <motion.div
          whileHover={{ y: -8 }}
          whileTap={{ scale: 0.97 }}
          className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] border border-gray-50 overflow-hidden flex flex-col transition-shadow duration-500 group-hover/card:shadow-[0_20px_40px_-20px_rgba(0,96,169,0.3)]"
        >
          {/* Image Section */}
          <div className="h-24 sm:h-32 xl:h-40 w-full overflow-hidden relative">
            <img
              src={recipe.img}
              alt={recipe.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
            />

            {/* Floating Author Badge */}
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-white/80 backdrop-blur-md px-2 sm:px-3 py-0.5 sm:py-1 rounded-full flex items-center gap-1 sm:gap-1.5 border border-white/20 shadow-sm">
              <User size={8} className="text-[#F57600] sm:hidden" strokeWidth={3} />
              <User size={10} className="text-[#F57600] hidden sm:block" strokeWidth={3} />
              <span className="text-[8px] sm:text-[9px] font-black text-gray-700 uppercase tracking-tighter truncate max-w-[60px] sm:max-w-none">
                {recipe.author}
              </span>
            </div>

            {/* Arrow on hover */}
            <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-[#0060A9] p-1.5 sm:p-2 rounded-full text-white opacity-0 -translate-y-2 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-300">
              <ArrowUpRight size={11} className="sm:hidden" strokeWidth={3} />
              <ArrowUpRight size={14} className="hidden sm:block" strokeWidth={3} />
            </div>
          </div>

          {/* Content Section */}
          <div className="p-3 sm:p-4 xl:p-5 flex flex-col flex-1 relative bg-white">
            {/* Accent line */}
            <div className="w-6 sm:w-8 h-0.5 sm:h-1 bg-[#F57600] rounded-full mb-2 sm:mb-3 group-hover/card:w-10 sm:group-hover/card:w-12 transition-all duration-500" />

            {/* Title */}
            <h3 className="font-black text-sm sm:text-base xl:text-lg text-[#0060A9] leading-[1.2] mb-1 sm:mb-2 group-hover/card:text-[#00B4FA] transition-colors duration-300 line-clamp-2">
              {recipe.name}
            </h3>

            {/* Description */}
            <p className="hidden sm:block text-[10px] xl:text-[11px] text-gray-500 line-clamp-2 leading-relaxed font-medium">
              Taste the masterpiece by <span className="text-gray-900">{recipe.author}</span>. A perfect blend of tradition and zest.
            </p>

            {/* Bottom Status Row */}
            <div className="mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-gray-50 flex justify-between items-center">
              <span className="text-[9px] sm:text-[10px] font-black text-[#F57600] tracking-widest uppercase">
                Must Try
              </span>
              <div className="flex gap-1">
                <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-blue-100 group-hover/card:bg-[#00B4FA] transition-colors" />
                <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-blue-50" />
              </div>
            </div>
          </div>

          {/* Animated Gradient Bottom Bar */}
          <div className="absolute bottom-0 left-0 w-full h-0.5 sm:h-1 bg-gray-100 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#0060A9] via-[#F57600] to-[#00B4FA]"
              initial={{ x: "-100%" }}
              whileHover={{ x: "0%" }}
              transition={{ duration: 0.5 }}
              style={{ width: "100%" }}
            />
          </div>
        </motion.div>
      </div>

      {expanded && (
        <CardExpandedView
          post={post}
          onClose={() => setExpanded(false)}
          onArchive={() => onArchive?.(recipe)}
          onReport={() => {
            onReport?.(recipe);
            setShowReportModal(true);
          }}
          onSave={(isSaved) => onSave?.(recipe, isSaved)}
        />
      )}

      {showReportModal && (
        <ReportModal
          post={post}
          onConfirm={() => setShowReportModal(false)}
          onCancel={() => setShowReportModal(false)}
        />
      )}
    </>
  );
};

export default RecommendationCard;
