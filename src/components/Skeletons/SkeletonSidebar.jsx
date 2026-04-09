import React from "react";
import SkeletonLoader from "./SkeletonLoader";

/**
 * SkeletonSidebar
 * Loading skeleton for sidebar navigation
 */
const SkeletonSidebar = ({ itemCount = 8 }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
      {/* Logo/Header */}
      <SkeletonLoader width="120px" height="28px" borderRadius="6px" />

      {/* Nav Items */}
      <div className="space-y-2 pt-4">
        {Array.from({ length: itemCount }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <SkeletonLoader width="24px" height="24px" borderRadius="4px" />
            <SkeletonLoader width="120px" height="14px" borderRadius="4px" />
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4" />

      {/* Bottom Section */}
      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <SkeletonLoader width="24px" height="24px" borderRadius="4px" />
            <SkeletonLoader width="100px" height="14px" borderRadius="4px" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonSidebar;
