import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Menu } from "lucide-react";
import LogoIcon from "../components/Assets/GC Logo.png";

const menuItems = [
  { name: "Home", id: "home-section", path: "/home" },
  { name: "About Us", path: "/about-us" },
  { name: "Contact Us", path: "/contact-us" },
  { name: "FAQs", id: "faq-section" },
];

export default function Navbar() {
  const [visible, setVisible] = useState(true);
  const [lastY, setLastY] = useState(0);
  const [activeTab, setActiveTab] = useState("Home");
  const [menuOpen, setMenuOpen] = useState(false);
  const prefersReducedMotion = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);
  // Hide on scroll down, show on scroll up; add bg after 20px; close menu on scroll
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setVisible(y < lastY || y < 60);
      setLastY(y);
      if (y > 10) setMenuOpen(false);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastY]);

  useEffect(() => {
    const match = menuItems.find((i) => i.path === location.pathname);
    if (match) setActiveTab(match.name);
    else if (location.pathname === "/") setActiveTab("Home");
    else setActiveTab("");
  }, [location.pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogoClick = () => {
    navigate("/home");
    // scroll-to-top is handled by the pathname useEffect above,
    // but if already on /home it won't fire — force it:
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClick = (item) => {
    setActiveTab(item.name);
    setMenuOpen(false);

    if (item.id === "faq-section") {
      // ── FAQs: scroll to section, navigate first if needed ────────────────
      const scrollTo = () => {
        const el = document.getElementById(item.id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      };
      if (location.pathname !== "/home" && location.pathname !== "/") {
        navigate("/home");
        setTimeout(scrollTo, 150);
      } else {
        scrollTo();
      }
    } else if (item.path) {
      // ── All other nav items: go to page + scroll to very top ─────────────
      if (location.pathname === item.path) {
        // Already on this page — just scroll up (pathname effect won't fire)
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        navigate(item.path);
        // The pathname useEffect fires and calls scrollTo({ top:0, behavior:"instant" })
        // which lands the user at the top before the new page paints.
      }
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 ${
          prefersReducedMotion ? "" : "transition-transform duration-500"
        } ${visible ? "translate-y-0" : "-translate-y-full"}`}
      >
       {/* ── DESKTOP (md+) ─────────────────────────────────────────────── */}
<div className="hidden md:flex items-center justify-between px-6 py-5">
  
  {/* Logo — fixed width, left-anchored */}
  <div
    className="flex items-center cursor-pointer w-48 shrink-0"
    onClick={handleLogoClick}
  >
    <img
      src={LogoIcon}
      alt="Logo"
      className="h-10 w-auto object-contain"
    />
  </div>

  {/* Nav pill — truly centered via flex-1 + flex justify-center */}
  <div className="flex-1 flex justify-center">
    <ul className="flex gap-32 bg-white/50 backdrop-blur-md px-16 py-2 rounded-full border border-black/5 shadow-sm">
      {menuItems.map((item) => (
        <li
          key={item.name}
          onClick={() => handleClick(item)}
          className={`cursor-pointer transition-colors duration-300 font-medium whitespace-nowrap ${
            activeTab === item.name
              ? "text-[#0060A9]"
              : "text-black hover:text-[#0060A9]/70"
          }`}
        >
          {item.name}
        </li>
      ))}
    </ul>
  </div>

  {/* Auth — fixed width, right-anchored */}
  <div className="flex gap-4 shrink-0 w-48 justify-end">
    <button
      onClick={() => navigate("/login?mode=login")}
      className="text-[#F57600] font-medium hover:text-[#0060A9] transition-colors"
    >
      Log In
    </button>
    <button
      onClick={() => navigate("/login?mode=signup")}
      className="bg-[#F57600] text-white hover:bg-[#0060A9]/90 transition-all px-6 py-2 rounded-full shadow-lg"
    >
      Sign Up
    </button>
  </div>
</div>

        {/* ── MOBILE: logo + hamburger ───────────────────────────────────── */}
        <div className="md:hidden flex items-center justify-between pl-2 pr-5 py-4">
          <div
            className="flex items-center cursor-pointer"
            onClick={handleLogoClick}
          >
            <img
              src={LogoIcon}
              alt="Logo"
              className="w-52 h-11 object-contain"
            />
          </div>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className={`p-2 rounded-lg transition-colors ${
              location.pathname === "/about-us" ||
              location.pathname === "/contact-us"
                ? "text-gray-800 hover:bg-gray-100"
                : "text-white hover:bg-white/10"
            }`}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ─────────────────────────────────────────────────── */}
      <div
        className={`fixed inset-x-0 top-0 z-40 md:hidden ${
          prefersReducedMotion ? "" : "transition-all duration-300"
        } ${
          menuOpen
            ? "opacity-100 pointer-events-auto translate-y-0"
            : "opacity-0 pointer-events-none -translate-y-1"
        }`}
      >
        <div
          className={`backdrop-blur-2xl border-b shadow-lg pt-16 ${
            location.pathname === "/about-us" ||
            location.pathname === "/contact-us"
              ? "bg-black/40 border-black/10"
              : "bg-white/20 border-white/20"
          }`}
        >
          <div className="px-4 py-3 flex flex-col gap-0.5">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleClick(item)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.name
                    ? "text-white bg-white/25 font-semibold"
                    : "text-white/90 hover:bg-white/15 hover:text-white"
                }`}
              >
                {item.name}
              </button>
            ))}

            <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-white/20">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/login?mode=signup");
                }}
                className="w-full py-3 rounded-xl bg-[#F57600] hover:bg-[#e06a00] text-white font-bold text-sm transition-colors shadow-sm"
              >
                Sign Up — it's free
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/login?mode=login");
                }}
                className="w-full py-3 rounded-xl text-white/70 font-medium text-sm hover:text-white transition-colors"
              >
                Already have an account?{" "}
                <span className="text-white font-semibold underline underline-offset-2">
                  Log In
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden bg-black/10"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}
