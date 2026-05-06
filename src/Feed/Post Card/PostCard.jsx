// src/components/Post Card/PostCard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PostHeader from "../Post Card/Post Header/PostHeader";
import PostContent from "../Post Card/Post Content/PostContent";
import PostActions from "../Post Card/Post Action/PostActions";
import ExpandedView from "../Post Card/Expanded View/ExpandedView";
import PostCommentModal from "../../components/Modals/PostModalComment";
import {
  DeleteConfirmModal,
  ArchiveConfirmModal,
  EditPostModal,
  ReportModal,
} from "../../components/Modals";
import { apiFetch } from "../../utils/api";
import { useUserLibrary } from "../../Context/UserLibraryContext";

/**
 * @param {{ post, isOwner, onDelete, onUpdate, viewerProfile }} props
 *
 * viewerProfile (optional) – the currently logged-in user's profile object:
 *   {
 *     allergens:     string[],
 *     dislikes:      string[],
 *     flavors:       string[],
 *     cookingStyles: string[],
 *   }
 *
 * Typically you'd pull this from a context/store at a higher level and pass
 * it once at the feed level so every PostCard receives it automatically.
 */
const normalizePost = (p = {}) => {
  const out = { ...p };
  const viewerId =
    localStorage.getItem("userId") ||
    localStorage.getItem("currentUserId") ||
    localStorage.getItem("id") ||
    "";

  // id fallback
  out.id = out.id ?? out._id ?? out._id?._str ?? out._id?.$oid ?? out._id;

  const likeEntries = Array.isArray(out.likes) ? out.likes : [];
  const dislikeEntries = Array.isArray(out.dislikes) ? out.dislikes : [];
  const repostEntries = Array.isArray(out.reposts) ? out.reposts : [];

  out.likesCount =
    typeof out.likesCount === "number"
      ? out.likesCount
      : likeEntries.length;
  out.commentsCount =
    typeof out.commentsCount === "number"
      ? out.commentsCount
      : Array.isArray(out.comments)
        ? out.comments.length
        : typeof out.comments === "number"
          ? out.comments
          : 0;
  out.repostsCount =
    typeof out.repostsCount === "number"
      ? out.repostsCount
      : repostEntries.length;

  out.likedByViewer =
    typeof out.likedByViewer === "boolean"
      ? out.likedByViewer
      : likeEntries.some((entry) => {
          const value =
            entry?.userId ??
            entry?._id ??
            entry?.id ??
            (typeof entry === "string" ? entry : null);
          return String(value) === String(viewerId);
        });

  out.dislikedByViewer =
    typeof out.dislikedByViewer === "boolean"
      ? out.dislikedByViewer
      : dislikeEntries.some((entry) => {
          const value =
            entry?.userId ??
            entry?._id ??
            entry?.id ??
            (typeof entry === "string" ? entry : null);
          return String(value) === String(viewerId);
        });

  out.repostedByViewer =
    typeof out.repostedByViewer === "boolean"
      ? out.repostedByViewer
      : repostEntries.some((entry) => {
          const value =
            entry?.userId ??
            entry?._id ??
            entry?.id ??
            (typeof entry === "string" ? entry : null);
          return String(value) === String(viewerId);
        });

  out.comments = Array.isArray(out.comments) ? out.comments : [];
  return out;
};

const PostCard = ({
  post: initialPost,
  isOwner = false,
  onDelete,
  onUpdate,
  onArchive,
  viewerProfile = null,
  autoOpenComments = false,
}) => {
  const [post, setPost] = useState(() => normalizePost(initialPost));
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const navigate = useNavigate();
  const { addToArchives } = useUserLibrary();

  useEffect(() => {
    setPost(normalizePost(initialPost));
  }, [initialPost]);

  useEffect(() => {
    if (autoOpenComments) {
      setShowCommentModal(true);
    }
  }, [autoOpenComments]);

  const applyPostUpdate = (nextPost) => {
    if (!nextPost) {
      return null;
    }

    const normalized = normalizePost(nextPost);
    setPost(normalized);
    onUpdate?.(normalized);
    return normalized;
  };

  const runPostMutation = async (path, init, fallbackMessage) => {
    const response = await apiFetch(path, init);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || fallbackMessage);
    }

    // Handle different response formats from backend
    const updatedPost = data.post || data.data || data;
    if (updatedPost && (updatedPost.id || updatedPost._id)) {
      applyPostUpdate(updatedPost);
    }

    return data;
  };

  const handleLike = async () => {
    const postId = post.id || post._id;
    const optimisticPost = {
      ...post,
      likedByViewer: !post.likedByViewer,
      dislikedByViewer: post.likedByViewer ? post.dislikedByViewer : false,
      likesCount: Math.max(0, post.likesCount + (post.likedByViewer ? -1 : 1)),
    };

    if (!post.likedByViewer && post.dislikedByViewer) {
      optimisticPost.dislikedByViewer = false;
    }

    applyPostUpdate(optimisticPost);

    try {
      await runPostMutation(
        `/api/posts/${postId}/like`,
        { method: "POST" },
        "Failed to update like",
      );
    } catch (error) {
      console.error("Failed to toggle like:", error);
      applyPostUpdate(post);
    }
  };

  const handleDislike = async () => {
    const postId = post.id || post._id;
    const optimisticPost = {
      ...post,
      dislikedByViewer: !post.dislikedByViewer,
      likedByViewer: post.dislikedByViewer ? post.likedByViewer : false,
    };

    if (!post.dislikedByViewer && post.likedByViewer) {
      optimisticPost.likedByViewer = false;
      optimisticPost.likesCount = Math.max(0, post.likesCount - 1);
    }

    applyPostUpdate(optimisticPost);

    try {
      await runPostMutation(
        `/api/posts/${postId}/dislike`,
        { method: "POST" },
        "Failed to update dislike",
      );
    } catch (error) {
      console.error("Failed to toggle dislike:", error);
      applyPostUpdate(post);
    }
  };

  const handleRepost = async () => {
    const postId = post.id || post._id;
    const optimisticPost = {
      ...post,
      repostedByViewer: !post.repostedByViewer,
      repostsCount: Math.max(
        0,
        post.repostsCount + (post.repostedByViewer ? -1 : 1),
      ),
    };

    applyPostUpdate(optimisticPost);

    try {
      await runPostMutation(
        `/api/posts/${postId}/repost`,
        { method: "POST" },
        "Failed to update repost",
      );
    } catch (error) {
      console.error("Failed to toggle repost:", error);
      applyPostUpdate(post);
    }
  };

  const handleVisitProfile = () => navigate(`/profile/${post.userId}`);

  const handleSaveEdit = (updated) => {
    applyPostUpdate(updated);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    setExpandedIndex(null);
    setShowCommentModal(false);
    onDelete?.(post.id);

    try {
      const response = await apiFetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete post");
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      setPost((currentPost) => normalizePost(currentPost));
    }
  };

  const handleConfirmArchive = () => {
    addToArchives(post);
    setShowArchiveConfirm(false);
    onArchive?.(post);
  };

  const handleConfirmReport = (reasonId) => {
    console.log(`Post ${post.id} reported for: ${reasonId}`);
    setShowReportModal(false);
  };

  const ownerHandlers = {
    onEdit: isOwner ? () => setShowEditModal(true) : undefined,
    onDelete: isOwner ? () => setShowDeleteConfirm(true) : undefined,
    onArchive: () => setShowArchiveConfirm(true),
    onReport: () => setShowReportModal(true),
  };

  return (
    <>
      <div
        className="bg-white rounded-3xl border border-gray-100 mb-5 overflow-hidden"
        style={{
          boxShadow:
            "0 4px 24px 0 rgba(245, 118, 0, 0.10), 0 1.5px 6px 0 rgba(245, 118, 0, 0.07)",
        }}
      >
        <div className="p-4 pb-3">
          <PostHeader
            post={post}
            isOwner={isOwner}
            onVisitProfile={handleVisitProfile}
            {...ownerHandlers}
          />

          {/* ↓ viewerProfile threaded through so pills appear in the card */}
          <PostContent
            post={post}
            onExpand={(index) => setExpandedIndex(index)}
            viewerProfile={viewerProfile}
          />
        </div>

        <PostActions
          post={post}
          onComment={() => setShowCommentModal(true)}
          commentsOpen={showCommentModal}
          onLike={handleLike}
          onDislike={handleDislike}
          onRepost={handleRepost}
        />

        <div className="pb-1" />
      </div>

      {/* ── Modals ── */}

      {expandedIndex !== null && (
        <ExpandedView
          post={post}
          startIndex={expandedIndex}
          isOwner={isOwner}
          onClose={() => setExpandedIndex(null)}
          onPostUpdate={applyPostUpdate}
          onLike={handleLike}
          onDislike={handleDislike}
          onRepost={handleRepost}
          viewerProfile={viewerProfile}
          {...ownerHandlers}
        />
      )}

      {showCommentModal && (
        <PostCommentModal
          post={post}
          isOwner={isOwner}
          onClose={() => setShowCommentModal(false)}
          onPostUpdate={applyPostUpdate}
          onLike={handleLike}
          onDislike={handleDislike}
          onRepost={handleRepost}
          onVisitProfile={handleVisitProfile}
          onEdit={
            isOwner
              ? () => {
                  setShowCommentModal(false);
                  setShowEditModal(true);
                }
              : undefined
          }
          onDelete={
            isOwner
              ? () => {
                  setShowCommentModal(false);
                  setShowDeleteConfirm(true);
                }
              : undefined
          }
          onArchive={isOwner ? () => setShowArchiveConfirm(true) : undefined}
          onReport={!isOwner ? () => setShowReportModal(true) : undefined}
        />
      )}

      {isOwner && showDeleteConfirm && (
        <DeleteConfirmModal
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {showArchiveConfirm && (
        <ArchiveConfirmModal
          onConfirm={handleConfirmArchive}
          onCancel={() => setShowArchiveConfirm(false)}
        />
      )}

      {isOwner && showEditModal && (
        <EditPostModal
          post={post}
          onSave={handleSaveEdit}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showReportModal && (
        <ReportModal
          post={post}
          onConfirm={handleConfirmReport}
          onCancel={() => setShowReportModal(false)}
        />
      )}
    </>
  );
};

export default PostCard;
