# TEST CASES - POST CREATION FEATURE

## Overview
This document covers comprehensive test cases for the Post Creation feature in Gastronome Connect frontend. The post creation flow includes content input, media upload, moderation checks, and post submission.

---

## Test Case 1: Create Post with Text Only

**Test Case ID:** POST_001  
**Feature:** Post Creation  
**Component:** Feed.jsx, useModeratedPostCreation, useUpload  
**Priority:** High  
**Severity:** Critical

### Preconditions
- User is logged in with valid `accessToken` stored
- User is on the Feed page
- Network connectivity is stable
- User ID is available in localStorage

### Test Steps
1. Click on "Create Post" button
2. In the post editor, enter text content: "Just made an amazing pasta dish! 🍝"
3. Do NOT attach any media files
4. Click "Post" button
5. Observe post submission process
6. Wait for response from backend

### Expected Results
- Text content is captured correctly
- Submit button is enabled
- API call to `POST /api/posts` is made with body:
  ```json
  {
    "content": "Just made an amazing pasta dish! 🍝",
    "userId": "<current_user_id>"
  }
  ```
- Post appears in feed within 2 seconds
- Success notification is shown (if applicable)
- Loading spinner disappears after submission

### Postconditions
- New post is visible at the top of the feed
- Post contains user's avatar, name, and timestamp
- Post text matches input exactly
- Post has engagement buttons (like, dislike, comment, repost)

### Test Data
```
Input: "Just made an amazing pasta dish! 🍝"
Expected Output: Post created with content visible in feed
```

### Pass/Fail Criteria
- ✅ PASS: Post appears in feed with exact text
- ❌ FAIL: Post not created, error message shown, or text modified

---

## Test Case 2: Create Post with Single Image

**Test Case ID:** POST_002  
**Feature:** Post Creation with Media  
**Component:** useUpload, MediaGrid, Feed.jsx  
**Priority:** High  
**Severity:** Critical

### Preconditions
- User is logged in
- User is on Feed page
- Valid image file exists: `recipe_photo.jpg` (2MB, JPG format, 1920x1080px)
- User has selected the image file for upload

### Test Steps
1. Click "Create Post" button
2. Enter caption text: "Homemade pizza night"
3. Click on media upload icon
4. Select image file: `recipe_photo.jpg`
5. Wait for image preview to load (should show thumbnail)
6. Click "Post" button
7. Monitor upload progress

### Expected Results
- Image preview appears in post editor
- Upload progress bar is visible
- Progress percentage increments from 0 to 100%
- File size is displayed (2MB)
- API call to upload endpoint includes:
  - Image file as FormData
  - Post caption
  - User ID
- Post is created with image embedded
- Image renders correctly in post card

### Postconditions
- Post displays image with caption
- Image is clickable and opens in expanded view
- Post engagement metrics are initialized (0 likes, comments, etc.)

### Test Data
```
File: recipe_photo.jpg
Size: 2MB
Format: JPEG
Resolution: 1920x1080px
Caption: "Homemade pizza night"
```

### Pass/Fail Criteria
- ✅ PASS: Image uploads successfully, post created with image visible
- ❌ FAIL: Upload fails, image not displayed, or wrong image shown

---

## Test Case 3: Create Post with Multiple Media (3 Images)

**Test Case ID:** POST_003  
**Feature:** Post Creation with Multiple Media  
**Component:** MediaGrid, useUpload  
**Priority:** High  
**Severity:** High

### Preconditions
- User is logged in
- User has 3 image files ready:
  - `dish1.jpg` (1.5MB)
  - `dish2.jpg` (1.8MB)
  - `dish3.jpg` (2.0MB)
- Total file size: 5.3MB (within limit)

### Test Steps
1. Open create post modal
2. Add post text: "Weekend cooking adventure - 3 courses"
3. Click media upload
4. Select all 3 images in sequence
5. Verify thumbnails appear in media preview grid
6. Reorder images by dragging (dish2 → position 1, dish1 → position 2)
7. Click "Post" button
8. Wait for all uploads to complete

### Expected Results
- All 3 images appear as thumbnails in upload preview
- Reordering works - images update positions
- MediaGrid component renders 3 images in correct order
- Upload progress shows: ~66%, ~93%, ~100%
- Backend receives all 3 images with metadata
- Post created successfully

### Postconditions
- Post displays all 3 images in correct reordered sequence
- MediaGrid shows thumbnail navigation dots (3 dots)
- User can swipe/navigate between images in expanded view

### Test Data
```
Files: dish1.jpg, dish2.jpg, dish3.jpg
Total Size: 5.3MB
Caption: "Weekend cooking adventure - 3 courses"
Expected Order: dish2, dish1, dish3
```

### Pass/Fail Criteria
- ✅ PASS: All 3 images upload, appear in correct order, post created
- ❌ FAIL: Any image fails to upload, wrong order, or post not created

---

## Test Case 4: Post Moderation - Flagged Post (Not Food Related)

**Test Case ID:** POST_004  
**Feature:** Post Moderation - Flagged Content  
**Component:** useModeratedPostCreation, PostUnderReviewPopup  
**Priority:** High  
**Severity:** High

### Preconditions
- User is logged in
- User attempts to post non-food-related content
- Post will trigger moderation flag
- Backend returns: `moderation.status = "flagged"`, `classification = "not_food_related"`

### Test Steps
1. Open create post dialog
2. Enter text: "Check out my new car - 2024 model" (non-food content)
3. Attach image of a car (non-food)
4. Click "Post" button
5. Backend processes post and returns flagged status
6. Frontend receives moderation response

### Expected Results
- Post submission completes
- Response includes: `moderation: { status: "flagged", classification: "not_food_related" }`
- PostUnderReviewPopup component is triggered
- Popup displays message: "Your post is under review because it does not appear to be food related."
- Popup title: "Post under review"
- Popup has dismiss button
- Auto-dismiss after 8000ms (8 seconds)

### Postconditions
- Post is hidden from feed (isHidden = true)
- Post appears in "Pending Review" section in user profile
- User receives notification about review status
- Admin can see post in moderation queue

### Test Data
```
Content: "Check out my new car - 2024 model"
Image: car_photo.jpg (non-food)
Expected Flag: not_food_related
```

### Pass/Fail Criteria
- ✅ PASS: Post flagged, review popup shown, post hidden
- ❌ FAIL: Post not flagged, popup doesn't appear, or post visible

---

## Test Case 5: Post Creation with Network Error

**Test Case ID:** POST_005  
**Feature:** Post Creation Error Handling  
**Component:** useUpload, Feed.jsx  
**Priority:** Medium  
**Severity:** High

### Preconditions
- User is logged in
- User has created post content
- Network connection will be interrupted during upload

### Test Steps
1. Open create post with text and 1 image
2. Click "Post" button
3. Wait for upload to reach 45% progress
4. Simulate network disconnection (DevTools Network Throttling: Offline)
5. Observe error handling

### Expected Results
- Upload progress stops at 45%
- Error message appears: "Network error. Please try again."
- UploadFailedModal component displays:
  - Error title
  - Error description
  - "Retry" button
  - "Cancel" button
- User can retry upload after reconnecting network

### Postconditions
- Post is not created on backend
- Media upload is cancelled/aborted
- Form data is preserved for retry
- User can click "Retry" to attempt again

### Test Data
```
Content: "Retry test post"
Image: test_image.jpg
Error: Network disconnection at 45% upload
```

### Pass/Fail Criteria
- ✅ PASS: Error handled gracefully, retry available, form preserved
- ❌ FAIL: No error message, form lost, or upload hangs

---

## Test Case 6: Post Creation - Empty Content Validation

**Test Case ID:** POST_006  
**Feature:** Form Validation  
**Component:** Post Editor, useUpload  
**Priority:** Medium  
**Severity:** Medium

### Preconditions
- User is on create post modal
- Post editor is empty

### Test Steps
1. Leave text field empty
2. Do NOT add any media
3. Click "Post" button
4. Observe validation behavior

### Expected Results
- "Post" button is disabled (greyed out)
- OR validation error message appears: "Post content cannot be empty"
- Post creation request is NOT sent to backend
- User cannot submit empty post

### Postconditions
- Create post modal remains open
- User can add content and retry
- No unnecessary API calls made

### Test Data
```
Content: (empty)
Media: (none)
```

### Pass/Fail Criteria
- ✅ PASS: Post button disabled or error shown, no API call
- ❌ FAIL: Empty post submitted to backend

---

## Test Case 7: Post Creation - Character Limit

**Test Case ID:** POST_007  
**Feature:** Content Validation  
**Component:** Post Editor  
**Priority:** Low  
**Severity:** Low

### Preconditions
- User is on create post modal
- Character limit is 5000 characters

### Test Steps
1. Enter exactly 4999 characters in text field
2. Verify button is enabled
3. Add 1 more character (total 5000)
4. Verify button is still enabled
5. Try to add 1 more character (total 5001)
6. Observe validation

### Expected Results
- At 5000 characters: "Post" button is enabled
- At 5001 characters: 
  - Input field prevents additional characters
  - OR warning message appears: "Maximum 5000 characters allowed"
- Character counter displays remaining: "1 of 5000"
- Post cannot exceed 5000 characters

### Postconditions
- User sees character limit enforced
- Cannot submit post over limit

### Test Data
```
Text length tests: 4999, 5000, 5001 characters
```

### Pass/Fail Criteria
- ✅ PASS: Character limit enforced, button disabled at limit+1
- ❌ FAIL: Allows characters over limit, post submitted

---

## Test Case 8: Post Created - Appears in Feed

**Test Case ID:** POST_008  
**Feature:** Post Feed Integration  
**Component:** Feed.jsx, InfiniteScrollTrigger  
**Priority:** High  
**Severity:** Critical

### Preconditions
- Post has been successfully created
- Post is not flagged/hidden
- Feed page is active
- User is viewing own feed

### Test Steps
1. Complete successful post creation (TEST_001)
2. Observe feed page
3. Wait for post to appear in feed list
4. Verify post position
5. Check post metadata

### Expected Results
- New post appears at TOP of feed (position 0)
- Post displays:
  - User avatar (profile picture)
  - User display name
  - Timestamp (e.g., "2 seconds ago")
  - Post content text
  - Media (if attached)
- Post has all action buttons:
  - Like button (0 likes initially)
  - Dislike button
  - Comment button (0 comments initially)
  - Repost button

### Postconditions
- Post is counted in user's posts
- Post is searchable
- Other users can see post (if public)

### Test Data
```
Created post: "Just made an amazing pasta dish! 🍝"
Expected position: Index 0 in feed
Expected engagement: 0 likes, 0 comments, 0 reposts
```

### Pass/Fail Criteria
- ✅ PASS: Post appears at top of feed with all correct metadata
- ❌ FAIL: Post not visible, wrong position, or missing buttons

---

## Test Case 9: Post Creation - Hashtag Detection

**Test Case ID:** POST_009  
**Feature:** Hashtag Support  
**Component:** Post Editor, MentionText  
**Priority:** Medium  
**Severity:** Medium

### Preconditions
- User is creating a post
- Post contains hashtags

### Test Steps
1. Enter post text: "Amazing #pasta #homemade #cooking"
2. Verify hashtags are highlighted in editor
3. Click on hashtag #pasta
4. Click "Post" button
5. Verify post created successfully

### Expected Results
- Hashtags are highlighted/styled differently in editor
- Hashtags remain in post content
- Post backend receives full text with hashtags
- Hashtags are extracted and indexed
- Post is searchable by hashtag

### Postconditions
- Hashtags can be clicked in feed to show related posts
- Hashtag page shows this post

### Test Data
```
Content: "Amazing #pasta #homemade #cooking"
Hashtags to detect: #pasta, #homemade, #cooking
```

### Pass/Fail Criteria
- ✅ PASS: Hashtags highlighted, post created, searchable
- ❌ FAIL: Hashtags not highlighted or not indexed

---

## Test Case 10: Post Creation - Mention Detection

**Test Case ID:** POST_010  
**Feature:** User Mention Support  
**Component:** MentionSuggestionsDropdown, Post Editor  
**Priority:** Medium  
**Severity:** Medium

### Preconditions
- User is creating a post
- Post contains user mentions
- Target user exists in database

### Test Steps
1. In post text field, type: "Hey @"
2. Observe MentionSuggestionsDropdown appears
3. Type "johndoe" - see suggestions
4. Click on "johndoe" in dropdown
5. Complete mention: "Hey @johndoe check this recipe!"
6. Click "Post" button

### Expected Results
- Mention dropdown appears after "@"
- User suggestions filtered by typed characters
- Selected user is highlighted in post
- Post content includes proper mention syntax
- Backend receives: "Hey @johndoe check this recipe!"
- Mentioned user receives notification

### Postconditions
- Mentioned user gets notification: "You were mentioned in a post"
- Mention is clickable in feed post
- Mention links to mentioned user's profile

### Test Data
```
Mention text: "Hey @johndoe check this recipe!"
Mentioned user: johndoe
```

### Pass/Fail Criteria
- ✅ PASS: Mention suggestions shown, user notified, post created
- ❌ FAIL: Dropdown doesn't appear or user not notified

---

## Integration Tests

### Test Case 11: Post Creation Flow - End to End

**Test Case ID:** POST_011  
**Feature:** Complete Post Creation Flow  
**Type:** Integration Test  
**Priority:** Critical

### Scenario: User creates post with text, image, and mentions

**Steps:**
1. User logs in successfully
2. Navigate to Feed page
3. Click "Create Post" button
4. Enter text: "Amazing dinner with @chef_mike #foodie"
5. Select image: pizza.jpg
6. Wait for image preview
7. Click "Post" button
8. Wait for completion

**Assertions:**
- ✅ Post appears in feed at position 0
- ✅ Image displays correctly
- ✅ Text content matches exactly
- ✅ User @chef_mike received mention notification
- ✅ Post engagement buttons initialized (0 likes/comments)
- ✅ Post timestamp shows "now" or "1 second ago"
- ✅ User's post count incremented

### Test Case 12: Concurrent Post Uploads

**Test Case ID:** POST_012  
**Feature:** Multiple Concurrent Posts  
**Type:** Load Test  
**Priority:** Medium

### Preconditions
- User is logged in
- Browser supports concurrent uploads
- Network bandwidth sufficient

### Steps:
1. Open 2 create post modals
2. Submit first post with image
3. Before first completes, submit second post
4. Wait for both to complete

**Expected Results:**
- ✅ Both posts created successfully
- ✅ Posts appear in feed
- ✅ No data loss or corruption
- ✅ Both show correct content

---

## Test Execution Summary

| Test ID | Feature | Status | Notes |
|---------|---------|--------|-------|
| POST_001 | Text Post | ⬜ | To be executed |
| POST_002 | Single Image | ⬜ | To be executed |
| POST_003 | Multiple Images | ⬜ | To be executed |
| POST_004 | Moderation Flag | ⬜ | To be executed |
| POST_005 | Error Handling | ⬜ | To be executed |
| POST_006 | Validation | ⬜ | To be executed |
| POST_007 | Char Limit | ⬜ | To be executed |
| POST_008 | Feed Display | ⬜ | To be executed |
| POST_009 | Hashtags | ⬜ | To be executed |
| POST_010 | Mentions | ⬜ | To be executed |
| POST_011 | End-to-End | ⬜ | To be executed |
| POST_012 | Concurrent | ⬜ | To be executed |

---

## Notes for QA
- Mock authentication with valid access tokens
- Use network throttling in DevTools to simulate slow connections
- Test on multiple browsers: Chrome, Firefox, Safari
- Test on mobile (iOS Safari, Chrome Mobile)
- Verify API requests in Network tab match expected format
- Check localStorage for token persistence
- Monitor console for errors/warnings
