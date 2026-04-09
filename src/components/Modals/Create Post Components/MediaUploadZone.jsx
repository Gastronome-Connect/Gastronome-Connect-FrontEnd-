import React from "react";
import { Video, Image as ImageIcon, FileImage } from "lucide-react";

/**
 * MediaUploadZone
 * Empty state upload area shown when no media has been added yet.
 * Props:
 *   onClick() - triggers the file picker
 */
const MediaUploadZone = ({ onClick }) => (
  <button
    onClick={onClick}
    className="w-full border-2 border-dashed border-gray-200 rounded-2xl hover:border-[#F57600]
               hover:bg-orange-50 transition-all p-7 flex flex-col items-center gap-3 text-gray-400 mb-4"
  >
    <div className="flex gap-3">
      <FileImage size={26} className="text-[#F57600]" />
      <Video     size={26} className="text-[#0060A9]" />
    </div>
    <span className="font-semibold text-sm">Click to add photos &amp; videos</span>
    <span className="text-xs text-gray-400">PNG, JPEG only · All video formats</span>
  </button>
);

export default MediaUploadZone;