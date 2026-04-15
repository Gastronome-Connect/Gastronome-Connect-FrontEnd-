import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavigationBar from "../Landing/NavigationBar";
import RecipeBook from "../components/Assets/RecipeBook.png";
import AuthorsIcon from "../components/Assets/UserIcon.png";
import Fork from "../components/Assets/Fork.png";
import Knife from "../components/Assets/Knife.png";
import Forward from "../components/Assets/Forward.png";
import PauseOrPlay from "../components/Assets/PauseOrPlay.png";
import Backward from "../components/Assets/Backward.png";
import RecipePopup from "../components/Popups/RecipePopup";
import Buffer from "../components/Loading Pages/buffer";
import { recipeAPI, logAPI } from "../utils/apiService";

function ViewRecipe() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [showCompleteButton, setShowCompleteButton] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [logId, setLogId] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const data = await recipeAPI.getRecipe(id);
        if (data.recipe) {
          setRecipe(data.recipe);
        } else {
          console.error("No recipe data found:", data);
        }
      } catch (err) {
        console.error("Failed to fetch recipe:", err);
      }
    };
    fetchRecipe();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      const scrolledToBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 10;
      setShowCompleteButton(scrolledToBottom);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleRecipeComplete = async () => {
    try {
      // ShorecipeData = await recipeAPI.saveRecipe({
        spoonacularId: recipe.id,
        title: recipe.title,
      });

      const recipeId = recipeData?.newRecipe?.id || recipeData?.existingRecipe?.id || 
                       recipeData?.newRecipe?._id || recipeData?.existingRecipe?._id;
      
      if (!recipeId) {
        console.error("No recipe ID found in response:", recipeData);
        return;
      }

      const logData = await logAPI.createLog({
        recipeId: recipeId,
        recipeName: recipe.title,
      });
      
      const logIdValue = logData?.log?.id || logData?.log?._id;
      
      if (logIdValue) {
        setLogId(logIdValue);
      } else {
        console.error("No log ID found in response:", logData);
      }
    } catch (err) {
      console.error("Error saving recipe or logging:", err);
    } catch (err) {
      console.error("Error saving recipe or logging:", err);
      // Keep modal visible even if there's an error
    }
  };

  const updateLog = async (field) => {
    if (!logId) {
      console.warn("No log ID available for update");
      navigate("../Home");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const updateRes = await fetch(buildApiUrl(`/api/logs/${logId}`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [field]: true }),
      });
      
      if (!updateRes.ok) {
        console.error("Log update failed with status:", updateRes.status);
      }
    } catch (err) {
      console.error("Failed to update log:", err);
    }
  };

  const steps = recipe?.analyzedInstructions[0]?.steps || [];

  const speakAllStepsFrom = (index) => {
    if (index >= steps.length) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(steps[index].step);
    utterance.lang = "en-US";

    utterance.onend = () => {
      if (speechSynthesis.paused || !isSpeaking) return;
      const nextIndex = index + 1;
      setCurrentStepIndex(nextIndex);
      await logAPI.updateLog(logId, { [field]: true });peechSynthesis.resume();
      setIsSpeaking(true);
    } else {
      speechSynthesis.cancel();
      speakAllStepsFrom(currentStepIndex);
    }
  };

  const handleNextStep = () => {
    speechSynthesis.cancel();
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      speakAllStepsFrom(nextIndex);
    }
  };

  const handlePreviousStep = () => {
    speechSynthesis.cancel();
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      speakAllStepsFrom(prevIndex);
    }
  };

  if (!recipe) {
    return <Buffer />;
  }

  return (
    <div className="relative min-h-screen bg-white pb-32">
      <NavigationBar />
      <div className="max-w-4xl mx-auto bg-white mt-2">
        <div className="relative">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-96 object-cover rounded-md"
          />
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between mb-6 text-black">
            <div className="flex items-center space-x-2">
              <img src={RecipeBook} alt="Recipe Icon" className="w-5 h-5" />
              <h1 className="text-sm text-black">Recipe for {recipe.title}</h1>
            </div>

            <div className="flex items-center space-x-2">
              <img src={AuthorsIcon} alt="Author Icon" className="w-5 h-5" />
              <p className="text-sm text-black">Author: {recipe.creditsText}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src={Fork} alt="Fork Icon" className="w-6 h-6" />
              <h2 className="text-mb font-semibold text-black">
                Get ready and prepare all Ingredients.
              </h2>
            </div>

            <ul className="list-disc list-inside ml-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-black">
              {recipe.extendedIngredients.map((ingredient, index) => (
                <li key={index}>{ingredient.original}</li>
              ))}
            </ul>

            <div className="flex items-center space-x-2 mt-6 mb-4">
              <img src={Knife} alt="Knife Icon" className="w-4 h-6" />
              <h2 className="text-mb font-semibold text-black ml-6">
                Follow the instructions:
              </h2>
            </div>

            <ul className="list-disc list-inside space-y-2 text-sm text-black ml-12">
              {steps.map((step) => (
                <li key={step.number}>{step.step}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* TTS Controls */}
      <div className="fixed bottom-0 left-0 w-full bg-white pb-4">
        <div className="flex flex-col items-center space-y-4 p-4">
          <button
            onClick={() => navigate("/Home")}
            className="text-xs sm:text-sm text-green-600 font-large font-semibold hover:underline"
          >
            Back
          </button>
          <div className="flex space-x-6">
            <button
              className="w-7 h-7 bg-[#3BA444] rounded-md flex items-center justify-center"
              onClick={handlePreviousStep}
            >
              <img src={Backward} alt="Backward Icon" className="w-3 h-3" />
            </button>
            <button
              className="w-7 h-7 bg-[#3BA444] rounded-md flex items-center justify-center"
              onClick={handlePlayPause}
            >
              <img
                src={PauseOrPlay}
                alt="Pause or Play Icon"
                className="w-3 h-3"
              />
            </button>
            <button
              className="w-7 h-7 bg-[#3BA444] rounded-md flex items-center justify-center"
              onClick={handleNextStep}
            >
              <img src={Forward} alt="Forward Icon" className="w-3 h-3" />
            </button>
          </div>
        </div>

        {showCompleteButton && (
          <div className="flex justify-center">
            <button
              className="bg-[#3BA444] text-white font-semibold py-2 px-4 rounded shadow"
              onClick={handleRecipeComplete}
            >
              Recipe Complete
            </button>
          </div>
        )}
      </div>

      {/* The Modal */}
      {isModalVisible && (
        <RecipePopup
          onArchive={() => {
            updateLog("archived");
            navigate("/Home");
          }}
          onFavorite={() => {
            updateLog("favorite");
            navigate("/Home");
          }}
          onSkip={() => navigate("/Home")}
        />
      )}
    </div>
  );
}

export default ViewRecipe;