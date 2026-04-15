import React from "react";
import SkeletonLoader from "./SkeletonLoader";

/**
 * SkeletonPostList
 * Loading skeleton for a list of posts/feed
 */
const SkeletonPostList = ({ count = 3 }) => {
  return (
    <div className="space-y-5">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i}
          className="bg-white rounded-3xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 4px 24px 0 rgba(245, 118, 0, 0.10)" }}
        >
          {/* Header */}
          <div className="p-4 pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <SkeletonLoader width="40px" height="40px" variant="circle" />
                <div className="flex-1 space-y-1.5">
                  <SkeletonLoader width="100px" height="12px" borderRadius="4px" />
                  <SkeletonLoader width="80px" height="10px" borderRadius="3px" />
                </div>
              </div>
              <SkeletonLoader width="28px" height="28px" variant="circle" />
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <div className="space-y-1.5">
              <SkeletonLoader width="100%" height="12px" borderRadius="3px" />
              <SkeletonLoader width="95%" height="12px" borderRadius="3px" />
            </div>
            <SkeletonLoader width="100%" height="250px" borderRadius="10px" />
          </div>

          {/* Actions */}
          <div className="px-4 py-2 border-t border-gray-100 flex justify-around">
            {[1, 2, 3, 4].map((j) => (
              <SkeletonLoader key={`action-${i}-${j}`} width="50px" height="16px" borderRadius="3px" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonPostList;
