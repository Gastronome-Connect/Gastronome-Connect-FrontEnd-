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
  // id fallback
  out.id = out.id ?? out._id ?? out._id?._str ?? out._id?.$oid ?? out._id;
  // counts may be arrays (backend) or numbers (older shape)
  out._likesCount = Array.isArray(out.likes)
    ? out.likes.length
    : typeof out.likes === "number"
      ? out.likes
      : 0;
  out._commentsCount = Array.isArray(out.comments)
    ? out.comments.length
    : typeof out.comments === "number"
      ? out.comments
      : 0;
  out._repostsCount = Array.isArray(out.reposts)
    ? out.reposts.length
    : typeof out.reposts === "number"
      ? out.reposts
      : 0;
  return out;
};

const PostCard = ({
  post: initialPost,
  isOwner = false,
  onDelete,
  onUpdate,
  viewerProfile = null,
}) => {
  const [post, setPost] = useState(() => normalizePost(initialPost));
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setPost(normalizePost(initialPost));
  }, [initialPost]);

  const handleVisitProfile = () => navigate(`/profile/${post.userId}`);

  const handleSaveEdit = (updated) => {
    setPost(normalizePost(updated));
    onUpdate?.(updated);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete?.(post.id);
  };

  const handleConfirmReport = (reasonId) => {
    console.log(`Post ${post.id} reported for: ${reasonId}`);
    setShowReportModal(false);
  };

  const ownerHandlers = isOwner
    ? {
        onEdit: () => setShowEditModal(true),
        onDelete: () => setShowDeleteConfirm(true),
        onArchive: () => setShowArchiveConfirm(true),
        onReport: undefined,
      }
    : {
        onEdit: undefined,
        onDelete: undefined,
        onArchive: undefined,
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
          viewerProfile={viewerProfile}
          {...ownerHandlers}
        />
      )}

      {showCommentModal && (
        <PostCommentModal
          post={post}
          isOwner={isOwner}
          onClose={() => setShowCommentModal(false)}
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

      {isOwner && showArchiveConfirm && (
        <ArchiveConfirmModal
          onConfirm={() => setShowArchiveConfirm(false)}
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

      {!isOwner && showReportModal && (
        <ReportModal
          post={post} // ← ADD THIS
          onConfirm={handleConfirmReport}
          onCancel={() => setShowReportModal(false)}
        />
      )}
    </>
  );
};

export default PostCard;
