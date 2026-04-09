import React from "react";
import SkeletonLoader from "./SkeletonLoader";

/**
 * SkeletonRecipeCard
 * Loading skeleton for RecipeCard component
 * Matches the visual structure of RecipeCard.jsx
 */
const SkeletonRecipeCard = () => {
  return (
    <div className="group relative bg-white rounded-2xl lg:rounded-3xl overflow-hidden border border-gray-100/50 w-full"
      style={{ boxShadow: "0 10px 30px -15px rgba(0, 96, 169, 0.2)" }}>
      
      {/* Image Skeleton */}
      <div className="h-28 lg:h-24 xl:h-36 2xl:h-44 relative overflow-hidden">
        <SkeletonLoader width="100%" height="100%" borderRadius="0" />
        
        {/* Action Button Skeleton */}
        <div className="absolute top-3 right-3 z-10">
          <SkeletonLoader 
            width="32px" 
            height="32px" 
            variant="circle"
          />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-3 lg:p-4 space-y-2">
        {/* Title */}
        <SkeletonLoader width="70%" height="18px" borderRadius="6px" />
        
        {/* Author & Date Row */}
        <div className="flex justify-between items-center pt-1">
          <div className="flex items-center gap-2 flex-1">
            <SkeletonLoader width="24px" height="24px" variant="circle" />
            <SkeletonLoader width="40%" height="14px" borderRadius="4px" />
          </div>
          <SkeletonLoader width="30%" height="14px" borderRadius="4px" />
        </div>

        {/* Description */}
        <div className="space-y-1.5 pt-2">
          <SkeletonLoader width="100%" height="12px" borderRadius="4px" />
          <SkeletonLoader width="85%" height="12px" borderRadius="4px" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonRecipeCard;
