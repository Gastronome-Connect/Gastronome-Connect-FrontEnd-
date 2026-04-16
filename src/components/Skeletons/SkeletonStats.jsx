import React from "react";
import SkeletonLoader from "./SkeletonLoader";

/**
 * SkeletonStats
 * Loading skeleton for statistics cards (admin dashboard)
 */
const SkeletonStats = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i}
          className="bg-white rounded-2xl border border-gray-100 p-5"
          style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)" }}
        >
          {/* Icon */}
          <SkeletonLoader width="40px" height="40px" variant="circle" />
          
          {/* Label */}
          <SkeletonLoader width="80px" height="12px" borderRadius="4px" className="mt-3 mb-2" />
          
          {/* Value */}
          <SkeletonLoader width="100px" height="24px" borderRadius="4px" className="mb-2" />
          
          {/* Change */}
          <SkeletonLoader width="60px" height="12px" borderRadius="3px" />
        </div>
      ))}
    </div>
  );
};

export default SkeletonStats;
