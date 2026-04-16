import SkeletonLoader from "./SkeletonLoader";

/**
 * SkeletonAllergensPanel
 * Mirrors AllergensPanel's layout:
 *   - Header with title + orange divider line
 *   - Two sections (Strict Allergens, Dietary Dislikes)
 *   - Each section has a label row + a row of pill skeletons
 */
const SkeletonAllergensPanel = () => (
  <div className="font-sans xl:h-full flex flex-col">

    {/* Header */}
    <div className="flex items-center gap-4 mb-3 flex-shrink-0">
      <SkeletonLoader width="190px" height="28px" borderRadius="6px" />
      <div className="flex-1 h-[3px] bg-gray-100 rounded-full mt-2" />
    </div>

    <div className="bg-white rounded-2xl border border-gray-100/50 xl:flex-1 xl:min-h-0 flex flex-col">
      <div className="xl:flex-1 xl:min-h-0 xl:overflow-y-auto p-5 sm:p-6 flex flex-col gap-6">

        {/* Strict Allergens section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-200 flex-shrink-0" />
            <SkeletonLoader width="120px" height="14px" borderRadius="4px" />
          </div>
          <div className="flex flex-wrap gap-2.5 pl-4">
            {["76px", "88px", "68px", "96px"].map((w, i) => (
              <SkeletonLoader key={i} width={w} height="30px" borderRadius="9999px" />
            ))}
          </div>
        </div>

        {/* Dietary Dislikes section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-200 flex-shrink-0" />
            <SkeletonLoader width="130px" height="14px" borderRadius="4px" />
          </div>
          <div className="flex flex-wrap gap-2.5 pl-4">
            {["64px", "80px", "72px", "90px", "76px"].map((w, i) => (
              <SkeletonLoader key={i} width={w} height="30px" borderRadius="9999px" />
            ))}
          </div>
        </div>

      </div>
    </div>
  </div>
);

export default SkeletonAllergensPanel;