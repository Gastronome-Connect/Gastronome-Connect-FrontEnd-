import React from "react";
import SkeletonLoader from "./SkeletonLoader";

/**
 * SkeletonChatbot
 * Loading skeleton for ChatbotWidget component
 */
const SkeletonChatbot = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={{ boxShadow: "0 4px 24px 0 rgba(245, 118, 0, 0.10)" }}>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
        <SkeletonLoader width="120px" height="18px" borderRadius="4px" />
      </div>

      {/* Chat Messages */}
      <div className="p-4 space-y-4 h-80">
        {/* Bot Message */}
        <div className="flex justify-start">
          <SkeletonLoader width="70%" height="60px" borderRadius="8px" />
        </div>

        {/* User Message */}
        <div className="flex justify-end">
          <SkeletonLoader width="60%" height="50px" borderRadius="8px" />
        </div>

        {/* Bot Message */}
        <div className="flex justify-start">
          <SkeletonLoader width="75%" height="70px" borderRadius="8px" />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex gap-2">
          <SkeletonLoader width="100%" height="40px" borderRadius="8px" />
          <SkeletonLoader width="40px" height="40px" borderRadius="6px" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonChatbot;
