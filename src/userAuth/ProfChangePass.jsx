import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ChangePass = ({ onCancel, onSuccess }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOldPasswordVisible, setIsOldPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  // Same regex as backend for consistent validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

  // Password validation helper function
  const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  if (!passwordRegex.test(password)) {
      return "Password must be at least 8 characters with at least one lowercase letter, one uppercase letter, one number, and one special character.";
    }
    return null;
  };

  const handleSubmit = async () => {
    try {
      // Reset messages
      setErrorMessage("");
      setSuccessMessage("");
      
      // Client-side validation
      if (!oldPassword || !newPassword || !confirmPassword) {
        setErrorMessage("All fields are required.");
        return;
      }

      if (newPassword !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
        return;
      }
      
      const passwordValidationError = validatePassword(newPassword);
      if (passwordValidationError) {
        setErrorMessage(passwordValidationError);
        return;
      }

      setIsLoading(true);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("You must be logged in to change your password");
      }

      const response = await fetch("http://localhost:3000/api/update-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword,
          newPassword
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to update password");
      }
      
      // Success
      setSuccessMessage(data.message || "Password updated successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Notify parent component about success
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
      
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-sm sm:max-w-md mx-auto">
      <h2 className="text-base sm:text-lg font-semibold mb-4 text-green-600">
        Change Password
      </h2>

      {errorMessage && (
        <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded">{errorMessage}</div>
      )}

      {successMessage && (
        <div className="text-green-500 text-sm mb-4 p-2 bg-green-50 rounded">{successMessage}</div>
      )}

      {/* Old Password Input */}
      <div className="relative mb-4">
        <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Current Password
        </label>
        <div className="relative">
          <input
            id="oldPassword"
            type={isOldPasswordVisible ? "text" : "password"}
            placeholder="Enter current password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 sm:p-3 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <button
            type="button"
            onClick={() => setIsOldPasswordVisible(!isOldPasswordVisible)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            aria-label={isOldPasswordVisible ? "Hide password" : "Show password"}
          >
            {isOldPasswordVisible ? <FaEye /> : <FaEyeSlash />}
          </button>
        </div>
      </div>

      {/* New Password Input */}
      <div className="mb-4">
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
          New Password
        </label>
        <div className="relative">
          <input
            id="newPassword"
            type={isNewPasswordVisible ? "text" : "password"}
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 sm:p-3 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <button
            type="button"
            onClick={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            aria-label={isNewPasswordVisible ? "Hide password" : "Show password"}
          >
            {isNewPasswordVisible ? <FaEye /> : <FaEyeSlash />}
          </button>
        </div>
      </div>

      {/* Confirm Password Input */}
      <div className="relative mb-6">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm New Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={isConfirmPasswordVisible ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full border rounded-md p-2 sm:p-3 focus:outline-none focus:ring-1 focus:ring-green-500 ${
              confirmPassword && confirmPassword !== newPassword 
                ? "border-red-300" 
                : "border-gray-300"
            }`}
          />
          <button
            type="button"
            onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            aria-label={isConfirmPasswordVisible ? "Hide password" : "Show password"}
          >
            {isConfirmPasswordVisible ? <FaEye /> : <FaEyeSlash />}
          </button>
        </div>
        {confirmPassword && confirmPassword !== newPassword && (
          <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-1/2 border border-gray-400 px-4 py-2 rounded-md bg-white hover:bg-gray-100 text-gray-700"
          disabled={isLoading}
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className={`w-full sm:w-1/2 px-4 py-2 rounded-md text-white ${
            isLoading ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default ChangePass;