/**
 * DEBUGGING GUIDE: Social Interactions Backend Response Format
 * 
 * Use this to debug and verify your backend response format matches what the frontend expects
 */

// ============================================================================
// 1. ADD THIS TO YOUR PostCard.jsx FOR DEBUGGING
// ============================================================================

// Replace the runPostMutation function with this debug version:

const runPostMutation = async (path, init, fallbackMessage) => {
  console.log(`[API] Calling: ${path}`, init);
  
  const response = await apiFetch(path, init);
  const data = await response.json();
  
  console.log(`[API] Response status:`, response.status);
  console.log(`[API] Response data:`, data);

  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }

  // Handle different response formats from backend
  const updatedPost = data.post || data.data || data;
  console.log(`[API] Updated post object:`, updatedPost);
  
  if (updatedPost && (updatedPost.id || updatedPost._id)) {
    console.log(`[API] Applying post update`);
    applyPostUpdate(updatedPost);
  } else {
    console.warn(`[API] No post object found in response!`);
  }

  return data;
};

// ============================================================================
// 2. ADD THIS TO YOUR CommentSection.jsx FOR DEBUGGING
// ============================================================================

// Replace the addComment function with this debug version:

const addComment = async (text) => {
  if (!text?.trim()) return;

  try {
    console.log(`[COMMENT] Adding comment to post:`, postId);
    console.log(`[COMMENT] Text:`, text);
    
    const response = await apiFetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ text: text.trim() }),
    });
    
    const data = await response.json();
    console.log(`[COMMENT] Response status:`, response.status);
    console.log(`[COMMENT] Response data:`, data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to add comment");
    }

    // Handle different response formats
    const updatedPost = data.post || data.data || {};
    const newComment = data.comment || data.newComment || {};
    
    console.log(`[COMMENT] Updated post:`, updatedPost);
    console.log(`[COMMENT] New comment:`, newComment);
    
    const postComments = Array.isArray(updatedPost.comments)
      ? updatedPost.comments
      : [...comments, newComment].filter(Boolean);

    setComments(postComments);
    
    if (updatedPost && (updatedPost.id || updatedPost._id)) {
      onPostUpdate?.(updatedPost);
    }

    const isCommentUnderReview =
      data.commentModeration?.status === "flagged" &&
      data.commentModeration?.classification === "not_food_related";

    if (isCommentUnderReview) {
      setShowCommentReviewPopup(true);
    }

    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  } catch (error) {
    console.error("Failed to add comment:", error);
  }
};

// ============================================================================
// 3. EXPECTED RESPONSE FORMATS
// ============================================================================

/*
Your backend should return responses in ONE of these formats:

FORMAT 1 - With full post object:
{
  success: true,
  post: {
    _id: "123456",
    content: "...",
    likes: ["user1", "user2"],
    likesCount: 2,
    dislikes: ["user3"],
    dislikesCount: 1,
    comments: [...],
    commentsCount: 3,
    reposts: [...],
    repostsCount: 1,
    likedByViewer: true,      // Important!
    dislikedByViewer: false,   // Important!
    repostedByViewer: false    // Important!
  }
}

FORMAT 2 - For comments specifically:
{
  success: true,
  comment: {
    _id: "comment-id",
    userId: "user-id",
    text: "Comment text",
    createdAt: "2026-04-17T..."
  },
  post: {
    _id: "123456",
    comments: [...],
    commentsCount: 3
  }
}

FORMAT 3 - Minimal response:
{
  success: true,
  data: {
    _id: "123456",
    ...post fields
  }
}
*/

// ============================================================================
// 4. TEST IN BROWSER CONSOLE
// ============================================================================

/*
1. Open DevTools (F12)
2. Go to Console tab
3. Try a like/dislike/repost action
4. You should see logs like:
   [API] Calling: /api/posts/123456/like POST
   [API] Response status: 200
   [API] Response data: {...the actual response...}
   [API] Updated post object: {...}
   [API] Applying post update

5. Check if you see "Updated post object" - if it's undefined, the response format is wrong
6. Take a screenshot of the console output and share with your backend team
*/

// ============================================================================
// 5. KEY FIELDS NEEDED FOR UI UPDATE
// ============================================================================

/*
For the frontend to show updated counts and button states, the response MUST include:

1. likesCount or likes (array)
2. dislikesCount or dislikes (array) 
3. repostsCount or reposts (array)
4. commentsCount or comments (array)
5. likedByViewer - boolean (whether current user has liked)
6. dislikedByViewer - boolean (whether current user has disliked)
7. repostedByViewer - boolean (whether current user has reposted)

Example:
{
  post: {
    _id: "123456",
    likesCount: 5,
    likes: ["user1", "user2"],
    dislikesCount: 1,
    dislikes: ["user3"],
    repostsCount: 2,
    reposts: ["user4", "user5"],
    commentsCount: 3,
    comments: [...],
    likedByViewer: true,      // ← This tells button to show as "liked"
    dislikedByViewer: false,   // ← This tells button to show as "unliked"
    repostedByViewer: true     // ← This tells button to show as "reposted"
  }
}
*/
