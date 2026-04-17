/**
 * INTEGRATION GUIDE: Social Interactions API
 * 
 * This shows how to integrate the API endpoints into your PostCard/Feed components
 */

import { postAPI } from "@/utils/apiService";

// ============================================================================
// EXAMPLE 1: Using in PostCard or Feed Component
// ============================================================================

/*
import { useState } from "react";
import PostActions from "./Post Action/PostActions";
import { postAPI } from "@/utils/apiService";

const PostCard = ({ post, onPostUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Like Post
  const handleLike = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await postAPI.likePost(post._id);
      console.log("Post liked:", result);
      
      // Update UI optimistically or wait for server response
      if (onPostUpdated) {
        onPostUpdated(result);
      }
    } catch (err) {
      setError("Failed to like post");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Dislike Post
  const handleDislike = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await postAPI.dislikePost(post._id);
      console.log("Post disliked:", result);
      
      if (onPostUpdated) {
        onPostUpdated(result);
      }
    } catch (err) {
      setError("Failed to dislike post");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Add Comment
  const handleComment = async (commentText) => {
    try {
      setLoading(true);
      setError(null);
      const result = await postAPI.addComment(post._id, {
        userId: getUserIdFromContext(), // Get from your auth context
        text: commentText,
      });
      console.log("Comment added:", result);
      
      if (onPostUpdated) {
        onPostUpdated(result);
      }
    } catch (err) {
      setError("Failed to add comment");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Repost
  const handleRepost = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await postAPI.repostPost(post._id);
      console.log("Post reposted:", result);
      
      if (onPostUpdated) {
        onPostUpdated(result);
      }
    } catch (err) {
      setError("Failed to repost");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="text-red-500">{error}</div>}
      <PostActions
        post={post}
        onLike={handleLike}
        onDislike={handleDislike}
        onComment={() => handleComment("comment text here")}
        onRepost={handleRepost}
      />
    </div>
  );
};

export default PostCard;
*/

// ============================================================================
// EXAMPLE 2: API Functions Ready to Use
// ============================================================================

/**
 * Like a post
 * @param {string} postId - The post ID
 * @returns {Promise} Response with updated post data
 */
export const likePost = async (postId) => {
  return await postAPI.likePost(postId);
};

/**
 * Dislike a post
 * @param {string} postId - The post ID
 * @returns {Promise} Response with updated post data
 */
export const dislikePost = async (postId) => {
  return await postAPI.dislikePost(postId);
};

/**
 * Add a comment to a post
 * @param {string} postId - The post ID
 * @param {string} userId - The user ID
 * @param {string} text - Comment text
 * @returns {Promise} Response with the new comment
 */
export const addComment = async (postId, userId, text) => {
  return await postAPI.addComment(postId, { userId, text });
};

/**
 * Repost a post
 * @param {string} postId - The post ID
 * @param {string} userId - The user ID (optional, backend may get from token)
 * @returns {Promise} Response with repost data
 */
export const repostPost = async (postId, userId) => {
  return await postAPI.repostPost(postId, { userId });
};

// ============================================================================
// EXAMPLE 3: Using with Context (For Global State)
// ============================================================================

/*
import { createContext, useContext, useState } from "react";
import { postAPI } from "@/utils/apiService";

const PostInteractionContext = createContext();

export const PostInteractionProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLike = async (postId) => {
    setLoading(true);
    setError(null);
    try {
      return await postAPI.likePost(postId);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDislike = async (postId) => {
    setLoading(true);
    setError(null);
    try {
      return await postAPI.dislikePost(postId);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (postId, userId, text) => {
    setLoading(true);
    setError(null);
    try {
      return await postAPI.addComment(postId, { userId, text });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleRepost = async (postId, userId) => {
    setLoading(true);
    setError(null);
    try {
      return await postAPI.repostPost(postId, { userId });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <PostInteractionContext.Provider
      value={{
        loading,
        error,
        handleLike,
        handleDislike,
        handleAddComment,
        handleRepost,
      }}
    >
      {children}
    </PostInteractionContext.Provider>
  );
};

export const usePostInteraction = () => {
  const context = useContext(PostInteractionContext);
  if (!context) {
    throw new Error("usePostInteraction must be used within PostInteractionProvider");
  }
  return context;
};
*/
