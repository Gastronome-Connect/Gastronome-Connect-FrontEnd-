import { Play } from "lucide-react";

const MediaThumb = ({ item, index, className = "", onClick, overlayCnt }) => {
  const isVideo = item.type === "video";

  return (
    <div
      className={`relative bg-gray-100 cursor-pointer overflow-hidden ${className}`}
      onClick={() => onClick?.(index)}
    >
      {isVideo ? (
        <div className="relative w-full h-full bg-black">
          <video
            src={`${item.url}?t=${Date.now()}`} // cache-buster
            className="w-full h-full object-contain"
            controls
            preload="metadata"
            playsInline
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/50 flex items-center justify-center">
              <Play
                size={18}
                className="text-white fill-white ml-0.5 sm:hidden"
              />
              <Play
                size={22}
                className="text-white fill-white ml-0.5 hidden sm:block"
              />
            </div>
          </div>
        </div>
      ) : (
        <img
          src={`${item.url}?t=${Date.now()}`} // cache-buster
          alt=""
          className="w-full h-full object-contain hover:brightness-95 transition duration-200"
        />
      )}

      {overlayCnt > 0 && (
        <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
          <span className="text-white text-xl sm:text-2xl font-bold">
            +{overlayCnt}
          </span>
        </div>
      )}
    </div>
  );
};

// ── MediaGrid ────────────────────────────────────────────────────────────────
const MediaGrid = ({ mediaItems = [], onExpand }) => {
  if (mediaItems.length === 0) return null;

  const visible = mediaItems.slice(0, 3);
  const hiddenCount = mediaItems.length > 3 ? mediaItems.length - 3 : 0;

  // 1 item
  if (mediaItems.length === 1) {
    const item = mediaItems[0];
    return (
      <div
        className="w-full rounded-xl overflow-hidden cursor-pointer bg-gray-100"
        onClick={() => onExpand?.(0)}
      >
        <MediaThumb item={item} index={0} onClick={onExpand} />
      </div>
    );
  }

  // 2 items
  if (mediaItems.length === 2) {
    return (
      <div
        className="w-full grid grid-cols-2 gap-0.5 rounded-xl overflow-hidden"
        style={{ height: "min(420px, 55vw)" }}
      >
        {visible.map((item, i) => (
          <MediaThumb
            key={i}
            item={item}
            index={i}
            className="h-full"
            onClick={onExpand}
          />
        ))}
      </div>
    );
  }

  // 3+ items
  return (
    <div
      className="w-full grid grid-cols-2 gap-0.5 rounded-xl overflow-hidden"
      style={{ height: "min(520px, 65vw)" }}
    >
      <MediaThumb
        item={visible[0]}
        index={0}
        className="h-full row-span-2"
        onClick={onExpand}
      />
      <MediaThumb
        item={visible[1]}
        index={1}
        className="h-full"
        onClick={onExpand}
      />
      <MediaThumb
        item={visible[2]}
        index={2}
        className="h-full"
        onClick={onExpand}
        overlayCnt={hiddenCount}
      />
    </div>
  );
};

export default MediaGrid;