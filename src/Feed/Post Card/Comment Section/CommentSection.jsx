import { useState, useRef, useImperativeHandle, forwardRef } from "react";
import CommentList from "./CommentList";
import CommentInput from "./CommentInput";

/**
 * @param {string}   postId
 * @param {Array}    initialComments
 * @param {boolean}  hideInput  - hides built-in input (ExpandedView pins its own)
 * @param {ref}      ref        - exposes addComment(text) so ExpandedView can call it
 */
const CommentSection = forwardRef(({ postId, initialComments = [], hideInput = false }, ref) => {
  const [comments, setComments] = useState(initialComments);
  const bottomRef = useRef(null);

  const addComment = (text) => {
    if (!text?.trim()) return;
    const newComment = {
      id: Math.random().toString(36).substr(2, 9),
      author: "You",
      avatar: "https://i.pravatar.cc/100?img=12",
      text: text.trim(),
      time: "Just now",
      replies: [],
    };
    setComments((prev) => [...prev, newComment]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  // expose addComment so ExpandedView's pinned input can call it
  useImperativeHandle(ref, () => ({ addComment }));

  return (
    <div className="flex flex-col">
      <CommentList comments={comments} scrollable={!hideInput} />
      <div ref={bottomRef} />
      {!hideInput && <CommentInput onSubmit={addComment} />}
    </div>
  );
});

CommentSection.displayName = "CommentSection";
export default CommentSection;