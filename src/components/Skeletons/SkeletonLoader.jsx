import React from "react";

/**
 * SkeletonLoader
 * Base skeleton component with pulse animation
 * Usage: <SkeletonLoader width="100%" height="200px" borderRadius="12px" />
 */
const SkeletonLoader = ({
  width = "100%",
  height = "20px",
  borderRadius = "8px",
  className = "",
  variant = "default", // default, circle, rect
}) => {
  const baseStyles = {
    width,
    height,
    borderRadius,
    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
  };

  const variantStyles = {
    default: { backgroundColor: "#e5e7eb" }, // gray-200
    circle: {
      borderRadius: "50%",
      backgroundColor: "#e5e7eb",
      width: height, // Make circle square
    },
    rect: { backgroundColor: "#e5e7eb" },
  };

  const animationKeyframes = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `;

  return (
    <>
      <style>{animationKeyframes}</style>
      <div
        className={className}
        style={{
          ...baseStyles,
          ...variantStyles[variant],
        }}
      />
    </>
  );
};

export default SkeletonLoader;
