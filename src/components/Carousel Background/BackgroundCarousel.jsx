import React from "react";
import Background1 from "../Assets/top-view-table-full-food.png";
import Background2 from "../Assets/stew-chicken-with-vegetables-mushrooms-cream-sauce.png";
import Background3 from "../Assets/Sinigang.png";
import { useCarousel } from "./CarouselContext";

const STYLES = `
  @keyframes slideInFromRight {
    0%   { transform: translateX(100%); }
    100% { transform: translateX(0%); }
  }
  @keyframes slideOutToLeft {
    0%   { transform: translateX(0%); }
    100% { transform: translateX(-100%); }
  }
  .slide-in { animation: slideInFromRight 0.8s ease-in-out forwards; }
  .slide-out { animation: slideOutToLeft 0.8s ease-in-out forwards; }

  @keyframes shimmer {
    0%   { opacity: 0.2; }
    50%  { opacity: 0.3; }
    100% { opacity: 0.2; }
  }
  .vignette-shimmer { animation: shimmer 8s ease-in-out infinite; }

  @media (prefers-reduced-motion: reduce) {
    .slide-in, .slide-out { animation: none; opacity: 1 !important; }
    .vignette-shimmer { animation: none; }
  }
`;

const bgImages = [
  { src: Background1 },
  { src: Background2 },
  { src: Background3 },
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
                  className="absolute inset-0"
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
                className="absolute inset-0 slide-out"
                style={{ zIndex: 2, pointerEvents: "none" }}
              >
                <div
                  className="absolute inset-0"
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

          // isCurrent
          return (
            <div
              key={`curr-${key}-${i}`}
              className="absolute inset-0 slide-in"
              style={{ zIndex: 3, pointerEvents: "none" }}
            >
              <div
                className="absolute inset-0"
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