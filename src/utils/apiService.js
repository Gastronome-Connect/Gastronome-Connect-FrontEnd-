// Organized API service with all endpoints from the backend
import { apiFetch } from "./api";

/**
 * Helper function to handle API responses with better error reporting
 */
async function handleApiResponse(responsePromise, endpoint, operationName) {
  try {
    const response = await responsePromise;
    
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const error = new Error(
        data.message || `${operationName} failed with status ${response.status}`
      );
      error.status = response.status;
      error.data = data;
      error.endpoint = endpoint;
      console.error(`[API Error] ${endpoint} (${operationName}):`, {
        status: response.status,
        statusText: response.statusText,
        message: data.message,
        data,
      });
      throw error;
    }
    
    return response.json().catch(() => ({}));
  } catch (error) {
    if (error instanceof Error && error.status) {
      throw error;
    }
    console.error(`[Network Error] ${endpoint} (${operationName}):`, error);
    throw new Error(
      `${operationName} failed: ${error.message || "Network error"}`
    );
  }
}

/**
 * Authentication API
 */
export const authAPI = {
  login: (email, password) =>
    handleApiResponse(
      apiFetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
      "/api/login",
      "Login"
    ),

  logout: () =>
    handleApiResponse(
      apiFetch("/api/logout", { method: "POST" }),
      "/api/logout",
      "Logout"
    ),

  refresh: () =>
    handleApiResponse(
      apiFetch("/api/refresh", { method: "POST" }),
      "/api/refresh",
      "Token refresh"
    ),

  // Note: backend route name can differ across deployments.
  // Try `/api/check-email` first, then fall back to `/api/validate`.
  checkEmail: async (email) => {
    try {
      const response = await apiFetch("/api/check-email", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        return response.json();
      }
      throw response;
    } catch (err) {
      console.warn("[API] /api/check-email failed, trying fallback /api/validate");
      return handleApiResponse(
        apiFetch("/api/validate", {
          method: "POST",
          body: JSON.stringify({ email }),
        }),
        "/api/validate (fallback)",
        "Email validation"
      );
    }
  },

  sendOtp: (email, username, password) =>
    handleApiResponse(
      apiFetch("/api/send-otp", {
        method: "POST",
        body: JSON.stringify({ email, username, password }),
      }),
      "/api/send-otp",
      "Send OTP"
    ),

  verifyOtp: (email, otp) =>
    handleApiResponse(
      apiFetch("/api/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      }),
      "/api/verify-otp",
      "Verify OTP"
    ),

  completeSignup: (email, signupData) =>
    handleApiResponse(
      apiFetch("/api/complete-signup", {
        method: "POST",
        body: JSON.stringify({ email, ...signupData }),
      }),
      "/api/complete-signup",
      "Complete signup"
    ),

  forgotPassword: (email) =>
    handleApiResponse(
      apiFetch("/api/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
      "/api/forgot-password",
      "Forgot password"
    ),

  resetPassword: (token, password) =>
    handleApiResponse(
      apiFetch(`/api/reset-password/${token}`, {
        method: "POST",
        body: JSON.stringify({ password }),
      }),
      "/api/reset-password",
      "Reset password"
    ),

  updateAvatar: (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return handleApiResponse(
      apiFetch("/api/avatar", { method: "PUT", body: formData }),
      "/api/avatar",
      "Update avatar"
    );
  },

  updateBio: (bio) =>
    handleApiResponse(
      apiFetch("/api/bio", {
        method: "PUT",
        body: JSON.stringify({ bio }),
      }),
      "/api/bio",
      "Update bio"
    ),

  updatePreferences: (id, preferences) =>
    handleApiResponse(
      apiFetch(`/api/user/preferences/${id}`, {
        method: "PATCH",
        body: JSON.stringify(preferences),
      }),
      "/api/user/preferences",
      "Update preferences"
    ),

  updatePassword: (oldPassword, newPassword) =>
    apiFetch("/api/update-password", {
      method: "PATCH",
      body: JSON.stringify({ oldPassword, newPassword }),
    }).then((r) => r.json()),

  getCurrentUser: () =>
    apiFetch("/api/user", { method: "GET" }).then((r) => r.json()),

  deleteAccount: () =>
    apiFetch("/api/delete-account", { method: "DELETE" }).then((r) =>
      r.json()
    ),

  restoreAccount: () =>
    apiFetch("/api/restore-account", { method: "PATCH" }).then((r) =>
      r.json()
    ),

  getPreferences: () =>
    apiFetch("/api/preferences", { method: "GET" }).then((r) => r.json()),

  getAllergens: () =>
    apiFetch("/api/allergens", { method: "GET" }).then((r) => r.json()),

  getDislikes: () =>
    apiFetch("/api/dislikes", { method: "GET" }).then((r) => r.json()),
};

/**
 * User API
 */
export const userAPI = {
  followUser: (targetUserId) =>
    apiFetch(`/api/follow/${targetUserId}`, { method: "POST" }).then((r) =>
      r.json()
    ),
};

/**
 * Recipe API
 */
export const recipeAPI = {
  searchRecipes: (query) =>
    apiFetch(`/api/recipes/search?q=${encodeURIComponent(query)}`, {
      method: "GET",
    }).then((r) => r.json()),

  getDailyPickRecipes: () =>
    apiFetch("/api/recipes/daily-picks", { method: "GET" }).then((r) =>
      r.json()
    ),

  getWeeklyTopRecipes: () =>
    apiFetch("/api/recipes/weekly-top", { method: "GET" }).then((r) =>
      r.json()
    ),

  getFavoriteRecipes: () =>
    apiFetch("/api/recipes/favorites", { method: "GET" }).then((r) =>
      r.json()
    ),

  searchFavorites: (query) =>
    apiFetch(
      `/api/recipes/favorite/search?q=${encodeURIComponent(query)}`,
      { method: "GET" }
    ).then((r) => r.json()),

  getArchivedRecipes: () =>
    apiFetch("/api/recipes/archived", { method: "GET" }).then((r) =>
      r.json()
    ),

  searchArchived: (query) =>
    apiFetch(
      `/api/recipes/archived/search?q=${encodeURIComponent(query)}`,
      { method: "GET" }
    ).then((r) => r.json()),

  getRecipeInfo: (id) =>
    apiFetch(`/api/recipes/${id}/info`, { method: "GET" }).then((r) =>
      r.json()
    ),

  getViewableRecipe: (id) =>
    apiFetch(`/api/recipes/${id}`, { method: "GET" }).then((r) => r.json()),

  saveRecipe: (recipeData) =>
    apiFetch("/api/recipes/saveRecipe", {
      method: "POST",
      body: JSON.stringify(recipeData),
    }).then((r) => r.json()),

  archiveRecipe: (id) =>
    apiFetch(`/api/recipes/archive/${id}`, { method: "PATCH" }).then((r) =>
      r.json()
    ),

  unarchiveRecipe: (id) =>
    apiFetch(`/api/recipes/${id}/archive`, { method: "DELETE" }).then((r) =>
      r.json()
    ),

  favoriteRecipe: (id) =>
    apiFetch(`/api/recipes/favorite/${id}`, { method: "PATCH" }).then((r) =>
      r.json()
    ),

  unfavoriteRecipe: (id) =>
    apiFetch(`/api/recipes/${id}/favorite`, { method: "DELETE" }).then((r) =>
      r.json()
    ),
};

/**
 * Post API
 */
export const postAPI = {
  createPost: (postData) => {
    const formData = new FormData();
    Object.keys(postData).forEach((key) => {
      if (Array.isArray(postData[key])) {
        postData[key].forEach((item) => formData.append(key, item));
      } else {
        formData.append(key, postData[key]);
      }
    });
    return apiFetch("/api/posts/", { method: "POST", body: formData }).then(
      (r) => r.json()
    );
  },

  updatePost: (postId, updateData) =>
    apiFetch(`/api/posts/${postId}`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    }).then((r) => r.json()),

  deletePost: (postId) =>
    apiFetch(`/api/posts/${postId}`, { method: "DELETE" }).then((r) =>
      r.json()
    ),

  getAllPosts: () =>
    apiFetch("/api/posts/", { method: "GET" }).then((r) => r.json()),

  addComment: (postId, comment) =>
    apiFetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify(comment),
    }).then((r) => r.json()),

  likePost: (postId) =>
    apiFetch(`/api/posts/${postId}/like`, { method: "POST" }).then((r) =>
      r.json()
    ),

  dislikePost: (postId) =>
    apiFetch(`/api/posts/${postId}/dislike`, { method: "POST" }).then((r) =>
      r.json()
    ),

  repostPost: (postId) =>
    apiFetch(`/api/posts/${postId}/repost`, { method: "POST" }).then((r) =>
      r.json()
    ),
};

/**
 * Log/History API
 */
export const logAPI = {
  createLog: (logData) =>
    apiFetch("/api/logs", {
      method: "POST",
      body: JSON.stringify(logData),
    }).then((r) => r.json()),

  deleteLog: (id) =>
    apiFetch(`/api/logs/${id}`, { method: "DELETE" }).then((r) => r.json()),

  deleteAllLogs: () =>
    apiFetch("/api/logs", { method: "DELETE" }).then((r) => r.json()),

  getHistoryLogs: () =>
    apiFetch("/api/logs", { method: "GET" }).then((r) => r.json()),

  updateLog: (id, updateData) =>
    apiFetch(`/api/logs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    }).then((r) => r.json()),

  searchLogs: (query) =>
    apiFetch(`/api/logs/search?q=${encodeURIComponent(query)}`, {
      method: "GET",
    }).then((r) => r.json()),
};

/**
 * Admin API
 */
export const adminAPI = {
  login: (email, password) =>
    apiFetch("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }).then((r) => r.json()),

  getDashboardStats: () =>
    apiFetch("/api/admin/dashboard/stats", { method: "GET" }).then((r) =>
      r.json()
    ),

  getTimeoutUsers: () =>
    apiFetch("/api/admin/timeout-users", { method: "GET" }).then((r) =>
      r.json()
    ),

  updateTimeoutUser: (userData) =>
    apiFetch("/api/admin/timeout-users", {
      method: "POST",
      body: JSON.stringify(userData),
    }).then((r) => r.json()),

  getDeletedAccounts: () =>
    apiFetch("/api/admin/deleted-accounts", { method: "GET" }).then((r) =>
      r.json()
    ),

  restoreAccount: (accountData) =>
    apiFetch("/api/admin/restore-account", {
      method: "POST",
      body: JSON.stringify(accountData),
    }).then((r) => r.json()),

  restoreAccountById: (id) =>
    apiFetch(`/api/admin/restore-account/${id}`, {
      method: "POST",
    }).then((r) => r.json()),

  getFlaggedContent: () =>
    apiFetch("/api/admin/flagged", { method: "GET" }).then((r) =>
      r.json()
    ),

  getFlaggedPosts: () =>
    apiFetch("/api/admin/flagged-posts", { method: "GET" }).then((r) =>
      r.json()
    ),

  getFlaggedComments: () =>
    apiFetch("/api/admin/flagged-comments", { method: "GET" }).then((r) =>
      r.json()
    ),

  getModerationQueue: () =>
    apiFetch("/api/admin/moderation/queue", { method: "GET" }).then((r) =>
      r.json()
    ),

  resolveModeration: (moderationData) =>
    apiFetch("/api/admin/moderation/resolve", {
      method: "POST",
      body: JSON.stringify(moderationData),
    }).then((r) => r.json()),

  getRestoreStats: () =>
    apiFetch("/api/admin/restore-stats", { method: "GET" }).then((r) =>
      r.json()
    ),
};

/**
 * Contact API
 */
export const contactAPI = {
  sendMessage: (contactData) =>
    apiFetch("/api/contact", {
      method: "POST",
      body: JSON.stringify(contactData),
    }).then((r) => r.json()),
};

/**
 * FAQ API
 */
export const faqAPI = {
  getFaqs: () =>
    apiFetch("/api/faqs", { method: "GET" }).then((r) => r.json()),
};

/**
 * Options API
 */
export const optionsAPI = {
  getOptions: () =>
    apiFetch("/api/options/", { method: "GET" }).then((r) => r.json()),
};

/**
 * Chat API
 */
export const chatAPI = {
  sendMessage: (message) =>
    apiFetch("/api/chatbot/message", {
      method: "POST",
      body: JSON.stringify({ message }),
    }).then((r) => r.json()),
};

/**
 * Text-to-Speech API
 */
export const ttsAPI = {
  textToSpeech: (text) =>
    apiFetch("/api/tts", {
      method: "POST",
      body: JSON.stringify({ text }),
    }).then((r) => r.json()),
};
