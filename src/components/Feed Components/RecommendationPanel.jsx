import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import RecommendationCard from "../Cards/RecommendedRecipeCard";

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

export default function Recommendation() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const scrollAmount = clientWidth * 0.8;
    scrollRef.current.scrollTo({
      left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="w-full relative">
      {/* Header */}
      <div className="px-2">
        <span className="text-[#F57600] text-[10px] sm:text-xs font-black tracking-widest uppercase">Daily Picks</span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#0060A9] tracking-tight">Recommendation</h2>
      </div>

      {/* Named group/slider so it doesn't bleed into group/card */}
      <div className="relative group/slider">
        {/* Left arrow — md+ only */}
        <button
          onClick={() => scroll("left")}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-white rounded-full shadow-xl border border-gray-50 text-[#0060A9] hover:bg-[#F57600] hover:text-white transition-all opacity-0 group-hover/slider:opacity-100 focus:outline-none hidden md:block active:scale-90"
        >
          <ChevronLeft size={24} strokeWidth={3} />
        </button>

        {/* Scrollable area */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-8 overflow-x-auto py-4 sm:py-6 px-2 scroll-smooth no-scrollbar"
        >
          {recommendedRecipes.map((recipe, index) => (
            <RecommendationCard key={index} recipe={recipe} />
          ))}
          <div className="min-w-[24px] sm:min-w-[40px] flex-shrink-0" />
        </div>

        {/* Right arrow — md+ only */}
        <button
          onClick={() => scroll("right")}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-white rounded-full shadow-xl border border-gray-50 text-[#0060A9] hover:bg-[#F57600] hover:text-white transition-all opacity-0 group-hover/slider:opacity-100 focus:outline-none hidden md:block active:scale-90"
        >
          <ChevronRight size={24} strokeWidth={3} />
        </button>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}