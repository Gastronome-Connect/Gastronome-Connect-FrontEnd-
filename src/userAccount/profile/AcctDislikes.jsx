import React, { useState, useRef } from "react";
import { FaChevronDown, FaChevronUp, FaTimes } from "react-icons/fa";
import AllergenIcon from "../../components/Assets/Allergen.png"; 
import DislikeIcon from "../../components/Assets/Dislike.png"; 
import ChangePopup from "../../components/Popups/SavePopup";

const Dropdown = ({ label, options, selected, setSelected, isOpen, setIsOpen, closeOthers, icon }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef(null);

  const sortedOptions = [...options].sort();
  const filteredOptions = sortedOptions.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelection = (value) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
    setSearchTerm("");
  };

  const removeSelection = (value, e) => {
    e.stopPropagation();
    setSelected((prev) => prev.filter((item) => item !== value));
  };

  return (
    <div className="relative w-full">
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <div
        className={`border rounded-lg px-3 py-2 bg-white flex items-center gap-2 min-h-[44px] relative ${
          isOpen ? "ring-2 ring-green-500 border-transparent" : "border-gray-300 hover:border-gray-400"
        } transition-all duration-200`}
        onClick={() => {
          closeOthers();
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        {icon && <img src={icon} alt={label} className="absolute left-3 h-5 w-5" />}

        <div className="flex-1 flex flex-wrap items-center gap-2 min-h-[36px] max-h-14 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 pl-8">
          {selected.map((item) => (
            <div key={item} className="flex items-center bg-green-100 text-black px-2 py-1 rounded-full text-sm">
              <span>{item}</span>
              <button onClick={(e) => removeSelection(item, e)} className="ml-2 text-red-600 hover:text-red-800">
                <FaTimes className="h-3 w-3" />
              </button>
            </div>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={selected.length === 0 ? `Search ${label}` : ""}
            className="outline-none bg-transparent placeholder-gray-400 flex-shrink-0 min-w-[100px] w-auto"
          />
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="text-gray-500 hover:text-gray-700 flex-shrink-0"
        >
          {isOpen ? <FaChevronUp className="h-4 w-4" /> : <FaChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-auto max-h-40">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option}
                onClick={() => toggleSelection(option)}
                className={`px-4 py-2 cursor-pointer transition-colors ${
                  selected.includes(option) ? "bg-green-50 text-green-700 hover:bg-green-100" : "hover:bg-gray-50"
                }`}
              >
                {option}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">No options found</div>
          )}
        </div>
      )}
    </div>
  );
};

const Preferences2 = () => {
  const [allergens, setAllergens] = useState(["Gluten"]); 
  const [dislikes, setDislikes] = useState(["Broccoli"]); 
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showPopup, setShowPopup] = useState(false); 

  const options = {
    allergens: ["Gluten", "Peanuts", "Tree Nuts", "Dairy", "Eggs", "Soy", "Fish", "Shellfish", "Sesame", "Wheat"],
    dislikes: ["Broccoli", "Cilantro", "Mushrooms", "Eggplant", "Onions", "Bell Peppers", "Brussels Sprouts", "Okra", "Spinach", "Avocado"],
  };

  const handleSave = () => {
    localStorage.setItem("allergens", JSON.stringify(allergens));
    localStorage.setItem("dislikes", JSON.stringify(dislikes));
    setShowPopup(true); 
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-center">
        <div className="max-w-lg w-full flex items-center justify-center">
          <div className="p-10 rounded-lg w-full max-w-md">
            <div>
            </div>

            <div className="space-y-4">
              <Dropdown
                label="Allergens"
                options={options.allergens}
                selected={allergens}
                setSelected={setAllergens}
                isOpen={openDropdown === "allergens"}
                setIsOpen={(state) => setOpenDropdown(state ? "allergens" : null)}
                closeOthers={() => setOpenDropdown("allergens")}
                icon={AllergenIcon}
              />
              <Dropdown
                label="Dislikes"
                options={options.dislikes}
                selected={dislikes}
                setSelected={setDislikes}
                isOpen={openDropdown === "dislikes"}
                setIsOpen={(state) => setOpenDropdown(state ? "dislikes" : null)}
                closeOthers={() => setOpenDropdown("dislikes")}
                icon={DislikeIcon} 
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="text-white w-full mt-7 px-4 py-3 text-md font-medium rounded-md bg-[#3BA444] hover:bg-green-700"
            >
              Save
            </button>

            {showPopup && <ChangePopup onContinue={closePopup} />} {/* Show popup if showPopup is true */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preferences2;
