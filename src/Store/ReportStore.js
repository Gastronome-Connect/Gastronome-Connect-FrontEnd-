/**
 * ReportStore.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Lightweight in-memory store for user reports (posts & comments/replies).
 *
 * Designed as a drop-in shim until the real backend is ready.
 * When you have an API, replace `addPostReport` / `addCommentReport` bodies
 * with `await adminApi.post(...)` calls and replace the getters with
 * `await adminApi.get(...)` calls. The rest of the app doesn't change.
 *
 * Shape stored per reported post:
 *   {
 *     id, author, avatar, caption, image,
 *     reportedAt, reportCount,
 *     category,          ← human-readable reason label
 *     categoryId,        ← raw reason id ("spam", "harassment", …)
 *     reportedBy,        ← array of reporter names (future-proof)
 *     detail,            ← free-text for "other" reports (nullable)
 *   }
 *
 * Shape stored per reported comment/reply:
 *   {
 *     id, type ("comment"|"reply"), author, text,
 *     postTitle, reportedAt, reportCount,
 *     category, categoryId, reportedBy, detail,
 *   }
 */

// ─── Reason id → display label map ──────────────────────────────────────────
export const REASON_LABELS = {
  spam:          "Spam or Misleading",
  harassment:    "Harassment or Bullying",
  hate:          "Hate Speech",
  violence:      "Violence or Dangerous Content",
  false:         "False Information",
  nudity:        "Nudity or Sexual Content",
  inappropriate: "Nudity or Sexual Content",   // alias used in second ReportModal
  misinformation:"False Information",           // alias
  copyright:     "Others",                      // alias
  other:         "Others",
};

// ─── Internal state ──────────────────────────────────────────────────────────
let _reportedPosts    = [];   // [ReportedPost]
let _reportedComments = [];   // [ReportedComment]
let _listeners        = [];   // change subscribers

const _notify = () => _listeners.forEach((fn) => fn());

// ─── Subscriptions (lets React components re-render on change) ───────────────
export const subscribe   = (fn) => { _listeners.push(fn); return () => { _listeners = _listeners.filter((l) => l !== fn); }; };
export const getSnapshot = () => ({ posts: _reportedPosts, comments: _reportedComments });

// ─── Post reports ────────────────────────────────────────────────────────────
/**
 * Call this from a user-facing ReportModal after they submit.
 *
 * @param {object} post       - the full post object available in PostCard/CardExpandedView
 * @param {string} reasonId   - one of the REASON_LABELS keys
 * @param {string|null} detail
 * @param {string} reportedBy - current username (default "You")
 */
export const addPostReport = (post, reasonId, detail = null, reportedBy = "You") => {
  const existing = _reportedPosts.find((p) => p.id === (post.id ?? post._id));
  if (existing) {
    // increment count & push reporter
    existing.reportCount += 1;
    if (!existing.reportedBy.includes(reportedBy)) existing.reportedBy.push(reportedBy);
  } else {
    _reportedPosts = [
      ..._reportedPosts,
      {
        id:          post.id ?? post._id,
        author:      post.author ?? "Unknown",
        avatar:      post.avatar ?? "",
        caption:     post.caption ?? post.description ?? "",
        image:       post.mediaItems?.[0]?.url ?? post.img ?? "",
        reportedAt:  new Date().toLocaleDateString(),
        reportCount: 1,
        category:    REASON_LABELS[reasonId] ?? "Others",
        categoryId:  reasonId,
        reportedBy:  [reportedBy],
        detail,
      },
    ];
  }
  _notify();
};

/**
 * Remove a post report (admin "Keep" or "Remove" action).
 */
export const removePostReport = (postId) => {
  _reportedPosts = _reportedPosts.filter((p) => p.id !== postId);
  _notify();
};

// ─── Comment / reply reports ─────────────────────────────────────────────────
/**
 * @param {object} comment    - { id, author, text, type ("comment"|"reply") }
 * @param {string} postTitle  - title/caption of the parent post
 * @param {string} reasonId
 * @param {string|null} detail
 * @param {string} reportedBy
 */
export const addCommentReport = (comment, postTitle, reasonId, detail = null, reportedBy = "You") => {
  const existing = _reportedComments.find((c) => c.id === comment.id);
  if (existing) {
    existing.reportCount += 1;
    if (!existing.reportedBy.includes(reportedBy)) existing.reportedBy.push(reportedBy);
  } else {
    _reportedComments = [
      ..._reportedComments,
      {
        id:          comment.id ?? Math.random().toString(36).substr(2, 9),
        type:        comment.type ?? "comment",
        author:      comment.author ?? "Unknown",
        text:        comment.text ?? "",
        postTitle:   postTitle ?? "Untitled post",
        reportedAt:  new Date().toLocaleDateString(),
        reportCount: 1,
        category:    REASON_LABELS[reasonId] ?? "Others",
        categoryId:  reasonId,
        reportedBy:  [reportedBy],
        detail,
      },
    ];
  }
  _notify();
};

/**
 * Remove a comment report (admin action).
 */
export const removeCommentReport = (commentId) => {
  _reportedComments = _reportedComments.filter((c) => c.id !== commentId);
  _notify();
};