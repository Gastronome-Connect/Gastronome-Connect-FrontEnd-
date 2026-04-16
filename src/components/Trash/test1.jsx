import React from "react";

const PreferencesPanel = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-2">
        <h3 className="text-xl font-bold text-gray-900">Preferences</h3>
        <div className="flex-1 h-[2px] bg-orange-400 mt-1"></div>
      </div>

      {/* Preferences Content Card */}
      <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100">
        {/* Flavor Section */}
        <div className="mb-4">
          <p className="font-bold text-gray-800 mb-3">Flavor:</p>
          <div className="flex flex-wrap gap-2">
            {["Spicy", "Sweet", "Sour", "Bitter"].map((item) => (
              <span 
                key={item} 
                className="px-5 py-1.5 bg-[#FFF2E7] text-gray-800 rounded-full text-sm font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Cooking Style Section */}
        <div className="mb-2">
          <p className="font-bold text-gray-800 mb-3">Cooking Style:</p>
          <div className="flex flex-wrap gap-2">
            {["Frying", "Steam", "Braising"].map((item) => (
              <span 
                key={item} 
                className="px-5 py-1.5 bg-[#FFF2E7] text-gray-800 rounded-full text-sm font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full text-[#1D63FF] font-sfpro font-bold text-sm hover:underline underline-offset-4">
          Edit Preferences
        </button>
      </div>
    </div>
  );
};

export default PreferencesPanel;