import React, { useState } from "react";
import { createPortal } from "react-dom";
import { FaEdit } from "react-icons/fa";
import { X, ZoomIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import HeaderImg from "../../Assets/ProfileHeader.png";
import UserImg from "../../Assets/Silhouette ni ano.png";
import EditProfileModal from "../../Modals/EditProfileModal";

const DEFAULT_PROFILE = {
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

// ── Avatar Lightbox ────────────────────────────────────────────────────────────
const AvatarLightbox = ({ src, alt, onClose }) =>
  createPortal(
    <AnimatePresence>
      <motion.div
        key="lightbox-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-6 sm:p-10"
        style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all shadow-xl"
        >
          <X size={20} />
        </button>

        <motion.div
          key="lightbox-image"
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="relative"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={src}
            alt={alt}
            className="block max-w-[85vw] max-h-[80vh] w-auto h-auto rounded-3xl object-contain shadow-2xl border-4 border-white/10"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );

// ─────────────────────────────────────────────────────────────────────────────
function ProfilePanel({
  profile = DEFAULT_PROFILE,
  onProfileSave,
  isOwner = true,
}) {
  const [showModal, setShowModal] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const handleSave = (updated) => {
    onProfileSave?.(updated);
  };

  const displayAvatar = profile.avatarSrc || UserImg;
  const statItems = [
    { label: "Posts", value: profile.postsCount ?? 0 },
    { label: "Followers", value: profile.followersCount ?? 0 },
    { label: "Following", value: profile.followingCount ?? 0 },
  ];

  return (
    <>
      <div
        className="bg-white rounded-3xl border border-gray-100 mb-5 overflow-hidden transition-all duration-300"
        style={{
          boxShadow:
            "0 4px 24px 0 rgba(245, 118, 0, 0.10), 0 1.5px 6px 0 rgba(245, 118, 0, 0.07)",
        }}
      >
        {/* Banner */}
        <div className="relative h-32 sm:h-44 md:h-52 lg:h-64 w-full">
          <img
            src={HeaderImg}
            alt="Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
        </div>

        {/* Body */}
        <div className="relative px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 pt-2">
          {/* Avatar row */}
          <div className="relative -mt-12 sm:-mt-16 md:-mt-20 mb-4 sm:mb-6 flex flex-col items-center gap-3 sm:flex-row sm:items-end sm:justify-between">
            {/* Clickable avatar */}
            <button
              onClick={() => setShowLightbox(true)}
              className="p-1 sm:p-1.5 bg-white rounded-full shadow-2xl shadow-gray-300/60 group/avatar focus:outline-none focus:ring-4 focus:ring-orange-200 self-center sm:self-auto"
              title="View full photo"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden ring-4 sm:ring-6 md:ring-8 ring-white relative">
                <img
                  src={displayAvatar}
                  alt="Avatar"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover/avatar:bg-black/40 transition-all duration-300 rounded-full flex flex-col items-center justify-center gap-1">
                  <ZoomIn
                    size={20}
                    className="text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300"
                  />
                  <span className="text-white text-[9px] sm:text-[10px] font-bold opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 tracking-wider">
                    VIEW PHOTO
                  </span>
                </div>
              </div>
            </button>

            {/* ── Action Button ── */}
            {isOwner ? (
              // Edit Profile — shown only to the profile owner
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-gray-50 text-slate-800 border border-slate-200 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full text-xs sm:text-sm font-semibold hover:bg-slate-100 transition-all shadow-sm active:scale-95 sm:mb-1 group"
              >
                <FaEdit className="text-orange-400 group-hover:text-orange-500 transition-colors" />
                Edit Profile
              </button>
            ) : isFollowing ? (
              // Unfollow — red, shown when visitor is already following
              <button
                onClick={() => setIsFollowing(false)}
                className="inline-flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full text-xs sm:text-sm font-semibold hover:bg-red-100 transition-all shadow-sm active:scale-95 sm:mb-1"
              >
                Unfollow
              </button>
            ) : (
              // Follow — blue, shown when visitor is not yet following
              <button
                onClick={() => setIsFollowing(true)}
                className="inline-flex items-center gap-2 bg-blue-500 text-white border border-blue-500 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full text-xs sm:text-sm font-semibold hover:bg-blue-600 transition-all shadow-sm active:scale-95 sm:mb-1"
              >
                Follow
              </button>
            )}
          </div>

          {/* Name, bio, stats */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 sm:gap-6 lg:gap-8 mt-1 sm:mt-2">
            <div className="space-y-1 sm:space-y-2 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tighter leading-tight">
                {profile.name || "User"}
              </h2>
              <p className="text-slate-700 text-sm sm:text-base md:text-lg font-medium leading-relaxed max-w-2xl opacity-90 mx-auto sm:mx-0">
                {profile.bio || "No bio added yet."}
              </p>
            </div>

            <div className="flex justify-center lg:justify-end gap-6 sm:gap-8 md:gap-10 lg:gap-12 border-t lg:border-t-0 pt-5 sm:pt-6 lg:pt-0 border-slate-100 shrink-0">
              {statItems.map(({ label, value }) => (
                <div key={label} className="flex flex-col items-center">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                    {value}
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1 sm:mt-1.5">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showLightbox && (
        <AvatarLightbox
          src={displayAvatar}
          alt={profile.name}
          onClose={() => setShowLightbox(false)}
        />
      )}

      {showModal && (
        <EditProfileModal
          initialData={profile}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}

export default ProfilePanel;
