import SkeletonLoader from "./SkeletonLoader";

/**
 * SkeletonProfilePanel
 * Mirrors ProfilePanel's exact layout:
 *   - Banner image
 *   - Avatar overlapping the banner
 *   - Edit button
 *   - Name, bio
 *   - Posts / Followers / Following stats
 */
const SkeletonProfilePanel = () => (
  <div
    className="bg-white rounded-3xl border border-gray-100 mb-5 overflow-hidden"
    style={{ boxShadow: "0 4px 24px 0 rgba(245, 118, 0, 0.10), 0 1.5px 6px 0 rgba(245, 118, 0, 0.07)" }}
  >
    {/* Banner */}
    <div className="h-32 sm:h-44 md:h-52 lg:h-64 w-full">
      <SkeletonLoader width="100%" height="100%" borderRadius="0" />
    </div>

    {/* Body */}
    <div className="relative px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 pt-2">

      {/* Avatar row */}
      <div className="relative -mt-12 sm:-mt-16 md:-mt-20 mb-4 sm:mb-6 flex flex-col items-center gap-3 sm:flex-row sm:items-end sm:justify-between">
        {/* Avatar circle */}
        <div className="p-1 sm:p-1.5 bg-white rounded-full shadow-2xl shadow-gray-300/60 self-center sm:self-auto">
          <SkeletonLoader
            width="96px"
            height="96px"
            variant="circle"
          />
        </div>

        {/* Edit button */}
        <SkeletonLoader width="120px" height="38px" borderRadius="9999px" />
      </div>

      {/* Name + bio + stats */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 sm:gap-6 mt-1 sm:mt-2">
        {/* Name & bio */}
        <div className="space-y-2 sm:space-y-3 text-center sm:text-left">
          <SkeletonLoader width="220px" height="36px" borderRadius="8px" />
          <SkeletonLoader width="280px" height="18px" borderRadius="6px" />
        </div>

        {/* Stats */}
        <div className="flex justify-center lg:justify-end gap-6 sm:gap-8 md:gap-10 lg:gap-12 border-t lg:border-t-0 pt-5 sm:pt-6 lg:pt-0 border-slate-100 shrink-0">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <SkeletonLoader width="40px" height="28px" borderRadius="6px" />
              <SkeletonLoader width="56px" height="12px" borderRadius="4px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default SkeletonProfilePanel;