import React from "react";
import SkeletonLoader from "./SkeletonLoader";

/**
 * SkeletonRecommendation
 * Loading skeleton for Recommendation component
 */
const SkeletonRecommendation = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      <SkeletonLoader width="200px" height="24px" borderRadius="6px" />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
            {/* Image */}
            <SkeletonLoader width="100%" height="180px" borderRadius="0" />
            
            {/* Info */}
            <div className="p-3 space-y-2">
              <SkeletonLoader width="80%" height="16px" borderRadius="4px" />
              <SkeletonLoader width="60%" height="12px" borderRadius="4px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonRecommendation;
