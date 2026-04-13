import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../../Feed/SideBar";
import Chatbot from "../Feed Components/ChatbotWidget";
import ProfilePanel from "./Panels/ProfilePanel";
import AllergensPanel from "./Panels/AllergensPanel";
import PreferencesPanel from "./Panels/PreferencesPanel";
import UploadProgressToast from "../Toast/UploadProgressToast";
import UploadFailedModal   from "../Modals/Create Post Components/UploadFailedModal";
import PostCard from "../../Feed/Post Card/PostCard";
import useUpload from "../../Hooks/UseUpload";
import { SkeletonPostList } from "../Skeletons";
import SkeletonProfilePanel     from "../Skeletons/SkeletonProfilePanel";
import SkeletonPreferencesPanel from "../Skeletons/SkeletonPreferencesPanel";
import SkeletonAllergensPanel   from "../Skeletons/SkeletonAllergensPanel";

const GCProfile = () => {
  const [posts, setPosts]               = useState([]);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [postsLoading,   setPostsLoading]   = useState(true);

  const [profileData, setProfileData] = useState({
    flavors:       ["Spicy", "Sweet", "Sour", "Bitter", "Savory", "Umami"],
    cookingStyles: ["Frying", "Steam", "Braising", "Grilling", "Baking", "Roasting"],
    allergens:     ["Peanut", "Citrus", "Seafoods", "Dairy", "Gluten", "Eggs"],
    dislikes:      ["Beef", "Pork", "Braising", "Liver", "Bitter Melon", "Okra"],
  });

  const mainRef = useRef(null);
  const { uploadState, progress, startUpload, retryUpload, cancelUpload, resetUpload } = useUpload();

  const handleNewPost = (newPost) => {
    startUpload(newPost, (posted) => setPosts((prev) => [posted, ...prev]));
  };

  useEffect(() => {
    // Simulate profile data load — replace with real API call
    const profileTimer = setTimeout(() => setProfileLoading(false), 1000);

    const fetchPosts = async () => {
      setPostsLoading(true);
      try {
        const res  = await fetch("http://localhost:3000/api/posts");
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
    return () => clearTimeout(profileTimer);
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#FDFCF9]">
      <Sidebar onNewPost={handleNewPost} />

      <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="p-4 sm:p-6 max-w-[1600px] mx-auto xl:pr-[448px]">

          {/* ── Profile card ── */}
          {profileLoading
            ? <SkeletonProfilePanel />
            : <ProfilePanel onProfileSave={(updated) => setProfileData((prev) => ({ ...prev, ...updated }))} />
          }

          {/* ── Preferences + Allergens (mobile only) ── */}
          <div className="xl:hidden flex flex-col gap-5 mt-5">
            {profileLoading ? (
              <>
                <SkeletonPreferencesPanel />
                <SkeletonAllergensPanel />
              </>
            ) : (
              <>
                <PreferencesPanel flavors={profileData.flavors} cookingStyles={profileData.cookingStyles} />
                <AllergensPanel allergens={profileData.allergens} dislikes={profileData.dislikes} />
              </>
            )}
          </div>

          {/* ── Posts header ── */}
          <div className="flex items-center gap-4 mt-5">
            <h3 className="text-xl font-bold text-gray-900 whitespace-nowrap">Posts</h3>
            <div className="flex-1 h-[2px] bg-orange-400 mt-1" />
          </div>

          {postsLoading && <div className="mt-5"><SkeletonPostList count={3} /></div>}

          {!postsLoading && posts.length === 0 && (
            <p className="text-center text-gray-400 py-16">No posts yet. Share your first recipe!</p>
          )}

          {!postsLoading && posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isOwner
              onDelete={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
              onUpdate={(updated) => setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))}
            />
          ))}
        </div>
      </main>

      {/* ── Right column (desktop) ── */}
      <div
        className="hidden xl:flex fixed top-6 bottom-6 z-40 flex-col gap-4"
        style={{ width: "400px", right: "24px" }}
      >
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-4">
          <div className="flex-1 min-h-0">
            {profileLoading
              ? <SkeletonPreferencesPanel />
              : <PreferencesPanel flavors={profileData.flavors} cookingStyles={profileData.cookingStyles} compressed={chatExpanded} />
            }
          </div>
          <div className="flex-1 min-h-0">
            {profileLoading
              ? <SkeletonAllergensPanel />
              : <AllergensPanel allergens={profileData.allergens} dislikes={profileData.dislikes} compressed={chatExpanded} />
            }
          </div>
        </div>
        <div className="flex-shrink-0">
          <Chatbot onExpandChange={setChatExpanded} />
        </div>
      </div>

      <UploadProgressToast uploadState={uploadState === "failed" ? "idle" : uploadState} progress={progress} onDone={resetUpload} />
      <UploadFailedModal isOpen={uploadState === "failed"} onRetry={retryUpload} onCancel={cancelUpload} />
    </div>
  );
};

export default GCProfile;