import { useState } from "react";
import { useNavigate } from "react-router-dom"; // 👈 add this
import PostHeader    from "../Post Card/Post Header/PostHeader";
import PostContent   from "../Post Card/Post Content/PostContent";
import PostActions   from "../Post Card/Post Action/PostActions";
import ExpandedView  from "../Post Card/Expanded View/ExpandedView";
import PostCommentModal from "../../components/Modals/PostModalComment";
import { DeleteConfirmModal, ArchiveConfirmModal, EditPostModal, ReportModal } from "../../components/Modals";

const PostCard = ({ post: initialPost, isOwner = false, onDelete, onUpdate }) => {
  const [post, setPost]                           = useState(initialPost);
  const [expandedIndex, setExpandedIndex]         = useState(null);
  const [showCommentModal, setShowCommentModal]   = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showEditModal, setShowEditModal]         = useState(false);
  const [showReportModal, setShowReportModal]     = useState(false);

  const navigate = useNavigate(); // 👈 add this

  // 👇 navigate to the post owner's profile page
  const handleVisitProfile = () => {
    navigate(`/profile/${post.userId}`); // adjust the route to match yours
  };

  const handleSaveEdit = (updated) => {
    setPost(updated);
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
        onEdit:    () => setShowEditModal(true),
        onDelete:  () => setShowDeleteConfirm(true),
        onArchive: () => setShowArchiveConfirm(true),
        onReport:  undefined,
      }
    : {
        onEdit:    undefined,
        onDelete:  undefined,
        onArchive: undefined,
        onReport:  () => setShowReportModal(true),
      };

  return (
    <>
      <div
        className="bg-white rounded-3xl border border-gray-100 mb-5 overflow-hidden"
        style={{ boxShadow: "0 4px 24px 0 rgba(245, 118, 0, 0.10), 0 1.5px 6px 0 rgba(245, 118, 0, 0.07)" }}
      >
        <div className="p-4 pb-3">
          <PostHeader
            post={post}
            isOwner={isOwner}
            onVisitProfile={handleVisitProfile} // 👈 pass it down
            {...ownerHandlers}
          />

          <PostContent
            post={post}
            onExpand={(index) => setExpandedIndex(index)}
          />
        </div>

        <PostActions
          post={post}
          onComment={() => setShowCommentModal(true)}
          commentsOpen={showCommentModal}
        />

        <div className="pb-1" />
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────── */}

      {expandedIndex !== null && (
        <ExpandedView
          post={post}
          startIndex={expandedIndex}
          isOwner={isOwner}
          onClose={() => setExpandedIndex(null)}
          {...ownerHandlers}
        />
      )}

      {showCommentModal && (
        <PostCommentModal
          post={post}
          isOwner={isOwner}
          onClose={() => setShowCommentModal(false)}
          onVisitProfile={handleVisitProfile} // 👈 also pass here if modal shows the avatar too
          onEdit={isOwner ? () => { setShowCommentModal(false); setShowEditModal(true); } : undefined}
          onDelete={isOwner ? () => { setShowCommentModal(false); setShowDeleteConfirm(true); } : undefined}
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
          onConfirm={handleConfirmReport}
          onCancel={() => setShowReportModal(false)}
        />
      )}
    </>
  );
};

export default PostCard;