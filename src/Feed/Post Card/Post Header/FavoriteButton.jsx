import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useUserLibrary } from "../../../Context/UserLibraryContext";

const FavoriteButton = ({ post, onChange }) => {
  const { isFavorited, toggleFavorite } = useUserLibrary();

  // Pass full post so resolveId handles any ID shape
  const saved = post ? isFavorited(post) : false;

  const handleClick = (e) => {
    e.stopPropagation();
    if (post) toggleFavorite(post);
    onChange?.(!saved);
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full transition-colors ${
        saved
          ? "bg-red-50 text-red-500"
          : "text-gray-400 hover:text-red-500 hover:bg-red-50"
      }`}
      aria-label={saved ? "Unsave post" : "Save post"}
    >
      {saved ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
    </button>
  );
};

export default FavoriteButton;