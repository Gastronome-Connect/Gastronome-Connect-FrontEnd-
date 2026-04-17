import { motion } from "framer-motion";
import { FaThumbsDown, FaRegThumbsDown } from "react-icons/fa";

const DislikeButton = ({ disliked = false, onToggle, disabled = false }) => (
  <motion.button
    onClick={onToggle}
    disabled={disabled}
    whileTap={{ scale: 0.8 }}
    transition={{ type: "spring", stiffness: 600, damping: 22 }}
    className={`transition-colors disabled:opacity-60 ${
      disliked ? "text-blue-500" : "text-gray-500 hover:text-blue-500"
    }`}
    aria-label={disliked ? "Remove dislike" : "Dislike"}
  >
    <motion.span
      animate={{ scale: disliked ? [1, 1.3, 1] : 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {disliked ? (
        <>
          <FaThumbsDown size={15} className="sm:hidden" />
          <FaThumbsDown size={18} className="hidden sm:block" />
        </>
      ) : (
        <>
          <FaRegThumbsDown size={15} className="sm:hidden" />
          <FaRegThumbsDown size={18} className="hidden sm:block" />
        </>
      )}
    </motion.span>
  </motion.button>
);

export default DislikeButton;
