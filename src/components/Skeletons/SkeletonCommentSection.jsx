import React from "react";
import SkeletonLoader from "./SkeletonLoader";

/**
 * SkeletonCommentSection
 * Loading skeleton for post comments
 */
const SkeletonCommentSection = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {/* Comment Input */}
      <div className="flex gap-3 mb-6">
        <SkeletonLoader width="40px" height="40px" variant="circle" />
        <SkeletonLoader width="100%" height="40px" borderRadius="8px" />
      </div>

      {/* Comments List */}
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-start gap-3">
            <SkeletonLoader width="32px" height="32px" variant="circle" />
            <div className="flex-1">
              <SkeletonLoader width="120px" height="12px" borderRadius="3px" className="mb-1" />
              <SkeletonLoader width="100%" height="14px" borderRadius="4px" />
            </div>
          </div>
          {i < count - 1 && <div className="border-b border-gray-100 mt-3" />}
        </div>
      ))}
    </div>
  );
};

export default SkeletonCommentSection;
