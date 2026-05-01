import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import LogoImage from "../components/Assets/Gastro.png";
import BackgroundCarousel from "../components/Carousel Background/BackgroundCarousel";
import { buildApiUrl } from "../utils/api";

const STYLES = `
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0px); }
  }
  .content-in { animation: fadeSlideIn 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  * { scrollbar-width: none; }
  *::-webkit-scrollbar { display: none; }
  button:focus { outline: none !important; box-shadow: none !important; }
  button:focus-visible { outline: none !important; box-shadow: none !important; }
`;

const isMobile = () => window.innerWidth < 640;

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [error, setError] = useState("");
  const [mobile, setMobile] = useState(isMobile());

  const navigate = useNavigate();
  const pendingEmail = sessionStorage.getItem("pendingEmail") || "";
  const isResetSessionVerified =
    sessionStorage.getItem("resetPasswordEmailVerified") === "true";

  React.useEffect(() => {
    const onResize = () => setMobile(isMobile());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const validateNewPassword = () => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_])[A-Za-z\d@$!%*?&#_]{8,}$/;
    if (!newPassword) {
      setNewPasswordError("Password is required");
      return false;
    }
    if (!passwordRegex.test(newPassword)) {
      setNewPasswordError(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      );
      return false;
    }
    setNewPasswordError("");
    return true;
  };

  const validateConfirmPassword = () => {
    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isNewPasswordValid = validateNewPassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    if (isNewPasswordValid && isConfirmPasswordValid) {
      setShowConfirmationModal(true);
    }
  };

  const handleConfirmPasswordReset = async () => {
    setLoading(true);
    setError("");

    try {
      if (!pendingEmail || !isResetSessionVerified) {
        throw new Error(
          "Reset session expired. Please request a new reset code.",
        );
      }

      const response = await fetch(buildApiUrl("/api/reset-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: pendingEmail,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      sessionStorage.removeItem("pendingEmail");
      sessionStorage.removeItem("sourceFlow");
      sessionStorage.removeItem("resetPasswordEmailVerified");

      navigate("/login", {
        state: {
          successMessage:
            "Password reset successful. Please login with your new password.",
        },
        replace: true,
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      setError(error.message || "Failed to reset password. Please try again.");
      setShowConfirmationModal(false);
    } finally {
      setLoading(false);
    }
  };

  const panelStyle = mobile
    ? {
        width: "calc(100vw - 32px)",
        maxWidth: "480px",
        height: "auto",
        minHeight: "calc(100vh - 32px)",
        maxHeight: "calc(100vh - 32px)",
      }
    : {
        width: "min(480px, calc(100vw - 48px))",
        height: "calc(100vh - 48px)",
        marginLeft: "0px",
        transform: "translateX(60px)",
      };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <style>{STYLES}</style>
      <BackgroundCarousel />

      <div
        className={
          mobile
            ? "absolute inset-0 flex items-center justify-center pointer-events-none"
            : "absolute inset-0 flex items-center justify-center pointer-events-none"
        }
      >
        <div
          className="pointer-events-auto bg-white rounded-3xl shadow-2xl overflow-hidden"
          style={panelStyle}
        >
          <div className="overflow-y-auto h-full">
            <div
              className="content-in h-full"
              style={{ willChange: "opacity, transform" }}
            >
              <div
                className="relative flex flex-col justify-center px-6 sm:px-8 py-8"
                style={{
                  minHeight: mobile
                    ? "calc(100vh - 32px)"
                    : "calc(100vh - 48px)",
                }}
              >
                {/* Logo */}
                <div className="flex justify-center mb-2">
                  <img
                    src={LogoImage}
                    alt="Gastronome Connect Logo"
                    className="h-16 sm:h-20 w-auto object-contain"
                  />
                </div>

                <h1 className="text-3xl sm:text-4xl font-sfpro font-bold text-center text-black mb-1">
                  RESET
                  <span className="bg-gradient-to-b from-[#F57600] to-[#F0AE35] bg-clip-text text-transparent">
                    {" "}
                  </span>
                  PASSWORD
                </h1>
                <p className="text-center text-gray-500 text-sm mb-6">
                  Enter your new password
                </p>

                {(!pendingEmail || !isResetSessionVerified) && (
                  <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Reset session expired. Please request a new password reset
                    code.
                  </div>
                )}

                {error && (
                  <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        onBlur={validateNewPassword}
                        placeholder=" "
                        className={`peer block w-full px-3 py-3 border ${
                          newPasswordError
                            ? "border-red-600"
                            : "border-gray-300"
                        } rounded-lg focus:outline-none focus:border-[#0060A9] text-sm bg-transparent transition-colors`}
                      />
                      <label
                        htmlFor="newPassword"
                        className="absolute left-3 top-3 px-1 transition-all duration-200 cursor-text text-gray-400 text-sm
                          peer-focus:-top-2.5 peer-focus:text-[11px] peer-focus:text-[#0060A9] peer-focus:bg-white
                          peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:bg-white"
                      >
                        New Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? (
                          <FaEye size={16} />
                        ) : (
                          <FaEyeSlash size={16} />
                        )}
                      </button>
                    </div>
                    {newPasswordError && (
                      <p className="text-red-500 text-xs mt-1">
                        {newPasswordError}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onBlur={validateConfirmPassword}
                        placeholder=" "
                        className={`peer block w-full px-3 py-3 border ${
                          confirmPasswordError
                            ? "border-red-600"
                            : "border-gray-300"
                        } rounded-lg focus:outline-none focus:border-[#0060A9] text-sm bg-transparent transition-colors`}
                      />
                      <label
                        htmlFor="confirmPassword"
                        className="absolute left-3 top-3 px-1 transition-all duration-200 cursor-text text-gray-400 text-sm
                          peer-focus:-top-2.5 peer-focus:text-[11px] peer-focus:text-[#0060A9] peer-focus:bg-white
                          peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:bg-white"
                      >
                        Confirm Password
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <FaEye size={16} />
                        ) : (
                          <FaEyeSlash size={16} />
                        )}
                      </button>
                    </div>
                    {confirmPasswordError && (
                      <p className="text-red-500 text-xs mt-1">
                        {confirmPasswordError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={
                      loading || !pendingEmail || !isResetSessionVerified
                    }
                    className={`w-full flex justify-center mt-6 py-2.5 px-4 rounded-lg text-sm font-sfpro font-bold text-white bg-gradient-to-b from-[#0060A9] to-[#00B4FA] outline-none shadow-md transition-all ${
                      loading || !pendingEmail || !isResetSessionVerified
                        ? "cursor-not-allowed opacity-50"
                        : "hover:brightness-110 active:scale-[0.98]"
                    }`}
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>

                <div className="mt-6 pt-4 border-t border-orange-200 text-center">
                  <button
                    onClick={() => navigate("/login", { replace: true })}
                    className="text-sm font-semibold text-[#F57600] hover:underline outline-none"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Password Reset
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to reset your password? You will need to use
              this new password to log in.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmationModal(false)}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPasswordReset}
                disabled={loading || !pendingEmail || !isResetSessionVerified}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? "Confirming..." : "Confirm Reset"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
