import SkeletonLoader from "./SkeletonLoader";

/**
 * SkeletonRecipeCard
 * Mirrors RecipeCard's exact layout:
 *   - Image block with action button
 *   - "Recipe" badge
 *   - Title, description lines
 *   - Divider
 *   - Author, date rows + chevron
 */
const SkeletonRecipeCard = () => (
  <div
    className="relative bg-white rounded-2xl lg:rounded-3xl overflow-hidden border border-gray-100/50 w-full"
    style={{ boxShadow: "0 10px 30px -15px rgba(0, 96, 169, 0.2)" }}
  >
    {/* Image */}
    <div className="relative h-28 lg:h-24 xl:h-36 2xl:h-44">
      <SkeletonLoader width="100%" height="100%" borderRadius="0" />
      {/* Action button placeholder */}
      <div className="absolute top-3 right-3">
        <SkeletonLoader width="28px" height="28px" variant="circle" />
      </div>
    </div>

    {/* Content */}
    <div className="p-2.5 xl:p-5 relative">
      {/* Badge */}
      <div className="absolute -top-2.5 left-3 xl:left-5">
        <SkeletonLoader width="52px" height="18px" borderRadius="9999px" />
      </div>

      {/* Title */}
      <SkeletonLoader width="75%" height="14px" borderRadius="4px" className="mb-1 xl:mb-2 mt-1" />

      {/* Description */}
      <div className="flex flex-col gap-1 mb-2 xl:mb-4">
        <SkeletonLoader width="100%" height="10px" borderRadius="3px" />
        <SkeletonLoader width="80%"  height="10px" borderRadius="3px" />
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-gray-100 mb-2 xl:mb-4" />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 xl:gap-2">
            <SkeletonLoader width="16px" height="16px" borderRadius="4px" />
            <SkeletonLoader width="60px" height="10px" borderRadius="3px" />
          </div>
          <div className="flex items-center gap-1 xl:gap-2">
            <SkeletonLoader width="16px" height="16px" borderRadius="4px" />
            <SkeletonLoader width="48px" height="9px"  borderRadius="3px" />
          </div>
        </div>
        <SkeletonLoader width="24px" height="24px" variant="circle" />
      </div>
    </div>
  </div>
);

/**
 * SkeletonRecipeGrid
 * Renders a grid of SkeletonRecipeCard matching the
 * grid used in Favorites / Archives / History pages:
 *   grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
 */
const SkeletonRecipeGrid = ({ count = 10 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonRecipeCard key={i} />
    ))}
  </div>
);

export { SkeletonRecipeCard, SkeletonRecipeGrid };
export default SkeletonRecipeGrid;