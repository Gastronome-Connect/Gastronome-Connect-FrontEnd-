import { useState } from "react";
import { motion } from "framer-motion";
import { FaRegCommentDots } from "react-icons/fa";
import LikeButton from "./LikeButton";
import DislikeButton from "./DislikeButton";
import RepostButton from "./RepostButton";

const PostActions = ({
  post,
  onComment,
  commentsOpen = false,
  onLike,
  onDislike,
  onRepost,
}) => {
  const [submitting, setSubmitting] = useState({
    like: false,
    dislike: false,
    repost: false,
  });

  const likes =
    typeof post.likesCount === "number"
      ? post.likesCount
      : Array.isArray(post.likes)
        ? post.likes.length
        : (post.likes ?? 0);
  const commentCount =
    typeof post.commentsCount === "number"
      ? post.commentsCount
      : Array.isArray(post.comments)
        ? post.comments.length
        : (post.comments ?? 0);
  const repostCount =
    typeof post.repostsCount === "number"
      ? post.repostsCount
      : Array.isArray(post.reposts)
        ? post.reposts.length
        : (post.reposts ?? 0);
  const liked = Boolean(post.likedByViewer);
  const disliked = Boolean(post.dislikedByViewer);
  const reposted = Boolean(post.repostedByViewer);

  const runAction = async (key, callback) => {
    if (!callback || submitting[key]) {
      return;
    }

    setSubmitting((current) => ({ ...current, [key]: true }));
    try {
      await callback();
    } finally {
      setSubmitting((current) => ({ ...current, [key]: false }));
    }
  };

  return (
    <div className="px-3 sm:px-4 pt-2 pb-1 flex items-center gap-2 sm:gap-3">
      {/* Like + Dislike grouped */}
      <div className="flex items-center bg-gray-100 rounded-full px-3 sm:px-5 py-2.5 sm:py-3 gap-2 sm:gap-3">
        <LikeButton
          liked={liked}
          count={likes}
          onToggle={() => runAction("like", onLike)}
          disabled={submitting.like}
        />
        <div className="w-[1px] h-4 sm:h-5 bg-gray-300" />
        <DislikeButton
          disliked={disliked}
          onToggle={() => runAction("dislike", onDislike)}
          disabled={submitting.dislike}
        />
      </div>

      {/* Comment button */}
      <motion.button
        onClick={onComment}
        whileTap={{ scale: 0.88 }}
        transition={{ type: "spring", stiffness: 500, damping: 18 }}
        className={`flex items-center gap-1.5 sm:gap-2 rounded-full px-3 sm:px-5 py-2.5 sm:py-3 transition-colors ${
          commentsOpen
            ? "bg-orange-100 text-[#F57600]"
            : "bg-gray-100 text-gray-500 hover:text-[#F57600]"
        }`}
        aria-label="Toggle comments"
      >
        <motion.span
          animate={{
            rotate: commentsOpen ? [0, -15, 15, 0] : 0,
            scale: commentsOpen ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <FaRegCommentDots size={16} className="sm:hidden" />
          <FaRegCommentDots size={18} className="hidden sm:block" />
        </motion.span>
        <motion.span
          key={commentCount}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="font-bold text-sm sm:text-base"
        >
          {commentCount}
        </motion.span>
      </motion.button>

      <RepostButton
        reposted={reposted}
        count={repostCount}
        onToggle={() => runAction("repost", onRepost)}
        disabled={submitting.repost}
      />
    </div>
  );
};

export default PostActions;
