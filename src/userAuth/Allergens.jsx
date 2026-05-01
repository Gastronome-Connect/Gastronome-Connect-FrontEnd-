import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundCarousel from "../components/Carousel Background/BackgroundCarousel";
import { FaChevronDown, FaChevronUp, FaTimes } from "react-icons/fa";
import LogoImage from "../components/Assets/Gastro.png";
import AllergenIcon from "../components/Assets/Allergen.png";
import DislikeIcon from "../components/Assets/Dislike.png";
import PrefPopup from "../components/Popups/PrefPopup";
import { apiFetch, buildApiUrl } from "../utils/api";
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
  .content-in { animation: fadeSlideIn 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  * { scrollbar-width: none; }
  *::-webkit-scrollbar { display: none; }
  button:focus { outline: none !important; box-shadow: none !important; }
  button:focus-visible { outline: none !important; box-shadow: none !important; }
`;

const isMobile = () => window.innerWidth < 640;

// ── Dropdown defined outside to prevent remount ──────────────────────────────
const Dropdown = ({
  label,
  options = [],
  selected,
  setSelected,
  isOpen,
  setIsOpen,
  closeOthers,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef(null);
  const isActive = isOpen || selected.length > 0 || searchTerm.length > 0;

  const filteredOptions = options
    .slice()
    .sort((a, b) => a.localeCompare(b))
    .filter((option) =>
      option.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  const toggleSelection = (value) => {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
    setSearchTerm("");
  };

  const removeSelection = (value, e) => {
    e.stopPropagation();
    setSelected((prev) => prev.filter((item) => item !== value));
  };

  return (
    <div className="relative w-full font-sans mt-2">
      <div
        className={`group relative border rounded-md px-3 py-1.5 bg-white flex items-center gap-2 min-h-[44px] transition-all duration-200 cursor-text ${
          isOpen
            ? "border-[#0060A9] ring-[1px] ring-[#00B4FA] shadow-[0_0_0_4px_rgba(0,96,169,0.1)]"
            : "border-gray-300 hover:border-gray-400 shadow-sm"
        }`}
        onClick={() => {
          closeOthers();
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        <label
          className={`absolute left-3 px-1 transition-all duration-200 pointer-events-none bg-white z-10 ${
            isActive
              ? "-top-2.5 text-[11px] text-[#0060A9] font-medium"
              : "top-[11px] text-sm text-gray-400"
          }`}
        >
          {isActive ? label : `Select ${label}...`}
        </label>

        <div className="flex-1 flex flex-wrap items-center gap-1.5 min-h-[32px] max-h-24 overflow-y-auto scrollbar-none">
          {selected.map((item) => (
            <div
              key={item}
              className="flex items-center bg-gray-100 border border-gray-200 text-gray-700 px-2 py-0.5 rounded shadow-sm text-xs font-medium"
            >
              <span className="truncate max-w-[120px]">{item}</span>
              <button
                type="button"
                onClick={(e) => removeSelection(item, e)}
                className="ml-1.5 text-gray-400 hover:text-red-500 transition-colors"
              >
                <FaTimes className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="outline-none bg-transparent text-sm flex-1 min-w-[60px] py-1"
          />
        </div>

        <div className="flex items-center ml-1 border-l pl-2 border-gray-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            {isOpen ? (
              <FaChevronUp className="h-3.5 w-3.5" />
            ) : (
              <FaChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-md shadow-xl border border-gray-200 overflow-hidden py-1">
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option}
                  onClick={() => toggleSelection(option)}
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                    selected.includes(option)
                      ? "bg-blue-50 text-[#0060A9] font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 italic text-center">
                No results for "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const Allergens = () => {
  const navigate = useNavigate();
  const [allergens, setAllergens] = useState([]);
  const [dislikes, setDislikes] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [optionsData, setOptionsData] = useState({
    allergens: [],
    dislikes: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAccountCreatedPopup, setShowAccountCreatedPopup] = useState(false);
  const [mobile, setMobile] = useState(isMobile());
  const sourceFlow = sessionStorage.getItem("sourceFlow");

  useEffect(() => {
    const onResize = () => setMobile(isMobile());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (sourceFlow !== "signup") {
      return undefined;
    }

    const handlePopState = () => {
      setSignupStep(SIGNUP_STEPS.PREFERENCES);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [sourceFlow]);

  useEffect(() => {
    if (sourceFlow === "signup") {
      setSignupStep(SIGNUP_STEPS.ALLERGENS);
    }
  }, [sourceFlow]);

  const clearSignupFlowState = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    sessionStorage.removeItem("tempSignupData");
    sessionStorage.removeItem("tempDislikes");
    sessionStorage.removeItem("tempPreferences");
    sessionStorage.removeItem("sourceFlow");
    sessionStorage.removeItem("pendingEmail");
    clearSignupStep();
  };

  const handlePopupContinue = () => {
    setShowAccountCreatedPopup(false);
    clearSignupFlowState();
    navigate("/login?mode=login", { replace: true });
  };

  const fetchOptions = async () => {
    try {
      const allergensResponse = await fetch(buildApiUrl("/api/allergens"));
      const allergensData = allergensResponse.ok
        ? await allergensResponse.json()
        : [];

      const dislikesResponse = await fetch(
        buildApiUrl("/api/options?type=dislikes"),
      );
      const dislikesData = dislikesResponse.ok
        ? await dislikesResponse.json()
        : [];
      const dislikes =
        dislikesData.find((item) => item.type === "dislikes")?.values || [];

      setOptionsData({
        allergens: Array.isArray(allergensData) ? allergensData : [],
        dislikes: Array.isArray(dislikes) ? dislikes : [],
      });
    } catch (error) {
      console.error("Error fetching options:", error.message);
      setOptionsData({ allergens: [], dislikes: [] });
    } finally {
      setLoading(false);
    }
  };

  const saveDislikes = async () => {
    const token = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");
    if (!token || !userId) {
      sessionStorage.setItem(
        "tempDislikes",
        JSON.stringify({ dislikes, allergens }),
      );
      return;
    }
    try {
      await apiFetch(`/api/user/preferences/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ dislikes, allergies: allergens }),
      });
    } catch (error) {
      console.error("Error saving dislikes:", error.message);
    }
  };

  const handleCompleteSignup = async () => {
    try {
      setError("");
      setIsSubmitting(true);

      const signupDataStr = sessionStorage.getItem("tempSignupData");
      if (!signupDataStr) {
        setError("Signup session expired. Please sign up again.");
        return;
      }

      const signupData = JSON.parse(signupDataStr);
      const { email } = signupData;
      const tempPreferencesStr = sessionStorage.getItem("tempPreferences");
      const tempPreferences = tempPreferencesStr
        ? JSON.parse(tempPreferencesStr)
        : {};

      const completeSignupResponse = await fetch(
        buildApiUrl("/api/complete-signup"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            preferences: {
              flavors: Array.isArray(tempPreferences.flavors)
                ? tempPreferences.flavors
                : [],
              techniques: Array.isArray(tempPreferences.cookingStyles)
                ? tempPreferences.cookingStyles
                : [],
            },
            allergens,
            dislikes,
          }),
        },
      );

      const completeSignupData = await completeSignupResponse.json();

      if (!completeSignupResponse.ok) {
        setError(completeSignupData.message || "Account creation failed");
        return;
      }

      setShowAccountCreatedPopup(true);
    } catch (error) {
      console.error("Error completing signup:", error);
      setError(error.message || "Failed to complete signup");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const isDoneDisabled = allergens.length === 0 && dislikes.length === 0;

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
            : "absolute inset-0 flex items-center justify-end pr-[60px] pointer-events-none"
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

                <h1 className="text-3xl sm:text-4xl font-sfpro font-bold text-center text-black mb-6">
                  ALLER
                  <span className="bg-gradient-to-b from-[#0060A9] to-[#00B4FA] bg-clip-text text-transparent">
                    G
                  </span>
                  ENS & DISLIKES
                </h1>

                {loading ? (
                  <div className="text-center text-gray-400 text-sm py-8">
                    Loading options...
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Dropdown
                      label="Allergens"
                      icon={AllergenIcon}
                      options={optionsData.allergens}
                      selected={allergens}
                      setSelected={setAllergens}
                      isOpen={openDropdown === "allergens"}
                      setIsOpen={(state) =>
                        setOpenDropdown(state ? "allergens" : null)
                      }
                      closeOthers={() => setOpenDropdown("allergens")}
                    />
                    <Dropdown
                      label="Dislikes"
                      icon={DislikeIcon}
                      options={optionsData.dislikes}
                      selected={dislikes}
                      setSelected={setDislikes}
                      isOpen={openDropdown === "dislikes"}
                      setIsOpen={(state) =>
                        setOpenDropdown(state ? "dislikes" : null)
                      }
                      closeOthers={() => setOpenDropdown("dislikes")}
                    />
                  </div>
                )}

                {error && (
                  <p className="mt-4 text-center text-sm text-red-500">
                    {error}
                  </p>
                )}

                <button
                  onClick={handleCompleteSignup}
                  disabled={isDoneDisabled || isSubmitting}
                  className={`w-full flex justify-center mt-6 py-2.5 px-4 rounded-lg text-sm font-sfpro font-bold text-white bg-gradient-to-b from-[#0060A9] to-[#00B4FA] outline-none shadow-md transition-all ${
                    isDoneDisabled || isSubmitting
                      ? "cursor-not-allowed opacity-50"
                      : "hover:brightness-110 active:scale-[0.98]"
                  }`}
                >
                  {isSubmitting ? "Creating account..." : "Done"}
                </button>

                <button
                  className="w-full mt-3 px-4 py-2.5 text-sm font-sfpro font-bold border-2 border-[#0060A9] text-[#0060A9] rounded-lg bg-white hover:bg-gray-50 outline-none transition-all"
                  disabled={isSubmitting}
                  onClick={handleCompleteSignup}
                >
                  {isSubmitting ? "Creating account..." : "Skip for Now"}
                </button>

                <div className="mt-6 pt-4 border-t border-orange-200 text-center">
                  <button
                    onClick={async () => {
                      if (sourceFlow === "signup") {
                        setSignupStep(SIGNUP_STEPS.PREFERENCES);
                      }
                      await saveDislikes();
                      navigate("/preferences", { replace: true });
                    }}
                    className="text-sm font-semibold text-[#F57600] hover:underline outline-none"
                  >
                    Back
                  </button>
                </div>

                <PrefPopup
                  isOpen={showAccountCreatedPopup}
                  onContinue={handlePopupContinue}
                  title="Account Created"
                  message="Your account has been created successfully. Continue to sign in."
                  buttonText="Continue to Login"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Allergens;
