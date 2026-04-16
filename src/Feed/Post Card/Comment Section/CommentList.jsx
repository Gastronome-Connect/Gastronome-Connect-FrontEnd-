import CommentItem from "./CommentItem";

/**
 * @param {Array}   comments   - list of comment objects
 * @param {boolean} scrollable - true for feed card (caps height), false for ExpandedView (flows freely)
 */
const CommentList = ({ comments = [], scrollable = true }) => {
  return (
    <div
      className={`px-4 pt-3 pb-2 flex flex-col gap-3 ${
        scrollable ? "max-h-48 sm:max-h-56 overflow-y-auto" : ""
      }`}
    >
      {comments.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        comments.map((c) => <CommentItem key={c.id} comment={c} />)
      )}
    </div>
  );
};

export default CommentList;