import React, { useEffect, useState } from "react";
import LogoImage from "../Assets/Gastro.png";

/**
 * IntroLoader — Dark "Simmering" Background 
 * Logo: Static size with White Pulsing Aura
 * Exit: Smooth Fade (No zooming)
 */

const STYLES = `
  @keyframes gc-simmer {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes gc-float-particle {
    0% { transform: translateY(0) rotate(0deg); opacity: 0; }
    50% { opacity: 0.6; }
    100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
  }
  @keyframes gc-white-aura {
    0%, 100% { opacity: 0.3; transform: scale(1.1); filter: blur(20px); }
    50% { opacity: 0.7; transform: scale(1.4); filter: blur(35px); }
  }
  @keyframes gc-reveal-text {
    from { clip-path: inset(0 100% 0 0); opacity: 0; }
    to { clip-path: inset(0 0% 0 0); opacity: 1; }
  }
  @keyframes gc-bar-fill {
    0% { width: 0%; }
    100% { width: 100%; }
  }

  .gc-animate-simmer {
    background: linear-gradient(-45deg, #001A2E, #0060A9, #080400, #F57600);
    background-size: 400% 400%;
    animation: gc-simmer 15s ease infinite;
  }
  
  .gc-particle {
    position: absolute;
    bottom: -10%;
    animation: gc-float-particle 8s linear infinite;
  }

  .gc-logo-aura {
    position: absolute;
    inset: 0;
    background: white;
    border-radius: 50%;
    animation: gc-white-aura 3s ease-in-out infinite;
  }

  .gc-text-reveal {
    animation: gc-reveal-text 1.2s cubic-bezier(0.77, 0, 0.175, 1) 0.8s both;
  }
`;

function IntroLoader({ onComplete }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Stage 1: Trigger Fade Out
    const exitTimer = setTimeout(() => setExiting(true), 3800);
    // Stage 2: Final Unmount
    const doneTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 4600);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <>
      <style>{STYLES}</style>

      <div
        className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-700 gc-animate-simmer ${
          exiting ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {/* Floating "Spice" Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="gc-particle text-[#F0AE35] opacity-0"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                fontSize: `${Math.random() * 20 + 10}px`,
              }}
            >
              ✦
            </div>
          ))}
        </div>

        {/* Central Content Container */}
        <div className="relative flex flex-col items-center gap-2">
          
          {/* Main Logo with Pulsing White Aura */}
          <div className="relative mb-6">
            <div className="gc-logo-aura" />
            <img
              src={LogoImage}
              alt="Logo"
              className="w-28 h-28 sm:w-32 sm:h-32 object-contain relative z-10"
            />
          </div>

          {/* Brand Name */}
          <div className="text-center z-10">
            <h1 className="gc-text-reveal flex items-center justify-center text-2xl sm:text-4xl font-black tracking-tighter text-white">
              GASTRO
              <span className="bg-gradient-to-b from-[#F57600] to-[#F0AE35] bg-clip-text text-transparent">
                NOME
              </span>
              <span className="ml-2 bg-gradient-to-b from-[#00B4FA] to-[#0060A9] bg-clip-text text-transparent">
                CONNECT
              </span>
            </h1>
            
            <p className="mt-2 text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-[0.4em] opacity-0 animate-[gc-reveal-text_0.8s_ease_1.5s_forwards]">
              Share • Discover • Create
            </p>
          </div>

          {/* Modern Progress Bar */}
          <div className="mt-12 w-48 sm:w-64 h-[3px] bg-white/10 rounded-full overflow-hidden relative">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#00B4FA] via-[#F57600] to-[#F0AE35] animate-[gc-bar-fill_2.5s_ease_1.2s_both]"
              style={{ boxShadow: '0 0 15px #F57600' }}
            />
          </div>

          {/* Status Indicators */}
          <div className="flex gap-2 mt-6">
            {[0, 1, 2].map((dot) => (
              <div
                key={dot}
                className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce"
                style={{ animationDelay: `${dot * 0.15}s` }}
              />
            ))}
          </div>
        </div>

        {/* Bottom Ambient Branding */}
        <div className="absolute bottom-10 text-white/20 text-[9px] font-black tracking-[0.3em] uppercase">
          Culinary AI Engine v2.0
        </div>
      </div>
    </>
  );
}

export default IntroLoader;