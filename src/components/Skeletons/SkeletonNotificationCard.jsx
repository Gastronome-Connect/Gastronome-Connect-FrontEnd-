import React from "react";
import SkeletonLoader from "./SkeletonLoader";

/**
 * SkeletonNotificationCard
 * Loading skeleton for NotificationCard component
 */
const SkeletonNotificationCard = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <SkeletonLoader width="40px" height="40px" variant="circle" />
        
        {/* Content */}
        <div className="flex-1 space-y-2">
          <SkeletonLoader width="180px" height="14px" borderRadius="4px" />
          <SkeletonLoader width="120px" height="12px" borderRadius="4px" />
        </div>

        {/* Timestamp & Action */}
        <div className="flex flex-col items-end gap-2">
          <SkeletonLoader width="80px" height="12px" borderRadius="4px" />
          <SkeletonLoader width="24px" height="24px" variant="circle" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonNotificationCard;
