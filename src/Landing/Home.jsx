import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import IntroLoader from "../components/Loading Pages/IntroLoader";
import Navbar from "./NavigationBar";
import Hero from "../components/Landing Components/GCHeroSection";
import Features from "../components/Landing Components/GCKeyFeatures";
import Carousel from "../components/Landing Components/GCFoodCarousel";
import Goals from "../components/Landing Components/GCGoalSection";
import FAQ from "./FAQs";
import Footer from "../components/Footer/Footer";

export default function GCHomePage() {
  const { hash } = useLocation();
  // sessionStorage clears on refresh but persists across navigation
  const [introComplete, setIntroComplete] = useState(
    () => sessionStorage.getItem("gc_intro_played") === "true",
  );

  // ── Hooks must always be called before any conditional return ──
  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [hash]);

  // ── Conditional render after all hooks ──
  if (!introComplete) {
    return (
      <IntroLoader
        onComplete={() => {
          sessionStorage.setItem("gc_intro_played", "true");
          setIntroComplete(true);
        }}
      />
    );
  }

  return (
    <>
      <Navbar />
      <div id="home-section">
        <Hero />
      </div>
      <Features />
      <Carousel />
      <Goals />
      <div id="faq-section">
        <FAQ />
      </div>
      <Footer />
    </>
  );
}
