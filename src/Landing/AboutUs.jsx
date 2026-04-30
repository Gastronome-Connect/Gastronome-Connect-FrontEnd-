import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import GCNavbar from "./NavigationBar";
import GCGoal from "../components/Landing Components/GCGoalSection";
import GCFooter from "../components/Footer/Footer";
import Jomari from "../components/Assets/jomjom 1x1.png";
import JC from "../components/Assets/JC.png";
import Matt from "../components/Assets/Matt Gallano.png";
import Nathaniel from "../components/Assets/natnat.png";

const STYLES = `
  .card-scene { perspective: 1200px; }
  .card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1);
  }
  .card-inner.flipped { transform: rotateY(180deg); }
  .card-face {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 2rem;
    overflow: hidden;
  }
  .card-back { transform: rotateY(180deg); }
  @media (prefers-reduced-motion: reduce) {
    .card-inner { transition: none; }
    .flip-hint:not(.flipped):hover .card-inner { transform: none; }
    .flip-hint.flipped:hover .card-inner { transform: rotateY(180deg); }
  }
  .flip-hint:not(.flipped):hover .card-inner { transform: rotateY(25deg); }
  .flip-hint.flipped:hover .card-inner { transform: rotateY(155deg); }

  /* Hide scrollbar cross-browser */
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

const team = [
  {
    name: "Jun Carlo Bisan",
    role: "Front-end",
    img: JC,
    contributions: [
      "Designed the UI/UX wireframes",
      "Built the landing & auth pages",
      "Implemented responsive layouts",
      "Created the carousel components",
    ],
  },
  {
    name: "Nathaniel Gonzales",
    role: "Back-end",
    img: Nathaniel,
    contributions: [
      "Developed OTP verification system",
      "Built user preferences API",
      "Integrated email notification service",
      "Wrote API documentation",
    ],
  },
  {
    name: "Matt Joshua Gallano",
    role: "Back-end",
    img: Matt,
    contributions: [
      "Engineered the feed algorithm",
      "Built allergens & dislikes API",
      "Optimized database queries",
      "Handled error handling & logging",
    ],
  },
  {
    name: "Jomari Arrojo",
    role: "Front-end",
    img: Jomari,
    contributions: [
      "Built the post & feed UI",
      "Developed profile & settings pages",
      "Implemented animations & transitions",
      "Ensured cross-browser compatibility",
    ],
  },
];

const FlipIcon = ({ reverse }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {reverse
      ? <><path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></>
      : <><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></>
    }
  </svg>
);

const TeamMemberCard = ({ member, index }) => {
  const [flipped, setFlipped] = useState(false);
  const prefersReducedMotion = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.6, delay: index * 0.1 }
      }
      /* Responsive card size: full-width on mobile, fixed on larger screens */
      className="flex-shrink-0 card-scene w-full sm:w-[240px] md:w-[260px] lg:w-[280px]"
      style={{ height: "clamp(340px, 45vw, 450px)" }}
    >
      <div
        className={`group relative w-full h-full cursor-pointer flip-hint ${flipped ? "flipped" : ""}`}
        onClick={() => setFlipped((f) => !f)}
        title={flipped ? "Click to flip back" : "Click to see contributions"}
      >
        {/* Hover tooltip — hidden on touch devices */}
        {!flipped && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/70 text-white text-[11px] font-semibold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 pointer-events-none z-30 transition-opacity duration-200 hidden sm:block"
            style={{ backdropFilter: "blur(4px)" }}>
            Click to flip ↩
          </div>
        )}

        <div className={`card-inner ${flipped ? "flipped" : ""}`}>
          {/* FRONT */}
          <div className="card-face bg-[#0060A9] border-4 border-[#0060A9] shadow-2xl">
            <div className="absolute inset-0">
              <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0060A9]/60 via-transparent to-transparent opacity-80" />
            </div>
            <div className="absolute top-4 right-4 z-10 bg-white/20 backdrop-blur-sm rounded-full p-2 text-white border border-white/30 transition-all duration-300 group-hover:bg-[#F57600] group-hover:border-[#F57600] group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#F57600]/40">
              <FlipIcon />
            </div>
            <div className="absolute bottom-5 left-4 right-4 text-center">
              <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-xl">
                <h3 className="text-[#0060A9] font-black text-[12px] sm:text-[13px] uppercase tracking-tighter leading-tight">{member.name}</h3>
                <p className="text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mt-1">{member.role}</p>
              </div>
            </div>
          </div>

          {/* BACK */}
          <div className="card-face card-back border-4 border-[#F57600] shadow-2xl"
            style={{ background: "linear-gradient(160deg, #0060A9 0%, #003d6b 100%)" }}>
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-[#F57600]/10" />
            <div className="absolute top-4 right-4 z-10 bg-white/20 backdrop-blur-sm rounded-full p-2 text-white border border-white/30 transition-all duration-300 group-hover:bg-[#F57600] group-hover:border-[#F57600] group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#F57600]/40">
              <FlipIcon reverse />
            </div>
            <div className="relative z-10 flex flex-col h-full px-5 sm:px-6 py-7 sm:py-8 justify-center">
              <div className="mb-4 sm:mb-5 text-center">
                <span className="text-[#F57600] font-black text-[10px] sm:text-[11px] uppercase tracking-[0.25em]">Contributions</span>
                <h3 className="text-white font-black text-sm sm:text-base uppercase tracking-tight leading-tight mt-1">
                  {member.name.split(" ")[0]}
                </h3>
                <div className="w-10 h-0.5 bg-[#F57600] mx-auto mt-2 rounded-full" />
              </div>
              <ul className="flex flex-col gap-2.5 sm:gap-3">
                {member.contributions.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 sm:gap-3">
                    <span className="mt-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#F57600] flex items-center justify-center shrink-0 text-white font-black text-[9px] sm:text-[10px]">{i + 1}</span>
                    <span className="text-white/90 text-xs sm:text-sm leading-snug font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-white/30 text-[10px] text-center mt-5 sm:mt-6 font-medium tracking-wider uppercase">Click to flip back</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const TeamSection = () => (
  <div className="bg-[#FDEEE0] min-h-screen overflow-x-hidden">
    <style>{STYLES}</style>
    <GCNavbar />

    <section className="py-12 sm:py-16 md:py-24 px-4">
      <div className="max-w-[1600px] mx-auto">

        {/* Heading */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl sm:text-6xl md:text-8xl font-black text-[#F57600] tracking-tighter uppercase italic"
          >
            The Team
          </motion.h1>
          <p className="text-[#0060A9] font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-xs sm:text-sm mt-2">
            Gastronome Connect Architects
          </p>
        </div>

        {/* Cards */}
        <div className="relative">
          {/*
            Mobile (< sm): vertical stack, full-width cards
            sm+: horizontal scroll row
          */}
          <div className="flex flex-col gap-6 sm:flex-row sm:flex-nowrap sm:overflow-x-auto sm:gap-4 md:gap-6 sm:pb-8 sm:px-4 sm:justify-start lg:justify-center no-scrollbar">
            {team.map((member, i) => (
              <TeamMemberCard key={i} member={member} index={i} />
            ))}
          </div>
        </div>

      </div>
    </section>

    <div className="mt-6 sm:mt-10">
      <GCGoal />
    </div>
    <GCFooter />
  </div>
);

export default TeamSection;