// src/components/InfoPill/InfoPill.jsx

const VARIANT_STYLES = {
  default: "bg-[#FFF2E7] text-gray-800 border-orange-100 hover:border-orange-200 hover:bg-orange-50",
  allergen: "bg-red-50 text-red-700 border-red-100 hover:border-red-200 hover:bg-red-100",
  dislike:  "bg-orange-50 text-orange-700 border-orange-100 hover:border-orange-200 hover:bg-orange-100",
  flavor:   "bg-indigo-50 text-indigo-700 border-indigo-100 hover:border-indigo-200 hover:bg-indigo-100",
  cooking:  "bg-teal-50 text-teal-700 border-teal-100 hover:border-teal-200 hover:bg-teal-100",
};

/**
 * InfoPill
 *
 * @param {string}  text       - Label shown in the pill
 * @param {string}  variant    - "default" | "allergen" | "dislike" | "flavor" | "cooking"
 * @param {string}  className  - Extra Tailwind classes (optional)
 */
const InfoPill = ({ text, variant = "default", className = "" }) => (
  <span
    title={text}
    className={`
      inline-block px-4 py-1.5
      border rounded-full
      text-xs font-semibold
      transition-all duration-200
      truncate max-w-[150px] align-middle
      ${VARIANT_STYLES[variant] ?? VARIANT_STYLES.default}
      ${className}
    `}
  >
    {text}
  </span>
);

export default InfoPill;