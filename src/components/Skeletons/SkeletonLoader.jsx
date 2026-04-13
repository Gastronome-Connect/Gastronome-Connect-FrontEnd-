import React from "react";

/**
 * SkeletonLoader
 * Base skeleton component with Facebook-style shimmer animation.
 * All other skeleton components use this as their base — updating
 * this file automatically updates every skeleton in the app.
 */
const SkeletonLoader = ({
  width = "100%",
  height = "20px",
  borderRadius = "8px",
  className = "",
  variant = "default", // "default" | "circle" | "rect"
}) => {
  const isCircle = variant === "circle";

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -800px 0; }
          100% { background-position:  800px 0; }
        }
        .skeleton-shimmer {
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 37%,
            #f0f0f0 63%
          );
          background-size: 800px 100%;
          animation: shimmer 1.4s ease infinite;
        }
      `}</style>
      <div
        className={`skeleton-shimmer ${className}`}
        style={{
          width:        isCircle ? height : width, // keep circle square
          height,
          borderRadius: isCircle ? "50%" : borderRadius,
          flexShrink:   0,
        }}
      />
    </>
  );
};

export default SkeletonLoader;