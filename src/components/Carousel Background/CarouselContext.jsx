import React, { createContext, useContext, useState, useEffect } from "react";

const INTERVAL = 5500;
const IMAGE_COUNT = 3;

const CarouselContext = createContext(null);

export const CarouselProvider = ({ children }) => {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev]       = useState(null);
  const [key, setKey]         = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => {
        const next = (c + 1) % IMAGE_COUNT;
        setPrev(c);
        setKey((k) => k + 1);
        return next;
      });
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []); // ✅ Runs once at app start, never resets on route change

  return (
    <CarouselContext.Provider value={{ current, prev, key }}>
      {children}
    </CarouselContext.Provider>
  );
};

export const useCarousel = () => useContext(CarouselContext);