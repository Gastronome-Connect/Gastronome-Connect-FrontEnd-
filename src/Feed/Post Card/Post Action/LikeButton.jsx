import { motion } from "framer-motion";
import { FaRegThumbsUp, FaThumbsUp } from "react-icons/fa";

const LikeButton = ({ liked = false, count = 0, onToggle }) => (
  <motion.button
    onClick={onToggle}
    whileTap={{ scale: 0.8 }}
    transition={{ type: "spring", stiffness: 600, damping: 22 }}
    className={`flex items-center gap-1.5 sm:gap-2 transition-colors ${
      liked ? "text-orange-500" : "text-gray-500 hover:text-orange-500"
    }`}
    aria-label={liked ? "Unlike" : "Like"}
  >
    <motion.span
      animate={{ scale: liked ? [1, 1.3, 1] : 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {liked
        ? <><FaThumbsUp size={15} className="sm:hidden" /><FaThumbsUp size={18} className="hidden sm:block" /></>
        : <><FaRegThumbsUp size={15} className="sm:hidden" /><FaRegThumbsUp size={18} className="hidden sm:block" /></>
      }
    </motion.span>
    <motion.span
      key={count}
      initial={{ y: liked ? -5 : 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="font-bold text-sm sm:text-base"
    >
      {count}
    </motion.span>
  </motion.button>
);

export default LikeButton;