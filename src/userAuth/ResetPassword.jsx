import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import LogoImage from "../components/Assets/FoodAI.png";
import BackgroundCarousel from "../components/Carousel Background/BackgroundCarousel";
import LockIcon from "../components/Assets/Lock.png";

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

  const navigate = useNavigate();
  const location = useLocation();
  const resetEmail = sessionStorage.getItem("resetEmail");

  // Redirect to forgot password if no email is found
  useEffect(() => {
    if (!resetEmail) {
      navigate("/forgot-password");
    }
  }, [resetEmail, navigate]);

  const validateNewPassword = () => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!newPassword) {
      setNewPasswordError("Password is required");
      return false;
    }
    if (!passwordRegex.test(newPassword)) {
      setNewPasswordError(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
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
      const response = await fetch("http://localhost:3000/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetEmail,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      // Clear reset email from session storage
      sessionStorage.removeItem("resetEmail");

      // Navigate to login with success message
      navigate("/login", {
        state: {
          successMessage:
            "Password reset successful. Please login with your new password.",
        },
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      setError(error.message || "Failed to reset password. Please try again.");
      setShowConfirmationModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full">
      <BackgroundCarousel />
      <div className="absolute inset-0 flex items-center justify-center overflow-auto">
        <div className="bg-white bg-opacity-80 w-full max-w-lg relative z-10 overflow-y-auto min-h-screen max-h-screen">
          <div className="w-full flex flex-col justify-center p-4 sm:p-6 md:p-8 lg:p-10 min-h-screen">
            <div className="p-5 rounded-lg max-w-md w-full mx-auto">
              <div className="text-center mb-8">
                <img
                  src={LogoImage}
                  alt="RecipAI Logo"
                  className="w-full h-auto max-w-xs mx-auto mb-4"
                />
                <h1 className="text-2xl font-bold text-green-600">
                  Reset Password
                </h1>
                <p className="mt-2 text-gray-600 text-sm">
                  Please enter and confirm your new password
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* New Password Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="newPassword"
                    className="block text-md font-medium text-gray-700"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <img
                      src={LockIcon}
                      alt="Lock Icon"
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5"
                    />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onBlur={validateNewPassword}
                      className={`mt-1 block w-full pl-10 pr-10 py-2 border ${
                        newPasswordError ? "border-red-600" : "border-green-600"
                      } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                      placeholder="Enter new password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      {showNewPassword ? (
                        <FaEye className="text-green-600" />
                      ) : (
                        <FaEyeSlash className="text-green-600" />
                      )}
                    </button>
                  </div>
                  {newPasswordError && (
                    <p className="text-red-600 text-sm">{newPasswordError}</p>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-md font-medium text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <img
                      src={LockIcon}
                      alt="Lock Icon"
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5"
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onBlur={validateConfirmPassword}
                      className={`mt-1 block w-full pl-10 pr-10 py-2 border ${
                        confirmPasswordError
                          ? "border-red-600"
                          : "border-green-600"
                      } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                      placeholder="Confirm new password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <FaEye className="text-green-600" />
                      ) : (
                        <FaEyeSlash className="text-green-600" />
                      )}
                    </button>
                  </div>
                  {confirmPasswordError && (
                    <p className="text-red-600 text-sm">
                      {confirmPasswordError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Resetting Password...
                    </span>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
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
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
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
