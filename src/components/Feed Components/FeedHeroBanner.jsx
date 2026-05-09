import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import ProfileHeader from "../Assets/ProfileHeader.png";

const SLIDES = [
  {
    isFullImage: true,
    image: ProfileHeader,
  },
  {
    tag: "FEATURED",
    title: "Discover, create, and showcase your recipes to the world",
    buttonText: "Discover 🍳",
    gradient: "from-[#F57600] via-[#F0AE35] to-[#F57600]",
    accentColor: "#F57600",
    image: "",
  },
  {
    tag: "COMMUNITY",
    title: "Join the culinary journey and share your secret flavors",
    buttonText: "Join Now ✨",
    gradient: "from-[#0060A9] via-[#00B4FA] to-[#0060A9]",
    accentColor: "#0060A9",
    image: "",
  },
];

const AUTOPLAY_DELAY = 5000;
const TRANSITION_DURATION = 700; // ms
const SWIPE_THRESHOLD = 40; // px — minimum horizontal drag to trigger slide
const SWIPE_VELOCITY = 0.3; // px/ms — fast flick triggers even below threshold

// Cloned list: [last, ...original, first] for seamless looping
const clonedSlides = [SLIDES[SLIDES.length - 1], ...SLIDES, SLIDES[0]];
const OFFSET = 1;

export default function HeroBanner({ onDiscover, onCreate }) {
  const [index, setIndex] = useState(OFFSET);
  const [animated, setAnimated] = useState(true);
  const trackRef = useRef(null);
  const intervalRef = useRef(null);
  const isJumpingRef = useRef(false);

  // ── Touch state ─────────────────────────────────────────────────────────────
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const touchStartT = useRef(null);
  const dragOffsetX = useRef(0); // live drag offset in px
  const isDragging = useRef(false);
  const isScrolling = useRef(false); // locked to vertical scroll, ignore swipe
  const trackWidth = useRef(0);
  // ────────────────────────────────────────────────────────────────────────────

  const goTo = useCallback((i, withAnimation = true) => {
    setAnimated(withAnimation);
    setIndex(i);
  }, []);

  const startAutoplay = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setIndex((prev) => {
        setAnimated(true);
        return prev + 1;
      });
    }, AUTOPLAY_DELAY);
  }, []);

  useEffect(() => {
    startAutoplay();
    return () => clearInterval(intervalRef.current);
  }, [startAutoplay]);

  useEffect(() => {
    if (isJumpingRef.current) return;
    if (index === clonedSlides.length - 1) {
      isJumpingRef.current = true;
      setTimeout(() => {
        goTo(OFFSET, false);
        isJumpingRef.current = false;
      }, TRANSITION_DURATION);
    }
    if (index === 0) {
      isJumpingRef.current = true;
      setTimeout(() => {
        goTo(SLIDES.length, false);
        isJumpingRef.current = false;
      }, TRANSITION_DURATION);
    }
  }, [index, goTo]);

  const handleDotClick = (i) => {
    goTo(i + OFFSET, true);
    startAutoplay();
  };

  const activeIndex =
    (((index - OFFSET) % SLIDES.length) + SLIDES.length) % SLIDES.length;

  // ── Touch handlers (mobile only — pointer-events guard via CSS, but we also
  //    check e.touches to be safe on desktop with touch screens) ───────────────

  const applyDragOffset = (offsetPx) => {
    if (!trackRef.current || !trackWidth.current) return;
    const pct = (offsetPx / trackWidth.current) * 100;
    // Base translateX from current slide index + live drag
    trackRef.current.style.transition = "none";
    trackRef.current.style.transform = `translateX(calc(-${index * 100}% + ${pct}px))`;
  };

  const resetTrackTransform = (withAnim = true) => {
    if (!trackRef.current) return;
    trackRef.current.style.transition = withAnim
      ? `transform ${TRANSITION_DURATION}ms cubic-bezier(0.4,0,0.2,1)`
      : "none";
    trackRef.current.style.transform = `translateX(-${index * 100}%)`;
  };

  const onTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartT.current = performance.now();
    dragOffsetX.current = 0;
    isDragging.current = false;
    isScrolling.current = false;
    trackWidth.current = trackRef.current?.offsetWidth ?? 0;
    // Pause autoplay while user interacts
    clearInterval(intervalRef.current);
  };

  const onTouchMove = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    // First significant move: decide axis lock
    if (!isDragging.current && !isScrolling.current) {
      if (Math.abs(dx) > Math.abs(dy) + 4) {
        isDragging.current = true;
      } else if (Math.abs(dy) > Math.abs(dx) + 4) {
        isScrolling.current = true;
      }
    }

    if (isScrolling.current) return; // let native scroll happen

    if (isDragging.current) {
      // Prevent page scroll while swiping the banner
      e.preventDefault();
      dragOffsetX.current = dx;
      applyDragOffset(dx);
    }
  };

  const onTouchEnd = (e) => {
    if (!isDragging.current) {
      touchStartX.current = null;
      startAutoplay();
      return;
    }

    const dx = dragOffsetX.current;
    const dt = performance.now() - touchStartT.current;
    const velocity = Math.abs(dx) / dt;
    const isFlick = velocity > SWIPE_VELOCITY;

    if (dx < -SWIPE_THRESHOLD || (isFlick && dx < 0)) {
      // Swipe left → next
      setAnimated(true);
      setIndex((prev) => prev + 1);
    } else if (dx > SWIPE_THRESHOLD || (isFlick && dx > 0)) {
      // Swipe right → prev
      setAnimated(true);
      setIndex((prev) => prev - 1);
    } else {
      // Snap back to current slide
      resetTrackTransform(true);
    }

    touchStartX.current = null;
    isDragging.current = false;
    startAutoplay();
  };

  const onTouchCancel = () => {
    if (isDragging.current) resetTrackTransform(true);
    touchStartX.current = null;
    isDragging.current = false;
    startAutoplay();
  };

  // When index changes via autoplay/dots/jump, sync the inline style back
  // (touch drag sets inline style; non-touch uses the style prop below)
  useEffect(() => {
    if (trackRef.current && !isDragging.current) {
      trackRef.current.style.transition = animated
        ? `transform ${TRANSITION_DURATION}ms cubic-bezier(0.4,0,0.2,1)`
        : "none";
      trackRef.current.style.transform = `translateX(-${index * 100}%)`;
    }
  }, [index, animated]);

  return (
    <div className="w-full flex flex-col items-center gap-3 sm:gap-6">
      {/* Banner */}
      <div
        className="relative w-full overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-white shadow-[0_20px_50px_-20px_rgba(0,96,169,0.3)] border border-gray-100"
        // Touch handlers attached to the outer container
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchCancel}
      >
        <div
          ref={trackRef}
          style={{
            display: "flex",
            // Initial transform via style prop; subsequent updates via useEffect + inline style
            transform: `translateX(-${index * 100}%)`,
            transition: animated
              ? `transform ${TRANSITION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`
              : "none",
            // Disable default touch-action on the track so our swipe works;
            // vertical scroll still works because we check axis lock in onTouchMove
            touchAction: "pan-y",
            // Prevent image drag on desktop accidentally triggering things
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          {clonedSlides.map((slide, i) => (
            <div
              key={i}
              className={`relative min-w-full flex items-center justify-center overflow-hidden
                ${slide.isFullImage ? "bg-white" : `bg-gradient-to-br ${slide.gradient}`} text-white`}
              style={!slide.isFullImage ? { minHeight: "180px" } : {}}
            >
              {slide.isFullImage ? (
                <div className="w-full h-[160px] sm:h-[220px] md:h-auto overflow-hidden">
                  <img
                    src={slide.image}
                    alt="Hero Header"
                    className="w-full h-full object-cover sm:object-contain select-none"
                    draggable={false}
                  />
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6 overflow-hidden">
                  {/* Decorative blobs */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none hidden sm:block"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], x: [0, 50, 0] }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute -bottom-10 -left-10 w-64 h-64 bg-black/5 rounded-full blur-3xl pointer-events-none hidden sm:block"
                  />

                  <div className="relative z-10 flex flex-col items-center gap-1 sm:gap-0">
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      className="inline-block px-3 py-0.5 sm:px-4 sm:py-1 rounded-full bg-white/20 backdrop-blur-md text-[9px] sm:text-[10px] md:text-xs font-black tracking-[0.2em] mb-2 sm:mb-3 border border-white/20 uppercase"
                    >
                      {slide.tag}
                    </motion.span>

                    <motion.h1
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      className="text-sm sm:text-lg md:text-3xl lg:text-4xl font-black mb-3 sm:mb-6 leading-[1.2] max-w-[90%] sm:max-w-[80%] drop-shadow-md"
                    >
                      {slide.title}
                    </motion.h1>

                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={onDiscover}
                        className="bg-white text-gray-900 px-4 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest hover:bg-[#F57600] hover:text-white transition-all shadow-xl shadow-black/10 active:scale-95"
                      >
                        {slide.buttonText}
                      </button>
                      <button
                        type="button"
                        onClick={onCreate}
                        className="bg-white/10 backdrop-blur-md border border-white/30 px-4 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/5 to-transparent z-0" />
      </div>

      {/* Pagination dots */}
      <div className="flex items-center gap-2 sm:gap-3 p-1 sm:p-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => handleDotClick(i)}
            className={`relative transition-all duration-500 rounded-full overflow-hidden ${
              activeIndex === i
                ? "w-8 sm:w-10 h-1.5 sm:h-2 bg-[#F57600]"
                : "w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gray-400 hover:bg-[#0060A9]/40"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          >
            {activeIndex === i && (
              <motion.div
                layoutId="activeGlow"
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                animate={{ x: [-40, 40] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
