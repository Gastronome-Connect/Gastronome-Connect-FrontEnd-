import React from "react";
import SkeletonLoader from "./SkeletonLoader";

/**
 * SkeletonAdminQuickActions
 * Loading skeleton for admin dashboard quick actions section
 */
const SkeletonAdminQuickActions = () => {
  return (
    <div className="bg-white rounded-2xl p-8 border-2 border-gray-100 shadow-lg">
      {/* Header Skeleton */}
      <div className="mb-6">
        <SkeletonLoader width="200px" height="32px" borderRadius="4px" />
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="p-6 rounded-xl bg-gray-50 border border-gray-100"
          >
            {/* Category Label */}
            <SkeletonLoader
              width="100px"
              height="10px"
              borderRadius="3px"
              className="mb-3"
            />

            {/* Title */}
            <SkeletonLoader
              width="140px"
              height="20px"
              borderRadius="4px"
              className="mb-2"
            />

            {/* Description */}
            <SkeletonLoader
              width="120px"
              height="12px"
              borderRadius="3px"
              className="mt-3"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonAdminQuickActions;
