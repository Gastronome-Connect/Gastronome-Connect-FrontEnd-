import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundCarousel from "../components/Carousel Background/BackgroundCarousel";
import LogoImage from "../components/Assets/Gastro.png";
import ResendPopup from "../components/Popups/ResendPopup";
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

const VerificationPage = () => {
  const [code, setCode] = useState(new Array(6).fill(""));
  const [timer, setTimer] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [error, setError] = useState("");
  const [showResendPopup, setShowResendPopup] = useState(false);
  const [mobile, setMobile] = useState(isMobile());
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check for pendingUser in sessionStorage on mount
  useEffect(() => {
    const pendingUser = sessionStorage.getItem("pendingUser");
    if (!pendingUser) {
      // No pending user - redirect to signup
      navigate("/signup", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const onResize = () => setMobile(isMobile());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Panel position based on viewport
  const getPanelTransform = () => {
    if (mobile) return undefined;
    const panelW = Math.min(480, window.innerWidth - 48);
    const rightX = window.innerWidth - panelW - 60;
    return `translateX(${rightX}px)`;
  };

  // Timer countdown
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
    if (/^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value.slice(-1);
      setCode(newCode);
      if (value && index < 5)
        document.getElementById(`code-${index + 1}`).focus();
      setError("");
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredCode = code.join("");
    if (enteredCode.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const pendingUser = sessionStorage.getItem("pendingUser");
      const { email } = pendingUser ? JSON.parse(pendingUser) : {};

      if (!email) {
        setError("Session expired, please sign up again");
        setTimeout(() => {
          sessionStorage.removeItem("pendingUser");
          navigate("/signup", { replace: true });
        }, 3000);
        return;
      }

      const response = await fetch(buildApiUrl("/api/verify-otp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: enteredCode }),
      });

      const data = await response.json();

      if (response.status === 200) {
        // Success - clear sessionStorage and redirect to login
        sessionStorage.removeItem("pendingUser");
        navigate("/login", { replace: true });
      } else if (response.status === 400) {
        // Wrong OTP
        setError("Incorrect code, try again");
      } else if (response.status === 410) {
        // Max attempts exceeded
        setError("Too many attempts, please sign up again");
        setTimeout(() => {
          sessionStorage.removeItem("pendingUser");
          navigate("/signup", { replace: true });
        }, 3000);
      } else if (response.status === 404) {
        // Session expired
        setError("Session expired, please sign up again");
        setTimeout(() => {
          sessionStorage.removeItem("pendingUser");
          navigate("/signup", { replace: true });
        }, 3000);
      } else {
        // Other errors
        setError(data.message || "Failed to verify OTP. Please try again.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer === 0 && !isTimerRunning) {
      const pendingUser = sessionStorage.getItem("pendingUser");
      if (!pendingUser) {
        setError("Session expired. Please restart the signup process.");
        return;
      }

      try {
        const { email, username, password } = JSON.parse(pendingUser);
        setLoading(true);
        setError("");

        const response = await fetch(buildApiUrl("/api/send-otp"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, username, password }),
        });

        const data = await response.json();

        if (response.status === 200) {
          setTimer(300);
          setIsTimerRunning(true);
          setShowResendPopup(true);
        } else {
          setError(data.message || "Failed to resend OTP. Please try again.");
        }
      } catch (error) {
        console.error("Resend OTP error:", error);
        setError("Failed to resend OTP. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const formatTimer = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleContinue = () => setShowResendPopup(false);
  const handleBackToSignup = () => {
    sessionStorage.removeItem("pendingUser");
    navigate("/signup", { replace: true });
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
        transform: getPanelTransform(),
      };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <style>{STYLES}</style>
      <BackgroundCarousel />

      <div
        className={
          mobile
            ? "absolute inset-0 flex items-center justify-center pointer-events-none"
            : "absolute inset-0 flex items-center pointer-events-none"
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
                        className={`w-10 h-10 sm:w-11 sm:h-11 text-base sm:text-lg text-center border ${
                          error ? "border-red-500" : "border-gray-300"
                        } rounded-lg shadow-sm focus:outline-none focus:border-[#0060A9] transition-colors`}
                      />
                    ))}
                  </div>

                  {error && (
                    <p className="text-red-500 text-xs text-center">{error}</p>
                  )}

                  <div className="flex items-center justify-between text-sm flex-wrap gap-y-1">
                    <div>
                      <span className="text-gray-600">
                        Didn't receive Code?
                      </span>
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={timer !== 0 || isTimerRunning || loading}
                        className={`ml-1 font-semibold hover:underline outline-none ${
                          timer === 0 && !isTimerRunning && !loading
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
                    disabled={loading}
                    className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-sfpro font-bold text-white bg-gradient-to-b from-[#0060A9] to-[#00B4FA] hover:brightness-110 active:scale-[0.98] transition-all outline-none shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Verifying..." : "Verify"}
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
                    onClick={handleBackToSignup}
                    className="text-sm font-semibold text-[#F57600] hover:underline outline-none"
                  >
                    Back to Sign Up
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
