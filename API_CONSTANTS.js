// API Endpoints Constants for Frontend Integration
// Usage: Import these constants in your frontend project

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.gastronomeconnect.online';

export const API_ENDPOINTS = {
  // ==================== AUTH ====================
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/login`,
    LOGOUT: `${API_BASE_URL}/api/logout`,
    REFRESH: `${API_BASE_URL}/api/refresh`,
    CHECK_EMAIL: `${API_BASE_URL}/api/check-email`,
    SEND_OTP: `${API_BASE_URL}/api/send-otp`,
    VERIFY_OTP: `${API_BASE_URL}/api/verify-otp`,
    COMPLETE_SIGNUP: `${API_BASE_URL}/api/complete-signup`,
    FORGOT_PASSWORD: `${API_BASE_URL}/api/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/api/reset-password`,
    GET_USER: `${API_BASE_URL}/api/user`,
    GET_USER_BY_ID: (id) => `${API_BASE_URL}/api/user/${id}`,
    UPDATE_DISPLAY_NAME: `${API_BASE_URL}/api/display-name`,
    UPDATE_USERNAME: `${API_BASE_URL}/api/username`,
    UPDATE_AVATAR: `${API_BASE_URL}/api/avatar`,
    UPDATE_BIO: `${API_BASE_URL}/api/bio`,
    UPDATE_PREFERENCES: (id) => `${API_BASE_URL}/api/user/preferences/${id}`,
    UPDATE_PASSWORD: `${API_BASE_URL}/api/update-password`,
    FOLLOW_USER: (userId) => `${API_BASE_URL}/api/follow/${userId}`,
    DELETE_ACCOUNT: `${API_BASE_URL}/api/delete-account`,
    RESTORE_ACCOUNT: `${API_BASE_URL}/api/restore-account`,
    GET_PREFERENCES: `${API_BASE_URL}/api/preferences`,
    GET_ALLERGENS: `${API_BASE_URL}/api/allergens`,
    GET_DISLIKES: `${API_BASE_URL}/api/dislikes`,
  },

  // ==================== POSTS ====================
  POSTS: {
    CREATE: `${API_BASE_URL}/api/posts`,
    GET_ALL: `${API_BASE_URL}/api/posts`,
    UPDATE: (postId) => `${API_BASE_URL}/api/posts/${postId}`,
    DELETE: (postId) => `${API_BASE_URL}/api/posts/${postId}`,
    ADD_COMMENT: (postId) => `${API_BASE_URL}/api/posts/${postId}/comments`,
    LIKE: (postId) => `${API_BASE_URL}/api/posts/${postId}/like`,
    DISLIKE: (postId) => `${API_BASE_URL}/api/posts/${postId}/dislike`,
    REPOST: (postId) => `${API_BASE_URL}/api/posts/${postId}/repost`,
  },

  // ==================== RECIPES ====================
  RECIPES: {
    SEARCH: `${API_BASE_URL}/api/recipes/search`,
    DAILY_PICKS: `${API_BASE_URL}/api/recipes/daily-picks`,
    WEEKLY_TOP: `${API_BASE_URL}/api/recipes/weekly-top`,
    GET_INFO: (id) => `${API_BASE_URL}/api/recipes/${id}/info`,
    GET_VIEWABLE: (id) => `${API_BASE_URL}/api/recipes/${id}`,
    SAVE: `${API_BASE_URL}/api/recipes/saveRecipe`,
    FAVORITES_VIEW: `${API_BASE_URL}/api/recipes/favorites`,
    FAVORITES_SEARCH: `${API_BASE_URL}/api/recipes/favorite/search`,
    TOGGLE_FAVORITE: (id) => `${API_BASE_URL}/api/recipes/${id}/favorite`,
    ARCHIVED_VIEW: `${API_BASE_URL}/api/recipes/archived`,
    ARCHIVED_SEARCH: `${API_BASE_URL}/api/recipes/archived/search`,
    TOGGLE_ARCHIVE: (id) => `${API_BASE_URL}/api/recipes/${id}/archive`,
  },

  // ==================== ADMIN ====================
  ADMIN: {
    LOGIN: `${API_BASE_URL}/api/admin/login`,
    DASHBOARD_STATS: `${API_BASE_URL}/api/admin/dashboard/stats`,
    FLAGGED_CONTENT: `${API_BASE_URL}/api/admin/flagged`,
    FLAGGED_POSTS: `${API_BASE_URL}/api/admin/flagged-posts`,
    FLAGGED_COMMENTS: `${API_BASE_URL}/api/admin/flagged-comments`,
    MODERATION_QUEUE: `${API_BASE_URL}/api/admin/moderation/queue`,
    RESOLVE_MODERATION: `${API_BASE_URL}/api/admin/moderation/resolve`,
    TIMEOUT_USERS_GET: `${API_BASE_URL}/api/admin/timeout-users`,
    TIMEOUT_USERS_UPDATE: `${API_BASE_URL}/api/admin/timeout-users`,
    DELETED_ACCOUNTS: `${API_BASE_URL}/api/admin/deleted-accounts`,
    RESTORE_STATS: `${API_BASE_URL}/api/admin/restore-stats`,
    RESTORE_ACCOUNT: `${API_BASE_URL}/api/admin/restore-account`,
    RESTORE_ACCOUNT_BY_ID: (id) => `${API_BASE_URL}/api/admin/restore-account/${id}`,
  },

  // ==================== CHAT ====================
  CHAT: {
    SEND_MESSAGE: `${API_BASE_URL}/api/chatbot/message`,
  },

  // ==================== TTS ====================
  TTS: {
    TEXT_TO_SPEECH: `${API_BASE_URL}/api/tts`,
  },

  // ==================== LOGS ====================
  LOGS: {
    CREATE: `${API_BASE_URL}/api/logs`,
    GET_ALL: `${API_BASE_URL}/api/logs`,
    SEARCH: `${API_BASE_URL}/api/logs/search`,
    UPDATE: (id) => `${API_BASE_URL}/api/logs/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/logs/${id}`,
    DELETE_ALL: `${API_BASE_URL}/api/logs`,
  },

  // ==================== CONTACT ====================
  CONTACT: {
    SEND_EMAIL: `${API_BASE_URL}/api/contact`,
  },

  // ==================== FAQ ====================
  FAQ: {
    GET_ALL: `${API_BASE_URL}/api/faqs`,
  },

  // ==================== OPTIONS ====================
  OPTIONS: {
    GET_ALL: `${API_BASE_URL}/api/options`,
  },

  // ==================== UPLOADS ====================
  UPLOADS: {
    GET_FILE: (filename) => `${API_BASE_URL}/uploads/${filename}`,
  },
};

export default API_ENDPOINTS;
