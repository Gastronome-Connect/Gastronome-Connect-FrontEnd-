import React from "react";
import SkeletonLoader from "./SkeletonLoader";

/**
 * SkeletonFeedHero
 * Loading skeleton for FeedHeroBanner component
 */
const SkeletonFeedHero = () => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden mb-6"
      style={{ boxShadow: "0 4px 24px 0 rgba(245, 118, 0, 0.10)" }}>
      
      {/* Banner Image */}
      <SkeletonLoader width="100%" height="300px" borderRadius="0" />
      
      {/* Content Overlay Area */}
      <div className="p-6 space-y-4">
        <SkeletonLoader width="60%" height="28px" borderRadius="6px" />
        <div className="space-y-2">
          <SkeletonLoader width="100%" height="14px" borderRadius="4px" />
          <SkeletonLoader width="95%" height="14px" borderRadius="4px" />
          <SkeletonLoader width="70%" height="14px" borderRadius="4px" />
        </div>
        <SkeletonLoader width="150px" height="40px" borderRadius="8px" />
      </div>
    </div>
  );
};

export default SkeletonFeedHero;
