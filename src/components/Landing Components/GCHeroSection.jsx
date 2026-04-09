import React, { useRef } from "react";
import { motion } from "framer-motion";
import HeroBanner from "../Assets/HeroBanner.png";

export default function Hero() {
  const heroRef = useRef(null);

  const handleLearnMore = () => {
    if (heroRef.current) {
      const nextSection = heroRef.current.nextElementSibling;
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
      }
    }
  };

  return (
    <section ref={heroRef} className="relative h-screen overflow-hidden flex items-end sm:items-center pb-24 sm:pb-0">

      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <motion.img
          src={HeroBanner}
          initial={{ scale: 1, x: 0 }}
          animate={{ scale: 1.1, x: -20 }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
          className="w-full h-full object-cover"
          alt="Hero Banner"
        />

        {/* Color correction — suppresses green, pushes toward brand palette */}
        <div className="absolute inset-0 bg-[#0060A9]/30 mix-blend-color" />

        {/* Mobile: bottom-up dark gradient + orange tint to kill the green */}
        <div className="absolute inset-0 sm:hidden bg-gradient-to-t from-black/90 via-[#0060A9]/30 to-[#F57600]/20" />

        {/* Desktop: original left-to-right with blue mid tone */}
        <div className="absolute inset-0 hidden sm:block bg-gradient-to-r from-black/70 via-[#0060A9]/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-6 sm:px-10 md:px-16 text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-5xl"
        >
          {/* Eyebrow — mobile only */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="sm:hidden text-[11px] uppercase tracking-[0.3em] text-orange-400 font-semibold mb-3"
          >
            Culinary Community
          </motion.p>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black mb-3 sm:mb-4 tracking-tighter leading-[1.05]">
            Gastronome{" "}
            <span className="text-orange-500">Connect</span>
          </h1>

          <p className="mb-8 sm:mb-10 text-sm sm:text-xl md:text-2xl text-gray-300 max-w-xs sm:max-w-2xl font-light leading-relaxed">
            Bringing world-class culinary experiences to your digital doorstep.
          </p>

          <div className="flex items-center">
            <motion.button
              whileHover={{ scale: 1.05, x: 10 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLearnMore}
              className="flex items-center gap-3 bg-orange-600 hover:bg-orange-500 px-7 sm:px-10 py-3.5 sm:py-5 rounded-full text-sm sm:text-xl font-bold transition-colors shadow-2xl"
            >
              Learn More
              <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
                →
              </motion.span>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Scroll prompt — desktop only */}
      <motion.div
        animate={{ opacity: [0.3, 0.7, 0.3], y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.4em] text-white/60">Discover</span>
        <div className="w-[1px] h-10 bg-gradient-to-b from-white/60 to-transparent" />
      </motion.div>

    </section>
  );
}