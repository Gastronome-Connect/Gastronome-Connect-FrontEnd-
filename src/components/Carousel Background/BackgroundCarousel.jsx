import React from "react";
import Background1 from "../Assets/top-view-table-full-food.png";
import Background2 from "../Assets/stew-chicken-with-vegetables-mushrooms-cream-sauce.png";
import Background3 from "../Assets/Sinigang.png";
import { useCarousel } from "./CarouselContext";

const STYLES = `
  @keyframes kenBurns1 {
    0%   { transform: scale(1)    translateX(0%)   translateY(0%); }
    100% { transform: scale(1.12) translateX(-2%)  translateY(-1%); }
  }
  @keyframes kenBurns2 {
    0%   { transform: scale(1)    translateX(0%)   translateY(0%); }
    100% { transform: scale(1.1)  translateX(2%)   translateY(-2%); }
  }
  @keyframes kenBurns3 {
    0%   { transform: scale(1.08) translateX(-1%)  translateY(1%); }
    100% { transform: scale(1)    translateX(1%)   translateY(-1%); }
  }
  .kb-1 { animation: kenBurns1 8s ease-in-out forwards; }
  .kb-2 { animation: kenBurns2 8s ease-in-out forwards; }
  .kb-3 { animation: kenBurns3 8s ease-in-out forwards; }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes fadeOut {
    from { opacity: 1; }
    to   { opacity: 0; }
  }
  .slide-enter { animation: fadeIn  1.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
  .slide-exit  { animation: fadeOut 1.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }

  @keyframes shimmer {
    0%   { opacity: 0.4; }
    50%  { opacity: 0.65; }
    100% { opacity: 0.4; }
  }
  .vignette-shimmer { animation: shimmer 6s ease-in-out infinite; }
`;

const bgImages = [
  { src: Background1, kb: "kb-1" },
  { src: Background2, kb: "kb-2" },
  { src: Background3, kb: "kb-3" },
];

const BackgroundCarousel = () => {
  const { current, prev, key } = useCarousel();

  return (
    <>
      <style>{STYLES}</style>

      <div className="absolute inset-0 overflow-hidden -z-10">

        {/* ── All slides always mounted, opacity controlled via animation class ── */}
        {bgImages.map((img, i) => {
          const isCurrent = i === current;
          const isPrev = i === prev;

          // Not current, not prev → hidden behind, no animation
          if (!isCurrent && !isPrev) {
            return (
              <div
                key={i}
                className="absolute inset-0"
                style={{ zIndex: 1, opacity: 0, pointerEvents: "none" }}
              >
                <div
                  className={`absolute inset-0 ${img.kb}`}
                  style={{
                    backgroundImage: `url(${img.src})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              </div>
            );
          }

          if (isPrev) {
            return (
              <div
                key={i}
                className="absolute inset-0 slide-exit"
                style={{ zIndex: 2, pointerEvents: "none" }}
              >
                <div
                  className={`absolute inset-0 ${img.kb}`}
                  style={{
                    backgroundImage: `url(${img.src})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    willChange: "transform",
                  }}
                />
              </div>
            );
          }

          // isCurrent — use key so Ken Burns restarts for the new slide only
          return (
            <div
              key={`curr-${key}-${i}`}
              className="absolute inset-0 slide-enter"
              style={{ zIndex: 3, pointerEvents: "none" }}
            >
              <div
                className={`absolute inset-0 ${img.kb}`}
                style={{
                  backgroundImage: `url(${img.src})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  willChange: "transform",
                }}
              />
            </div>
          );
        })}

        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            zIndex: 5,
            background: "linear-gradient(135deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.18) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0 vignette-shimmer"
          style={{
            zIndex: 6,
            background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.25) 100%)",
            pointerEvents: "none",
          }}
        />

      </div>
    </>
  );
};

export default BackgroundCarousel;