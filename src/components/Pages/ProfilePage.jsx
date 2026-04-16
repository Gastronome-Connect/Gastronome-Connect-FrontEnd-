import React, { useState, useEffect, useRef } from "react";
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
import { apiFetch, buildApiUrl, getAccessToken } from "../../utils/api";
import { jwtDecode } from "jwt-decode";

const DEFAULT_PROFILE_DATA = {
  name: "",
  bio: "",
  avatarSrc: null,
  flavors: [],
  cookingStyles: [],
  allergens: [],
  dislikes: [],
  postsCount: 0,
  followersCount: 0,
  followingCount: 0,
};

const resolveUploadUrl = (value) => {
  if (!value) return null;
  if (value.startsWith("http") || value.startsWith("data:")) return value;
  return buildApiUrl(`/uploads/${value.replace(/^\/+/, "")}`);
};

const getCurrentUserId = () => {
  const storedUserId = localStorage.getItem("userId");
  if (storedUserId) return storedUserId;

  const token = getAccessToken();
  if (!token) return null;

  try {
    const payload = jwtDecode(token);
    return payload?.userId || payload?.id || payload?._id || null;
  } catch (error) {
    console.error("Failed to decode access token:", error);
    return null;
  }
};

const normalizeProfileData = (user = {}) => ({
  name: user.username || "",
  bio: user.bio || "",
  avatarSrc: resolveUploadUrl(user.avatar),
  flavors: user.preferences?.flavors ?? [],
  cookingStyles: user.preferences?.techniques ?? [],
  allergens: user.allergies ?? [],
  dislikes: user.dislikes ?? [],
  postsCount: user.postsCount ?? 0,
  followersCount: user.followersCount ?? 0,
  followingCount: user.followingCount ?? 0,
});

const dataUrlToFile = async (dataUrl, fileName = "avatar.png") => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const extension = blob.type.split("/")[1] || "png";
  return new File([blob], `${fileName}.${extension}`, { type: blob.type });
};

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
    startUpload(newPost, (posted) => {
      setPosts((prev) => [posted, ...prev]);
      setProfileData((prev) => ({
        ...prev,
        postsCount: (prev.postsCount ?? 0) + 1,
      }));
    });
  };

  const handleProfileSave = async (updated) => {
    const nextProfile = { ...profileData, ...updated };

    if (updated.bio !== undefined && updated.bio !== profileData.bio) {
      const bioRes = await apiFetch("/api/bio", {
        method: "PUT",
        body: JSON.stringify({ bio: updated.bio }),
      });
      const bioJson = await bioRes.json();
      if (!bioRes.ok) {
        throw new Error(bioJson.message || "Failed to save bio");
      }
      nextProfile.bio = bioJson.bio ?? updated.bio;
    }

    if (
      updated.avatarSrc &&
      updated.avatarSrc.startsWith("data:") &&
      updated.avatarSrc !== profileData.avatarSrc
    ) {
      const avatarFile = await dataUrlToFile(updated.avatarSrc);
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const avatarRes = await apiFetch("/api/avatar", {
        method: "PUT",
        body: formData,
      });
      const avatarJson = await avatarRes.json();
      if (!avatarRes.ok) {
        throw new Error(avatarJson.message || "Failed to save avatar");
      }
      nextProfile.avatarSrc = avatarJson.avatar || updated.avatarSrc;
    }

    setProfileData(nextProfile);
    return nextProfile;
  };

  useEffect(() => {
    let cancelled = false;

    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      setProfileLoading(false);
      setPostsLoading(false);
      return undefined;
    }

    const fetchProfileAndPosts = async () => {
      setProfileLoading(true);
      setPostsLoading(true);

      try {
        const [profileRes, postsRes] = await Promise.all([
          apiFetch(`/api/user?id=${encodeURIComponent(currentUserId)}`),
          fetch(
            buildApiUrl(
              `/api/posts?userId=${encodeURIComponent(currentUserId)}`,
            ),
          ),
        ]);

        const profileJson = await profileRes.json();
        if (!profileRes.ok) {
          throw new Error(profileJson.message || "Failed to load profile");
        }

        const postsJson = await postsRes.json();
        if (!postsRes.ok) {
          throw new Error(postsJson.message || "Failed to load posts");
        }

        if (!cancelled) {
          const normalizedPosts = Array.isArray(postsJson) ? postsJson : [];
          setProfileData({
            ...normalizeProfileData(profileJson.user),
            postsCount: normalizedPosts.length,
          });
          setPosts(normalizedPosts);
        }
      } catch (err) {
        console.error("Failed to fetch profile page data:", err);
        if (!cancelled) {
          setProfileData(DEFAULT_PROFILE_DATA);
          setPosts([]);
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
          setPostsLoading(false);
        }
      }
    };

    fetchProfileAndPosts();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#FDFCF9]">
      <Sidebar onNewPost={handleNewPost} />

      <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="p-4 sm:p-6 max-w-[1600px] mx-auto xl:pr-[448px]">
          {/* ── Profile card ── */}
          {profileLoading ? (
            <SkeletonProfilePanel />
          ) : (
            <ProfilePanel
              profile={profileData}
              onProfileSave={handleProfileSave}
            />
          )}

          {/* ── Preferences + Allergens (mobile only) ── */}
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

          {/* ── Posts header ── */}
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
                key={post.id || post._id}
                post={post}
                isOwner
                viewerProfile={profileData}
                onDelete={(id) => {
                  setPosts((prev) =>
                    prev.filter((p) => (p.id || p._id) !== id),
                  );
                  setProfileData((prev) => ({
                    ...prev,
                    postsCount: Math.max((prev.postsCount ?? 0) - 1, 0),
                  }));
                }}
                onUpdate={(updated) =>
                  setPosts((prev) =>
                    prev.map((p) =>
                      (p.id || p._id) === (updated.id || updated._id)
                        ? updated
                        : p,
                    ),
                  )
                }
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
