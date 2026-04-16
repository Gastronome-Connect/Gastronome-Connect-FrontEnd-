import { apiFetch, buildApiUrl } from "./api";
import adminApi from "./adminApi";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3000";

// ============= AUTHENTICATION ENDPOINTS =============
export const authAPI = {
  login: (email, password) =>
    apiFetch(`/api/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }).then(r => r.json()),

  logout: () =>
    apiFetch(`/api/logout`, { method: "POST" }).then(r => r.json()),

  refresh: () =>
    apiFetch(`/api/refresh`, { method: "POST" }).then(r => r.json()),

  validateEmail: (email) =>
    apiFetch(`/api/validate`, {
      method: "POST",
      body: JSON.stringify({ email }),
    }).then(r => r.json()),

  register: (userData) =>
    apiFetch(`/api/register`, {
      method: "POST",
      body: JSON.stringify(userData),
    }).then(r => r.json()),

  sendOTP: (email, username, password) =>
    apiFetch(`/api/send-otp`, {
      method: "POST",
      body: JSON.stringify({ email, username, password }),
    }).then(r => r.json()),

  verifyOTP: (email, otp) =>
    apiFetch(`/api/verify-otp`, {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    }).then(r => r.json()),

  forgotPassword: (email) =>
    apiFetch(`/api/forgot-password`, {
      method: "POST",
      body: JSON.stringify({ email }),
    }).then(r => r.json()),

  resetPassword: (token, newPassword) =>
    apiFetch(`/api/reset-password/${token}`, {
      method: "POST",
      body: JSON.stringify({ newPassword }),
    }).then(r => r.json()),

  updatePassword: (oldPassword, newPassword) =>
    apiFetch(`/api/update-password`, {
      method: "PATCH",
      body: JSON.stringify({ oldPassword, newPassword }),
    }).then(r => r.json()),

  getUser: () =>
    apiFetch(`/api/user`, { method: "GET" }).then(r => r.json()),

  updateAvatar: (avatarData) =>
    apiFetch(`/api/avatar`, {
      method: "PUT",
      body: JSON.stringify(avatarData),
    }).then(r => r.json()),

  updateBio: (bio) =>
    apiFetch(`/api/bio`, {
      method: "PUT",
      body: JSON.stringify({ bio }),
    }).then(r => r.json()),

  deleteAccount: () =>
    apiFetch(`/api/delete-account`, { method: "DELETE" }).then(r => r.json()),

  restoreAccount: () =>
    apiFetch(`/api/restore-account`, { method: "PATCH" }).then(r => r.json()),
};

// ============= USER ENDPOINTS =============
export const userAPI = {
  followUser: (targetUserId) =>
    apiFetch(`/api/follow/${targetUserId}`, { method: "POST" }).then(r => r.json()),

  updatePreferences: (id, preferences) =>
    apiFetch(`/api/user/preferences/${id}`, {
      method: "PATCH",
      body: JSON.stringify(preferences),
    }).then(r => r.json()),

  getPreferences: () =>
    apiFetch(`/api/preferences`, { method: "GET" }).then(r => r.json()),

  getAllergens: () =>
    apiFetch(`/api/allergens`, { method: "GET" }).then(r => r.json()),

  getDislikes: () =>
    apiFetch(`/api/dislikes`, { method: "GET" }).then(r => r.json()),
};

// ============= RECIPE ENDPOINTS =============
export const recipeAPI = {
  searchRecipes: (query) =>
    apiFetch(`/api/recipes/search?q=${encodeURIComponent(query)}`, { method: "GET" }).then(r => r.json()),

  getAllRecipes: () =>
    apiFetch(`/api/recipes`, { method: "GET" }).then(r => r.json()),

  getRecipeInfo: (recipeId) =>
    apiFetch(`/api/recipes/${recipeId}/info`, { method: "GET" }).then(r => r.json()),

  getRecipe: (recipeId) =>
    apiFetch(`/api/recipes/${recipeId}`, { method: "GET" }).then(r => r.json()),

  getFavorites: () =>
    apiFetch(`/api/recipes/favorites`, { method: "GET" }).then(r => r.json()),

  searchFavorites: (query) =>
    apiFetch(`/api/recipes/favorite/search?q=${encodeURIComponent(query)}`, { method: "GET" }).then(r => r.json()),

  getArchived: () =>
    apiFetch(`/api/recipes/archived`, { method: "GET" }).then(r => r.json()),

  searchArchived: (query) =>
    apiFetch(`/api/recipes/archived/search?q=${encodeURIComponent(query)}`, { method: "GET" }).then(r => r.json()),

  saveRecipe: (recipeData) =>
    apiFetch(`/api/recipes/saveRecipe`, {
      method: "POST",
      body: JSON.stringify(recipeData),
    }).then(r => r.json()),

  archiveRecipe: (recipeId) =>
    apiFetch(`/api/recipes/archive/${recipeId}`, { method: "PATCH" }).then(r => r.json()),

  unarchiveRecipe: (recipeId) =>
    apiFetch(`/api/recipes/${recipeId}/archive`, { method: "DELETE" }).then(r => r.json()),

  favoriteRecipe: (recipeId) =>
    apiFetch(`/api/recipes/favorite/${recipeId}`, { method: "PATCH" }).then(r => r.json()),

  unfavoriteRecipe: (recipeId) =>
    apiFetch(`/api/recipes/${recipeId}/favorite`, { method: "DELETE" }).then(r => r.json()),
};

// ============= POST ENDPOINTS =============
export const postAPI = {
  createPost: (postData) =>
    apiFetch(`/api/posts`, {
      method: "POST",
      body: JSON.stringify(postData),
    }).then(r => r.json()),

  getAllPosts: () =>
    apiFetch(`/api/posts`, { method: "GET" }).then(r => r.json()),

  updatePost: (postId, updates) =>
    apiFetch(`/api/posts/${postId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }).then(r => r.json()),

  deletePost: (postId) =>
    apiFetch(`/api/posts/${postId}`, { method: "DELETE" }).then(r => r.json()),

  addComment: (postId, comment) =>
    apiFetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify(comment),
    }).then(r => r.json()),

  likePost: (postId) =>
    apiFetch(`/api/posts/${postId}/like`, { method: "POST" }).then(r => r.json()),

  dislikePost: (postId) =>
    apiFetch(`/api/posts/${postId}/dislike`, { method: "POST" }).then(r => r.json()),

  repostPost: (postId) =>
    apiFetch(`/api/posts/${postId}/repost`, { method: "POST" }).then(r => r.json()),
};

// ============= LOG ENDPOINTS =============
export const logAPI = {
  createLog: (logData) =>
    apiFetch(`/api/logs`, {
      method: "POST",
      body: JSON.stringify(logData),
    }).then(r => r.json()),

  getHistory: () =>
    apiFetch(`/api/logs`, { method: "GET" }).then(r => r.json()),

  searchLogs: (query) =>
    apiFetch(`/api/logs/search?q=${encodeURIComponent(query)}`, { method: "GET" }).then(r => r.json()),

  updateLog: (logId, updates) =>
    apiFetch(`/api/logs/${logId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }).then(r => r.json()),

  deleteLog: (logId) =>
    apiFetch(`/api/logs/${logId}`, { method: "DELETE" }).then(r => r.json()),

  deleteAllLogs: () =>
    apiFetch(`/api/logs`, { method: "DELETE" }).then(r => r.json()),
};

// ============= ADMIN ENDPOINTS =============
export const adminAPI = {
  login: (email, password) =>
    adminApi.post("/login", { email, password }),

  getDashboardStats: () =>
    adminApi.get("/dashboard/stats"),

  getTimeoutUsers: () =>
    adminApi.get("/timeout-users"),

  updateTimeoutUser: (userId, data) =>
    adminApi.post("/timeout-users", { userId, ...data }),

  getDeletedAccounts: () =>
    adminApi.get("/deleted-accounts"),

  restoreAccount: (data) =>
    adminApi.post("/restore-account", data),

  restoreAccountById: (id) =>
    adminApi.post(`/restore-account/${id}`),

  // Flagged posts
  getFlaggedPosts: () =>
    adminApi.get("/flagged-posts"),

  getFlaggedPostsWithStats: () =>
    adminApi.get("/flagged-posts-stats"),

  // Reported comments
  getReportedComments: () =>
    adminApi.get("/reported-comments"),

  getReportedCommentsWithStats: () =>
    adminApi.get("/reported-comments-stats"),
};

// ============= CONTACT & FAQ ENDPOINTS =============
export const contactAPI = {
  sendContactEmail: (contactData) =>
    apiFetch(`/api/contact`, {
      method: "POST",
      body: JSON.stringify(contactData),
    }).then(r => r.json()),
};

export const faqAPI = {
  getFAQs: () =>
    apiFetch(`/api/faqs`, { method: "GET" }).then(r => r.json()),
};

// ============= OPTIONS ENDPOINTS =============
export const optionsAPI = {
  getOptions: () =>
    apiFetch(`/api/options`, { method: "GET" }).then(r => r.json()),
};
