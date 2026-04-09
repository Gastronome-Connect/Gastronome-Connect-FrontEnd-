/**
 * useDraft — manages a single CreatePost draft in localStorage.
 *
 * NOTE: File blobs (from file picker) cannot survive localStorage.
 * Only items that already have a stable URL (e.g. previously uploaded)
 * will survive a page reload. New local-file previews are stored as-is
 * for the current session and will be cleared on reload automatically.
 */

const DRAFT_KEY = "createPost_draft";

const useDraft = () => {
  const saveDraft = (data) => {
    try {
      const payload = {
        title:      data.title      ?? "",
        postText:   data.postText   ?? "",
        mediaItems: (data.mediaItems ?? []).map(({ id, url, type, title, caption }) => ({
          id, url, type,
          title:   title   ?? "",
          caption: caption ?? "",
        })),
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn("Draft save failed:", e);
    }
  };

  const loadDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const clearDraft = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
  };

  const hasDraft = () => !!localStorage.getItem(DRAFT_KEY);

  return { saveDraft, loadDraft, clearDraft, hasDraft };
};

export default useDraft;