import React from "react";
import SkeletonLoader from "./SkeletonLoader";

/**
 * SkeletonAdminCardList
 * Loading skeleton for admin moderation lists (posts, comments, users, accounts)
 */
const SkeletonAdminCardList = ({ count = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border-2 border-gray-100 p-4 shadow-sm"
        >
          <div className="flex gap-4">
            {/* Avatar/Icon */}
            <SkeletonLoader width="50px" height="50px" variant="circle" />

            {/* Content */}
            <div className="flex-1 space-y-3">
              {/* Title/Author */}
              <SkeletonLoader width="200px" height="14px" borderRadius="4px" />

              {/* Subtitle/Email */}
              <SkeletonLoader width="150px" height="12px" borderRadius="3px" />

              {/* Description/Preview */}
              <div className="space-y-2">
                <SkeletonLoader
                  width="100%"
                  height="12px"
                  borderRadius="3px"
                />
                <SkeletonLoader
                  width="80%"
                  height="12px"
                  borderRadius="3px"
                />
              </div>

              {/* Metadata Row */}
              <div className="flex gap-4 pt-2">
                <SkeletonLoader width="80px" height="11px" borderRadius="3px" />
                <SkeletonLoader width="100px" height="11px" borderRadius="3px" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <SkeletonLoader width="70px" height="32px" borderRadius="6px" />
              <SkeletonLoader width="70px" height="32px" borderRadius="6px" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonAdminCardList;
