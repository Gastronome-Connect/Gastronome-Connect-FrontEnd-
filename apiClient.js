// API Client Service for Frontend
// Handles all API requests with automatic token management and error handling

import API_ENDPOINTS from './API_CONSTANTS';

class APIClient {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL || 'https://api.gastronomeconnect.online';
    this.accessToken = localStorage.getItem('accessToken') || null;
    this.refreshToken = localStorage.getItem('refreshToken') || null;
  }

  /**
   * Set tokens after login
   */
  setTokens(accessToken, refreshToken = null) {
    this.accessToken = accessToken;
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }
    if (refreshToken) {
      this.refreshToken = refreshToken;
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  /**
   * Clear tokens on logout
   */
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  /**
   * Get authorization headers
   */
  getHeaders(isFormData = false) {
    const headers = {
      ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
    };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }

  /**
   * Generic fetch method with error handling
   */
  async request(url, method = 'GET', data = null, isFormData = false) {
    try {
      const options = {
        method,
        headers: this.getHeaders(isFormData),
        credentials: 'include', // Include cookies for refresh token
      };

      if (data) {
        if (isFormData) {
          options.body = data; // FormData object
        } else {
          options.body = JSON.stringify(data);
        }
      }

      let response = await fetch(url, options);

      // Handle token refresh if unauthorized
      if (response.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry original request with new token
          options.headers = this.getHeaders(isFormData);
          response = await fetch(url, options);
        }
      }

      const responseData = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          message: responseData.message || 'An error occurred',
          data: responseData,
        };
      }

      return responseData;
    } catch (error) {
      console.error(`API Error [${method} ${url}]:`, error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken() {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.REFRESH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      const data = await response.json();

      if (response.ok && data.accessToken) {
        this.setTokens(data.accessToken);
        return true;
      }

      this.clearTokens();
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return false;
    }
  }

  // ==================== AUTH METHODS ====================

  async login(email, password) {
    const data = await this.request(API_ENDPOINTS.AUTH.LOGIN, 'POST', {
      email,
      password,
    });
    if (data.accessToken) {
      this.setTokens(data.accessToken);
    }
    return data;
  }

  async logout() {
    await this.request(API_ENDPOINTS.AUTH.LOGOUT, 'POST', {
      refreshToken: this.refreshToken,
    });
    this.clearTokens();
  }

  async validateEmail(email) {
    return this.request(API_ENDPOINTS.AUTH.VALIDATE_EMAIL, 'POST', { email });
  }

  async sendOTP(email, username, password) {
    return this.request(API_ENDPOINTS.AUTH.SEND_OTP, 'POST', {
      email,
      username,
      password,
    });
  }

  async verifyOTP(email, otp) {
    return this.request(API_ENDPOINTS.AUTH.VERIFY_OTP, 'POST', {
      email,
      otp,
    });
  }

  async register(email, preferences, allergens, dislikes) {
    return this.request(API_ENDPOINTS.AUTH.REGISTER, 'POST', {
      email,
      preferences,
      allergens,
      dislikes,
    });
  }

  async createAccount(email, username, password, displayName) {
    return this.request(API_ENDPOINTS.AUTH.CREATE_ACCOUNT, 'POST', {
      email,
      username,
      password,
      displayName,
    });
  }

  async completeSignup(email) {
    return this.request(API_ENDPOINTS.AUTH.COMPLETE_SIGNUP, 'POST', {
      email,
    });
  }

  async forgotPassword(email) {
    return this.request(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, 'POST', {
      email,
    });
  }

  async resetPassword(token, newPassword) {
    return this.request(API_ENDPOINTS.AUTH.RESET_PASSWORD, 'POST', {
      token,
      newPassword,
    });
  }

  async getCurrentUser() {
    return this.request(API_ENDPOINTS.AUTH.GET_USER, 'GET');
  }

  async getUserById(id) {
    return this.request(API_ENDPOINTS.AUTH.GET_USER_BY_ID(id), 'GET');
  }

  async updateDisplayName(displayName) {
    return this.request(API_ENDPOINTS.AUTH.UPDATE_DISPLAY_NAME, 'PUT', {
      displayName,
    });
  }

  async updateUsername(username) {
    return this.request(API_ENDPOINTS.AUTH.UPDATE_USERNAME, 'PUT', {
      username,
    });
  }

  async updateAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.request(
      API_ENDPOINTS.AUTH.UPDATE_AVATAR,
      'PUT',
      formData,
      true
    );
  }

  async updateBio(bio) {
    return this.request(API_ENDPOINTS.AUTH.UPDATE_BIO, 'PUT', { bio });
  }

  async updatePreferences(id, preferences) {
    return this.request(
      API_ENDPOINTS.AUTH.UPDATE_PREFERENCES(id),
      'PATCH',
      preferences
    );
  }

  async updatePassword(currentPassword, newPassword) {
    return this.request(API_ENDPOINTS.AUTH.UPDATE_PASSWORD, 'PATCH', {
      currentPassword,
      newPassword,
    });
  }

  async toggleFollow(userId) {
    return this.request(API_ENDPOINTS.AUTH.FOLLOW_USER(userId), 'POST');
  }

  async deleteAccount() {
    return this.request(API_ENDPOINTS.AUTH.DELETE_ACCOUNT, 'DELETE');
  }

  async restoreAccount() {
    return this.request(API_ENDPOINTS.AUTH.RESTORE_ACCOUNT, 'PATCH');
  }

  async getPreferences() {
    return this.request(API_ENDPOINTS.AUTH.GET_PREFERENCES, 'GET');
  }

  async getAllergens() {
    return this.request(API_ENDPOINTS.AUTH.GET_ALLERGENS, 'GET');
  }

  async getDislikes() {
    return this.request(API_ENDPOINTS.AUTH.GET_DISLIKES, 'GET');
  }

  // ==================== POSTS METHODS ====================

  async createPost(formData) {
    // formData should include 'media' files and other post data
    return this.request(API_ENDPOINTS.POSTS.CREATE, 'POST', formData, true);
  }

  async getAllPosts() {
    return this.request(API_ENDPOINTS.POSTS.GET_ALL, 'GET');
  }

  async updatePost(postId, data) {
    return this.request(API_ENDPOINTS.POSTS.UPDATE(postId), 'PATCH', data);
  }

  async deletePost(postId) {
    return this.request(API_ENDPOINTS.POSTS.DELETE(postId), 'DELETE');
  }

  async addComment(postId, content) {
    return this.request(API_ENDPOINTS.POSTS.ADD_COMMENT(postId), 'POST', {
      content,
    });
  }

  async likePost(postId) {
    return this.request(API_ENDPOINTS.POSTS.LIKE(postId), 'POST');
  }

  async dislikePost(postId) {
    return this.request(API_ENDPOINTS.POSTS.DISLIKE(postId), 'POST');
  }

  async repostPost(postId) {
    return this.request(API_ENDPOINTS.POSTS.REPOST(postId), 'POST');
  }

  // ==================== RECIPES METHODS ====================

  async searchRecipes(query, filters = {}) {
    const params = new URLSearchParams({ q: query, ...filters });
    return this.request(
      `${API_ENDPOINTS.RECIPES.SEARCH}?${params}`,
      'GET'
    );
  }

  async getDailyPickRecipes() {
    return this.request(API_ENDPOINTS.RECIPES.DAILY_PICKS, 'GET');
  }

  async getWeeklyTopRecipes() {
    return this.request(API_ENDPOINTS.RECIPES.WEEKLY_TOP, 'GET');
  }

  async getRecipeInfo(id) {
    return this.request(API_ENDPOINTS.RECIPES.GET_INFO(id), 'GET');
  }

  async getViewableRecipe(id) {
    return this.request(API_ENDPOINTS.RECIPES.GET_VIEWABLE(id), 'GET');
  }

  async saveRecipe(recipeData) {
    return this.request(API_ENDPOINTS.RECIPES.SAVE, 'POST', recipeData);
  }

  async getFavoriteRecipes() {
    return this.request(API_ENDPOINTS.RECIPES.FAVORITES_VIEW, 'GET');
  }

  async searchFavoriteRecipes(query) {
    const params = new URLSearchParams({ q: query });
    return this.request(
      `${API_ENDPOINTS.RECIPES.FAVORITES_SEARCH}?${params}`,
      'GET'
    );
  }

  async toggleFavoriteRecipe(id) {
    return this.request(
      API_ENDPOINTS.RECIPES.TOGGLE_FAVORITE(id),
      'PATCH'
    );
  }

  async getArchivedRecipes() {
    return this.request(API_ENDPOINTS.RECIPES.ARCHIVED_VIEW, 'GET');
  }

  async searchArchivedRecipes(query) {
    const params = new URLSearchParams({ q: query });
    return this.request(
      `${API_ENDPOINTS.RECIPES.ARCHIVED_SEARCH}?${params}`,
      'GET'
    );
  }

  async toggleArchiveRecipe(id) {
    return this.request(API_ENDPOINTS.RECIPES.TOGGLE_ARCHIVE(id), 'PATCH');
  }

  // ==================== CHAT METHODS ====================

  async sendChatMessage(message) {
    return this.request(API_ENDPOINTS.CHAT.SEND_MESSAGE, 'POST', {
      message,
    });
  }

  // ==================== TTS METHODS ====================

  async textToSpeech(text) {
    return this.request(API_ENDPOINTS.TTS.TEXT_TO_SPEECH, 'POST', { text });
  }

  // ==================== LOGS METHODS ====================

  async createLog(logData) {
    return this.request(API_ENDPOINTS.LOGS.CREATE, 'POST', logData);
  }

  async getAllLogs() {
    return this.request(API_ENDPOINTS.LOGS.GET_ALL, 'GET');
  }

  async searchLogs(query, filters = {}) {
    const params = new URLSearchParams({ q: query, ...filters });
    return this.request(`${API_ENDPOINTS.LOGS.SEARCH}?${params}`, 'GET');
  }

  async updateLog(id, logData) {
    return this.request(API_ENDPOINTS.LOGS.UPDATE(id), 'PATCH', logData);
  }

  async deleteLog(id) {
    return this.request(API_ENDPOINTS.LOGS.DELETE(id), 'DELETE');
  }

  async deleteAllLogs() {
    return this.request(API_ENDPOINTS.LOGS.DELETE_ALL, 'DELETE');
  }

  // ==================== CONTACT METHODS ====================

  async sendContactEmail(contactData) {
    return this.request(API_ENDPOINTS.CONTACT.SEND_EMAIL, 'POST', contactData);
  }

  // ==================== FAQ METHODS ====================

  async getFAQs() {
    return this.request(API_ENDPOINTS.FAQ.GET_ALL, 'GET');
  }

  // ==================== OPTIONS METHODS ====================

  async getOptions() {
    return this.request(API_ENDPOINTS.OPTIONS.GET_ALL, 'GET');
  }

  // ==================== ADMIN METHODS ====================

  async adminLogin(email, password) {
    const data = await this.request(API_ENDPOINTS.ADMIN.LOGIN, 'POST', {
      email,
      password,
    });
    if (data.accessToken) {
      this.setTokens(data.accessToken);
    }
    return data;
  }

  async getDashboardStats() {
    return this.request(API_ENDPOINTS.ADMIN.DASHBOARD_STATS, 'GET');
  }

  async getFlaggedContent() {
    return this.request(API_ENDPOINTS.ADMIN.FLAGGED_CONTENT, 'GET');
  }

  async getFlaggedPosts() {
    return this.request(API_ENDPOINTS.ADMIN.FLAGGED_POSTS, 'GET');
  }

  async getFlaggedComments() {
    return this.request(API_ENDPOINTS.ADMIN.FLAGGED_COMMENTS, 'GET');
  }

  async getModerationQueue() {
    return this.request(API_ENDPOINTS.ADMIN.MODERATION_QUEUE, 'GET');
  }

  async resolveModeration(data) {
    return this.request(
      API_ENDPOINTS.ADMIN.RESOLVE_MODERATION,
      'POST',
      data
    );
  }

  async getTimeoutUsers() {
    return this.request(API_ENDPOINTS.ADMIN.TIMEOUT_USERS_GET, 'GET');
  }

  async updateTimeoutUser(userData) {
    return this.request(
      API_ENDPOINTS.ADMIN.TIMEOUT_USERS_UPDATE,
      'POST',
      userData
    );
  }

  async getDeletedAccounts() {
    return this.request(API_ENDPOINTS.ADMIN.DELETED_ACCOUNTS, 'GET');
  }

  async getRestoreStats() {
    return this.request(API_ENDPOINTS.ADMIN.RESTORE_STATS, 'GET');
  }

  async restoreAccountAdmin(id) {
    return this.request(
      API_ENDPOINTS.ADMIN.RESTORE_ACCOUNT_BY_ID(id),
      'POST'
    );
  }
}

// Export singleton instance
export default new APIClient();
