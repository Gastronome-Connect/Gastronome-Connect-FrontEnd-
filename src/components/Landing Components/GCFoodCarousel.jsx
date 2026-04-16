import React, { useState, useEffect, useCallback, useRef } from "react";

import Karekare from "../Assets/Kare-kare.png";
import Sisig from "../Assets/Sisig.png";
import Adobo from "../Assets/Adobo.png";
import Lechon from "../Assets/Lechong Kawali.png";
import Sinigang from "../Assets/Sinigang.png";
import Bicol from "../Assets/Bicol Express.png";
import Pancit from "../Assets/Pancit Canton.png";
import Laing from "../Assets/Laing.png";
import Binangkal from "../Assets/Binangkal.png";

const dishes = [
  {
    name: "Kare-Kare",
    description: "A Filipino oxtail stew in peanut sauce.",
    image: Karekare,
    path: "../KarekareRecipe",
  },
  {
    name: "Classic Pork Sisig",
    description: "Cook with Pig ears with a mix of Pig skin.",
    image: Sisig,
    path: "../SisigRecipe",
  },
  {
    name: "Adobong Bisaya",
    description: "A regional take on the classic Adobo dish.",
    image: Adobo,
    path: "../AdoboRecipe",
  },
  {
    name: "Sinigang",
    description: "A sour tamarind-based soup.",
    image: Sinigang,
    path: "../SinigangRecipe",
  },
  {
    name: "Lechong Kawali",
    description: "Crispy fried pork belly.",
    image: Lechon,
    path: "../LechonRecipe",
  },
  {
    name: "Bicol Express",
    description: "A spicy coconut milk stew.",
    image: Bicol,
    path: "../BicolExpressRecipe",
  },
  {
    name: "Pancit Canton",
    description: "Stir-fried noodles with vegetables and meat.",
    image: Pancit,
    path: "../PancitCantonRecipe",
  },
  {
    name: "Laing",
    description: "Taro leaves cooked in coconut milk.",
    image: Laing,
    path: "../LaingRecipe",
  },
  {
    name: "Binagkal",
    description: "Bread with sesame-seed coating.",
    image: Binangkal,
    path: "../BinangkalRecipe",
  },
];

const RecipeCarousel = () => {
  const totalItems = dishes.length;
  const [currentIndex, setCurrentIndex] = useState(totalItems);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const scrollRef = useRef(null);
  const isProcessingClick = useRef(false);
  const extendedDishes = [...dishes, ...dishes, ...dishes];

  // Detect mobile once
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" },
    );
    if (scrollRef.current) observer.observe(scrollRef.current);
    return () => observer.disconnect();
  }, []);

  const handleNext = useCallback(() => {
    if (isProcessingClick.current) return;
    isProcessingClick.current = true;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
    setTimeout(() => {
      isProcessingClick.current = false;
    }, 700);
  }, []);

  const handlePrev = useCallback(() => {
    if (isProcessingClick.current) return;
    isProcessingClick.current = true;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
    setTimeout(() => {
      isProcessingClick.current = false;
    }, 700);
  }, []);

  useEffect(() => {
    if (isHovered || !isVisible) return;
    const interval = setInterval(handleNext, 4000);
    return () => clearInterval(interval);
  }, [handleNext, isHovered, isVisible]);

  useEffect(() => {
    let timer;
    if (currentIndex >= totalItems * 2) {
      timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(totalItems);
      }, 700);
    } else if (currentIndex < totalItems) {
      timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(totalItems * 2 - 1);
      }, 700);
    }
    return () => clearTimeout(timer);
  }, [currentIndex, totalItems]);

  // On mobile: full-width single card layout, swipeable
  const touchStartX = useRef(null);
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? handleNext() : handlePrev();
    touchStartX.current = null;
  };

  // Card width: 25% on desktop, 80% on mobile (so adjacent cards peek)
  const cardWidth = isMobile ? 80 : 25;
  const offsetPct = isMobile ? 10 : 37.5; // centers the active card

  return (
    <div
      ref={scrollRef}
      className="min-h-[60vh] sm:min-h-[75vh] w-full bg-[#FDEEE0] flex flex-col items-center justify-center py-10 px-4 overflow-hidden select-none"
    >
      <style>{`
        @keyframes kenburns {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .animate-kenburns { animation: kenburns 12s ease-in-out infinite; }
      `}</style>

      {/* Heading */}
      <div className="text-center mb-8 sm:mb-10 px-4">
        <h2 className="text-[#F57600] text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter drop-shadow-sm">
          Savor Every Experience
        </h2>
        <p className="text-gray-600 text-xs sm:text-sm mt-2 max-w-md mx-auto">
          Explore our handpicked selection of authentic Filipino flavors.
        </p>
      </div>

      <div
        className={`
        flex flex-col items-center w-full max-w-[1400px] transition-all duration-1000 ease-out
        ${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-20 scale-95 blur-sm"}
      `}
      >
        <div className="flex items-center w-full relative">
          {/* Prev arrow — desktop only */}
          <button
            onClick={handlePrev}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="hidden lg:flex absolute left-10 w-14 h-14 items-center justify-center bg-white text-[#F57600] rounded-full shadow-xl hover:bg-[#F57600] hover:text-white transition-all z-50 border-2 border-[#F57600] active:scale-90"
          >
            <span className="text-2xl">❮</span>
          </button>

          {/* Carousel track */}
          <div
            className={`relative w-full flex items-center ${isMobile ? "h-[340px]" : "h-[550px]"}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className={`flex items-center w-full h-full ${isTransitioning ? "transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]" : ""}`}
              style={{
                transform: `translateX(calc(-${currentIndex * cardWidth}% + ${offsetPct}%))`,
              }}
            >
              {extendedDishes.map((dish, index) => {
                const isHighlight = index === currentIndex;
                return (
                  <div
                    key={index}
                    style={{ width: `${cardWidth}%` }}
                    className="flex-shrink-0 flex justify-center items-center px-2 sm:px-4"
                  >
                    <div
                      onClick={() => {
                        if (index < currentIndex) handlePrev();
                        else if (index > currentIndex) handleNext();
                      }}
                      className={`
                        relative w-full rounded-[2rem] sm:rounded-[3rem] overflow-hidden transition-all duration-700 cursor-pointer
                        border-[5px] sm:border-[8px] border-[#F57600]
                        ${
                          isHighlight
                            ? isMobile
                              ? "z-30 h-[300px] opacity-100 shadow-[0_20px_40px_-10px_rgba(245,118,0,0.5)] scale-105"
                              : "z-30 h-[480px] w-[110%] opacity-100 shadow-[0_30px_60px_-15px_rgba(245,118,0,0.5)] scale-110"
                            : isMobile
                              ? "z-10 h-[240px] opacity-30 scale-95"
                              : "z-10 h-[320px] opacity-20 blur-[2px] grayscale scale-90"
                        }
                      `}
                    >
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ${isHighlight ? "animate-kenburns" : ""}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      <div
                        className={`absolute inset-0 flex flex-col justify-end p-5 sm:p-8 text-white transition-all duration-700 ${isHighlight ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                      >
                        <h3 className="text-xl sm:text-3xl font-black mb-1 sm:mb-2 italic tracking-tight">
                          {dish.name}
                        </h3>
                        <p className="text-white/80 text-xs sm:text-sm line-clamp-2 font-medium italic leading-relaxed">
                          {dish.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next arrow — desktop only */}
          <button
            onClick={handleNext}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="hidden lg:flex absolute right-10 w-14 h-14 items-center justify-center bg-white text-[#F57600] rounded-full shadow-xl hover:bg-[#F57600] hover:text-white transition-all z-50 border-2 border-[#F57600] active:scale-90"
          >
            <span className="text-2xl">❯</span>
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex gap-2 sm:gap-3 mt-6 sm:mt-12">
          {dishes.map((_, i) => (
            <button
              key={i}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => {
                if (isProcessingClick.current) return;
                setIsTransitioning(true);
                setCurrentIndex(totalItems + i);
              }}
              className={`h-2 transition-all duration-500 rounded-full ${currentIndex % totalItems === i ? "w-8 sm:w-12 bg-[#F57600]" : "w-2 sm:w-3 bg-[#F57600]/20"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecipeCarousel;
