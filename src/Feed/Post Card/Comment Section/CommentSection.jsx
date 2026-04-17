import {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";
import CommentList from "./CommentList";
import CommentInput from "./CommentInput";
import { apiFetch } from "../../../utils/api";
import PostUnderReviewPopup from "../../../components/Popups/PostUnderReviewPopup";

/**
 * @param {string}   postId
 * @param {Array}    initialComments
 * @param {boolean}  hideInput  - hides built-in input (ExpandedView pins its own)
 * @param {ref}      ref        - exposes addComment(text) so ExpandedView can call it
 */
const CommentSection = forwardRef(
  ({ postId, initialComments = [], hideInput = false, onPostUpdate }, ref) => {
    const [comments, setComments] = useState(initialComments);
    const [showCommentReviewPopup, setShowCommentReviewPopup] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
      setComments(initialComments);
    }, [initialComments]);

    const addComment = async (text) => {
      if (!text?.trim()) return;

      try {
        // Get userId from localStorage (set during login)
        const userId = localStorage.getItem("userId");
        if (!userId) {
          throw new Error("User not authenticated. Please login again.");
        }

        const response = await apiFetch(`/api/posts/${postId}/comments`, {
          method: "POST",
          body: JSON.stringify({ 
            userId: userId,
            text: text.trim() 
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to add comment");
        }

        // Handle different response formats
        const updatedPost = data.post || data.data || {};
        const newComment = data.comment || data.newComment || {};
        const postComments = Array.isArray(updatedPost.comments)
          ? updatedPost.comments
          : [...comments, newComment].filter(Boolean);

        setComments(postComments);
        
        if (updatedPost && (updatedPost.id || updatedPost._id)) {
          onPostUpdate?.(updatedPost);
        }

        const isCommentUnderReview =
          data.commentModeration?.status === "flagged" &&
          data.commentModeration?.classification === "not_food_related";

        if (isCommentUnderReview) {
          setShowCommentReviewPopup(true);
        }

        setTimeout(
          () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
          50,
        );
      } catch (error) {
        console.error("Failed to add comment:", error);
      }
    };

    // expose addComment so ExpandedView's pinned input can call it
    useImperativeHandle(ref, () => ({ addComment }));

    return (
      <div className="flex flex-col">
        <PostUnderReviewPopup
          isOpen={showCommentReviewPopup}
          title="Comment under review"
          message="Your comment is under review because it does not appear to be food related."
          onDismiss={() => setShowCommentReviewPopup(false)}
        />
        <CommentList comments={comments} scrollable={!hideInput} />
        <div ref={bottomRef} />
        {!hideInput && <CommentInput onSubmit={addComment} />}
      </div>
    );
  },
);

CommentSection.displayName = "CommentSection";
export default CommentSection;
