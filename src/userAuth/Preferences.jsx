import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundCarousel from "../components/Carousel Background/BackgroundCarousel";
import { FaChevronDown, FaChevronUp, FaTimes } from "react-icons/fa";
import LogoImage from "../components/Assets/Gastro.png";
import Flavor from "../components/Assets/Flavor.png";
import CookingStyle from "../components/Assets/Cooking Style.png";
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

// ── Dropdown ──────────────────────────────────────────────────────────────────
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
        className={`group relative border rounded-md px-3 py-1.5 bg-white flex items-center gap-2 min-h-[44px] transition-all duration-200 ${
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
            placeholder=""
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
        <div className="absolute z-50 w-full mt-2 bg-white rounded-md shadow-xl border border-gray-200 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
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
const Preferences = () => {
  const navigate = useNavigate();
  const [flavors, setFlavors] = useState([]);
  const [cookingStyles, setCookingStyles] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [optionsData, setOptionsData] = useState({
    flavors: [],
    cookingStyles: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [mobile, setMobile] = useState(isMobile());

  useEffect(() => {
    const onResize = () => setMobile(isMobile());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const savePreferences = async () => {
    const token = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");
    if (!token || !userId) {
      sessionStorage.setItem(
        "tempPreferences",
        JSON.stringify({ flavors, cookingStyles }),
      );
      return;
    }
    try {
      const response = await fetch(
        buildApiUrl(`/api/user/preferences/${userId}`),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            preferences: { flavors, techniques: cookingStyles },
          }),
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save preferences.");
      }
    } catch (error) {
      console.error("Error saving preferences:", error.message);
    }
  };

  const fetchOptions = async () => {
    try {
      const response = await fetch(buildApiUrl("/api/options"));
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const result = { flavors: [], cookingStyles: [] };
      data.forEach((option) => {
        if (result[option.type]) result[option.type] = option.values;
      });
      setOptionsData(result);
    } catch (error) {
      console.error("Error fetching options:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    const syncDataAfterAuth = async () => {
      const token = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");
      if (!token || !userId) return;

      const tempPreferences = sessionStorage.getItem("tempPreferences");
      if (tempPreferences) {
        try {
          const { flavors, cookingStyles } = JSON.parse(tempPreferences);
          const response = await fetch(
            buildApiUrl(`/api/user/preferences/${userId}`),
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                preferences: { flavors, techniques: cookingStyles },
              }),
            },
          );
          if (!response.ok) {
            const e = await response.json();
            throw new Error(e.message || "Failed to sync preferences.");
          }
          sessionStorage.removeItem("tempPreferences");
        } catch (error) {
          console.error("Error syncing preferences to backend:", error.message);
        }
      }

      const tempDislikes = localStorage.getItem("tempDislikes");
      if (tempDislikes) {
        try {
          const { dislikes, allergens } = JSON.parse(tempDislikes);
          const response = await fetch(
            buildApiUrl(`/api/user/preferences/${userId}`),
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ dislikes, allergies: allergens }),
            },
          );
          if (!response.ok) {
            const e = await response.json();
            throw new Error(e.message || "Failed to sync dislikes.");
          }
          localStorage.removeItem("tempDislikes");
        } catch (error) {
          console.error("Error syncing dislikes to backend:", error.message);
        }
      }
    };
    syncDataAfterAuth();
  }, []);

  const isNextDisabled = flavors.length === 0 && cookingStyles.length === 0;

  const desktopX = (() => {
    const panelWidth = Math.min(480, window.innerWidth - 48);
    return window.innerWidth - panelWidth - 60;
  })();

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
        transform: `translateX(${desktopX}px)`,
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
                <div className="flex justify-center mb-2">
                  <img
                    src={LogoImage}
                    alt="Gastronome Connect Logo"
                    className="h-16 sm:h-20 w-auto object-contain"
                  />
                </div>

                <h1 className="text-3xl sm:text-4xl font-sfpro font-bold text-center text-black mb-6">
                  PREFEREN
                  <span className="bg-gradient-to-b from-[#F57600] to-[#F0AE35] bg-clip-text text-transparent">
                    C
                  </span>
                  ES
                </h1>

                {isLoading ? (
                  <div className="text-center text-gray-400 text-sm py-8">
                    Loading options...
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Dropdown
                      label="Flavor"
                      icon={Flavor}
                      options={optionsData.flavors}
                      selected={flavors}
                      setSelected={setFlavors}
                      isOpen={openDropdown === "flavors"}
                      setIsOpen={(state) =>
                        setOpenDropdown(state ? "flavors" : null)
                      }
                      closeOthers={() => setOpenDropdown("flavors")}
                    />
                    <Dropdown
                      label="Cooking Style"
                      icon={CookingStyle}
                      options={optionsData.cookingStyles}
                      selected={cookingStyles}
                      setSelected={setCookingStyles}
                      isOpen={openDropdown === "cookingStyles"}
                      setIsOpen={(state) =>
                        setOpenDropdown(state ? "cookingStyles" : null)
                      }
                      closeOthers={() => setOpenDropdown("cookingStyles")}
                    />
                  </div>
                )}

                <button
                  onClick={async () => {
                    await savePreferences();
                    navigate("/allergens");
                  }}
                  disabled={isNextDisabled}
                  className={`w-full flex justify-center mt-6 py-2.5 px-4 rounded-lg text-sm font-sfpro font-bold text-white bg-gradient-to-b from-[#0060A9] to-[#00B4FA] outline-none shadow-md transition-all ${
                    isNextDisabled
                      ? "cursor-not-allowed opacity-50"
                      : "hover:brightness-110 active:scale-[0.98]"
                  }`}
                >
                  Next
                </button>

                <button
                  className="w-full mt-3 px-4 py-2.5 text-sm font-sfpro font-bold border-2 border-[#0060A9] text-[#0060A9] rounded-lg bg-white hover:bg-gray-50 outline-none transition-all"
                  onClick={() => navigate("/allergens")}
                >
                  Skip for Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preferences;
