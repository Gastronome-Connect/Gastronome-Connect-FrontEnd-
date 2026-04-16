import { useRef, useEffect } from "react";
import { Play } from "lucide-react";

const AutoResizeTextarea = ({ value, onChange, placeholder, maxHeight = 90 }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [value, maxHeight]);

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full text-sm text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#F57600] transition-colors resize-none leading-relaxed"
      style={{ minHeight: "38px", maxHeight: `${maxHeight}px`, overflowY: "hidden" }}
    />
  );
};

const MediaCaptionEditor = ({ mediaItems, onCaptionsChange }) => {
  if (!mediaItems.length) return null;

  const update = (id, field, value) => {
    onCaptionsChange(mediaItems.map((m) =>
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  return (
    <div className="flex flex-col gap-5">
      {mediaItems.map((item, i) => (
        <div key={item.id} className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">

          {/* Media preview */}
          <div className="relative bg-black" style={{ height: "200px" }}>
            {item.type === "image" ? (
              <img src={item.url} alt="" className="w-full h-full object-contain" />
            ) : (
              <div className="relative w-full h-full">
                <video src={item.url} className="w-full h-full object-contain" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                    <Play size={18} className="text-white fill-white ml-0.5" />
                  </div>
                </div>
              </div>
            )}

            {/* Index badge */}
            <div className="absolute top-2.5 left-2.5 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {item.type === "image" ? "IMG" : "VID"} {i + 1}
            </div>

            {/* Filled indicator */}
            {(item.title || item.caption) && (
              <div className="absolute top-2.5 right-2.5 bg-[#F57600] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                ✓
              </div>
            )}
          </div>

          {/* Fields */}
          <div className="px-4 py-3 flex flex-col gap-2 bg-gray-50">

            {/* Title */}
            <div>
              <input
                type="text"
                value={item.title ?? ""}
                onChange={(e) => update(item.id, "title", e.target.value.slice(0, 60))}
                placeholder={`Title for ${item.type} ${i + 1}...`}
                className="w-full text-sm font-semibold text-gray-800 placeholder-gray-300 bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#F57600] transition-colors"
              />
              <div className="flex justify-end mt-0.5">
                <span className={`text-[10px] font-medium ${(item.title?.length ?? 0) >= 60 ? "text-red-400" : "text-gray-300"}`}>
                  {item.title?.length ?? 0}/60
                </span>
              </div>
            </div>

            {/* Caption */}
            <AutoResizeTextarea
              value={item.caption ?? ""}
              onChange={(e) => update(item.id, "caption", e.target.value)}
              placeholder={`Caption for ${item.type} ${i + 1}...`}
            />
          </div>

        </div>
      ))}
    </div>
  );
};

export default MediaCaptionEditor;