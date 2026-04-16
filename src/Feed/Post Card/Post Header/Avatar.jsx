const PostAvatar = ({ src, alt = "User", size = 10, borderColor = "border-orange-400", onClick }) => (
  <div
    onClick={onClick}
    className={`w-${size} h-${size} rounded-full border-2 ${borderColor} overflow-hidden shrink-0 ${
      onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""
    }`}
  >
    <img
      src={src || "https://i.pravatar.cc/100"}
      alt={alt}
      className="w-full h-full object-cover"
    />
  </div>
);

export default PostAvatar;