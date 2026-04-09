import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LogoImage from "../components/Assets/Gastro.png";
import BackgroundSlider from "../components/Carousel Background/BackgroundCarousel";
import ResendPopup from "../components/Popups/ResendPopup";

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

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showResendPopup, setShowResendPopup] = useState(false);
  const [mobile, setMobile] = useState(isMobile());

  const navigate = useNavigate();

  useEffect(() => {
    const onResize = () => setMobile(isMobile());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const validateEmail = () => {
    if (!email) { setEmailError("Field can't be empty"); return false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setEmailError("Invalid email format"); return false; }
    setEmailError(""); return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateEmail()) return;
    localStorage.setItem("resetPasswordEmail", email);
    localStorage.setItem("sourceFlow", "forgotpassword");
    setShowResendPopup(true);
  };

  const handleConfirmRedirect = () => {
    setShowResendPopup(false);
    navigate("/verification");
  };

  const panelStyle = mobile
    ? { width: "calc(100vw - 32px)", maxWidth: "480px", height: "auto", minHeight: "calc(100vh - 32px)", maxHeight: "calc(100vh - 32px)" }
    : { width: "min(480px, calc(100vw - 48px))", height: "calc(100vh - 48px)", marginLeft: "0px", transform: "translateX(60px)" };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <style>{STYLES}</style>
      <BackgroundSlider />

      <div className={mobile ? "absolute inset-0 flex items-center justify-center pointer-events-none" : "absolute inset-0 flex items-center pointer-events-none"}>
        <div
          className="pointer-events-auto bg-white rounded-3xl shadow-2xl overflow-hidden"
          style={panelStyle}
        >
          <div className="overflow-y-auto h-full">
            <div className="content-in h-full" style={{ willChange: "opacity, transform" }}>
              <div
                className="relative flex flex-col justify-center px-6 sm:px-8 py-8"
                style={{ minHeight: mobile ? "calc(100vh - 32px)" : "calc(100vh - 48px)" }}
              >
                {/* Logo */}
                <div className="flex justify-center mb-2">
                  <img src={LogoImage} alt="Gastronome Connect Logo" className="h-16 sm:h-20 w-auto object-contain" />
                </div>

                <h1 className="text-3xl sm:text-4xl font-sfpro font-bold text-center text-black mb-1">
                  FORGOT{" "}
                  <span className="bg-gradient-to-b from-[#F57600] to-[#F0AE35] bg-clip-text text-transparent">P</span>
                  ASSWORD
                </h1>
                <p className="text-center text-gray-500 text-sm mb-6">
                  Enter your email to receive a reset code
                </p>

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                  <div>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={validateEmail}
                        placeholder=" "
                        className={`peer block w-full px-3 py-3 border ${
                          emailError ? "border-red-600" : "border-gray-300"
                        } rounded-lg focus:outline-none focus:border-[#0060A9] text-sm bg-transparent transition-colors`}
                      />
                      <label
                        htmlFor="email"
                        className="absolute left-3 top-3 px-1 transition-all duration-200 cursor-text text-gray-400 text-sm
                          peer-focus:-top-2.5 peer-focus:text-[11px] peer-focus:text-[#0060A9] peer-focus:bg-white
                          peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:bg-white"
                      >
                        Email address
                      </label>
                    </div>
                    {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                  </div>

                  <button
                    type="submit"
                    className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-sfpro font-bold text-white bg-gradient-to-b from-[#0060A9] to-[#00B4FA] hover:brightness-110 active:scale-[0.98] transition-all outline-none shadow-md"
                  >
                    Send Code
                  </button>
                </form>

                <div className="mt-6 pt-4 border-t border-orange-200 text-center">
                  <button
                    onClick={() => navigate("/login")}
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

      {showResendPopup && <ResendPopup onContinue={handleConfirmRedirect} />}
    </div>
  );
};

export default ForgotPassword;