import { useCallback, useState } from "react";

const isPostUnderReview = (post) =>
  post?.moderation?.status === "flagged" &&
  post?.moderation?.classification === "not_food_related";

export default function useModeratedPostCreation({
  startUpload,
  onApprovedPost,
  onFlaggedPost,
}) {
  const [showPostReviewPopup, setShowPostReviewPopup] = useState(false);

  const handleNewPost = useCallback(
    (newPost) => {
      if (isPostUnderReview(newPost)) {
        onFlaggedPost?.(newPost);
        setShowPostReviewPopup(true);
        return;
      }

      startUpload(newPost, (posted) => {
        if (posted?.isHidden) {
          return;
        }

        onApprovedPost?.(posted);
      });
    },
    [onApprovedPost, onFlaggedPost, startUpload],
  );

  return {
    handleNewPost,
    reviewPopupProps: {
      isOpen: showPostReviewPopup,
      onDismiss: () => setShowPostReviewPopup(false),
      title: "Post under review",
      message:
        "Your post is under review because it does not appear to be food related.",
    },
  };
}
