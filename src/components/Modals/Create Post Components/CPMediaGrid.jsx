import React from "react";
import { X, Play, Plus, Pencil } from "lucide-react";

/**
 * MediaGrid
 * Renders the thumbnail grid of uploaded media items.
 * Props:
 *   mediaItems   - array of media objects
 *   onRemove(id) - called when X is clicked on a thumb
 *   onAddMore()  - called when "Add More" tile is clicked
 */
const MediaGrid = ({ mediaItems = [], onRemove, onAddMore }) => {
  return (
    <div className="grid grid-cols-3 gap-2 mb-3">
      {mediaItems.map((item) => (
        <div
          key={item.id}
          className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-gray-50"
        >
          {/* Remove button */}
          <button
            onClick={() => onRemove(item.id)}
            className="absolute top-1.5 right-1.5 z-20 p-1 bg-black/50 hover:bg-red-500 text-white
                       rounded-full transition-all opacity-0 group-hover:opacity-100"
          >
            <X size={12} />
          </button>

          {/* "edited" badge */}
          {(item.title || item.caption) && (
            <div className="absolute top-1.5 left-1.5 z-10 bg-[#F57600] text-white text-[9px] font-bold
                            px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <Pencil size={7} /> edited
            </div>
          )}

          {/* Type badge */}
          <div className="absolute bottom-1.5 right-1.5 z-10">
            {item.type === "video"
              ? <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Play size={8} className="fill-white" /> VID
                </span>
              : <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">IMG</span>
            }
          </div>

          {/* Preview */}
          {item.type === "image"
            ? <img src={item.url} alt="Preview" className="w-full h-full object-cover" />
            : <div className="relative w-full h-full bg-gray-900">
                <video src={item.url} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play size={24} className="text-white fill-white opacity-90" />
                </div>
              </div>
          }
        </div>
      ))}

      {/* Add More tile */}
      <button
        onClick={onAddMore}
        className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200
                   rounded-2xl hover:bg-gray-50 hover:border-[#F57600] transition-all aspect-square text-gray-400 gap-1"
      >
        <Plus size={22} />
        <span className="text-xs font-semibold">Add More</span>
      </button>
    </div>
  );
};

export default MediaGrid;