import { useState, useRef, useEffect } from "react";
import { FaEllipsisH } from "react-icons/fa";
import Avatar from "./Avatar";
import FavoriteButton from "./FavoriteButton";
import PostMenu from "./PostMenu";

const PostHeader = ({ post, isOwner = false, onEdit, onDelete, onArchive, onReport, onVisitProfile }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuWrapRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuWrapRef.current && !menuWrapRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">

        {/* Clickable avatar */}
        <Avatar
          src={post.avatar}
          alt={post.author}
          size={10}
          onClick={onVisitProfile}
        />

        {/* Clickable name + date block */}
        <div>
          <p
            onClick={onVisitProfile}
            className="text-sm font-bold text-gray-900 leading-tight cursor-pointer hover:text-orange-500 transition-colors w-fit"
          >
            {post.author}
          </p>
          <p className="text-xs text-gray-400">{post.date}</p>
        </div>

      </div>

      <div className="flex items-center gap-1">
        <FavoriteButton />

        <div className="relative" ref={menuWrapRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className={`p-2 rounded-full transition-colors ${
              menuOpen ? "bg-orange-50 text-[#F57600]" : "hover:bg-gray-100 text-gray-400"
            }`}
            aria-label="Post options"
          >
            <FaEllipsisH size={15} />
          </button>

          {menuOpen && (
            <PostMenu
              isOwner={isOwner}
              onEdit={() => { setMenuOpen(false); onEdit?.(); }}
              onDelete={() => { setMenuOpen(false); onDelete?.(); }}
              onArchive={() => { setMenuOpen(false); onArchive?.(); }}
              onReport={() => { setMenuOpen(false); onReport?.(); }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PostHeader;