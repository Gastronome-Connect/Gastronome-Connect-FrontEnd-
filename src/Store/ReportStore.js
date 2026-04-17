/**
 * ReportStore.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Lightweight in-memory store for user reports (posts, comments/replies,
 * and profiles/users).
 *
 * Designed as a drop-in shim until the real backend is ready.
 * When you have an API, replace `addPostReport` / `addCommentReport` /
 * `addProfileReport` bodies with `await adminApi.post(...)` calls and replace
 * the getters with `await adminApi.get(...)` calls. The rest of the app
 * doesn't change.
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
 *
 * Shape stored per reported profile/user:
 *   {
 *     id, userId, author, avatar, bio,
 *     reportedAt, reportCount,
 *     category, categoryId, reportedBy, detail,
 *   }
 */

// ─── Reason id → display label map ──────────────────────────────────────────
export const REASON_LABELS = {
  spam:            "Spam or Misleading",
  harassment:      "Harassment or Bullying",
  hate:            "Hate Speech",
  violence:        "Violence or Dangerous Content",
  false:           "False Information",
  nudity:          "Nudity or Sexual Content",
  inappropriate:   "Nudity or Sexual Content",   // alias used in second ReportModal
  misinformation:  "False Information",          // alias
  fake:            "Fake Account",
  identity_theft:  "Identity Theft or Impersonation",
  scam:            "Scam or Fraud",
  abusive_profile: "Abusive Profile Content",
  copyright:       "Others",                     // alias
  other:           "Others",
};

const REASON_ALIASES = {
  misleading: "spam",
  bullying: "harassment",
  dangerous: "violence",
  sexual: "nudity",
  impersonation: "identity_theft",
  fake_account: "fake",
  scammer: "scam",
  abuse_profile: "abusive_profile",
  others: "other",
};

// ─── Internal state ──────────────────────────────────────────────────────────
const STORAGE_KEYS = {
  posts: "gastro_reported_posts",
  comments: "gastro_reported_comments",
  profiles: "gastro_reported_profiles",
};

const readPersisted = (key) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

let _reportedPosts    = readPersisted(STORAGE_KEYS.posts);      // [ReportedPost]
let _reportedComments = readPersisted(STORAGE_KEYS.comments);   // [ReportedComment]
let _reportedProfiles = readPersisted(STORAGE_KEYS.profiles);   // [ReportedProfile]
let _listeners        = [];   // change subscribers

const persist = () => {
  try {
    localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(_reportedPosts));
    localStorage.setItem(STORAGE_KEYS.comments, JSON.stringify(_reportedComments));
    localStorage.setItem(STORAGE_KEYS.profiles, JSON.stringify(_reportedProfiles));
  } catch (error) {}
};

const _notify = () => {
  persist();
  _listeners.forEach((fn) => fn());
};

const normalizeReasonId = (reasonId) => {
  const normalized = String(reasonId ?? "").trim().toLowerCase();
  return REASON_LABELS[normalized] ? normalized : (REASON_ALIASES[normalized] ?? normalized ?? "other");
};

const createReasonBreakdown = (reasonId, count = 1) => {
  const normalizedReasonId = normalizeReasonId(reasonId);
  return [
    {
      id: normalizedReasonId,
      label: REASON_LABELS[normalizedReasonId] ?? "Others",
      count,
    },
  ];
};

const mergeReasonBreakdown = (existingBreakdown = [], reasonId) => {
  const normalizedReasonId = normalizeReasonId(reasonId);
  const reasonLabel = REASON_LABELS[normalizedReasonId] ?? "Others";
  const nextBreakdown = Array.isArray(existingBreakdown) ? [...existingBreakdown] : [];
  const reasonIndex = nextBreakdown.findIndex(
    (entry) => entry?.id === normalizedReasonId || entry?.label === reasonLabel,
  );

  if (reasonIndex >= 0) {
    nextBreakdown[reasonIndex] = {
      ...nextBreakdown[reasonIndex],
      id: normalizedReasonId,
      label: reasonLabel,
      count: (nextBreakdown[reasonIndex]?.count ?? 0) + 1,
    };
    return nextBreakdown;
  }

  nextBreakdown.push({
    id: normalizedReasonId,
    label: reasonLabel,
    count: 1,
  });

  return nextBreakdown;
};

// ─── Subscriptions (lets React components re-render on change) ───────────────
export const subscribe   = (fn) => { _listeners.push(fn); return () => { _listeners = _listeners.filter((l) => l !== fn); }; };
export const getSnapshot = () => ({
  posts: _reportedPosts,
  comments: _reportedComments,
  profiles: _reportedProfiles,
});

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
  const normalizedReasonId = normalizeReasonId(reasonId);
  const existing = _reportedPosts.find((p) => p.id === (post.id ?? post._id));
  if (existing) {
    // increment count & push reporter
    existing.reportCount += 1;
    existing.reportedAt = new Date().toLocaleDateString();
    if (!existing.reportedBy.includes(reportedBy)) existing.reportedBy.push(reportedBy);
    existing.category = REASON_LABELS[normalizedReasonId] ?? "Others";
    existing.categoryId = normalizedReasonId;
    existing.reasonBreakdown = mergeReasonBreakdown(existing.reasonBreakdown, normalizedReasonId);
    existing.author = post.author ?? existing.author ?? "Unknown";
    existing.avatar = post.avatar ?? existing.avatar ?? "";
    existing.caption = post.caption ?? post.description ?? existing.caption ?? "";
    existing.image = post.mediaItems?.[0]?.url ?? post.img ?? existing.image ?? "";
    if (detail) existing.detail = detail;
  } else {
    _reportedPosts = [
      ..._reportedPosts,
      {
        id:          post.id ?? post._id,
        postId:      post.id ?? post._id,
        author:      post.author ?? "Unknown",
        avatar:      post.avatar ?? "",
        caption:     post.caption ?? post.description ?? "",
        image:       post.mediaItems?.[0]?.url ?? post.img ?? "",
        reportedAt:  new Date().toLocaleDateString(),
        reportCount: 1,
        category:    REASON_LABELS[normalizedReasonId] ?? "Others",
        categoryId:  normalizedReasonId,
        reasonBreakdown: createReasonBreakdown(normalizedReasonId),
        reportedBy:  [reportedBy],
        detail,
      },
    ];
  }
  _notify();
};

export const syncReportedPosts = (posts = []) => {
  _reportedPosts = Array.isArray(posts) ? [...posts] : [];
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
  const normalizedReasonId = normalizeReasonId(reasonId);
  const existing = _reportedComments.find((c) => c.id === comment.id);
  if (existing) {
    existing.reportCount += 1;
    if (!existing.reportedBy.includes(reportedBy)) existing.reportedBy.push(reportedBy);
    existing.category = REASON_LABELS[normalizedReasonId] ?? "Others";
    existing.categoryId = normalizedReasonId;
    if (detail) existing.detail = detail;
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
        category:    REASON_LABELS[normalizedReasonId] ?? "Others",
        categoryId:  normalizedReasonId,
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

// ─── Profile / user reports ─────────────────────────────────────────────────
/**
 * @param {object} profile    - { id|userId, author|name|userName, avatar|avatarSrc, bio }
 * @param {string} reasonId
 * @param {string|null} detail
 * @param {string} reportedBy
 */
export const addProfileReport = (profile, reasonId, detail = null, reportedBy = "You") => {
  const normalizedReasonId = normalizeReasonId(reasonId);
  const profileId = profile?.userId ?? profile?.id ?? Math.random().toString(36).substr(2, 9);
  const existing = _reportedProfiles.find((p) => p.id === profileId || p.userId === profileId);

  if (existing) {
    existing.reportCount += 1;
    existing.reportedAt = new Date().toLocaleDateString();
    existing.category = REASON_LABELS[normalizedReasonId] ?? "Others";
    existing.categoryId = normalizedReasonId;
    existing.reasonBreakdown = mergeReasonBreakdown(existing.reasonBreakdown, normalizedReasonId);
    existing.author = profile?.author ?? profile?.name ?? profile?.userName ?? existing.author ?? "Unknown";
    existing.avatar = profile?.avatar ?? profile?.avatarSrc ?? existing.avatar ?? "";
    existing.bio = profile?.bio ?? existing.bio ?? "";
    if (!existing.reportedBy.includes(reportedBy)) existing.reportedBy.push(reportedBy);
    if (detail) existing.detail = detail;
  } else {
    _reportedProfiles = [
      ..._reportedProfiles,
      {
        id:          profileId,
        userId:      profileId,
        author:      profile?.author ?? profile?.name ?? profile?.userName ?? "Unknown",
        avatar:      profile?.avatar ?? profile?.avatarSrc ?? "",
        bio:         profile?.bio ?? "",
        reportedAt:  new Date().toLocaleDateString(),
        reportCount: 1,
        category:    REASON_LABELS[normalizedReasonId] ?? "Others",
        categoryId:  normalizedReasonId,
        reasonBreakdown: createReasonBreakdown(normalizedReasonId),
        reportedBy:  [reportedBy],
        detail,
      },
    ];
  }
  _notify();
};

/**
 * Remove a profile report (admin action).
 */
export const removeProfileReport = (profileId) => {
  _reportedProfiles = _reportedProfiles.filter((p) => p.id !== profileId && p.userId !== profileId);
  _notify();
};
