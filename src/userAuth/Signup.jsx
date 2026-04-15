import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildApiUrl } from "../utils/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import BackgroundCarousel from "../components/Carousel Background/BackgroundCarousel";
import LogoImage from "../components/Assets/Gastro.png";
import ResendPopup from "../components/Popups/ResendPopup";
import Buffer from "../components/Loading Pages/buffer";

const SignUp = () => {
  const [emailSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validateEmail = () => {
    if (!email) {
      setEmailError("Field can't be empty");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Invalid email format");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = () => {
    if (!password) {
      setPasswordError("Field can't be empty");
      return false;
    }
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return false;
    }
    if (!/[a-z]/.test(password)) {
      setPasswordError("Password must contain at least one lowercase letter");
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setPasswordError("Password must contain at least one uppercase letter");
      return false;
    }
    if (!/\d/.test(password)) {
      setPasswordError("Password must contain at least one number");
      return false;
    }
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>_]/;
    if (!specialCharRegex.test(password)) {
      setPasswordError("Password must contain at least one special character");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const validateConfirmPassword = () => {
    if (!confirmPassword) {
      setConfirmPasswordError("Field can't be empty");
      return false;
    }
    if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match.");
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  const handleVerify = () => {
    navigate("/verification", { replace: true });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    if (!isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      setLoading(false);
      return;
    }

    try {
      const validateResponse = await fetch(buildApiUrl("/api/validate"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const validateData = await validateResponse.json();
      if (!validateResponse.ok) {
        setEmailError(validateData.message || "Email validation failed");
        setLoading(false);
        return;
      }

      sessionStorage.setItem(
        "tempSignupData",
        JSON.stringify({ email, password, confirmPassword }),
      );
      sessionStorage.setItem("pendingEmail", email);
      sessionStorage.setItem("sourceFlow", "signup");

      navigate("/verification", { replace: true });
    } catch (error) {
      console.error("Sign up preparation error:", error);
      setError(error.message || "An unexpected error occurred");
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 w-full h-full">
      <BackgroundCarousel />

      <div className="absolute inset-0 flex items-center justify-end">
        <div className="bg-white w-full max-w-lg relative z-10 min-h-screen max-h-screen">
          <div className="w-full flex flex-col justify-center p-4 sm:p-6 md:p-8 lg:p-10 min-h-screen">
            <div className="w-full sm:w-11/12 md:w-10/12 lg:w-11/12 mx-auto">
              {/* Logo */}
              <div className="h-20 mb-3 flex justify-center">
                <img
                  src={LogoImage}
                  alt="Gastronome Connect Logo"
                  className="h-auto w-3/4 sm:w-2/3 md:w-3/5 lg:w-4/5 object-contain"
                />
              </div>
              <h1 className="text-4xl font-sfpro font-bold text-center text-black mb-1">
                <span className="bg-gradient-to-b from-[#F57600] to-[#F0AE35] bg-clip-text text-transparent">
                  C
                </span>
                REATE A
                <span className="bg-gradient-to-b from-[#F57600] to-[#F0AE35] bg-clip-text text-transparent">
                  CC
                </span>
                OUNT
              </h1>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              <form className="mt-4" onSubmit={handleRegister}>
                {/* Email input */}
                <div className="mt-3">
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={validateEmail}
                      placeholder=" "
                      className={`peer block w-full px-3 py-3 border ${
                        emailError ? "border-red-600" : "border-gray-700"
                      } rounded-md shadow-sm focus:outline-none focus:ring-[#00B4FA] focus:border-[#0060A9] text-xs sm:text-sm md:text-base bg-transparent`}
                    />
                    <label
                      htmlFor="email"
                      className="absolute left-3 top-3 px-1 transition-all duration-200 cursor-text text-gray-500 text-xs sm:text-sm md:text-base peer-focus:-top-2.5 peer-focus:text-[10px] peer-focus:text-[#0060A9] peer-focus:bg-white peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:bg-white"
                    >
                      Email address
                    </label>
                  </div>
                  {emailError && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1">
                      {emailError}
                    </p>
                  )}
                </div>

                {/* Password input */}
                <div className="mt-3">
                  <div className="relative">
                    <input
                      type={passwordVisible ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={validatePassword}
                      placeholder=" "
                      autoComplete="new-password"
                      className={`peer block w-full px-3 py-3 border ${
                        passwordError ? "border-red-600" : "border-gray-700"
                      } rounded-md shadow-sm focus:outline-none focus:ring-[#00B4FA] focus:border-[#0060A9] text-xs sm:text-sm md:text-base bg-transparent`}
                    />
                    <label
                      htmlFor="confirm-password"
                      className="absolute left-3 top-3 px-1 transition-all duration-200 cursor-text text-gray-500 text-xs sm:text-sm md:text-base peer-focus:-top-2.5 peer-focus:text-[10px] peer-focus:text-[#0060A9] peer-focus:bg-white peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:bg-white"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center justify-center cursor-pointer z-10"
                    >
                      {passwordVisible ? (
                        <FaEye className="text-[#0060A9] text-xs sm:text-sm md:text-base" />
                      ) : (
                        <FaEyeSlash className="text-[#F57600] text-xs sm:text-sm md:text-base" />
                      )}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1">
                      {passwordError}
                    </p>
                  )}
                </div>

                {/* Confirm password input */}
                <div className="mt-3">
                  <div className="relative">
                    <input
                      type={isConfirmPasswordVisible ? "text" : "password"}
                      id="confirm-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onBlur={validateConfirmPassword}
                      placeholder=" "
                      autoComplete="new-password"
                      className={`peer block w-full px-3 py-3 border ${
                        confirmPasswordError
                          ? "border-red-600"
                          : "border-gray-700"
                      } rounded-md shadow-sm focus:outline-none focus:ring-[#00B4FA] focus:border-[#0060A9] text-xs sm:text-sm md:text-base bg-transparent`}
                    />
                    <label
                      htmlFor="password"
                      className="absolute left-3 top-3 px-1 transition-all duration-200 cursor-text text-gray-500 text-xs sm:text-sm md:text-base peer-focus:-top-2.5 peer-focus:text-[10px] peer-focus:text-[#0060A9] peer-focus:bg-white peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:bg-white"
                    >
                      Confirm Password
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                      }
                      className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center justify-center cursor-pointer z-10"
                    >
                      {isConfirmPasswordVisible ? (
                        <FaEye className="text-[#0060A9] text-xs sm:text-sm md:text-base" />
                      ) : (
                        <FaEyeSlash className="text-[#F57600] text-xs sm:text-sm md:text-base" />
                      )}
                    </button>
                  </div>
                  {confirmPasswordError && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1">
                      {confirmPasswordError}
                    </p>
                  )}
                </div>

                {/* Next button */}
                <div className="flex flex-col gap-1 mt-4 mb-5">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm md:text-base font-sfpro font-bold text-white bg-gradient-to-b from-[#0060A9] to-[#00B4FA] hover:brightness-110 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0060A9] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Buffer /> : "Sign up"}
                  </button>
                </div>

                {/* Sign In link */}
                <div className="pt-3 border-t border-[#F57600]">
                  <div className="flex justify-center items-center">
                    <p className="text-xs sm:text-sm md:text-base font-medium">
                      Already have an account?
                    </p>
                    <button
                      onClick={() => navigate("/login", { replace: true })}
                      className="text-blue-600 text-xs sm:text-sm md:text-base font-medium ml-2 hover:underline"
                    >
                      Log in
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Email sent message */}
      {emailSent && <ResendPopup onContinue={handleVerify} />}
    </div>
  );
};

export default SignUp;
