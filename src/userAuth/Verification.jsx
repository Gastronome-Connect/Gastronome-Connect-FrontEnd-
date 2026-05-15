import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundCarousel from "../components/Carousel Background/BackgroundCarousel";
import LogoImage from "../components/Assets/Gastro.png";
import Porm from "./Preferences";
import ResendPopup from "../components/Popups/ResendPopup";
import { buildApiUrl } from "../utils/api";
import useBlockBrowserBack from "../Hooks/useBlockBrowserBack";
import {
  clearSignupStep,
  setSignupStep,
  SIGNUP_STEPS,
} from "../utils/signupFlow";

const STYLES = `
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0px); }
  }
  .content-in { 
    animation: fadeSlideIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    opacity: 1 !important;
  }
  * { scrollbar-width: none; }
  *::-webkit-scrollbar { display: none; }
  button:focus { outline: none !important; box-shadow: none !important; }
  button:focus-visible { outline: none !important; box-shadow: none !important; }
`;

const isMobile = () => window.innerWidth < 640;
const OTP_RESEND_COUNTDOWN_SECONDS = 90;
const normalizeOtpInput = (value = "") =>
  String(value || "")
    .replace(/\D/g, "")
    .slice(0, 6);

const VerificationPage = () => {
  const [code, setCode] = useState(new Array(6).fill(""));
  const [timer, setTimer] = useState(OTP_RESEND_COUNTDOWN_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState("");
  const [error, setError] = useState("");
  const [showPorm] = useState(false);
  const [showResendPopup, setShowResendPopup] = useState(false);
  const [mobile, setMobile] = useState(isMobile());
  const navigate = useNavigate();
  const email = sessionStorage.getItem("pendingEmail");
  const username = sessionStorage.getItem("pendingUsername");
  const password = sessionStorage.getItem("pendingPassword");
  const otpSentRef = useRef(false);

  const sourceFlow = sessionStorage.getItem("sourceFlow");

  // Debug logging
  useEffect(() => {
    console.log("🔍 Verification component mounted");
    console.log("  email:", email);
    console.log("  sourceFlow:", sourceFlow);
    if (!email || !sourceFlow) {
      console.warn("⚠️ Missing sessionStorage values - should have been redirected by FlowRoute!");
    }
  }, [email, sourceFlow]);

  useBlockBrowserBack(sourceFlow === "signup");

  useEffect(() => {
    const onResize = () => setMobile(isMobile());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (sourceFlow === "signup") {
      setSignupStep(SIGNUP_STEPS.VERIFICATION);
    }
  }, [sourceFlow]);

  useEffect(() => {
    const sendOTP = async () => {
      if (otpSentRef.current) return;
      otpSentRef.current = true;
      
      try {
        const endpoint =
          sourceFlow === "forgotpassword"
            ? "/api/forgot-password"
            : "/api/send-otp";
        const response = await fetch(buildApiUrl(endpoint), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, username, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to send OTP");
        setTimer(OTP_RESEND_COUNTDOWN_SECONDS);
        setIsTimerRunning(true);
      } catch (error) {
        setError(error.message);
      }
    };
    if (email && sourceFlow === "signup") sendOTP();
  }, [email, sourceFlow]);

  useEffect(() => {
    if (!isTimerRunning || timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          setIsTimerRunning(false);
          clearInterval(interval);
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  const handleChange = (value, index) => {
    const sanitizedValue = normalizeOtpInput(value);

    if (!sanitizedValue) {
      const nextCode = [...code];
      nextCode[index] = "";
      setCode(nextCode);
      setError("");
      return;
    }

    const nextCode = [...code];

    if (sanitizedValue.length > 1) {
      sanitizedValue.split("").forEach((digit, offset) => {
        if (index + offset < nextCode.length) {
          nextCode[index + offset] = digit;
        }
      });
      setCode(nextCode);
      const focusIndex = Math.min(index + sanitizedValue.length, 5);
      document.getElementById(`code-${focusIndex}`)?.focus();
      setError("");
      return;
    }

    nextCode[index] = sanitizedValue;
    setCode(nextCode);
    if (index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
    setError("");
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`).focus();
    }
  };

  const handlePaste = (e) => {
    const pastedCode = normalizeOtpInput(e.clipboardData.getData("text"));
    if (!pastedCode) {
      return;
    }

    e.preventDefault();
    const nextCode = new Array(6).fill("");
    pastedCode.split("").forEach((digit, index) => {
      nextCode[index] = digit;
    });
    setCode(nextCode);
    const focusIndex = Math.min(pastedCode.length, 5);
    document.getElementById(`code-${focusIndex}`)?.focus();
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) {
      return;
    }

    const enteredCode = normalizeOtpInput(code.join(""));
    if (enteredCode.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessNotice("");

    try {
      const endpoint =
        sourceFlow === "forgotpassword"
          ? "/api/verify-reset-otp"
          : "/api/verify-otp";
      const response = await fetch(buildApiUrl(endpoint), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: enteredCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to verify OTP");

      if (sourceFlow === "forgotpassword") {
        setSuccessNotice("Code accepted, redirecting to reset password...");
        sessionStorage.setItem("resetPasswordEmailVerified", "true");
        setTimeout(() => {
          navigate("/forgot-password", { replace: true });
        }, 2000);
      } else {
        setSuccessNotice("Code accepted, redirecting to preferences...");
        setSignupStep(SIGNUP_STEPS.PREFERENCES);
        setTimeout(() => {
          navigate("/preferences", { replace: true });
        }, 2000);
      }
    } catch (error) {
      setError(error.message);
      setSuccessNotice("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (timer === 0 && !isTimerRunning) {
      if (!email) {
        setError("Session expired. Please restart the verification process.");
        return;
      }
      try {
        const endpoint =
          sourceFlow === "forgotpassword"
            ? "/api/forgot-password"
            : "/api/send-otp";
        const response = await fetch(buildApiUrl(endpoint), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, username, password }),
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Failed to resend OTP");
        setTimer(OTP_RESEND_COUNTDOWN_SECONDS);
        setIsTimerRunning(true);
        setShowResendPopup(true);
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const formatTimer = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleContinue = () => setShowResendPopup(false);
  const handleBackToLogin = () => {
    // Clear flow state for both signup and forgotpassword flows
    sessionStorage.removeItem("pendingEmail");
    sessionStorage.removeItem("sourceFlow");
    sessionStorage.removeItem("resetPasswordEmailVerified");
    clearSignupStep();

    // For signup flow, also clear any auth tokens and temp signup data
    if (sourceFlow === "signup") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("tempSignupData");
      sessionStorage.removeItem("tempPreferences");
      sessionStorage.removeItem("tempDislikes");
    }

    navigate("/login");
  };

  if (showPorm) return <Porm />;

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
      };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <style>{STYLES}</style>
      <BackgroundCarousel />

      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 50 }}
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
                  VERIFI
                  <span className="bg-gradient-to-b from-[#F57600] to-[#F0AE35] bg-clip-text text-transparent">
                    C
                  </span>
                  ATION
                </h1>
                <p className="text-center text-gray-500 text-sm mb-6">
                  Enter the 6-digit code sent to your email
                </p>

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                  {/* OTP inputs — slightly smaller on mobile */}
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        id={`code-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleChange(e.target.value, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onPaste={handlePaste}
                        className={`w-10 h-10 sm:w-11 sm:h-11 text-base sm:text-lg text-center border ${
                          error ? "border-red-500" : "border-gray-300"
                        } rounded-lg shadow-sm focus:outline-none focus:border-[#0060A9] transition-colors`}
                      />
                    ))}
                  </div>

                  {error && (
                    <p className="text-red-500 text-xs text-center">{error}</p>
                  )}

                  {successNotice && (
                    <p className="text-emerald-600 text-xs text-center font-semibold">
                      {successNotice}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm flex-wrap gap-y-1">
                    <div>
                      <span className="text-gray-600">
                        Didn't receive Code?
                      </span>
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={timer !== 0 || isTimerRunning}
                        className={`ml-1 font-semibold hover:underline outline-none ${
                          timer === 0 && !isTimerRunning
                            ? "text-[#F57600] cursor-pointer"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Request again
                      </button>
                    </div>
                    <span className="text-gray-500 font-medium tabular-nums">
                      {formatTimer()}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-sfpro font-bold text-white bg-gradient-to-b from-[#0060A9] to-[#00B4FA] hover:brightness-110 active:scale-[0.98] transition-all outline-none shadow-md"
                  >
                    {isSubmitting ? "Verifying..." : "Verify"}
                  </button>
                </form>

                {showResendPopup && (
                  <ResendPopup
                    isOpen={showResendPopup}
                    onContinue={handleContinue}
                  />
                )}

                <div className="mt-6 pt-4 border-t border-orange-200 text-center">
                  <button
                    onClick={handleBackToLogin}
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
    </div>
  );
};

export default VerificationPage;
