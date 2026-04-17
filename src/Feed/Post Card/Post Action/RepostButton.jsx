import { motion } from "framer-motion";
import { FaRetweet } from "react-icons/fa";

const RepostButton = ({
  reposted = false,
  count = 0,
  onToggle,
  disabled = false,
}) => (
  <motion.button
    onClick={onToggle}
    disabled={disabled}
    whileTap={{ scale: 0.88 }}
    transition={{ type: "spring", stiffness: 500, damping: 18 }}
    className={`flex items-center gap-1 sm:gap-1.5 rounded-full px-3 sm:px-5 py-2.5 sm:py-3 transition-colors disabled:opacity-60 ${
      reposted
        ? "bg-orange-100 text-[#F57600]"
        : "bg-gray-100 text-gray-500 hover:text-[#F57600]"
    }`}
    aria-label={reposted ? "Undo repost" : "Repost"}
  >
    <motion.span
      animate={{ rotate: reposted ? 180 : 0 }}
      transition={{ type: "spring", stiffness: 360, damping: 20 }}
    >
      <FaRetweet size={18} className="sm:hidden" />
      <FaRetweet size={20} className="hidden sm:block" />
    </motion.span>
    <motion.span
      key={count}
      initial={{ y: reposted ? -8 : 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="font-bold text-sm sm:text-base"
    >
      {count}
    </motion.span>
  </motion.button>
);

export default RepostButton;
