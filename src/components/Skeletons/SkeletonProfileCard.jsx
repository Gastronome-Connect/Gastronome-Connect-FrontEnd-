import React from "react";
import SkeletonLoader from "./SkeletonLoader";

/**
 * SkeletonProfileCard
 * Loading skeleton for profile/account sections
 */
const SkeletonProfileCard = ({ variant = "default" }) => {
  if (variant === "header") {
    return (
      <div className="bg-gradient-to-b from-blue-50 to-white rounded-3xl p-6 mb-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Cover Photo Skeleton */}
          <SkeletonLoader width="100%" height="200px" borderRadius="12px" />
          
          {/* Avatar */}
          <div className="flex justify-center -mt-16">
            <SkeletonLoader 
              width="120px" 
              height="120px" 
              variant="circle"
              className="border-4 border-white"
            />
          </div>

          {/* Profile Info */}
          <div className="space-y-2 w-full">
            <SkeletonLoader width="200px" height="24px" borderRadius="6px" />
            <SkeletonLoader width="280px" height="14px" borderRadius="4px" />
          </div>

          {/* Bio */}
          <div className="space-y-1 w-full pt-2">
            <SkeletonLoader width="100%" height="12px" borderRadius="4px" />
            <SkeletonLoader width="90%" height="12px" borderRadius="4px" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <SkeletonLoader width="120px" height="18px" borderRadius="4px" />
        <SkeletonLoader width="60px" height="24px" borderRadius="6px" />
      </div>
      
      <div className="space-y-2">
        <SkeletonLoader width="100%" height="14px" borderRadius="4px" />
        <SkeletonLoader width="85%" height="14px" borderRadius="4px" />
      </div>
    </div>
  );
};

export default SkeletonProfileCard;
