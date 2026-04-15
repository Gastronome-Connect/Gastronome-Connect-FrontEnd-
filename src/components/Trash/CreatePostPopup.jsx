import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Video, Image as ImageIcon, Plus, Play, FileImage } from "lucide-react";
import { buildApiUrl } from "../../utils/api";

export default function CreatePostModal({ isOpen, onClose, onPost }) {
  const [title, setTitle] = useState("");
  const [postText, setPostText] = useState("");
  const [mediaItems, setMediaItems] = useState([]);
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isPostEmpty = postText.trim().length === 0 && mediaItems.length === 0;

  const handlePost = async () => {
    if (isPostEmpty) return;

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("caption", postText);
      formData.append("userId", "69a7a701766988541402e744");

      mediaItems.forEach((item) => {
        formData.append("media", item.file);
      });

      const res = await fetch(buildApiUrl("/api/posts"), {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to create post");

      const savedPost = await res.json();

      onPost(savedPost);

      setPostText("");
      setMediaItems([]);
      onClose();
    } catch (err) {
      console.error("Post failed:", err);
      alert("Failed to post. Try again.");
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newItems = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video") ? "video" : "image",
    }));
    setMediaItems((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeMedia = (id) => {
    setMediaItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter((i) => i.id !== id);
    });
  };

  const triggerFilePicker = () => fileInputRef.current?.click();

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-5 border-b-2 border-[#F57600] flex justify-center items-center shrink-0">
          <h2 className="text-xl font-bold text-gray-800">Create Post</h2>
          <button onClick={onClose} className="absolute right-5 p-1 rounded-full bg-orange-50 text-[#F57600] hover:bg-orange-100 transition-colors">
            <X size={22} strokeWidth={3} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src="https://i.pravatar.cc/100"
              alt="User"
              className="w-10 h-10 rounded-full border border-gray-100 object-cover"
            />
            <span className="font-bold text-gray-800">
              {localStorage.getItem("email")}
            </span>
          </div>

          {/* Optional Title */}
<input
  type="text"
  value={title}
  onChange={(e) => setTitle(e.target.value.slice(0, 60))}
  placeholder="Title (optional)"
  className="w-full text-base font-semibold text-gray-800 placeholder-gray-300 border-none focus:ring-0 outline-none mb-1"
/>
{/* Character counter */}
<div className="text-right text-xs text-gray-400 mb-1">
  {title.length}/60
</div>
          <div className="border-b border-gray-100 mb-3" />

          {/* Caption */}
          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder="What's your recipe? Mix photos and videos!"
            className="w-full min-h-[90px] text-sm text-gray-700 placeholder-gray-400 border-none focus:ring-0 resize-none outline-none mb-4"
          />

          {/* Upload prompt when empty */}
          {mediaItems.length === 0 && (
            <button
              onClick={triggerFilePicker}
              className="w-full border-2 border-dashed border-gray-200 rounded-2xl hover:border-[#F57600] hover:bg-orange-50 transition-all p-7 flex flex-col items-center gap-3 text-gray-400 mb-4"
            >
              <div className="flex gap-3">
                <FileImage size={26} className="text-[#F57600]" />
                <Video size={26} className="text-[#0060A9]" />
              </div>
              <span className="font-semibold text-sm">Click to add photos &amp; videos</span>
              <span className="text-xs text-gray-400">You can select multiple files at once</span>
            </button>
          )}

          {/* Media Grid */}
          {mediaItems.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {mediaItems.map((item) => (
                <div key={item.id} className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                  <button
                    onClick={() => removeMedia(item.id)}
                    className="absolute top-1.5 right-1.5 z-20 p-1 bg-black/50 hover:bg-red-500 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                  <div className="absolute bottom-1.5 left-1.5 z-10">
                    {item.type === "video" ? (
                      <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Play size={8} className="fill-white" /> VID
                      </span>
                    ) : (
                      <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">IMG</span>
                    )}
                  </div>
                  {item.type === "image" ? (
                    <img
                      src={item.url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <Play
                          size={24}
                          className="text-white fill-white opacity-80"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={triggerFilePicker}
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-[#F57600] transition-all aspect-square text-gray-400 gap-1"
              >
                <Plus size={22} />
                <span className="text-xs font-semibold">Add More</span>
              </button>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
          />
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-white shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-200 w-full sm:w-auto">
              {mediaItems.length === 0 ? (
                <>
                  <span className="text-sm font-bold text-gray-600">Add media</span>
                  <div className="flex gap-3">
                    <button onClick={triggerFilePicker} className="text-[#0060A9] hover:scale-110 transition-transform"><Video size={22} /></button>
                    <button onClick={triggerFilePicker} className="text-[#F57600] hover:scale-110 transition-transform"><ImageIcon size={22} /></button>
                  </div>
                </>
              ) : (
                <span className="text-sm font-bold text-gray-600">
                  {mediaItems.filter(i => i.type === "image").length} photo{mediaItems.filter(i => i.type === "image").length !== 1 ? "s" : ""},&nbsp;
                  {mediaItems.filter(i => i.type === "video").length} video{mediaItems.filter(i => i.type === "video").length !== 1 ? "s" : ""} added
                </span>
              )}
            </div>

            <button
              onClick={handlePost}
              disabled={isPostEmpty}
              className={`w-full sm:flex-1 font-bold py-3.5 rounded-2xl shadow-lg transition-all active:scale-95
                ${
                  isPostEmpty
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-[#F57600] to-[#F0AE35] text-white hover:opacity-90"
                }`}
            >
              Post Recipe
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
