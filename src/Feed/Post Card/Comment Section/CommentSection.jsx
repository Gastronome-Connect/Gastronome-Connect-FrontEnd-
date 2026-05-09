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
import ContentViolationModal from "../../../components/Modals/ContentViolationModal";

/**
 * @param {string}   postId
 * @param {Array}    initialComments
 * @param {boolean}  hideInput  - hides built-in input (ExpandedView pins its own)
 * @param {ref}      ref        - exposes addComment(text) so ExpandedView can call it
 */
const CommentSection = forwardRef(
  ({ postId, initialComments = [], hideInput = false, onPostUpdate }, ref) => {
    const [comments, setComments] = useState(initialComments);
    const [violationError, setViolationError] = useState(null);
    const bottomRef = useRef(null);

    useEffect(() => {
      setComments(initialComments);
    }, [initialComments]);

    const addComment = async (text) => {
      const trimmedText = text?.trim();
      if (!trimmedText) return;

      const optimisticComment = {
        id: `temp-${Date.now()}`,
        _id: `temp-${Date.now()}`,
        text: trimmedText,
        content: trimmedText,
        author: "You",
        pending: true,
      };

      setComments((current) => [...current, optimisticComment]);
      onPostUpdate?.({
        id: postId,
        comments: [...comments, optimisticComment],
        commentsCount: comments.length + 1,
      });

      try {
        const response = await apiFetch(`/api/posts/${postId}/comments`, {
          method: "POST",
          body: JSON.stringify({ text: trimmedText }),
        });
        const data = await response.json();

        if (response.status === 422) {
          setViolationError({
            reason: data.reason || null,
            category: data.category || null,
          });
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Failed to add comment");
        }

        const nextComments = Array.isArray(data.post?.comments)
          ? data.post.comments
          : [...comments, data.comment].filter(Boolean);

        setComments(nextComments);
        onPostUpdate?.(data.post);

        setTimeout(
          () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
          50,
        );
      } catch (error) {
        console.error("Failed to add comment:", error);
        setComments((current) =>
          current.filter((comment) => comment.id !== optimisticComment.id),
        );
        onPostUpdate?.({
          id: postId,
          comments,
          commentsCount: comments.length,
        });
      }
    };

    const addReply = async ({ commentId, text, parentReplyId = null }) => {
      if (!commentId || !text?.trim()) return;

      try {
        const response = await apiFetch(
          `/api/posts/${postId}/comments/${commentId}/replies`,
          {
            method: "POST",
            body: JSON.stringify({ text: text.trim(), parentReplyId }),
          },
        );
        const data = await response.json();

        if (response.status === 422) {
          setViolationError({
            reason: data.reason || null,
            category: data.category || null,
          });
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Failed to add reply");
        }

        const nextComments = Array.isArray(data.post?.comments)
          ? data.post.comments
          : comments;

        setComments(nextComments);
        onPostUpdate?.(data.post);
      } catch (error) {
        console.error("Failed to add reply:", error);
      }
    };

    const reactToComment = async (commentId, type) => {
      if (!commentId || !type) return;

      try {
        const response = await apiFetch(
          `/api/comments/${commentId}/reactions`,
          {
            method: "POST",
            body: JSON.stringify({ type }),
          },
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to update reaction");
        }

        if (Array.isArray(data.post?.comments)) {
          setComments(data.post.comments);
          onPostUpdate?.(data.post);
        }
      } catch (error) {
        console.error("Failed to update comment reaction:", error);
      }
    };

    const deleteComment = async (commentId) => {
      if (!commentId) return;

      try {
        const response = await apiFetch(`/api/comments/${commentId}`, {
          method: "DELETE",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to delete comment");
        }

        if (Array.isArray(data.post?.comments)) {
          setComments(data.post.comments);
          onPostUpdate?.(data.post);
        }
      } catch (error) {
        console.error("Failed to delete comment:", error);
      }
    };

    // expose addComment so ExpandedView's pinned input can call it
    useImperativeHandle(ref, () => ({
      addComment,
      addReply,
      reactToComment,
      deleteComment,
    }));

    return (
      <div className="flex flex-col">
        <CommentList
          comments={comments}
          scrollable={!hideInput}
          postId={postId}
          onReply={addReply}
          onReact={reactToComment}
          onDelete={deleteComment}
        />
        <div ref={bottomRef} />
        {!hideInput && <CommentInput onSubmit={addComment} />}

        <ContentViolationModal
          isOpen={!!violationError}
          onClose={() => setViolationError(null)}
          reason={violationError?.reason}
          category={violationError?.category}
          contentType="comment"
        />
      </div>
    );
  },
);

CommentSection.displayName = "CommentSection";
export default CommentSection;
