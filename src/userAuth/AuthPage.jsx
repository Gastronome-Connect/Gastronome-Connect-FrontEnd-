import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Info } from "lucide-react";
import BackgroundCarousel from "../components/Carousel Background/BackgroundCarousel";
import LogoImage from "../components/Assets/Gastro.png";
import ResendPopup from "../components/Popups/ResendPopup";
import Buffer from "../components/Loading Pages/buffer";
import { apiFetch } from "../utils/api";

const AUTH_STATE_EVENT = "auth-state-changed";

const FloatingInput = ({
  type,
  id,
  value,
  onChange,
  onBlur,
  error,
  label,
  rightEl,
  autoComplete,
}) => (
  <div className="relative">
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder=" "
      autoComplete={autoComplete}
      className={`peer block w-full px-3 py-3 border ${
        error ? "border-red-500" : "border-gray-300"
      } rounded-lg focus:outline-none focus:border-[#0060A9] text-sm bg-transparent transition-colors`}
    />
    <label
      htmlFor={id}
      className="absolute left-3 top-3 px-1 transition-all duration-200 cursor-text text-gray-400 text-sm
        peer-focus:-top-2.5 peer-focus:text-[11px] peer-focus:text-[#0060A9] peer-focus:bg-white
        peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:bg-white"
    >
      {label}
    </label>
    {rightEl}
  </div>
);

const PasswordTooltip = ({ forceShow = false }) => {
  const [hovered, setHovered] = useState(false);
  const [autoVisible, setAutoVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (forceShow) {
      updateCoords();
      setAutoVisible(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setAutoVisible(false), 5000);
    }
    return () => clearTimeout(timerRef.current);
  }, [forceShow]);

  const updateCoords = () => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setCoords({ top: r.top, left: r.left + r.width / 2 });
  };

  const visible = hovered || autoVisible;

  const tooltip = visible
    ? createPortal(
        <div
          className="fixed z-[99999] w-56 bg-gray-900 text-white text-[11px] rounded-xl px-3 py-2.5 shadow-2xl pointer-events-none transition-all duration-200"
          style={{
            top: coords.top - 8,
            left: coords.left,
            transform: "translate(-50%, -100%)",
          }}
        >
          <p className="font-semibold mb-1.5 text-white/90">
            Password must include:
          </p>
          <ul className="space-y-1 text-white/75">
            {[
              "At least 8 characters",
              "One uppercase letter (A–Z)",
              "One lowercase letter (a–z)",
              "One number (0–9)",
              "One special character (!@#$%...)",
              "No spaces allowed",
            ].map((req) => (
              <li key={req} className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-orange-400 flex-shrink-0" />
                {req}
              </li>
            ))}
          </ul>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onMouseEnter={() => {
          updateCoords();
          setHovered(true);
        }}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => {
          updateCoords();
          setHovered(true);
        }}
        onBlur={() => setHovered(false)}
        className={`transition-colors outline-none flex-shrink-0 ${visible ? "text-[#0060A9]" : "text-gray-400 hover:text-[#0060A9]"}`}
        tabIndex={-1}
        aria-label="Password requirements"
      >
        <Info size={14} strokeWidth={2.5} />
      </button>
      {tooltip}
    </>
  );
};

const STYLES = `
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0px); }
  }
  @keyframes fadeSlideOut {
    from { opacity: 1; transform: translateY(0px); }
    to   { opacity: 0; transform: translateY(-12px); }
  }
  .content-in  { animation: fadeSlideIn  0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .content-out { animation: fadeSlideOut 0.26s ease-in forwards; }
  * { scrollbar-width: none; }
  *::-webkit-scrollbar { display: none; }
  button:focus { outline: none !important; box-shadow: none !important; }
  button:focus-visible { outline: none !important; box-shadow: none !important; }
`;

/* ─── Mobile detection helper ─────────────────────────────── */
const isMobile = () => window.innerWidth < 640;

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const initialIsLogin =
    new URLSearchParams(location.search).get("mode") !== "signup";
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [isAnimating, setIsAnimating] = useState(false);
  const [contentVisible, setContentVisible] = useState(true);
  const [mobile, setMobile] = useState(isMobile());

  useEffect(() => {
    const onResize = () => {
      setMobile(isMobile());
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Login state ──────────────────────────────────────────────
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginEmailError, setLoginEmailError] = useState("");
  const [loginPasswordError, setLoginPasswordError] = useState("");
  const [loginPasswordVisible, setLoginPasswordVisible] = useState(false);
  const [, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // ── SignUp state ─────────────────────────────────────────────
  const [emailSent] = useState(false);
  const [signupUsername, setSignupUsername] = useState("");
  const [signupUsernameError, setSignupUsernameError] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupEmailError, setSignupEmailError] = useState("");
  const [signupPasswordError, setSignupPasswordError] = useState("");
  const [showPasswordHint, setShowPasswordHint] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [signupPasswordVisible, setSignupPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  // ── Fade transition (no sliding) ─────────────────────────
  const switchTo = (goToLogin) => {
    if (isAnimating) return;
    setIsAnimating(true);

    const fadeDuration = 260;

    // Fade out current content
    setContentVisible(false);
    navigate(goToLogin ? "/login?mode=login" : "/login?mode=signup", {
      replace: true,
    });

    // After fade out, change content and fade in
    setTimeout(() => {
      setIsLogin(goToLogin);
      setContentVisible(true);
    }, fadeDuration);

    // End animation state
    setTimeout(() => {
      setIsAnimating(false);
    }, fadeDuration * 2);
  };

  // ── Login validation ─────────────────────────────────────────
  const validateLoginIdentifier = () => {
    const value = loginIdentifier.trim();
    if (!value) {
      setLoginEmailError("This field can't be empty");
      return false;
    }

    if (value.includes("@")) {
      const emailRegex =
        /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\.[a-zA-Z]{2})?$/;
      if (!emailRegex.test(value)) {
        setLoginEmailError("Invalid Email Format");
        return false;
      }
    }

    setLoginEmailError("");
    return true;
  };

  const validateLoginPassword = () => {
    if (!loginPassword.trim()) {
      setLoginPasswordError("This field can't be empty");
      return false;
    }
    setLoginPasswordError("");
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    const isEmailValid = validateLoginIdentifier();
    const isPasswordValid = validateLoginPassword();
    if (isEmailValid && isPasswordValid) {
      try {
        const identifier = loginIdentifier.trim();
        const isEmailLogin = identifier.includes("@");

        let response = await apiFetch("/api/login", {
          method: "POST",
          body: JSON.stringify({ identifier, password: loginPassword }),
        });
        let data = await response.json();
        let isAdminLogin = false;

        if (!response.ok && !isEmailLogin) {
          response = await apiFetch("/api/admin/login", {
            method: "POST",
            body: JSON.stringify({
              username: identifier,
              password: loginPassword,
            }),
          });
          data = await response.json();
          isAdminLogin = response.ok;
        }

        if (!response.ok) throw new Error(data.message || "");
        if (isAdminLogin) {
          localStorage.setItem("adminAccessToken", data.accessToken);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("userId");
          window.dispatchEvent(new Event(AUTH_STATE_EVENT));
          navigate("/admin");
        } else {
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.removeItem("adminAccessToken");
          if (data?.user?._id) {
            localStorage.setItem("userId", data.user._id);
          }
          window.dispatchEvent(new Event(AUTH_STATE_EVENT));
          navigate("/feed");
        }
        setLoginError("");
        setLoginEmailError("");
        setLoginPasswordError("");
      } catch (error) {
        console.error("Login error:", error);
        setLoginEmailError("Incorrect username/email or password");
        setLoginPasswordError("Incorrect username/email or password");
        setLoginError(error.message || "");
      }
    }
    setLoginLoading(false);
  };

  // ── SignUp validation ────────────────────────────────────────
  const validateSignupUsername = () => {
    if (!signupUsername.trim()) {
      setSignupUsernameError("Username can't be empty");
      return false;
    }
    if (signupUsername.trim().length < 3) {
      setSignupUsernameError("Username must be at least 3 characters");
      return false;
    }
    if (signupUsername.trim().length > 30) {
      setSignupUsernameError("Username must be 30 characters or less");
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(signupUsername.trim())) {
      setSignupUsernameError("Only letters, numbers, and underscores allowed");
      return false;
    }
    setSignupUsernameError("");
    return true;
  };

  const validateSignupEmail = () => {
    if (!signupEmail) {
      setSignupEmailError("Field can't be empty");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupEmail)) {
      setSignupEmailError("Invalid Email Format");
      return false;
    }
    setSignupEmailError("");
    return true;
  };

  const validateSignupPassword = () => {
    if (!signupPassword) {
      setSignupPasswordError("Field can't be empty");
      setShowPasswordHint(true);
      return false;
    }
    if (/\s/.test(signupPassword)) {
      setSignupPasswordError("Password must not contain spaces");
      setShowPasswordHint(true);
      return false;
    }
    if (signupPassword.length < 8) {
      setSignupPasswordError("Password must be at least 8 characters long.");
      setShowPasswordHint(true);
      return false;
    }
    if (!/[a-z]/.test(signupPassword)) {
      setSignupPasswordError(
        "Password must contain at least one lowercase letter",
      );
      setShowPasswordHint(true);
      return false;
    }
    if (!/[A-Z]/.test(signupPassword)) {
      setSignupPasswordError(
        "Password must contain at least one uppercase letter",
      );
      setShowPasswordHint(true);
      return false;
    }
    if (!/\d/.test(signupPassword)) {
      setSignupPasswordError("Password must contain at least one number");
      setShowPasswordHint(true);
      return false;
    }
    if (!/[!@#$%^&*(),.?":{}|<>_]/.test(signupPassword)) {
      setSignupPasswordError(
        "Password must contain at least one special character",
      );
      setShowPasswordHint(true);
      return false;
    }
    setSignupPasswordError("");
    setShowPasswordHint(false);
    return true;
  };

  const validateConfirmPassword = () => {
    if (!confirmPassword) {
      setConfirmPasswordError("Field can't be empty");
      return false;
    }
    if (confirmPassword !== signupPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  const handleVerify = () => navigate("/verification", { replace: true });

  const handleRegister = async (e) => {
    e.preventDefault();
    setSignupLoading(true);
    setSignupError("");

    const isUsernameValid = validateSignupUsername();
    const isEmailValid = validateSignupEmail();
    const isPasswordValid = validateSignupPassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    if (
      !isUsernameValid ||
      !isEmailValid ||
      !isPasswordValid ||
      !isConfirmPasswordValid
    ) {
      setSignupLoading(false);
      return;
    }

    try {
      const validateResponse = await apiFetch("/api/validate", {
        method: "POST",
        body: JSON.stringify({ email: signupEmail }),
      });
      const validateData = await validateResponse.json();
      if (!validateResponse.ok) {
        setSignupEmailError(validateData.message || "Email validation failed");
        setSignupLoading(false);
        return;
      }

      // Store signup data and navigate to verification to send OTP
      sessionStorage.setItem("pendingEmail", signupEmail);
      sessionStorage.setItem("sourceFlow", "signup");
      sessionStorage.setItem(
        "tempSignupData",
        JSON.stringify({
          username: signupUsername.trim(),
          email: signupEmail,
          password: signupPassword,
          confirmPassword,
        }),
      );

      navigate("/verification", { replace: true });
    } catch (error) {
      console.error("Sign up preparation error:", error);
      setSignupError(error.message || "An unexpected error occurred");
      setSignupLoading(false);
    }
  };

  /* ─── Panel style ───────────────────────────────────────────── */
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
        className={
          mobile
            ? "absolute inset-0 flex items-center justify-center pointer-events-none"
            : "absolute inset-0 flex items-center justify-center pointer-events-none"
        }
      >
        <div
          id="auth-panel"
          className="pointer-events-auto bg-white rounded-3xl shadow-2xl overflow-hidden"
          style={panelStyle}
        >
          <div className="overflow-y-auto h-full">
            <div
              className={
                contentVisible ? "content-in h-full" : "content-out h-full"
              }
              style={{ willChange: "opacity, transform", minHeight: "100%" }}
            >
              <div
                className="relative flex flex-col justify-center px-6 sm:px-8 py-8"
                style={{
                  minHeight: mobile
                    ? "calc(100vh - 32px)"
                    : "calc(100vh - 48px)",
                }}
              >
                {isLogin ? (
                  /* ── LOGIN CONTENT ────────────────────────── */
                  <>
                    <div className="flex justify-center mb-2">
                      <img
                        src={LogoImage}
                        alt="Gastronome Connect Logo"
                        className="h-16 sm:h-20 w-auto object-contain"
                      />
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-sfpro font-bold text-center text-black mb-1">
                      WEL
                      <span className="bg-gradient-to-b from-[#F57600] to-[#F0AE35] bg-clip-text text-transparent">
                        C
                      </span>
                      OME
                    </h1>
                    <p className="text-center font-sfpro font-semibold text-gray-500 text-sm mb-6">
                      Share your creativity and Discover more
                    </p>

                    <form
                      className="flex flex-col gap-4"
                      onSubmit={handleLogin}
                    >
                      <div>
                        <FloatingInput
                          type="text"
                          id="login-email"
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          onBlur={validateLoginIdentifier}
                          error={loginEmailError}
                          label="Username/Email address"
                          autoComplete="username"
                        />
                        {loginEmailError && (
                          <p className="text-red-500 text-xs mt-1">
                            {loginEmailError}
                          </p>
                        )}
                      </div>

                      <div>
                        <FloatingInput
                          type={loginPasswordVisible ? "text" : "password"}
                          id="login-password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          onBlur={validateLoginPassword}
                          error={loginPasswordError}
                          label="Password"
                          autoComplete="current-password"
                          rightEl={
                            <button
                              type="button"
                              tabIndex={-1}
                              onClick={() =>
                                setLoginPasswordVisible(!loginPasswordVisible)
                              }
                              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer outline-none"
                            >
                              {loginPasswordVisible ? (
                                <FaEye className="text-[#0060A9] text-sm" />
                              ) : (
                                <FaEyeSlash className="text-[#F57600] text-sm" />
                              )}
                            </button>
                          }
                        />
                        {loginPasswordError && (
                          <p className="text-red-500 text-xs mt-1">
                            {loginPasswordError}
                          </p>
                        )}
                      </div>

                      <div className="text-right -mt-1">
                        <a
                          href="/forgotpassword"
                          onClick={(e) => {
                            e.preventDefault();
                            navigate("/forgot-password");
                          }}
                          className="text-sm text-[#F57600] hover:underline"
                        >
                          Forgot your password?
                        </a>
                      </div>

                      <button
                        type="submit"
                        disabled={loginLoading}
                        className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-sfpro font-bold text-white bg-gradient-to-b from-[#0060A9] to-[#00B4FA] hover:brightness-110 active:scale-[0.98] transition-all outline-none shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {loginLoading ? <Buffer /> : "Log In"}
                      </button>

                      <div className="pt-2 border-t border-orange-200 text-center">
                        <span className="text-sm text-gray-600">
                          Don't have an account?{" "}
                        </span>
                        <button
                          type="button"
                          onClick={() => switchTo(false)}
                          className="text-sm font-semibold text-[#F57600] hover:underline outline-none"
                        >
                          Sign up
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  /* ── SIGNUP CONTENT ───────────────────────── */
                  <>
                    <div className="flex justify-center mb-2">
                      <img
                        src={LogoImage}
                        alt="Gastronome Connect Logo"
                        className="h-14 sm:h-16 w-auto object-contain"
                      />
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-sfpro font-bold text-center text-black mb-4">
                      <span className="bg-gradient-to-b from-[#F57600] to-[#F0AE35] bg-clip-text text-transparent">
                        C
                      </span>
                      REATE A
                      <span className="bg-gradient-to-b from-[#F57600] to-[#F0AE35] bg-clip-text text-transparent">
                        CC
                      </span>
                      OUNT
                    </h1>

                    {signupError && (
                      <div className="bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded-lg mb-3 text-sm">
                        {signupError}
                      </div>
                    )}

                    <form
                      className="flex flex-col gap-4"
                      onSubmit={handleRegister}
                    >
                      <div>
                        <FloatingInput
                          type="text"
                          id="signup-username"
                          value={signupUsername}
                          onChange={(e) => setSignupUsername(e.target.value)}
                          onBlur={validateSignupUsername}
                          error={signupUsernameError}
                          label="Username"
                        />
                        {signupUsernameError && (
                          <p className="text-red-500 text-xs mt-1">
                            {signupUsernameError}
                          </p>
                        )}
                      </div>

                      <div>
                        <FloatingInput
                          type="email"
                          id="signup-email"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          onBlur={validateSignupEmail}
                          error={signupEmailError}
                          label="Email address"
                        />
                        {signupEmailError && (
                          <p className="text-red-500 text-xs mt-1">
                            {signupEmailError}
                          </p>
                        )}
                      </div>

                      <div>
                        <div className="relative">
                          <FloatingInput
                            type={signupPasswordVisible ? "text" : "password"}
                            id="signup-password"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            onBlur={validateSignupPassword}
                            error={signupPasswordError}
                            label="Password"
                            autoComplete="new-password"
                            rightEl={
                              <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center gap-1.5">
                                <PasswordTooltip forceShow={showPasswordHint} />
                                <button
                                  type="button"
                                  tabIndex={-1}
                                  onClick={() =>
                                    setSignupPasswordVisible(
                                      !signupPasswordVisible,
                                    )
                                  }
                                  className="cursor-pointer outline-none"
                                >
                                  {signupPasswordVisible ? (
                                    <FaEye className="text-[#0060A9] text-sm" />
                                  ) : (
                                    <FaEyeSlash className="text-[#F57600] text-sm" />
                                  )}
                                </button>
                              </div>
                            }
                          />
                        </div>
                        {signupPasswordError && (
                          <p className="text-red-500 text-xs mt-1">
                            {signupPasswordError}
                          </p>
                        )}
                      </div>

                      <div>
                        <FloatingInput
                          type={confirmPasswordVisible ? "text" : "password"}
                          id="confirm-password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onBlur={validateConfirmPassword}
                          error={confirmPasswordError}
                          label="Confirm Password"
                          autoComplete="new-password"
                          rightEl={
                            <button
                              type="button"
                              tabIndex={-1}
                              onClick={() =>
                                setConfirmPasswordVisible(
                                  !confirmPasswordVisible,
                                )
                              }
                              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer outline-none"
                            >
                              {confirmPasswordVisible ? (
                                <FaEye className="text-[#0060A9] text-sm" />
                              ) : (
                                <FaEyeSlash className="text-[#F57600] text-sm" />
                              )}
                            </button>
                          }
                        />
                        {confirmPasswordError && (
                          <p className="text-red-500 text-xs mt-1">
                            {confirmPasswordError}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={signupLoading}
                        className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-sfpro font-bold text-white bg-gradient-to-b from-[#0060A9] to-[#00B4FA] hover:brightness-110 active:scale-[0.98] transition-all outline-none shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {signupLoading ? <Buffer /> : "Sign Up"}
                      </button>

                      <div className="pt-2 border-t border-orange-200 text-center">
                        <span className="text-sm text-gray-600">
                          Already have an account?{" "}
                        </span>
                        <button
                          type="button"
                          onClick={() => switchTo(true)}
                          className="text-sm font-semibold text-[#F57600] hover:underline outline-none"
                        >
                          Log in
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {(loginLoading || signupLoading) && <Buffer />}
      {emailSent && <ResendPopup onContinue={handleVerify} />}
    </div>
  );
};

export default AuthPage;
