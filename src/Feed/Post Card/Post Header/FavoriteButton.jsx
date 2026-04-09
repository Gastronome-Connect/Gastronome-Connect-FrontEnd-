import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const FavoriteButton = ({ initialSaved = false, onChange }) => {
  const [saved, setSaved] = useState(initialSaved);

  const handleClick = () => {
    const next = !saved;
    setSaved(next);
    onChange?.(next);
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full transition-colors ${
        saved ? "bg-red-50 text-red-500" : "text-gray-400 hover:text-red-500 hover:bg-red-50"
      }`}
      aria-label={saved ? "Unsave post" : "Save post"}
    >
      {saved ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
    </button>
  );
};

export default FavoriteButton;