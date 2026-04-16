import React from "react";
import { FaTimes } from "react-icons/fa";

const RecipeCard = ({ recipe, onRemove }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden relative z-10">
      <img
        src={recipe.image}
        alt={recipe.title}
        className="w-full h-20 sm:h-40 md:h-40 object-cover"
      />
      <div className="p-4">
        <h2 className="text-lg sm:text-xl font-semibold text-green-700">
          {recipe.title}
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Author: {recipe.author}
        </p>
        <p className="text-sm sm:text-base text-gray-600">
          Date Created: {recipe.dateCreated}
        </p>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          {recipe.description}
        </p>
      </div>
      <button
        onClick={() => onRemove(recipe)}
        className="absolute top-2 right-2 bg-green-600 text-white rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center hover:bg-gray-600"
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default RecipeCard;