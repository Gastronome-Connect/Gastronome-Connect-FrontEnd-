# Skeleton Components Quick Reference

## Import All Components

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
} from "../Skeletons";
```

---

## Component Reference & Props

### SkeletonLoader (Base Component)
```jsx
<SkeletonLoader 
  width="100%"           // CSS width value
  height="20px"          // CSS height value
  borderRadius="8px"     // CSS border-radius
  className=""           // Additional CSS classes
  variant="default"      // 'default' | 'circle' | 'rect'
/>
```

### Card Skeletons
```jsx
<SkeletonRecipeCard />          // No props needed
<SkeletonPostCard />            // No props needed
<SkeletonNotificationCard />    // No props needed
<SkeletonProfileCard variant="header" /> // or default
<SkeletonCommentSection count={3} />     // count = number of comments
```

### List & Grid Skeletons
```jsx
<SkeletonPostList count={3} />          // count = number of posts
<SkeletonRecommendation count={3} />    // count = number of items (default 3)
<SkeletonGridCards 
  columns={3}   // 1, 2, 3, or 4
  count={6}     // number of items
/>
```

### Feature Skeletons
```jsx
<SkeletonFeedHero />    // No props needed
<SkeletonSidebar itemCount={8} />
<SkeletonChatbot />     // No props needed
<SkeletonStats count={4} />
<SkeletonTable 
  rows={5}      // number of table rows
  columns={4}   // number of columns
/>
```

---

## Common Usage Patterns

### Pattern 1: Simple Loading State
```jsx
const [isLoading, setIsLoading] = useState(true);
const [data, setData] = useState(null);

useEffect(() => {
  fetchData().then(result => {
    setData(result);
    setIsLoading(false);
  });
}, []);

return isLoading ? <SkeletonPostCard /> : <PostCard post={data} />;
```

### Pattern 2: List Loading
```jsx
const [items, setItems] = useState([]);
const [isLoading, setIsLoading] = useState(true);

return (
  <div>
    {isLoading ? (
      <SkeletonPostList count={3} />
    ) : (
      items.map(item => <PostCard key={item.id} post={item} />)
    )}
  </div>
);
```

### Pattern 3: Grid Loading
```jsx
return (
  <div>
    {isLoading ? (
      <SkeletonGridCards columns={3} count={6} />
    ) : (
      <div className="grid grid-cols-3 gap-4">
        {recipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
      </div>
    )}
  </div>
);
```

### Pattern 4: Multiple Sections
```jsx
return (
  <div>
    {isLoadingHeader && <SkeletonProfileCard variant="header" />}
    {isLoadingContent && <SkeletonGridCards columns={2} count={4} />}
  </div>
);
```

---

## Customize Animations

### Speed up animation (edit SkeletonLoader.jsx):
```jsx
animation: "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite" // 1 second
```

### Slow down animation:
```jsx
animation: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite" // 3 seconds
```

### Change color opacity:
```jsx
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }  // More dramatic pulse
}
```

---

## Quick Tips

✅ **Do:**
- Match skeleton layout to actual component
- Use appropriate `count` for list skeletons
- Place in conditional render with loading state
- Import from barrel export `../Skeletons`

❌ **Don't:**
- Don't show skeletons forever (set proper loading state)
- Don't create overly complex custom skeletons (use SkeletonLoader instead)
- Don't forget to update skeleton when component changes
- Don't use for static content (only async data)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Animation not visible | Check CSS animations enabled in browser |
| Layout mismatch | Adjust width/height in skeleton component |
| Text too large/small | Update `height` and `fontSize` in skeleton |
| Colors off | Change `backgroundColor` in SkeletonLoader |
| Performance slow | Reduce `count` prop or number of skeletons shown |

---

## File Locations

```
src/components/Skeletons/
├── SkeletonLoader.jsx ..................... Base component (import for custom)
├── SkeletonRecipeCard.jsx ................ Recipe card skeleton
├── SkeletonPostCard.jsx .................. Social post skeleton
├── SkeletonNotificationCard.jsx ......... Notification item skeleton
├── SkeletonProfileCard.jsx .............. User profile skeleton
├── SkeletonCommentSection.jsx ........... Comment thread skeleton
├── SkeletonFeedHero.jsx ................. Banner/hero skeleton
├── SkeletonRecommendation.jsx ........... Recommendation grid skeleton
├── SkeletonPostList.jsx ................. Full post list skeleton
├── SkeletonSidebar.jsx .................. Navigation sidebar skeleton
├── SkeletonGridCards.jsx ................ Generic grid card skeleton
├── SkeletonChatbot.jsx .................. Chat widget skeleton
├── SkeletonTable.jsx .................... Data table skeleton
├── SkeletonStats.jsx .................... Dashboard stats skeleton
├── index.js ............................ Barrel export
├── IMPLEMENTATION_GUIDE.md ............. Full guide (detailed)
└── QUICK_REFERENCE.md ..................This file (quick lookup)
```

---

## Next Steps

1. Import skeletons into your components
2. Add loading state management
3. Wrap components with conditional rendering
4. Test with slow network (DevTools Network Throttling)
5. Customize colors/animations as needed

---

For detailed examples, see `IMPLEMENTATION_GUIDE.md`
