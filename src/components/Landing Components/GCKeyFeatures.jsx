import React, { useEffect, useRef, useState } from "react";
import FirstImage from "../Assets/GCFirstImage.png";
import SecondImage from "../Assets/GCSecondImage.png";
import ThirdImage from "../Assets/GCThirdImage.png";
import FourthImage from "../Assets/GCFourthImage.png";
import FifthImage from "../Assets/GCFifthImage.png";

const useScrollReveal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, isVisible];
};

export default function Features() {
  const [sectionRef, isVisible] = useScrollReveal();
  const getDelay = (index) => (isVisible ? `${index * 150}ms` : "0ms");

  return (
    <section ref={sectionRef} className="relative bg-[#FDEEE0] py-16 sm:py-24 px-6 sm:px-10 lg:px-16 overflow-hidden">
      <div className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-7xl mx-auto">

        {/* Left: Features */}
        <div className="flex flex-col gap-8 sm:gap-10">
          <div className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <h2 className="text-5xl sm:text-7xl lg:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-[#E67E22] to-[#F57600] font-bold mb-4 sm:mb-6 tracking-tight">
              Key Features
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-lg leading-relaxed border-l-4 border-[#E67E22] pl-4 sm:pl-6">
Gastronome Connect combines intelligent recipe generation with interactive social features, allowing users to discover, create, and share meals effortlessly in one unified platform.
            </p>
          </div>

          <div className="flex flex-col gap-5 sm:gap-8">
            {[
              { id: 1, title: "AI-Powered Recipe Generation", desc: "An intelligent engine that suggests complete recipes based on your on-hand ingredients, specific dietary needs, and personal taste preferences." },
              { id: 2, title: "Social Culinary Ecosystem", desc: "Connect with fellow food enthusiasts and share your culinary creations." },
              { id: 3, title: "Community-Driven \"Top 10\" Feed", desc: "A weekly refreshed showcase of the world's most popular dishes, determined by real-time community engagement, likes, and feedback." },
              { id: 4, title: "Integrated Recipe Archive", desc: "A centralized \"vault\" for saving AI-generated suggestions and community favorites, ensuring your personal culinary library is always accessible." },
            ].map((item, index) => (
              <div
                key={item.id}
                style={{ transitionDelay: getDelay(index) }}
                className={`group border-2 border-[#0060A9] py-6 sm:py-10 px-6 sm:px-10 rounded-[20px] sm:rounded-[30px] bg-white flex gap-5 sm:gap-8 items-center shadow-lg cursor-pointer animate-float
                  transition-all duration-500 ease-out
                  ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}
                  hover:-translate-y-4 sm:hover:-translate-y-6 hover:shadow-[0_25px_60px_rgba(0,180,250,0.6)] hover:border-[#00B4FA]`}
              >
                <span className="text-4xl sm:text-7xl font-black text-[#E67E22] min-w-[36px] sm:min-w-[60px] transition-transform duration-300 group-hover:scale-110">
                  {item.id}
                </span>
                <div>
                  <h3 className="font-bold text-[#E67E22] text-lg sm:text-2xl mb-1 sm:mb-2 group-hover:translate-x-2 transition-transform duration-300">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-md text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Photo Mosaic — hidden on mobile, shown on lg+ */}
        <div className="hidden lg:grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-6">
            {[FirstImage, SecondImage].map((img, idx) => (
              <div
                key={idx}
                style={{ transitionDelay: getDelay(idx) }}
                className={`rounded-[50px] overflow-hidden shadow-xl animate-float cursor-pointer transition-all duration-500 ease-out
                  ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
                  hover:-translate-y-6 hover:scale-[1.05] hover:shadow-[0_25px_60px_rgba(0,180,250,0.6)]
                  ${idx === 0 ? "hover:rotate-[-2deg]" : "hover:rotate-[2deg]"}`}
              >
                <img src={img} alt="" className="w-full h-auto block object-cover" />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-6 pt-16">
            {[ThirdImage, FourthImage].map((img, idx) => (
              <div
                key={idx + 2}
                style={{ transitionDelay: getDelay(idx + 2) }}
                className={`rounded-[50px] overflow-hidden shadow-xl animate-float cursor-pointer transition-all duration-500 ease-out
                  ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
                  hover:-translate-y-6 hover:scale-[1.05] hover:shadow-[0_25px_60px_rgba(0,180,250,0.6)]
                  ${idx === 0 ? "hover:rotate-[2deg]" : "hover:rotate-[-2deg]"}`}
              >
                <img src={img} alt="" className="w-full h-auto block object-cover" />
              </div>
            ))}
          </div>
          <div
            style={{ transitionDelay: getDelay(4) }}
            className={`col-span-2 rounded-[50px] overflow-hidden mt-4 shadow-2xl animate-float cursor-pointer transition-all duration-500 ease-out
              ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
              hover:-translate-y-4 hover:scale-[1.02] hover:shadow-[0_25px_70px_rgba(0,180,250,0.5)]`}
          >
            <img src={FifthImage} alt="" className="w-full h-auto block object-cover" />
          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-float { animation: float 5s ease-in-out infinite; }
        .animate-float:hover { animation-play-state: paused; }
      `}</style>
    </section>
  );
}