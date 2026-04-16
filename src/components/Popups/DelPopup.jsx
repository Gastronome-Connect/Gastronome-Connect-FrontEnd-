import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const DeleteAccountPopup = ({
  isOpen,
  onCancel,
  onConfirm,
  loading,
  error,
}) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleCancel = () => {
    setPassword("");
    setShowPassword(false);
    onCancel();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-red-950/20 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden border border-red-100"
          >
            <div className="bg-red-600 text-white text-center py-10 px-6">
              <ShieldAlert size={40} className="mx-auto mb-3" />
              <h2 className="text-xl font-black tracking-tight uppercase">
                Delete Account
              </h2>
            </div>

            <div className="p-8">
              <p className="text-gray-500 text-xs text-center leading-relaxed mb-6">
                This will schedule your account for deletion and disable access.
                It will be permanently deleted after 30 days.
              </p>

              {/* Password field with eye toggle */}
              <div className="relative mb-2">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm with Password"
                  className={`w-full border-2 rounded-2xl p-4 pr-12 text-sm focus:outline-none transition-all bg-gray-50
                    ${error ? "border-red-400 focus:border-red-500" : "border-gray-100 focus:border-red-600"}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  {showPassword ? (
                    <FaEyeSlash size={15} />
                  ) : (
                    <FaEye size={15} />
                  )}
                </button>
              </div>

              {/* Error message — inline under the input */}
              <div className="mb-5 min-h-[20px]">
                {error && (
                  <p className="text-red-500 text-[11px] font-black uppercase tracking-wide text-center">
                    ✕ {error}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={password ? { scale: 1.02 } : {}}
                  whileTap={password ? { scale: 0.98 } : {}}
                  disabled={loading || !password}
                  onClick={() => onConfirm(password)}
                  className={`w-full py-4 rounded-2xl text-white font-black text-xs tracking-widest transition-all
                    ${!password ? "bg-gray-200 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 shadow-xl shadow-red-100"}`}
                >
                  {loading
                    ? "SCHEDULING DELETION..."
                    : "SCHEDULE ACCOUNT DELETION"}
                </motion.button>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteAccountPopup;
