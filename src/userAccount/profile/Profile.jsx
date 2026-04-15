import React, { useState, useEffect, useRef } from "react";

// Icons
import { FaUser } from "react-icons/fa";
import { HiChevronDown, HiChevronLeft, HiChevronRight } from "react-icons/hi"; 

// Components
import Sidebar from "../../Feed/SideBar";
import PostCard from "../../Feed/Post Card/PostCard";
import Chatbot from "../../components/Feed Components/ChatbotWidget";
import ProfilePanel from "../../components/Pages/Panels/ProfilePanel";
import Account from "../Account";

/* NOTE: If these are already in GComponents, 
  remove these local definitions and use the imports instead.
*/

const PreferencesPanel = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-2">
        <h3 className="text-xl font-bold text-gray-900">Preferences</h3>
        <div className="flex-1 h-[2px] bg-orange-400 mt-1"></div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100">
        <div className="mb-4">
          <p className="font-bold text-gray-800 mb-3">Flavor:</p>
          <div className="flex flex-wrap gap-2">
            {["Spicy", "Sweet", "Sour", "Bitter"].map((item) => (
              <span 
                key={item} 
                className="px-5 py-1.5 bg-[#FFF2E7] text-gray-800 rounded-full text-sm font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-2">
          <p className="font-bold text-gray-800 mb-3">Cooking Style:</p>
          <div className="flex flex-wrap gap-2">
            {["Frying", "Steam", "Braising"].map((item) => (
              <span 
                key={item} 
                className="px-5 py-1.5 bg-[#FFF2E7] text-gray-800 rounded-full text-sm font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <button className="w-full text-[#1D63FF] font-bold text-sm hover:underline underline-offset-4">
          Edit Preferences
        </button>
      </div>
    </div>
  );
};

const AllergensPanel = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-2">
        <h3 className="text-xl font-bold text-gray-900">Allergens & Dislikes</h3>
        <div className="flex-1 h-[2px] bg-orange-400 mt-1"></div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100">
        <div className="mb-4">
          <p className="font-bold text-gray-800 mb-2 text-sm">Allergens:</p>
          <div className="flex flex-wrap gap-2">
            {["Peanut", "Citrus", "Seafoods"].map((item) => (
              <span key={item} className="px-4 py-1.5 bg-[#FFF2E7] text-gray-800 rounded-full text-xs font-medium">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <p className="font-bold text-gray-800 mb-2 text-sm">Dislikes:</p>
          <div className="flex flex-wrap gap-2">
            {["Beef", "Pork", "Braising"].map((item) => (
              <span key={item} className="px-4 py-1.5 bg-[#FFF2E7] text-gray-800 rounded-full text-xs font-medium">
                {item}
              </span>
            ))}
          </div>
        </div>

        <button className="w-full text-[#1D63FF] font-bold text-sm hover:underline underline-offset-4">
          Edit Allergens & Dislikes
        </button>
      </div>
    </div>
  );
};

// Main Component
const GCProfile = () => {
  const [name] = useState("Your Name");
  const [bio] = useState("I love Gastronome Connect, Mah G!");
  const [showEditProfile, setShowEditProfile] = useState(false);
  
  const [posts] = useState([
    {
      id: 1,
      author: "Jomarrie",
      date: "01/10/01",
      image: "https://via.placeholder.com/600x400?text=French+Pastries",
      caption: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
      likes: 67,
      comments: 67,
    },
    {
      id: 2,
      author: "Jomarrie",
      date: "01/12/01",
      image: "https://via.placeholder.com/600x400?text=Beef+Steak",
      caption: "Tried out a new searing technique today!",
      likes: 45,
      comments: 12,
    }
  ]);

  return (
    <div className="flex h-screen w-full bg-[#FDFCF9] overflow-y-auto overflow-x-hidden">
      
      {/* Left Navigation Sidebar */}
      <aside className="h-full flex-shrink-0 sticky top-0">
        <Sidebar />
      </aside>

      {/* Main Feed Section */}
      <main className="flex-1 px-8 py-6">
        <div className="max-w-4xl mx-auto">
          
          <ProfilePanel 
            name={name} 
            bio={bio} 
            onEditClick={() => setShowEditProfile(!showEditProfile)} 
          />

          {showEditProfile && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-orange-100">
              <Account />
              <button 
                onClick={() => setShowEditProfile(false)} 
                className="mt-4 text-orange-500 font-bold text-xs uppercase hover:underline"
              >
                Close Editor
              </button>
            </div>
          )}

          <div className="mt-8">
            <div className="flex items-center gap-4 mb-6">
              <h3 className="text-xl font-bold text-gray-900">Posts</h3>
              <div className="flex-1 h-[2px] bg-orange-400 mt-1"></div>
            </div>
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="w-80 flex-shrink-0 px-6 py-6">
        <div className="sticky top-6 space-y-4">
          <Chatbot />
          <PreferencesPanel />
          <AllergensPanel />
        </div>
      </aside>
      
    </div>
  );
};

export default GCProfile;