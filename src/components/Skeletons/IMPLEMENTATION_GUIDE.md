# Skeleton Loading Components Implementation Guide

## Overview
This guide explains how to use the skeleton loading components created in `src/components/Skeletons/` for better UX while your app loads data.

---

## Available Skeleton Components

### Base Component
- **SkeletonLoader** - Core reusable skeleton with pulse animation

### Card & Content Skeletons
- **SkeletonRecipeCard** - For recipe/food item cards
- **SkeletonPostCard** - For social feed posts
- **SkeletonNotificationCard** - For notification items
- **SkeletonProfileCard** - For user profile sections
- **SkeletonCommentSection** - For comment threads

### Feed & List Skeletons
- **SkeletonFeedHero** - For hero/banner sections
- **SkeletonRecommendation** - For recommendation grids
- **SkeletonPostList** - For full post list with multiple items

### Layout & Feature Skeletons
- **SkeletonSidebar** - For sidebar navigation
- **SkeletonGridCards** - Generic grid card layout (columns: 1-4)
- **SkeletonChatbot** - For chat widget
- **SkeletonTable** - For table/list data
- **SkeletonStats** - For dashboard statistics

---

## Implementation Examples

### 1. Using SkeletonRecipeCard in RecipeCard Component

```jsx
import { useState, useEffect } from "react";
import { SkeletonRecipeCard } from "../Skeletons";
import RecipeCard from "./RecipeCard";

const RecipeCardWrapper = ({ recipe, ...props }) => {
  const [isLoading, setIsLoading] = useState(!recipe);

  useEffect(() => {
    // Simulate loading
    if (recipe) {
      setIsLoading(false);
    }
  }, [recipe]);

  if (isLoading) {
    return <SkeletonRecipeCard />;
  }

  return <RecipeCard recipe={recipe} {...props} />;
};

export default RecipeCardWrapper;
```

### 2. Using SkeletonPostList in Feed Component

```jsx
import { useState, useEffect } from "react";
import { SkeletonPostList } from "../Skeletons";
import PostCard from "./PostCard";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/posts");
        const data = await response.json();
        setPosts(data);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (isLoading) {
    return <SkeletonPostList count={3} />;
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default Feed;
```

### 3. Using SkeletonGridCards for Recipe Grid

```jsx
import { useState, useEffect } from "react";
import { SkeletonGridCards } from "../Skeletons";
import RecipeCard from "./RecipeCard";

const RecipeGrid = () => {
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecipes = async () => {
      setIsLoading(true);
      const data = await fetchRecipes();
      setRecipes(data);
      setIsLoading(false);
    };

    loadRecipes();
  }, []);

  return (
    <div>
      {isLoading ? (
        <SkeletonGridCards columns={3} count={6} />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeGrid;
```

### 4. Using SkeletonProfileCard in Profile Page

```jsx
import { useState, useEffect } from "react";
import { SkeletonProfileCard } from "../Skeletons";
import ProfileCard from "./ProfileCard";

const ProfilePage = ({ userId }) => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      const data = await fetchProfile(userId);
      setProfile(data);
      setIsLoading(false);
    };

    loadProfile();
  }, [userId]);

  return (
    <div>
      {isLoading ? (
        <>
          <SkeletonProfileCard variant="header" />
          <SkeletonProfileCard />
          <SkeletonProfileCard />
        </>
      ) : (
        <ProfileContent profile={profile} />
      )}
    </div>
  );
};

export default ProfilePage;
```

### 5. Using SkeletonTable for Admin Dashboard

```jsx
import { useState, useEffect } from "react";
import { SkeletonTable } from "../Skeletons";
import DataTable from "./DataTable";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  return (
    <div>
      {isLoading ? (
        <SkeletonTable rows={5} columns={4} />
      ) : (
        <DataTable data={users} />
      )}
    </div>
  );
};

export default AdminPanel;
```

### 6. Using Custom SkeletonLoader

```jsx
import { SkeletonLoader } from "../Skeletons";

const CustomLoadingComponent = () => (
  <div className="p-4 space-y-4">
    <SkeletonLoader width="200px" height="24px" borderRadius="6px" />
    <SkeletonLoader width="100%" height="150px" borderRadius="12px" />
    <SkeletonLoader width="80%" height="20px" borderRadius="4px" />
  </div>
);

export default CustomLoadingComponent;
```

---

## Hook Pattern - useAsync with Skeleton Loading

Create a custom hook for better reusability:

```jsx
// hooks/useAsync.js
import { useState, useEffect } from "react";

export const useAsync = (asyncFunction, immediate = true) => {
  const [status, setStatus] = useState("idle");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setStatus("pending");
    setData(null);
    setError(null);

    try {
      const response = await asyncFunction();
      setData(response);
      setStatus("success");
    } catch (error) {
      setError(error);
      setStatus("error");
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, data, error };
};
```

Usage:

```jsx
const MyComponent = () => {
  const { status, data } = useAsync(fetchData);

  const isLoading = status === "pending";

  return (
    <div>
      {isLoading ? (
        <SkeletonPostList count={3} />
      ) : (
        data.map((item) => <PostCard key={item.id} post={item} />)
      )}
    </div>
  );
};
```

---

## Customizing Skeleton Components

### Adjust Animation Speed

Edit `SkeletonLoader.jsx`:

```jsx
animation: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite" // Faster
animation: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite"  // Slower
```

### Change Skeleton Colors

```jsx
// In SkeletonLoader.jsx
const variantStyles = {
  default: { backgroundColor: "#f3f4f6" }, // lighter gray
  // or
  default: { backgroundColor: "#0ea5e9" }, // blue tint
};
```

### Create Custom Skeleton

```jsx
import SkeletonLoader from "./SkeletonLoader";

const SkeletonBlogCard = () => (
  <div className="bg-white rounded-lg p-4 space-y-3">
    <SkeletonLoader width="100%" height="250px" borderRadius="8px" />
    <SkeletonLoader width="80%" height="20px" borderRadius="4px" />
    <SkeletonLoader width="100%" height="60px" borderRadius="4px" />
    <SkeletonLoader width="150px" height="16px" borderRadius="4px" />
  </div>
);

export default SkeletonBlogCard;
```

---

## Best Practices

1. **Match Layouts** - Keep skeleton layout matching the actual component
2. **Correct Count** - Use appropriate `count` props for list skeletons
3. **Responsive** - Skeletons scale with Tailwind breakpoints
4. **Animation** - Pulse effect provides visual feedback of loading
5. **Reusable** - Use `SkeletonLoader` base component for custom needs
6. **Performance** - Skeletons are lightweight, minimal re-renders

---

## Files Created

```
src/components/Skeletons/
├── SkeletonLoader.jsx              (Base component)
├── SkeletonRecipeCard.jsx
├── SkeletonPostCard.jsx
├── SkeletonNotificationCard.jsx
├── SkeletonProfileCard.jsx
├── SkeletonCommentSection.jsx
├── SkeletonFeedHero.jsx
├── SkeletonRecommendation.jsx
├── SkeletonPostList.jsx
├── SkeletonSidebar.jsx
├── SkeletonGridCards.jsx
├── SkeletonChatbot.jsx
├── SkeletonTable.jsx
├── SkeletonStats.jsx
├── index.js                        (Barrel export)
└── IMPLEMENTATION_GUIDE.md        (This file)
```

---

## Quick Import Reference

```jsx
import {
  SkeletonLoader,
  SkeletonRecipeCard,
  SkeletonPostCard,
  SkeletonNotificationCard,
  SkeletonProfileCard,
  SkeletonCommentSection,
  SkeletonFeedHero,
  SkeletonRecommendation,
  SkeletonPostList,
  SkeletonSidebar,
  SkeletonGridCards,
  SkeletonChatbot,
  SkeletonTable,
  SkeletonStats,
} from "../Skeletons/index";
```

---

## Troubleshooting

**Skeleton not showing animation?**
- Check browser DevTools → ensure CSS animations are enabled
- Verify `animation` property in `SkeletonLoader.jsx`

**Skeleton layout doesn't match component?**
- Adjust padding, spacing, and dimensions in the skeleton file
- Compare visually with actual component

**Performance issues?**
- Reduce number of skeleton items with `count` prop
- Use `SkeletonLoader` directly for simple cases

---

For questions or improvements, refer to the individual skeleton component files.
