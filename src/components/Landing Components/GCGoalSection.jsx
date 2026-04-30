import { useEffect, useRef, useState, useMemo } from "react";
import GoalsBG from "../Assets/GoalsBackground.png";
import MissionIcon from "../Assets/Mission.png";
import VisionIcon from "../Assets/Vision.png";
import ValuesIcon from "../Assets/Values.png";

export default function Goals() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef(null);
  const prefersReducedMotion = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <section ref={sectionRef} className="relative py-20 sm:py-28 text-white overflow-hidden font-sans">
      {/* Background */}
      <img
        src={GoalsBG}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0060A9]/60 via-[#004a82]/50 to-[#001a33]/70" />

      {/* Content */}
      <div className={`relative z-10 max-w-6xl mx-auto px-5 sm:px-8 text-center transition-all duration-1000 ease-out ${
        prefersReducedMotion
          ? "opacity-100 translate-y-0"
          : hasAnimated
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
      }`}>

        <h2 className="text-3xl sm:text-5xl md:text-7xl font-extralight mb-5 sm:mb-8 tracking-tight drop-shadow-lg">
          Gastronome{" "}
          <span className="font-semibold text-[#F57600]">Connect's Goal</span>
        </h2>

        <p className="max-w-2xl mx-auto mb-12 sm:mb-20 text-sm sm:text-base md:text-lg leading-relaxed text-blue-50/90 font-light italic px-2">
          "Redefining the culinary experience by merging AI-driven innovation with a global social community to inspire every chef and preserve every tradition."
        </p>

        {/* Three columns — stack on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-12">
          {[
            { img: MissionIcon, title: "Our Mission", text: "To simplify meal planning and enrich culinary experiences by integrating AI-powered recipe generation with a dynamic food-sharing community." },
            { img: VisionIcon,  title: "Our Vision",  text: "To become a leading digital platform where technology and community unite to transform how people discover, create, and share food globally." },
            { img: ValuesIcon,  title: "Our Values",  text: "We drive global culinary discovery through relentless innovation and shared connection, rooted in a foundation of quality, trust, and total inclusivity for every kitchen." },
          ].map((item, index) => (
            <div
              key={index}
              className={`group flex flex-col items-center p-6 sm:p-8 rounded-2xl transition-all duration-700 hover:bg-white/5 hover:backdrop-blur-sm ${
                prefersReducedMotion
                  ? "opacity-100 translate-y-0 scale-100"
                  : hasAnimated
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-20 scale-95"
              }`}
            >
              <div className="mb-5 sm:mb-8 h-24 sm:h-32 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2">
                <img src={item.img} alt={item.title} className="h-full object-contain drop-shadow-2xl" />
              </div>
              <h3 className="font-bold text-base sm:text-xl mb-3 sm:mb-4 uppercase tracking-[0.2em] text-blue-100 group-hover:text-white transition-colors">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-gray-200 group-hover:text-white transition-opacity duration-500">
                {item.text}
              </p>
              <div className="mt-4 w-0 h-[2px] bg-blue-400 transition-all duration-500 group-hover:w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}