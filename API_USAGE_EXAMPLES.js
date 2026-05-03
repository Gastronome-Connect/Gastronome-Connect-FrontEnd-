// API Integration Usage Examples
// Copy these patterns to your React frontend

import apiClient from './apiClient';
import API_ENDPOINTS from './API_CONSTANTS';

// ==================== SETUP ====================

// 1. In your .env file (React frontend)
/*
REACT_APP_API_BASE_URL=http://localhost:3000
or for production:
REACT_APP_API_BASE_URL=https://your-backend-domain.com
*/

// 2. Import in your component
/*
import apiClient from './services/apiClient';
import API_ENDPOINTS from './constants/API_CONSTANTS';
*/

// ==================== AUTHENTICATION EXAMPLES ====================

// Login
export async function handleLogin(email, password) {
  try {
    const response = await apiClient.login(email, password);
    console.log('Login successful:', response);
    // Redirect to dashboard
    return response;
  } catch (error) {
    console.error('Login failed:', error.message);
  }
}

// Signup flow
export async function handleSignup(email, username, password, displayName) {
  try {
    // Step 1: Validate email
    await apiClient.validateEmail(email);
    
    // Step 2: Send OTP
    await apiClient.sendOTP(email, username, password);
    
    // Step 3: Wait for user to enter OTP and verify
    // const otpResponse = await apiClient.verifyOTP(email, userOTP);
    
    // Step 4: Register preferences
    const registerResponse = await apiClient.register(
      email,
      { flavors: [], techniques: [] },
      [],
      []
    );
    
    // Step 5: Create account
    const createResponse = await apiClient.createAccount(
      email,
      username,
      password,
      displayName
    );
    
    // Step 6: Complete signup
    await apiClient.completeSignup(email);
    
    return createResponse;
  } catch (error) {
    console.error('Signup failed:', error.message);
    throw error;
  }
}

// Logout
export async function handleLogout() {
  try {
    await apiClient.logout();
    // Clear local state, redirect to login
    console.log('Logged out successfully');
  } catch (error) {
    console.error('Logout failed:', error);
  }
}

// Get current user
export async function fetchCurrentUser() {
  try {
    const user = await apiClient.getCurrentUser();
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error.message);
    if (error.status === 401) {
      // Redirect to login
    }
  }
}

// Update user profile
export async function updateUserProfile(displayName, bio) {
  try {
    await apiClient.updateDisplayName(displayName);
    await apiClient.updateBio(bio);
    console.log('Profile updated');
  } catch (error) {
    console.error('Update failed:', error.message);
  }
}

// Update avatar
export async function updateUserAvatar(file) {
  try {
    const response = await apiClient.updateAvatar(file);
    console.log('Avatar updated:', response);
    return response;
  } catch (error) {
    console.error('Avatar upload failed:', error.message);
  }
}

// ==================== POSTS EXAMPLES ====================

// Create a post with media
export async function createPost(title, caption, mediaFiles) {
  try {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('caption', caption);
    
    // Add multiple media files
    mediaFiles.forEach((file) => {
      formData.append('media', file);
    });
    
    const response = await apiClient.createPost(formData);
    console.log('Post created:', response);
    return response;
  } catch (error) {
    console.error('Post creation failed:', error.message);
  }
}

// Get all posts
export async function fetchAllPosts() {
  try {
    const posts = await apiClient.getAllPosts();
    return posts;
  } catch (error) {
    console.error('Failed to fetch posts:', error.message);
  }
}

// Like a post
export async function likePost(postId) {
  try {
    const response = await apiClient.likePost(postId);
    return response;
  } catch (error) {
    console.error('Failed to like post:', error.message);
  }
}

// Add comment
export async function addPostComment(postId, comment) {
  try {
    const response = await apiClient.addComment(postId, comment);
    return response;
  } catch (error) {
    console.error('Failed to add comment:', error.message);
  }
}

// Delete post
export async function deletePost(postId) {
  try {
    await apiClient.deletePost(postId);
    console.log('Post deleted');
  } catch (error) {
    console.error('Failed to delete post:', error.message);
  }
}

// ==================== RECIPES EXAMPLES ====================

// Search recipes
export async function searchRecipes(query, filters = {}) {
  try {
    const results = await apiClient.searchRecipes(query, filters);
    return results;
  } catch (error) {
    console.error('Recipe search failed:', error.message);
  }
}

// Get daily picks
export async function getDailyPickRecipes() {
  try {
    const recipes = await apiClient.getDailyPickRecipes();
    return recipes;
  } catch (error) {
    console.error('Failed to fetch daily picks:', error.message);
  }
}

// Get recipe details
export async function getRecipeDetails(recipeId) {
  try {
    const recipe = await apiClient.getRecipeInfo(recipeId);
    return recipe;
  } catch (error) {
    console.error('Failed to fetch recipe:', error.message);
  }
}

// Save recipe as favorite
export async function saveRecipeAsFavorite(recipeData) {
  try {
    const response = await apiClient.saveRecipe(recipeData);
    return response;
  } catch (error) {
    console.error('Failed to save recipe:', error.message);
  }
}

// Get favorite recipes
export async function fetchFavoriteRecipes() {
  try {
    const favorites = await apiClient.getFavoriteRecipes();
    return favorites;
  } catch (error) {
    console.error('Failed to fetch favorites:', error.message);
  }
}

// Toggle archive
export async function toggleArchiveRecipe(recipeId) {
  try {
    const response = await apiClient.toggleArchiveRecipe(recipeId);
    return response;
  } catch (error) {
    console.error('Failed to archive recipe:', error.message);
  }
}

// ==================== CHAT EXAMPLES ====================

// Send message to chatbot
export async function sendChatbotMessage(message) {
  try {
    const response = await apiClient.sendChatMessage(message);
    return response;
  } catch (error) {
    console.error('Failed to send message:', error.message);
  }
}

// ==================== LOGS EXAMPLES ====================

// Create log entry
export async function createActivityLog(logData) {
  try {
    const response = await apiClient.createLog(logData);
    return response;
  } catch (error) {
    console.error('Failed to create log:', error.message);
  }
}

// Get all logs
export async function fetchAllLogs() {
  try {
    const logs = await apiClient.getAllLogs();
    return logs;
  } catch (error) {
    console.error('Failed to fetch logs:', error.message);
  }
}

// Search logs
export async function searchActivityLogs(query, filters) {
  try {
    const results = await apiClient.searchLogs(query, filters);
    return results;
  } catch (error) {
    console.error('Failed to search logs:', error.message);
  }
}

// ==================== ADMIN EXAMPLES ====================

// Admin login
export async function adminLogin(email, password) {
  try {
    const response = await apiClient.adminLogin(email, password);
    console.log('Admin login successful');
    return response;
  } catch (error) {
    console.error('Admin login failed:', error.message);
  }
}

// Get dashboard stats
export async function fetchDashboardStats() {
  try {
    const stats = await apiClient.getDashboardStats();
    return stats;
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error.message);
  }
}

// Get flagged content
export async function fetchFlaggedContent() {
  try {
    const flagged = await apiClient.getFlaggedContent();
    return flagged;
  } catch (error) {
    console.error('Failed to fetch flagged content:', error.message);
  }
}

// Get moderation queue
export async function fetchModerationQueue() {
  try {
    const queue = await apiClient.getModerationQueue();
    return queue;
  } catch (error) {
    console.error('Failed to fetch moderation queue:', error.message);
  }
}

// Resolve moderation item
export async function resolveModerationItem(itemId, decision, reason) {
  try {
    const response = await apiClient.resolveModeration({
      itemId,
      decision,
      reason,
    });
    return response;
  } catch (error) {
    console.error('Failed to resolve moderation:', error.message);
  }
}

// ==================== REACT HOOK EXAMPLE ====================

/*
import { useState, useEffect } from 'react';
import apiClient from './services/apiClient';

function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await apiClient.getCurrentUser();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (apiClient.accessToken) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  return { user, loading, error };
}

export default useUser;
*/

// ==================== ERROR HANDLING ====================

/*
// Global error handler
export function handleAPIError(error) {
  if (error.status === 401) {
    // Unauthorized - redirect to login
    window.location.href = '/login';
  } else if (error.status === 403) {
    // Forbidden - user doesn't have permission
    console.error('Access denied:', error.message);
  } else if (error.status === 404) {
    // Not found
    console.error('Resource not found:', error.message);
  } else if (error.status === 500) {
    // Server error
    console.error('Server error:', error.message);
  } else {
    console.error('API Error:', error.message);
  }
}
*/

export default {
  handleLogin,
  handleSignup,
  handleLogout,
  fetchCurrentUser,
  updateUserProfile,
  updateUserAvatar,
  createPost,
  fetchAllPosts,
  likePost,
  addPostComment,
  deletePost,
  searchRecipes,
  getDailyPickRecipes,
  getRecipeDetails,
  saveRecipeAsFavorite,
  fetchFavoriteRecipes,
  toggleArchiveRecipe,
  sendChatbotMessage,
  createActivityLog,
  fetchAllLogs,
  searchActivityLogs,
  adminLogin,
  fetchDashboardStats,
  fetchFlaggedContent,
  fetchModerationQueue,
  resolveModerationItem,
};
