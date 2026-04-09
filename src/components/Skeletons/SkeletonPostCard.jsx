import React from "react";
import SkeletonLoader from "./SkeletonLoader";

/**
 * SkeletonPostCard
 * Loading skeleton for PostCard component
 * Matches the visual structure of PostCard.jsx
 */
const SkeletonPostCard = () => {
  return (
    <div 
      className="bg-white rounded-3xl border border-gray-100 mb-5 overflow-hidden"
      style={{ boxShadow: "0 4px 24px 0 rgba(245, 118, 0, 0.10), 0 1.5px 6px 0 rgba(245, 118, 0, 0.07)" }}
    >
      {/* Header Skeleton */}
      <div className="p-4 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {/* Avatar */}
            <SkeletonLoader width="40px" height="40px" variant="circle" />
            
            {/* Header Info */}
            <div className="flex-1 space-y-2">
              <SkeletonLoader width="120px" height="14px" borderRadius="4px" />
              <SkeletonLoader width="100px" height="12px" borderRadius="4px" />
            </div>
          </div>
          
          {/* Menu Button */}
          <SkeletonLoader width="32px" height="32px" variant="circle" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 space-y-4">
        {/* Description Text */}
        <div className="space-y-2">
          <SkeletonLoader width="100%" height="14px" borderRadius="4px" />
          <SkeletonLoader width="95%" height="14px" borderRadius="4px" />
          <SkeletonLoader width="80%" height="14px" borderRadius="4px" />
        </div>

        {/* Image Placeholder */}
        <SkeletonLoader width="100%" height="300px" borderRadius="12px" />
      </div>

      {/* Actions Skeleton */}
      <div className="px-4 py-3 border-t border-gray-100 flex justify-around">
        <SkeletonLoader width="60px" height="20px" borderRadius="4px" />
        <SkeletonLoader width="60px" height="20px" borderRadius="4px" />
        <SkeletonLoader width="60px" height="20px" borderRadius="4px" />
        <SkeletonLoader width="60px" height="20px" borderRadius="4px" />
      </div>
    </div>
  );
};

export default SkeletonPostCard;
