import React, { useState, useEffect } from "react";
import NavigationBar from "../components/NavigationBar";
import logo from "../components/Assets/FoodAI.png";
import { FaSearch } from "react-icons/fa";
import HAFPopup from "../components/Popups/HAFPopup";
import CAPopup from "../components/Popups/CAPopup";
import ChangePopup from "../components/Popups/SavePopup";
import RecipeCard from "../recipe/RecipeHistory";
import Loading from "../components/Loading Pages/buffer";

const History = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showClearPopup, setShowClearPopup] = useState(false);
  const [showRemovePopup, setShowRemovePopup] = useState(false);
  const [changePopup, setChangePopup] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [id, setId] = useState(null);

  const recipesPerPage = 6;

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:3000/api/recipes/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.recipe) {
            setRecipe(data.recipe);
          } else {
            console.error("No recipe data found:", data);
          }
        })
        .catch((err) => console.error("Failed to fetch recipe:", err));
    }

    fetch("http://localhost:3000/api/recipes/logs")
      .then((res) => res.json())
      .then((data) => {
        if (data.recipes) {
          setRecipes(data.recipes);
        } else {
          console.error("No archived recipes found:", data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch logs:", err);
        setLoading(false);
      });
  }, [id]);

  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (recipe.author && recipe.author.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipes = filteredRecipes.slice(indexOfFirstRecipe, indexOfLastRecipe);
  const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);

  const handleRemoveRecipe = (recipe) => {
    setShowRemovePopup({
      message: `Remove "${recipe.title}" from your history?`,
      onConfirm: () => {
        setRecipes((prevRecipes) => prevRecipes.filter((r) => r.id !== recipe.id));
        setShowRemovePopup(false);
        setChangePopup(true);
      },
    });
  };

  const handleClearAll = () => {
    setShowClearPopup({
      message: "This will permanently remove all recipes from your history. Are you sure?",
      onConfirm: () => {
        setRecipes([]);
        setShowClearPopup(false);
        setChangePopup(true);
      },
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="sticky top-0 bg-white z-40">
        <NavigationBar />
        <div className="p-4 sm:p-4 lg:p-6 bg-white">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-green-700">History</h1>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-grow w-full">
              <FaSearch className="absolute top-3 left-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or author"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-green-600"
              />
            </div>
            <button
              onClick={handleClearAll}
              disabled={recipes.length === 0}
              className="w-36 px-4 py-2 bg-[#3BA444] text-white rounded-md font-semibold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#3BA444]"
            >
              Clear History
            </button>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8 bg-white">
        {loading ? (
          <Loading />
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} onRemove={handleRemoveRecipe} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <img src={logo} alt="Logo" className="w-32 sm:w-48 md:w-64 object-contain" />
            <p className="mt-4 text-lg text-green-600 font-semibold text-center">
              No Recipe Found in History
            </p>
          </div>
        )}
      </div>

      {recipes.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg z-40 flex items-center justify-between px-4 py-2">
          <div className="text-sm md:text-base text-gray-600">
            Showing {indexOfFirstRecipe + 1} to {Math.min(indexOfLastRecipe, filteredRecipes.length)} of {filteredRecipes.length} entries
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                className={`px-3 py-1 border border-gray-300 rounded-md ${
                  currentPage === pageNumber ? "bg-green-500 text-white" : "text-gray-600 hover:bg-white"
                }`}
              >
                {pageNumber}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clear All Popup */}
      {showClearPopup && (
        <CAPopup
          message={showClearPopup.message}
          onConfirm={showClearPopup.onConfirm}
          onCancel={() => setShowClearPopup(false)}
        />
      )}

      {/* Remove Single Recipe Popup */}
      {showRemovePopup && (
        <HAFPopup
          message={showRemovePopup.message}
          onConfirm={showRemovePopup.onConfirm}
          onCancel={() => setShowRemovePopup(false)}
        />
      )}

      {changePopup && <ChangePopup onContinue={() => setChangePopup(false)} />}
    </div>
  );
};

export default History;