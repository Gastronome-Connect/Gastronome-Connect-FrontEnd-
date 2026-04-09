import React from "react";
import SkeletonLoader from "./SkeletonLoader";

/**
 * SkeletonGridCards
 * Generic grid skeleton for card layouts (recipes, articles, etc)
 */
const SkeletonGridCards = ({ columns = 3, count = 6 }) => {
  const gridClassName = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  }[columns] || "grid-cols-3";

  return (
    <div className={`grid ${gridClassName} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="bg-white rounded-2xl overflow-hidden border border-gray-100"
          style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)" }}
        >
          {/* Image */}
          <SkeletonLoader width="100%" height="200px" borderRadius="0" />

          {/* Content */}
          <div className="p-4 space-y-3">
            <SkeletonLoader width="85%" height="16px" borderRadius="4px" />
            <div className="space-y-1.5">
              <SkeletonLoader width="100%" height="12px" borderRadius="3px" />
              <SkeletonLoader width="70%" height="12px" borderRadius="3px" />
            </div>
            <div className="flex gap-2 pt-2">
              <SkeletonLoader width="40px" height="14px" borderRadius="3px" />
              <SkeletonLoader width="50px" height="14px" borderRadius="3px" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonGridCards;
