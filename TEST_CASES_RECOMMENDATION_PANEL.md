# TEST CASES - RECOMMENDATION PANEL (DAILY PICKS)

## Overview
This document covers comprehensive test cases for the Recommendation Panel feature that displays daily-picked recipes in the Gastronome Connect feed. The panel shows curated recipe recommendations in a horizontal scrollable carousel.

---

## Test Case 1: Recommendation Panel Loads on Feed Page

**Test Case ID:** REC_001  
**Feature:** Recommendation Panel Display  
**Component:** RecommendationPanel.jsx, Feed.jsx  
**Priority:** High  
**Severity:** Critical

### Preconditions
- User navigates to Feed page
- Internet connection is active
- Backend API endpoint `/api/recipes/daily-picks` is available
- User has not previously viewed today's picks

### Test Steps
1. Navigate to Feed page
2. Observe page loading
3. Wait for content to load (up to 5 seconds)
4. Look for "Daily Picks" or recommendation section
5. Verify section displays recipes

### Expected Results
- Recommendation Panel appears on the page:
  - Position: Below hero banner, above post feed
  - Title/Header: "DAILY PICKS" or "RECOMMENDED RECIPES"
  - Content: Horizontal carousel of recipe cards
  - Carousel is scrollable (arrows or swipe)
- API call made to `/api/recipes/daily-picks` with status 200
- Response includes array of recipes
- Multiple recipe cards visible (3-5 cards visible at once)

### Postconditions
- Panel is interactive
- User can scroll through recipes
- Loading state resolved
- No errors in console

### Pass/Fail Criteria
- ✅ PASS: Panel visible, recipes displayed, API called successfully
- ❌ FAIL: Panel not visible, API error, or no recipes shown

---

## Test Case 2: Recommendation Panel Initial Loading State

**Test Case ID:** REC_002  
**Feature:** Loading Skeleton  
**Component:** RecommendationPanel.jsx, SkeletonRecommendationCard  
**Priority:** Medium  
**Severity:** Medium

### Preconditions
- Feed page is loading
- API call to `/api/recipes/daily-picks` is pending
- Network is slow (simulated with DevTools throttling)

### Test Steps
1. Open DevTools Network tab
2. Set Network throttle to "Slow 3G"
3. Navigate to Feed page
4. Observe recommendation panel as it loads
5. Wait for real content to appear

### Expected Results
- Before recipes load:
  - Skeleton loader cards appear in carousel position
  - Multiple skeleton cards visible (same width/height as real cards)
  - Skeleton animation running (shimmer/pulse effect)
  - "Loading options..." or similar message shown
- After API responds:
  - Skeleton cards smoothly transition to real recipe cards
  - No layout shift (skeleton has same dimensions)
  - Loading animation stops

### Postconditions
- Real recipes now displayed
- Panel interactive
- Professional loading experience

### Test Data
```
Network throttle: Slow 3G (2G fallback)
Expected load time: 3-5 seconds
Skeleton cards count: Same as recipe cards (3-5)
```

### Pass/Fail Criteria
- ✅ PASS: Skeleton shows, smooth transition to real content
- ❌ FAIL: No skeleton, layout shift, or poor UX

---

## Test Case 3: Recipe Data Mapping

**Test Case ID:** REC_003  
**Feature:** Data Transformation  
**Component:** RecommendationPanel.jsx, mapRecommendedRecipe function  
**Priority:** High  
**Severity:** High

### Preconditions
- API `/api/recipes/daily-picks` returns recipe objects
- Recipe objects have various field names (internal and external)

### Test Steps
1. Intercept API response in Network tab
2. Examine recipe object structure
3. Verify data mapping function handles:
   - Local recipes: `recipeName`, `recipeImg`
   - External recipes: `title`, `image`
   - Both formats: `_id` and `id`
4. Check final mapped object

### Expected Results
- Recipe objects properly mapped to display format:
  ```javascript
  {
    id: "...",
    _id: "...",
    name: "Recipe Name",
    title: "Recipe Name",
    author: "Source or Author",
    sourceLabel: "source.com",
    img: "https://...",
    image: "https://...",
    avatar: "https://...",
    caption: "Instructions or description",
    description: "Instructions or description",
    ingredients: [...],
    date: "MM/DD/YYYY",
    mediaItems: [...]
  }
  ```
- Image URLs properly resolved
- All fields have fallback values
- No null/undefined fields displayed
- Recipe name, image, and author all populated

### Postconditions
- Mapped data used for display
- Cards render with correct data
- No display errors

### Test Data
```
Sample API response:
{
  "recipes": [
    {
      "_id": "123abc",
      "recipeName": "Pasta Carbonara",
      "recipeImg": "/images/pasta.jpg",
      "instructions": "Mix eggs, pecorino, guanciale...",
      "sourceName": "Gastronome Connect",
      "sourceUrl": "https://internal.com"
    },
    {
      "id": "456def",
      "title": "Risotto",
      "image": "https://spoonacular.com/risotto.jpg",
      "author": "Spoonacular",
      "description": "Add broth gradually..."
    }
  ]
}
```

### Pass/Fail Criteria
- ✅ PASS: All data mapped correctly, no errors, all fields populated
- ❌ FAIL: Missing fields, null values, or mapping errors

---

## Test Case 4: Recipe Card Display

**Test Case ID:** REC_004  
**Feature:** Individual Recipe Card UI  
**Component:** RecommendedRecipeCard.jsx  
**Priority:** High  
**Severity:** High

### Preconditions
- Recipes are loaded and mapped
- RecommendedRecipeCard component renders recipe data

### Test Steps
1. Load recommendation panel with recipes
2. Observe individual recipe card
3. Verify all elements displayed
4. Check styling and layout

### Expected Results
- Each recipe card displays:
  - **Image**: Recipe image at top (height: 6rem to 9rem depending on screen size)
  - **Title**: Recipe name prominently (truncated if too long, 2-3 lines max)
  - **Author/Source**: Source name (e.g., "Spoonacular", "Chef Mike")
  - **Source Label**: Domain name (e.g., "spoonacular.com")
  - **Date**: Created/published date (MM/DD/YYYY format)
  - **Accent Line**: Colored line under title
  - **Border**: Subtle gray border
  - **Shadow**: Soft shadow for depth
  - **Styling**:
    - Responsive sizing
    - Rounded corners (1.5rem to 2rem)
    - Clean, professional design

### Postconditions
- Card is clickable
- Card responsive on different screen sizes
- No overlapping text or images

### Test Data
```
Card elements:
- Image height: sm:28 (7rem) / xl:36 (9rem)
- Title lines: 2-3 max
- Font: sans-serif
- Colors: White bg, gray border, orange/blue accents
```

### Pass/Fail Criteria
- ✅ PASS: All elements visible, properly styled, responsive
- ❌ FAIL: Missing elements, poor layout, or text overflow

---

## Test Case 5: Horizontal Scroll Navigation - Left Arrow

**Test Case ID:** REC_005  
**Feature:** Carousel Left Navigation  
**Component:** RecommendationPanel.jsx, scroll function  
**Priority:** High  
**Severity:** High

### Preconditions
- Recommendation panel loaded with 10+ recipes
- Carousel is in default position (scroll = 0)
- Left scroll arrow is visible

### Test Steps
1. Locate left arrow button in carousel header
2. Click left arrow
3. Observe scroll animation
4. Verify new cards visible

### Expected Results
- Left arrow click triggers scroll:
  - Scroll direction: left
  - Scroll distance: clientWidth * 0.8 (80% of visible width)
  - Animation: smooth scroll (behavior: "smooth")
  - Duration: ~500-800ms
- First click: If at position 0, no movement (or minimal)
- Subsequent clicks: Scrolls left revealing previous cards
- Arrow is disabled/greyed when at start position

### Postconditions
- Earlier recipes now visible
- User can scroll back to beginning
- Multiple clicks possible

### Test Data
```
Scroll distance formula: scrollLeft - (clientWidth * 0.8)
Animation: smooth, ~600ms
Initial position: scrollLeft = 0
```

### Pass/Fail Criteria
- ✅ PASS: Smooth left scroll, correct distance, arrow state managed
- ❌ FAIL: No scroll, jerky animation, or wrong distance

---

## Test Case 6: Horizontal Scroll Navigation - Right Arrow

**Test Case ID:** REC_006  
**Feature:** Carousel Right Navigation  
**Component:** RecommendationPanel.jsx, scroll function  
**Priority:** High  
**Severity:** High

### Preconditions
- Recommendation panel loaded
- Multiple recipes available (10+)
- Right scroll arrow is visible
- Carousel is scrolled to left position

### Test Steps
1. Locate right arrow button
2. Click right arrow
3. Observe scroll animation
4. Verify new cards visible
5. Continue clicking until end

### Expected Results
- Right arrow click triggers scroll:
  - Scroll direction: right
  - Scroll distance: clientWidth * 0.8 (80% of visible width)
  - Animation: smooth scroll
  - Duration: ~500-800ms
- Subsequent clicks: Scrolls right revealing more recipes
- When at end: Arrow disabled/greyed
- Carousel can be scrolled all the way to end showing last recipes

### Postconditions
- Later recipes visible
- User can explore all recommendations
- Infinite scroll behavior (can scroll to end)

### Test Data
```
Scroll distance formula: scrollLeft + (clientWidth * 0.8)
Animation: smooth, ~600ms
End condition: scrollLeft + clientWidth >= scrollWidth
```

### Pass/Fail Criteria
- ✅ PASS: Smooth right scroll, correct distance, end detection
- ❌ FAIL: No scroll, jerky animation, or disabled state wrong

---

## Test Case 7: Touch/Swipe Navigation (Mobile)

**Test Case ID:** REC_007  
**Feature:** Mobile Swipe Navigation  
**Component:** RecommendationPanel.jsx (mobile view)  
**Priority:** Medium  
**Severity:** Medium

### Preconditions
- View page on mobile device or mobile emulator (320px width)
- Recommendation panel loaded
- Touch events enabled

### Test Steps
1. On mobile device, view feed with recommendation panel
2. Swipe left on carousel
3. Observe scroll
4. Swipe right on carousel
5. Observe scroll in opposite direction

### Expected Results
- Swipe left: Carousel scrolls right (shows more recipes)
- Swipe right: Carousel scrolls left (shows previous recipes)
- Smooth swipe animation
- No page scroll interference
- Swipe sensitivity appropriate (not too sensitive)

### Postconditions
- Mobile user can navigate carousel easily
- Touch interaction smooth
- No default touch behaviors interfering

### Test Data
```
Device: iPhone 12 (390px width)
Swipe distance: Natural swipe gesture
Expected: Carousel responds to swipe
```

### Pass/Fail Criteria
- ✅ PASS: Swipe navigates carousel smoothly
- ❌ FAIL: Swipe doesn't work or interferes with page

---

## Test Case 8: Responsive Design - Different Screen Sizes

**Test Case ID:** REC_008  
**Feature:** Responsive Layout  
**Component:** RecommendationPanel.jsx, SkeletonRecommendationCard  
**Priority:** High  
**Severity:** High

### Preconditions
- Recommendation panel rendered
- Test across multiple viewport sizes

### Test Steps
1. View panel on Desktop (1920px)
   - Verify 5+ cards visible
   - Cards sized appropriately
2. View panel on Tablet (768px)
   - Verify 3-4 cards visible
   - Responsive sizing
3. View panel on Mobile (375px)
   - Verify 1-2 cards visible
   - Proper scaling
4. Test responsive transitions by resizing browser window

### Expected Results
- Desktop (xl, 1200px+):
  - Card min-width: 240px
  - Card height: 288px
  - Padding: responsive
- Tablet (md, 768px):
  - Card min-width: 220px
  - Card height: 258px
  - 3 cards visible
- Mobile (sm, 640px):
  - Card min-width: 200px
  - Card height: 258px
  - 2 cards visible
- Mobile (< 640px):
  - Card min-width: 160px
  - Card height: 224px
  - 1-2 cards visible

### Postconditions
- Layout works on all screen sizes
- No horizontal overflow
- Content readable on all devices

### Test Data
```
Breakpoints: 640px, 768px, 1024px, 1280px
Card sizes adjust at each breakpoint
```

### Pass/Fail Criteria
- ✅ PASS: Responsive on all screen sizes, proper card count visible
- ❌ FAIL: Overflow, poor visibility, or broken layout

---

## Test Case 9: Click Recipe Card - Navigate to Recipe Details

**Test Case ID:** REC_009  
**Feature:** Recipe Card Click Action  
**Component:** RecommendedRecipeCard.jsx, RecommendationPanel.jsx  
**Priority:** High  
**Severity:** High

### Preconditions
- Recommendation panel displayed with recipes
- Recipe detail page exists
- Navigation is configured

### Test Steps
1. Click on a recipe card in carousel
2. Observe navigation
3. Verify destination page

### Expected Results
- Recipe card is clickable
- Click navigates to recipe detail view
- Navigation options:
  - Route to: `/recipe/:id` or similar
  - OR: Modal opens with recipe details
  - OR: Expand in-place details panel
- Recipe ID is passed correctly
- Recipe details page loads:
  - Large recipe image
  - Full recipe name
  - Ingredients list
  - Full instructions
  - Cooking time, servings, etc.

### Postconditions
- User viewing recipe details
- Can return to feed
- Recipe info fully accessible

### Test Data
```
Recipe ID: 507f1f77bcf86cd799439011
Action: Click card
Expected destination: Recipe detail page
```

### Pass/Fail Criteria
- ✅ PASS: Card clickable, navigates to correct recipe detail
- ❌ FAIL: Card not clickable or wrong recipe opened

---

## Test Case 10: API Error - Recipe Fetch Fails

**Test Case ID:** REC_010  
**Feature:** Error Handling  
**Component:** RecommendationPanel.jsx  
**Priority:** High  
**Severity:** High

### Preconditions
- API endpoint `/api/recipes/daily-picks` fails
- Backend returns 500 error or network error occurs

### Test Steps
1. Open Feed page with network interceptor
2. Make `/api/recipes/daily-picks` endpoint return error
3. Observe panel behavior
4. Check for error message

### Expected Results
- API call fails (status !== 200)
- Error caught in try-catch block
- Error response:
  - State: `recipes = []` (empty array)
  - State: `isLoading = false`
- Panel displays:
  - Empty state message: "Failed to load daily pick recipes"
  - OR: Graceful fallback content
  - No error thrown to console
  - No panel visible OR simple message visible
- User can navigate feed normally

### Postconditions
- Error handled gracefully
- App continues functioning
- No crash

### Test Data
```
API response: 500 Internal Server Error
Expected handling: Empty state, no panel shown
```

### Pass/Fail Criteria
- ✅ PASS: Error handled gracefully, empty state shown, app functional
- ❌ FAIL: Error thrown, console error, or crash

---

## Test Case 11: Empty Response - No Recipes Available

**Test Case ID:** REC_011  
**Feature:** Empty State Handling  
**Component:** RecommendationPanel.jsx  
**Priority:** Medium  
**Severity:** Medium

### Preconditions
- API returns successful (200) but empty array
- Response: `{ recipes: [] }` or just `[]`

### Test Steps
1. Set API to return empty recipes array
2. Load Feed page
3. Observe recommendation panel
4. Check for empty state

### Expected Results
- API call succeeds (200 OK)
- Response contains no recipes
- Panel handles gracefully:
  - Empty state message: "No daily picks available today"
  - OR: Panel not displayed at all
  - OR: Placeholder content
- Feed continues loading below
- No errors in console

### Postconditions
- Feed loads normally without panel
- Good UX for empty state

### Test Data
```
API response: { recipes: [] }
Status: 200 OK
Expected UI: Empty state or hidden panel
```

### Pass/Fail Criteria
- ✅ PASS: Empty state handled gracefully, feed loads normally
- ❌ FAIL: Error shown or panel breaks

---

## Test Case 12: Large Recipe Image Handling

**Test Case ID:** REC_012  
**Feature:** Image Optimization  
**Component:** RecommendedRecipeCard.jsx  
**Priority:** Medium  
**Severity:** Medium

### Preconditions
- Recipe has high-resolution image (4000x3000px, 3MB)
- Image URL provided in response
- resolveUploadUrl function handles URL mapping

### Test Steps
1. Load recommendation panel
2. Observe recipe images loading
3. Check Network tab for image requests
4. Verify image display performance

### Expected Results
- Images load efficiently:
  - Optimized size for card display
  - Quick load time (< 1 second per card)
  - No layout shift while loading
  - Proper aspect ratio maintained
- Image URL properly resolved:
  - resolveUploadUrl maps to correct CDN
  - URL is accessible
  - Image renders correctly

### Postconditions
- Cards display images properly
- No performance degradation
- Images load lazily if below viewport

### Test Data
```
Image size: 3MB original
Card display size: 160-240px width
Expected: Compressed/optimized by CDN
```

### Pass/Fail Criteria
- ✅ PASS: Images load quickly, optimized size, no layout shift
- ❌ FAIL: Slow loading, large file size, or layout shift

---

## Test Case 13: Recommendation Panel Refresh

**Test Case ID:** REC_013  
**Feature:** Data Refresh  
**Component:** RecommendationPanel.jsx  
**Priority:** Low  
**Severity:** Low

### Preconditions
- Recommendation panel loaded with recipes
- Time has passed (simulated)
- User refreshes page or new daily picks time arrives

### Test Steps
1. Load recommendation panel (initial load)
2. Note recipe IDs visible
3. Refresh page (F5)
4. Observe panel after refresh

### Expected Results
- Panel reloads and fetches fresh recipes
- New set of recipes may be displayed (depends on backend)
- Loading state shows skeleton cards
- After load: New recipes or same recipes displayed
- No stale cache issues
- API called fresh each page load

### Postconditions
- Fresh data always displayed
- No cached old data

### Test Data
```
Initial load: 5 recipe IDs
After refresh: New set or same set
Expected: Fresh API call made
```

### Pass/Fail Criteria
- ✅ PASS: Fresh API call on refresh, updated data shown
- ❌ FAIL: Stale cache, old recipes shown

---

## Test Case 14: Recipe Title Truncation

**Test Case ID:** REC_014  
**Feature:** Text Overflow Handling  
**Component:** RecommendedRecipeCard.jsx  
**Priority:** Low  
**Severity:** Low

### Preconditions
- Recipe has very long title: "Homemade Handmade Traditional Italian Pasta Carbonara with Authentic Guanciale and Pecorino Romano Cheese"

### Test Steps
1. Load panel with recipe with long title
2. Observe title in card
3. Check for truncation or wrapping

### Expected Results
- Title is truncated gracefully:
  - Max lines: 2-3 lines max
  - Overflow: "..." added at end
  - No overlapping text
  - Readable font size maintained
- Card styling prevents overflow
- Full title available on hover (tooltip) or detail page

### Postconditions
- Long titles don't break layout
- Professional appearance

### Test Data
```
Long title: "Homemade Handmade Traditional Italian Pasta Carbonara..."
Expected lines: 2-3 max
Truncation: Text-overflow: ellipsis
```

### Pass/Fail Criteria
- ✅ PASS: Long title truncated with ellipsis, card layout intact
- ❌ FAIL: Title overflow breaks card or text hard to read

---

## Test Case 15: Carousel State Persistence

**Test Case ID:** REC_015  
**Feature:** Scroll Position Preservation  
**Component:** RecommendationPanel.jsx  
**Priority:** Low  
**Severity:** Low

### Preconditions
- User has scrolled carousel to middle position
- User navigates away from feed
- User returns to feed page

### Test Steps
1. Load recommendation panel
2. Scroll carousel to position 50%
3. Navigate to another page (e.g., profile)
4. Return to feed
5. Check carousel position

### Expected Results
- Carousel resets to beginning (scrollLeft = 0)
- OR carousel maintains scroll position (if implemented)
- Behavior is consistent
- No unexpected scrolls

### Postconditions
- Predictable carousel behavior
- User can navigate easily

### Test Data
```
Scroll position before: 50% of carousel
After navigation return: Reset or maintained
```

### Pass/Fail Criteria
- ✅ PASS: Carousel behavior consistent and expected
- ❌ FAIL: Erratic scroll behavior

---

## Integration Tests

### Test Case 16: Recommendation Panel in Feed Layout

**Test Case ID:** REC_016  
**Type:** Integration Test  
**Priority:** High

### Scenario: Panel integration with full feed

**Steps:**
1. Load Feed page
2. Observe layout:
   - Hero Banner at top
   - Recommendation Panel below hero
   - Post feed below recommendations
3. Scroll feed:
   - Hero disappears
   - Recommendation panel stays
   - Posts appear/disappear as scroll
4. Load more posts (infinite scroll)

**Assertions:**
- ✅ Panel positioned correctly below hero
- ✅ Panel doesn't interfere with post feed
- ✅ No layout overlap
- ✅ Responsive on all sizes
- ✅ All three components (hero, panel, feed) work together

---

### Test Case 17: Performance - Multiple Recipe Cards Rendering

**Test Case ID:** REC_017  
**Type:** Performance Test  
**Priority:** Medium

### Scenario: Large number of recipes rendering

**Steps:**
1. API returns 50 recipes (simulated)
2. Panel renders all 50 cards
3. Monitor performance:
   - Frame rate (should be 60 FPS)
   - Memory usage
   - Scroll smoothness
4. Scroll through all cards multiple times

**Assertions:**
- ✅ Smooth 60 FPS scrolling
- ✅ No jank or stuttering
- ✅ Memory stable
- ✅ CPU usage reasonable
- ✅ Cards render in <2 seconds

---

## Test Execution Summary

| Test ID | Feature | Status | Notes |
|---------|---------|--------|-------|
| REC_001 | Panel Load | ⬜ | To be executed |
| REC_002 | Loading State | ⬜ | To be executed |
| REC_003 | Data Mapping | ⬜ | To be executed |
| REC_004 | Card Display | ⬜ | To be executed |
| REC_005 | Left Scroll | ⬜ | To be executed |
| REC_006 | Right Scroll | ⬜ | To be executed |
| REC_007 | Mobile Swipe | ⬜ | To be executed |
| REC_008 | Responsive | ⬜ | To be executed |
| REC_009 | Card Click | ⬜ | To be executed |
| REC_010 | API Error | ⬜ | To be executed |
| REC_011 | Empty State | ⬜ | To be executed |
| REC_012 | Image Handling | ⬜ | To be executed |
| REC_013 | Data Refresh | ⬜ | To be executed |
| REC_014 | Title Truncation | ⬜ | To be executed |
| REC_015 | Scroll Persist | ⬜ | To be executed |
| REC_016 | Feed Integration | ⬜ | To be executed |
| REC_017 | Performance | ⬜ | To be executed |

---

## Notes for QA
- Use Network tab to intercept `/api/recipes/daily-picks`
- Test various response formats from different recipe sources
- Verify image URLs are properly resolved for CDN
- Check for console errors/warnings
- Test keyboard navigation (Tab through cards)
- Verify accessibility (ARIA labels, focus states)
- Test with different system themes (dark mode if supported)
- Monitor performance with Lighthouse
- Test with browser extensions disabled
- Verify no console warnings or performance issues
