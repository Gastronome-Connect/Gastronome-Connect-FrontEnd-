import React from "react";
import { Sparkles } from "lucide-react";

/**
 * SparkleEffect — CSS-only, no framer-motion, no Math.random on render.
 * Uses a simple CSS keyframe so it never causes re-renders.
 */
const SparkleEffect = ({ color }) => (
  <>
    <span className="sparkle-float absolute pointer-events-none z-20" style={{ color }}>
      <Sparkles size={10} fill={color} />
    </span>
    <style>{`
      .sparkle-float {
        animation: sparklePop 2.4s ease-in-out infinite;
      }
      @keyframes sparklePop {
        0%   { opacity: 0; transform: scale(0) translateY(0); }
        40%  { opacity: 1; transform: scale(1.2) translateY(-8px); }
        100% { opacity: 0; transform: scale(0) translateY(-20px); }
      }
    `}</style>
  </>
);

export default SparkleEffect;