import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../../Feed/SideBar";
import Chatbot from "../Feed Components/ChatbotWidget";
import ProfilePanel from "./Panels/ProfilePanel";
import AllergensPanel from "./Panels/AllergensPanel";
import PreferencesPanel from "./Panels/PreferencesPanel";
import UploadProgressToast from "../Toast/UploadProgressToast";
import UploadFailedModal from "../Modals/Create Post Components/UploadFailedModal";
import PostCard from "../../Feed/Post Card/PostCard";
import useUpload from "../../Hooks/UseUpload";
import { SkeletonPostList } from "../Skeletons";
import SkeletonProfilePanel from "../Skeletons/SkeletonProfilePanel";
import SkeletonPreferencesPanel from "../Skeletons/SkeletonPreferencesPanel";
import SkeletonAllergensPanel from "../Skeletons/SkeletonAllergensPanel";
import { apiFetch, buildApiUrl, resolveUploadUrl } from "../../utils/api";

const DEFAULT_PROFILE_DATA = {
  id: "",
  name: "Juan Dela Cruz",
  bio: "",
  avatarSrc: "",
  followersCount: 0,
  followingCount: 0,
  postsCount: 0,
  flavors: [],
  cookingStyles: [],
  allergens: [],
  dislikes: [],
};

const normalizeProfileData = (user = {}) => ({
  id: user._id || user.id || "",
  name:
    user.displayName || user.username || user.name || DEFAULT_PROFILE_DATA.name,
  bio: user.bio || "",
  avatarSrc: resolveUploadUrl(user.avatar || ""),
  followersCount:
    typeof user.followersCount === "number"
      ? user.followersCount
      : Array.isArray(user.followers)
        ? user.followers.length
        : 0,
  followingCount:
    typeof user.followingCount === "number"
      ? user.followingCount
      : Array.isArray(user.following)
        ? user.following.length
        : 0,
  postsCount: typeof user.postsCount === "number" ? user.postsCount : 0,
  flavors: Array.isArray(user.preferences?.flavors)
    ? user.preferences.flavors
    : [],
  cookingStyles: Array.isArray(user.preferences?.techniques)
    ? user.preferences.techniques
    : [],
  allergens: Array.isArray(user.allergies) ? user.allergies : [],
  dislikes: Array.isArray(user.dislikes) ? user.dislikes : [],
});

const dataUrlToFile = async (dataUrl) => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const extension = blob.type.split("/")[1] || "png";
  return new File([blob], `avatar.${extension}`, { type: blob.type });
};

const areStringArraysEqual = (left = [], right = []) =>
  JSON.stringify(left) === JSON.stringify(right);

const GCProfile = () => {
  const [posts, setPosts] = useState([]);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [profileData, setProfileData] = useState(DEFAULT_PROFILE_DATA);

  const mainRef = useRef(null);
  const {
    uploadState,
    progress,
    startUpload,
    retryUpload,
    cancelUpload,
    resetUpload,
  } = useUpload();

  const handleNewPost = (newPost) => {
    startUpload(newPost, (posted) => setPosts((prev) => [posted, ...prev]));
  };

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      try {
        const profileResponse = await apiFetch("/api/user");
        const profileDataResponse = await profileResponse.json();
        if (!profileResponse.ok) {
          throw new Error(
            profileDataResponse.message || "Failed to fetch profile",
          );
        }

        const normalizedProfile = normalizeProfileData(
          profileDataResponse.user,
        );
        setProfileData(normalizedProfile);
        setProfileLoading(false);

        if (!normalizedProfile.id) {
          setPosts([]);
          return;
        }

        const postsResponse = await fetch(
          buildApiUrl(`/api/posts?userId=${normalizedProfile.id}`),
        );
        const postsData = await postsResponse.json();
        setPosts(Array.isArray(postsData) ? postsData : []);
      } catch (error) {
        console.error("Failed to fetch profile or posts:", error);
      } finally {
        setProfileLoading(false);
        setPostsLoading(false);
      }
    };

    fetchProfileAndPosts();
  }, []);

  const handleProfileSave = async (updated) => {
    const nextProfile = { ...profileData };

    if (typeof updated.name === "string" && updated.name.trim()) {
      const displayName = updated.name.trim();

      if (displayName !== profileData.name) {
        const displayNameResponse = await apiFetch("/api/display-name", {
          method: "PUT",
          body: JSON.stringify({ displayName }),
        });
        const displayNameData = await displayNameResponse.json();
        if (!displayNameResponse.ok) {
          throw new Error(
            displayNameData.message || "Failed to update display name",
          );
        }

        nextProfile.name =
          displayNameData.user?.displayName ||
          displayNameData.user?.username ||
          displayName;

        setPosts((prev) =>
          prev.map((post) =>
            String(post.userId) === String(profileData.id)
              ? {
                  ...post,
                  author: nextProfile.name,
                  authorDisplayName: nextProfile.name,
                  authorUsername: nextProfile.name,
                }
              : post,
          ),
        );
      }
    }

    if (typeof updated.bio === "string" && updated.bio !== profileData.bio) {
      const bioResponse = await apiFetch("/api/bio", {
        method: "PUT",
        body: JSON.stringify({ bio: updated.bio }),
      });
      const bioData = await bioResponse.json();
      if (!bioResponse.ok) {
        throw new Error(bioData.message || "Failed to update bio");
      }
      nextProfile.bio = bioData.bio ?? updated.bio;
    }

    if (
      updated.avatarSrc &&
      updated.avatarSrc !== profileData.avatarSrc &&
      updated.avatarSrc.startsWith("data:")
    ) {
      const avatarFile = await dataUrlToFile(updated.avatarSrc);
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const avatarResponse = await apiFetch("/api/avatar", {
        method: "PUT",
        body: formData,
      });
      const avatarData = await avatarResponse.json();
      if (!avatarResponse.ok) {
        throw new Error(avatarData.message || "Failed to update avatar");
      }

      nextProfile.avatarSrc = resolveUploadUrl(avatarData.avatar || "");
      setPosts((prev) =>
        prev.map((post) =>
          String(post.userId) === String(profileData.id)
            ? { ...post, avatar: nextProfile.avatarSrc }
            : post,
        ),
      );
    }

    const preferencesChanged =
      !areStringArraysEqual(updated.flavors, profileData.flavors) ||
      !areStringArraysEqual(updated.cookingStyles, profileData.cookingStyles) ||
      !areStringArraysEqual(updated.allergens, profileData.allergens) ||
      !areStringArraysEqual(updated.dislikes, profileData.dislikes);

    if (preferencesChanged && profileData.id) {
      const preferencesResponse = await apiFetch(
        `/api/user/preferences/${profileData.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            preferences: {
              flavors: updated.flavors,
              techniques: updated.cookingStyles,
            },
            allergies: updated.allergens,
            dislikes: updated.dislikes,
          }),
        },
      );

      const preferencesData = await preferencesResponse.json();
      if (!preferencesResponse.ok) {
        throw new Error(
          preferencesData.message || "Failed to update preferences",
        );
      }

      Object.assign(nextProfile, normalizeProfileData(preferencesData.user));
    }

    setProfileData(nextProfile);
    window.dispatchEvent(
      new CustomEvent("profile-updated", { detail: nextProfile }),
    );
  };

  return (
    <div className="flex h-screen w-full bg-[#FDFCF9]">
      <Sidebar onNewPost={handleNewPost} />

      <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="p-4 sm:p-6 max-w-[1600px] mx-auto xl:pr-[448px]">
          {profileLoading ? (
            <SkeletonProfilePanel />
          ) : (
            <ProfilePanel
              profile={profileData}
              onProfileSave={handleProfileSave}
              isOwner={true}
            />
          )}

          <div className="xl:hidden flex flex-col gap-5 mt-5">
            {profileLoading ? (
              <>
                <SkeletonPreferencesPanel />
                <SkeletonAllergensPanel />
              </>
            ) : (
              <>
                <PreferencesPanel
                  flavors={profileData.flavors}
                  cookingStyles={profileData.cookingStyles}
                />
                <AllergensPanel
                  allergens={profileData.allergens}
                  dislikes={profileData.dislikes}
                />
              </>
            )}
          </div>

          <div className="flex items-center gap-4 mt-5">
            <h3 className="text-xl font-bold text-gray-900 whitespace-nowrap">
              Posts
            </h3>
            <div className="flex-1 h-[2px] bg-orange-400 mt-1" />
          </div>

          {postsLoading && (
            <div className="mt-5">
              <SkeletonPostList count={3} />
            </div>
          )}

          {!postsLoading && posts.length === 0 && (
            <p className="text-center text-gray-400 py-16">
              No posts yet. Share your first recipe!
            </p>
          )}

          {!postsLoading &&
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isOwner
                onDelete={(id) =>
                  setPosts((prev) => prev.filter((item) => item.id !== id))
                }
                onUpdate={(updated) =>
                  setPosts((prev) =>
                    prev.map((item) =>
                      item.id === updated.id ? updated : item,
                    ),
                  )
                }
              />
            ))}
        </div>
      </main>

      <div
        className="hidden xl:flex fixed top-6 bottom-6 z-40 flex-col gap-4"
        style={{ width: "400px", right: "24px" }}
      >
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-4">
          <div className="flex-1 min-h-0">
            {profileLoading ? (
              <SkeletonPreferencesPanel />
            ) : (
              <PreferencesPanel
                flavors={profileData.flavors}
                cookingStyles={profileData.cookingStyles}
                compressed={chatExpanded}
              />
            )}
          </div>
          <div className="flex-1 min-h-0">
            {profileLoading ? (
              <SkeletonAllergensPanel />
            ) : (
              <AllergensPanel
                allergens={profileData.allergens}
                dislikes={profileData.dislikes}
                compressed={chatExpanded}
              />
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <Chatbot onExpandChange={setChatExpanded} />
        </div>
      </div>

      <UploadProgressToast
        uploadState={uploadState === "failed" ? "idle" : uploadState}
        progress={progress}
        onDone={resetUpload}
      />
      <UploadFailedModal
        isOpen={uploadState === "failed"}
        onRetry={retryUpload}
        onCancel={cancelUpload}
      />
    </div>
  );
};

export default GCProfile;
