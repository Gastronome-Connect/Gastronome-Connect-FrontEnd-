import React, { useState, useEffect } from "react";
import { Flame } from "lucide-react";
import PopularRecipeCard from "../Cards/PopularRecipeCard";
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

const recipes = [
  { name: "Kare-kare",     author: "Lola Rosa",      img: Karekare  },
  { name: "Sisig",         author: "Aling Lucing",   img: Sisig     },
  { name: "Adobo",         author: "Chef Boy Logro", img: Adobo     },
  { name: "Lechong Kawali",author: "Mang Tomas",     img: Lechon    },
  { name: "Sinigang",      author: "Nanay Maria",    img: Sinigang  },
  { name: "Bicol Express", author: "Bicol's Finest", img: Bicol     },
  { name: "Pancit Canton", author: "Lolo Pepe",      img: Pancit    },
  { name: "Laing",         author: "Gata Master",    img: Laing     },
  { name: "Binangkal",     author: "Cebu Sweets",    img: Binangkal },
  { name: "Lechon Manok",  author: "Andok's Style",  img: Lechon    },
];

// Skeleton row that mirrors PopularRecipeCard's layout
const SkeletonPopularRow = () => (
  <div className="flex items-center gap-4 p-3 rounded-[22px] border border-transparent">
    {/* Rank */}
    <SkeletonLoader width="20px" height="14px" borderRadius="4px" />
    {/* Thumbnail */}
    <SkeletonLoader width="56px" height="56px" borderRadius="16px" />
    {/* Text */}
    <div className="flex-1 flex flex-col gap-1.5">
      <SkeletonLoader width="70%" height="14px" borderRadius="4px" />
      <SkeletonLoader width="50%" height="11px" borderRadius="4px" />
    </div>
  </div>
);

export default function PopularRecipes() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data fetch — replace with real API call if needed
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 flex flex-col h-full min-h-0 shadow-[0_20px_40px_-15px_rgba(0,96,169,0.08)] relative overflow-hidden">

      <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#0060A9]/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#F57600]/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-end mb-4 sm:mb-8 px-1 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame size={14} className="text-[#F57600] animate-pulse" />
            <span className="text-[#F57600] text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">
              Weekly Top 10
            </span>
          </div>
          <h3 className="font-black text-2xl sm:text-3xl text-[#0060A9] tracking-tighter leading-none">
            Popular Recipes
          </h3>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-2 sm:pr-3 custom-scrollbar space-y-2 sm:space-y-3 relative z-10">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonPopularRow key={i} />)
          : recipes.map((recipe, index) => (
              <PopularRecipeCard key={index} recipe={recipe} index={index} />
            ))
        }
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #CBD5E1; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #0060A9; }
      `}</style>
    </div>
  );
}