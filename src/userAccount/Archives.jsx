import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import NavigationBar from "../Landing/NavigationBar";
import { FaSearch } from "react-icons/fa";
import HAFPopup from "../components/Popups/HAFPopup";
import ChangePopup from "../components/Popups/SavePopup";
import logo from "../components/Assets/FoodAI.png";
import RecipeCard from "../recipe/RecipeArchive";
import Loading from "../components/Loading Pages/buffer";
import Error from "../components/Loading Pages/error";

const Archives = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showRemovePopup, setShowRemovePopup] = useState(false);
  const [removeRecipe, setRemoveRecipe] = useState(null);
  const [changePopup, setChangePopup] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    setLoading(true);
    let timeoutId;

    if (id) {
      // Set a timeout to trigger error if fetch takes too long
      timeoutId = setTimeout(() => {
        setFetchError(true);
        setLoading(false);
      }, 5000);

      fetch(`http://localhost:3000/api/recipes/${id}`)
        .then((res) => res.json())
        .then((data) => {
          clearTimeout(timeoutId); // Clear the timeout on successful fetch
          if (data.recipe) {
            setRecipe(data.recipe);
          } else {
            console.error("No recipe data found:", data);
            setFetchError(true);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch recipe:", err);
          setFetchError(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }

    fetch("http://localhost:3000/api/recipes/archives")
      .then((res) => res.json())
      .then((data) => {
        if (data.recipes) {
          setRecipes(data.recipes);
        } else {
          console.error("No archive recipes found:", data);
        }
      })
      .catch((err) => console.error("Failed to fetch archives:", err))
      .finally(() => {
        setLoading(false);
      });

    // Clean up function to clear the timeout if component unmounts
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [id]);

  const recipesPerPage = 6;
  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (recipe.author &&
        recipe.author.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipes = filteredRecipes.slice(
    indexOfFirstRecipe,
    indexOfLastRecipe,
  );
  const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);

  const handleRemoveRecipe = (recipe) => {
    setRemoveRecipe(recipe);
    setShowRemovePopup({
      message: `Are you sure you want to remove ${recipe.title}?`,
      onConfirm: () => {
        setRecipes((prevRecipes) =>
          prevRecipes.filter((r) => r._id !== recipe._id),
        );
        setShowRemovePopup(false);
        setChangePopup(true);

        fetch(`http://localhost:3000/api/recipes/${recipe._id}/archive`, {
          method: "DELETE",
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("Recipe removed from archives:", data);
          })
          .catch((err) =>
            console.error("Error removing recipe from archives:", err),
          );
      },
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="sticky top-0 bg-white z-40">
        <NavigationBar />
        <div className="p-4 sm:p-4 lg:p-6 bg-white">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-green-700">
            Archives
          </h1>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-grow w-full">
              <FaSearch className="absolute top-3 left-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search a recipe by name or author"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-green-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recipe Cards or Error */}
      <div className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8 bg-white">
        {loading ? (
          <Loading />
        ) : fetchError ? (
          <Error />
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentRecipes.map((recipe) => (
              <RecipeCard
                key={recipe._id || recipe.id}
                recipe={recipe}
                onRemove={() => handleRemoveRecipe(recipe)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <img
              src={logo}
              alt="Logo"
              className="w-32 sm:w-48 md:w-64 object-contain"
            />
            <p className="mt-4 text-lg text-green-600 font-semibold text-center">
              No Recipe Found in Archives
            </p>
          </div>
        )}
      </div>

      {/* Sticky Pagination */}
      {recipes.length > 0 && !loading && !fetchError && (
        <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg z-40 flex items-center justify-between px-4 py-2">
          <div className="text-sm md:text-base text-gray-600">
            Showing {indexOfFirstRecipe + 1} to{" "}
            {Math.min(indexOfLastRecipe, filteredRecipes.length)} of{" "}
            {filteredRecipes.length} entries
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`px-3 py-1 border border-gray-300 rounded-md ${
                    currentPage === pageNumber
                      ? "bg-green-500 text-white"
                      : "text-gray-600 hover:bg-white"
                  }`}
                >
                  {pageNumber}
                </button>
              ),
            )}
          </div>
        </div>
      )}

      {/* Popup */}
      {showRemovePopup && (
        <HAFPopup
          title="Archives"
          message={showRemovePopup.message}
          onConfirm={showRemovePopup.onConfirm}
          onCancel={() => setShowRemovePopup(false)}
          type="confirm"
        />
      )}

      {changePopup && <ChangePopup onContinue={() => setChangePopup(false)} />}
    </div>
  );
};

export default Archives;
