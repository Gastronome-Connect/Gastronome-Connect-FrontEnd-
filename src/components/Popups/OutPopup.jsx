import React from "react";
import Check from "../Assets/TickSquare.png";

const OutPopup = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header - Blue */}
        <div className="bg-[#0060A9] text-white text-center py-8 px-6">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <img src={Check} alt="Logout Icon" className="w-7 h-7 brightness-0 invert" />
          </div>
          <h2 className="text-xl font-black tracking-tight uppercase tracking-widest">Logout</h2>
        </div>

        {/* Body */}
        <div className="p-8 text-center">
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Do you really want to logout of your account?
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              className="w-full py-4 rounded-2xl bg-red-500 text-white font-black text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-100 active:scale-95"
            >
              LOGOUT
            </button>
            <button
              onClick={onCancel}
              className="w-full py-4 rounded-2xl bg-gray-50 text-gray-400 font-bold text-sm hover:bg-gray-100 transition-all"
            >
              BACK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutPopup;