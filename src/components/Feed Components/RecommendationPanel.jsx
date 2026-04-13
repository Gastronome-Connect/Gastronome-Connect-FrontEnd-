import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import RecommendationCard from "../Cards/RecommendedRecipeCard";
import { SkeletonLoader } from "../Skeletons";

import Karekare  from "../Assets/Kare-kare.png";
import Sisig     from "../Assets/Sisig.png";
import Adobo     from "../Assets/Adobo.png";
import Lechon    from "../Assets/Lechong Kawali.png";
import Sinigang  from "../Assets/Sinigang.png";
import Bicol     from "../Assets/Bicol Express.png";
import Pancit    from "../Assets/Pancit Canton.png";
import Laing     from "../Assets/Laing.png";
import Binangkal from "../Assets/Binangkal.png";

const recommendedRecipes = [
  { name: "Kare-kare",     author: "Lola Rosa",      img: Karekare  },
  { name: "Sisig",         author: "Aling Lucing",   img: Sisig     },
  { name: "Adobo",         author: "Chef Boy Logro", img: Adobo     },
  { name: "Lechong Kawali",author: "Mang Tomas",     img: Lechon    },
  { name: "Sinigang",      author: "Nanay Maria",    img: Sinigang  },
  { name: "Bicol Express", author: "Bicol's Finest", img: Bicol     },
  { name: "Pancit Canton", author: "Lolo Pepe",      img: Pancit    },
  { name: "Laing",         author: "Gata Master",    img: Laing     },
  { name: "Binangkal",     author: "Jomarrie",       img: Binangkal },
  { name: "Pork Humba",    author: "Lola Arnel",     img: Adobo     },
];

/**
 * SkeletonRecommendationCard
 * Matches the exact width, height, and shape of RecommendationCard
 * so the layout doesn't shift when real cards appear.
 */
const SkeletonRecommendationCard = () => (
  <div
    className="flex-shrink-0 min-w-[160px] sm:min-w-[200px] md:min-w-[220px] xl:min-w-[240px]
               rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden bg-white border border-gray-50 shadow-sm"
  >
    {/* Image block */}
    <div className="h-24 sm:h-32 xl:h-40 w-full">
      <SkeletonLoader width="100%" height="100%" borderRadius="0" />
    </div>

    {/* Content block */}
    <div className="p-3 sm:p-4 xl:p-5 flex flex-col gap-2">
      {/* Accent line */}
      <SkeletonLoader width="32px" height="4px" borderRadius="9999px" />
      {/* Title */}
      <SkeletonLoader width="80%" height="16px" borderRadius="6px" />
      {/* Description — hidden on smallest, matches hidden sm:block */}
      <div className="hidden sm:block">
        <SkeletonLoader width="100%" height="11px" borderRadius="4px" />
      </div>
      {/* Bottom row */}
      <div className="mt-2 pt-2 border-t border-gray-50 flex justify-between items-center">
        <SkeletonLoader width="50px" height="10px" borderRadius="4px" />
        <div className="flex gap-1">
          <SkeletonLoader width="6px" height="6px" borderRadius="9999px" />
          <SkeletonLoader width="6px" height="6px" borderRadius="9999px" />
        </div>
      </div>
    </div>
  </div>
);

export default function Recommendation() {
  const scrollRef               = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  // Replace with your real API call
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    scrollRef.current.scrollTo({
      left: direction === "left"
        ? scrollLeft - clientWidth * 0.8
        : scrollLeft + clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  return (
    <section className="w-full relative">
      {/* Header */}
      <div className="px-2">
        <span className="text-[#F57600] text-[10px] sm:text-xs font-black tracking-widest uppercase">
          Daily Picks
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#0060A9] tracking-tight">
          Recommendation
        </h2>
      </div>

      <div className="relative group/slider">
        {/* Left arrow — only when loaded */}
        {!isLoading && (
          <button
            onClick={() => scroll("left")}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-white rounded-full shadow-xl border border-gray-50 text-[#0060A9] hover:bg-[#F57600] hover:text-white transition-all opacity-0 group-hover/slider:opacity-100 focus:outline-none hidden md:block active:scale-90"
          >
            <ChevronLeft size={24} strokeWidth={3} />
          </button>
        )}

        {/*
          Same horizontal scroll container for both states so
          the row height never jumps between skeleton and real cards.
        */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-8 overflow-x-auto py-4 sm:py-6 px-2 scroll-smooth no-scrollbar"
        >
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRecommendationCard key={i} />
              ))
            : recommendedRecipes.map((recipe, index) => (
                <RecommendationCard key={index} recipe={recipe} />
              ))
          }
          <div className="min-w-[24px] sm:min-w-[40px] flex-shrink-0" />
        </div>

        {/* Right arrow — only when loaded */}
        {!isLoading && (
          <button
            onClick={() => scroll("right")}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-white rounded-full shadow-xl border border-gray-50 text-[#0060A9] hover:bg-[#F57600] hover:text-white transition-all opacity-0 group-hover/slider:opacity-100 focus:outline-none hidden md:block active:scale-90"
          >
            <ChevronRight size={24} strokeWidth={3} />
          </button>
        )}
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}