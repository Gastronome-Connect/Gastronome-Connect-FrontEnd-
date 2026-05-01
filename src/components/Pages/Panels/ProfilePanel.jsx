import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FaEdit } from "react-icons/fa";
import {
  AlertTriangle,
  Check,
  Flag,
  Loader2,
  Users,
  X,
  ZoomIn,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import HeaderImg from "../../Assets/ProfileHeader.png";
import UserImg from "../../Assets/Silhouette ni ano.png";
import EditProfileModal from "../../Modals/EditProfileModal";
import { addProfileReport } from "../../../Store/ReportStore";
import { apiFetch } from "../../../utils/api";

const DEFAULT_PROFILE = {
  name: "Juan Dela Cruz",
  username: "@juandelacruz",
  bio: "Hilu",
  avatarSrc: "",
  postsCount: 0,
  followersCount: 0,
  followingCount: 0,
  flavors: [],
  cookingStyles: [],
  allergens: [],
  dislikes: [],
};

const REPORT_REASON_OPTIONS = [
  { id: "fake", label: "Fake Account" },
  { id: "identity_theft", label: "Identity Theft or Impersonation" },
  { id: "scam", label: "Scam or Fraud" },
  { id: "abusive_profile", label: "Abusive Profile Content" },
  { id: "other", label: "Others" },
];

const RelationshipListModal = ({
  open,
  onClose,
  title,
  users,
  isLoading,
  error,
  onOpenProfile,
  onToggleFollow,
  pendingUserIds,
  viewerUserId,
}) => {
  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="relationship-list-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[9998] flex items-center justify-center p-4 sm:p-6"
        style={{
          background: "rgba(15, 23, 42, 0.55)",
          backdropFilter: "blur(8px)",
        }}
        onClick={onClose}
      >
        <motion.div
          key="relationship-list-modal"
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          onClick={(event) => event.stopPropagation()}
          className="w-full max-w-2xl rounded-[28px] bg-white border border-orange-100 shadow-[0_30px_80px_rgba(15,23,42,0.18)] overflow-hidden"
        >
          <div className="flex items-start justify-between gap-4 px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-[#0060A9] border border-blue-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]">
                <Users size={14} />
                Relationships
              </div>
              <h3 className="mt-3 text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                {title}
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all"
              aria-label="Close relationship modal"
            >
              <X size={18} />
            </button>
          </div>

          <div className="max-h-[65vh] overflow-y-auto px-5 sm:px-6 py-5 sm:py-6">
            {isLoading && (
              <div className="flex items-center justify-center gap-3 py-16 text-slate-500">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm font-semibold">
                  Loading {title.toLowerCase()}...
                </span>
              </div>
            )}

            {!isLoading && error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {!isLoading && !error && users.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-slate-400">
                <Users size={28} />
                <p className="text-sm font-medium">No users found here yet.</p>
              </div>
            )}

            {!isLoading && !error && users.length > 0 && (
              <div className="space-y-3">
                {users.map((user) => {
                  const userId = user.id || user._id;
                  const canToggleFollow =
                    userId && String(userId) !== String(viewerUserId || "");
                  const isPending = pendingUserIds.has(String(userId || ""));

                  return (
                    <div
                      key={userId}
                      className="flex w-full items-center gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-left transition-all hover:border-blue-200 hover:bg-blue-50/50"
                    >
                      <button
                        type="button"
                        onClick={() => onOpenProfile(user)}
                        className="flex min-w-0 flex-1 items-center gap-4 text-left"
                      >
                        <img
                          src={user.avatar || UserImg}
                          alt={user.displayName || user.username || "User"}
                          className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {user.displayName ||
                              user.name ||
                              user.username ||
                              "Unknown User"}
                          </p>
                          <p className="truncate text-xs font-semibold text-orange-500">
                            @
                            {user.accountUsername || user.username || "unknown"}
                          </p>
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {user.bio || "No bio yet."}
                          </p>
                        </div>
                        <div className="shrink-0 text-right text-[11px] font-semibold text-slate-400">
                          <p>{user.followersCount || 0} followers</p>
                          <p>{user.followingCount || 0} following</p>
                        </div>
                      </button>
                      {canToggleFollow && (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={(event) => {
                            event.stopPropagation();
                            onToggleFollow?.(userId);
                          }}
                          className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                            user.isFollowedByViewer
                              ? "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                              : "border border-blue-500 bg-blue-500 text-white hover:bg-blue-600"
                          } ${isPending ? "cursor-wait opacity-60" : ""}`}
                        >
                          {isPending
                            ? "Working..."
                            : user.isFollowedByViewer
                              ? "Unfollow"
                              : "Follow"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
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
        style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(10px)" }}
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
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: "min(85vw, 720px)",
            width: "100%",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(0,0,0,0.3)",
          }}
        >
          <img
            src={src}
            alt={alt}
            style={{
              display: "block",
              width: "100%",
              height: "auto",
              maxHeight: "80vh",
              objectFit: "contain",
              borderRadius: "0",
            }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );

const ReportProfileModal = ({
  open,
  onClose,
  onSubmit,
  reason,
  setReason,
  detail,
  setDetail,
  isSubmitting,
  submitState,
  profileName,
}) => {
  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="report-profile-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[9998] flex items-center justify-center p-4 sm:p-6"
        style={{
          background: "rgba(15, 23, 42, 0.55)",
          backdropFilter: "blur(8px)",
        }}
        onClick={onClose}
      >
        <motion.div
          key="report-profile-modal"
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          onClick={(event) => event.stopPropagation()}
          className="w-full max-w-xl rounded-[28px] bg-white border border-orange-100 shadow-[0_30px_80px_rgba(15,23,42,0.18)] overflow-hidden"
        >
          <div className="flex items-start justify-between gap-4 px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 text-orange-600 border border-orange-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]">
                <Flag size={14} />
                Report Profile
              </div>
              <h3 className="mt-3 text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                Report {profileName || "this user"}
              </h3>
              <p className="mt-1 text-sm sm:text-[15px] text-slate-600 leading-relaxed">
                Tell us what is wrong with this account, such as impersonation,
                fake identity, scam behavior, or abusive profile details.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all"
              aria-label="Close report modal"
            >
              <X size={18} />
            </button>
          </div>

          <form
            onSubmit={onSubmit}
            className="px-5 sm:px-6 py-5 sm:py-6 space-y-5"
          >
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-900">
                Why are you reporting this account?
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {REPORT_REASON_OPTIONS.map((option) => {
                  const active = reason === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setReason(option.id)}
                      className={`text-left rounded-2xl border px-4 py-3.5 transition-all duration-200 ${
                        active
                          ? "border-orange-300 bg-orange-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/40"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border ${
                            active
                              ? "border-orange-500 bg-orange-500 text-white"
                              : "border-slate-300 bg-white text-transparent"
                          }`}
                        >
                          <Check size={12} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 leading-snug">
                            {option.label}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {reason === "other" && (
              <div className="space-y-2">
                <label
                  htmlFor="profile-report-detail"
                  className="block text-sm font-bold text-slate-900"
                >
                  Tell us more
                </label>
                <textarea
                  id="profile-report-detail"
                  value={detail}
                  onChange={(event) => setDetail(event.target.value)}
                  rows={4}
                  placeholder="Share more details about this profile or account."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-300 resize-none"
                />
              </div>
            )}

            {submitState === "success" && (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
                <Check size={18} className="mt-0.5 shrink-0" />
                <p className="text-sm font-medium">
                  Thanks. Your report has been submitted for review.
                </p>
              </div>
            )}

            {submitState === "error" && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                <p className="text-sm font-medium">
                  Please select a reason before submitting your report.
                </p>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !reason ||
                  (reason === "other" && !detail.trim())
                }
                className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Flag size={16} />
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
};

// ─────────────────────────────────────────────────────────────────────────────
function ProfilePanel({
  profile = DEFAULT_PROFILE,
  onProfileSave,
  isOwner = true,
  onToggleFollow,
  viewerUserId,
}) {
  const navigate = useNavigate();
  const mergedProfile = { ...DEFAULT_PROFILE, ...profile };

  const [showModal, setShowModal] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [reportDetail, setReportDetail] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSubmitState, setReportSubmitState] = useState("idle");
  const [relationshipModal, setRelationshipModal] = useState({
    open: false,
    title: "Followers",
    users: [],
    isLoading: false,
    error: "",
  });
  const [pendingRelationshipUserIds, setPendingRelationshipUserIds] = useState(
    () => new Set(),
  );

  const displayAvatar = mergedProfile.avatarSrc || UserImg;
  const reportProfilePayload = useMemo(
    () => ({
      id: mergedProfile.id || mergedProfile.userId,
      userId: mergedProfile.userId || mergedProfile.id,
      author: mergedProfile.name,
      avatar: mergedProfile.avatarSrc || displayAvatar,
      bio: mergedProfile.bio,
    }),
    [
      displayAvatar,
      mergedProfile.avatarSrc,
      mergedProfile.bio,
      mergedProfile.id,
      mergedProfile.name,
      mergedProfile.userId,
    ],
  );

  const statItems = [
    { label: "Posts", value: mergedProfile.postsCount },
    { label: "Followers", value: mergedProfile.followersCount },
    { label: "Following", value: mergedProfile.followingCount },
  ];

  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setSelectedReason("");
    setReportDetail("");
    setReportSubmitState("idle");
    setIsSubmittingReport(false);
  };

  const handleSubmitReport = (event) => {
    event.preventDefault();

    if (
      !selectedReason ||
      (selectedReason === "other" && !reportDetail.trim())
    ) {
      setReportSubmitState("error");
      return;
    }

    setIsSubmittingReport(true);

    try {
      if (typeof addProfileReport === "function") {
        addProfileReport(
          reportProfilePayload,
          selectedReason,
          selectedReason === "other" ? reportDetail.trim() : null,
          "You",
        );
      } else {
        console.warn("addProfileReport is not available in ReportStore yet.");
      }

      setReportSubmitState("success");

      window.setTimeout(() => {
        handleCloseReportModal();
      }, 1200);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const openRelationshipModal = async (type) => {
    if (!mergedProfile.id) {
      return;
    }

    const title = type === "following" ? "Following" : "Followers";
    setRelationshipModal({
      open: true,
      title,
      users: [],
      isLoading: true,
      error: "",
    });

    try {
      const response = await apiFetch(`/api/user/${mergedProfile.id}/${type}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Failed to load ${type}`);
      }

      setRelationshipModal({
        open: true,
        title,
        users: Array.isArray(data.users) ? data.users : [],
        isLoading: false,
        error: "",
      });
    } catch (error) {
      setRelationshipModal({
        open: true,
        title,
        users: [],
        isLoading: false,
        error: error.message || `Failed to load ${type}`,
      });
    }
  };

  const closeRelationshipModal = () => {
    setRelationshipModal((current) => ({
      ...current,
      open: false,
      isLoading: false,
      error: "",
    }));
  };

  const handleOpenProfile = (user) => {
    closeRelationshipModal();
    navigate(`/profile/${user.id || user._id}`);
  };

  const handleToggleRelationshipFollow = async (userId) => {
    if (!userId) {
      return;
    }

    const key = String(userId);
    setPendingRelationshipUserIds((current) => new Set([...current, key]));

    try {
      const response = await apiFetch(`/api/follow/${userId}`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update follow status");
      }

      setRelationshipModal((current) => ({
        ...current,
        users: current.users.map((user) => {
          const currentUserId = String(user.id || user._id || "");
          if (currentUserId !== key) {
            return user;
          }

          return {
            ...user,
            isFollowedByViewer: Boolean(data.isFollowing),
            followersCount:
              typeof data.followersCount === "number"
                ? data.followersCount
                : user.followersCount,
          };
        }),
      }));
    } catch (error) {
      console.error("Failed to toggle relationship follow:", error);
    } finally {
      setPendingRelationshipUserIds((current) => {
        const next = new Set(current);
        next.delete(key);
        return next;
      });
    }
  };

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
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-gray-50 text-slate-800 border border-slate-200 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full text-xs sm:text-sm font-semibold hover:bg-slate-100 transition-all shadow-sm active:scale-95 sm:mb-1 group"
              >
                <FaEdit className="text-orange-400 group-hover:text-orange-500 transition-colors" />
                Edit Profile
              </button>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 sm:mb-1">
                {mergedProfile.isFollowedByViewer ? (
                  <button
                    onClick={onToggleFollow}
                    className="inline-flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full text-xs sm:text-sm font-semibold hover:bg-red-100 transition-all shadow-sm active:scale-95"
                  >
                    Unfollow
                  </button>
                ) : (
                  <button
                    onClick={onToggleFollow}
                    className="inline-flex items-center gap-2 bg-blue-500 text-white border border-blue-500 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full text-xs sm:text-sm font-semibold hover:bg-blue-600 transition-all shadow-sm active:scale-95"
                  >
                    Follow
                  </button>
                )}

                <button
                  onClick={() => {
                    setReportSubmitState("idle");
                    setShowReportModal(true);
                  }}
                  className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 border border-orange-200 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full text-xs sm:text-sm font-semibold hover:bg-orange-100 transition-all shadow-sm active:scale-95"
                >
                  <Flag size={15} />
                  Report Profile
                </button>
              </div>
            )}
          </div>

          {/* Name, bio, stats */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 sm:gap-6 lg:gap-8 mt-1 sm:mt-2">
            <div className="space-y-1 sm:space-y-2 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tighter leading-tight">
                {mergedProfile.name}
              </h2>
              {mergedProfile.username && (
                <p className="text-sm sm:text-base font-semibold text-orange-500 tracking-tight -mt-0.5">
                  @{mergedProfile.username}
                </p>
              )}
              <p className="text-slate-700 text-sm sm:text-base md:text-lg font-medium leading-relaxed max-w-2xl opacity-90 mx-auto sm:mx-0">
                {mergedProfile.bio}
              </p>
            </div>

            <div className="flex justify-center lg:justify-end gap-6 sm:gap-8 md:gap-10 lg:gap-12 border-t lg:border-t-0 pt-5 sm:pt-6 lg:pt-0 border-slate-100 shrink-0">
              {statItems.map(({ label, value }) => {
                const lowerLabel = label.toLowerCase();
                const isRelationship =
                  lowerLabel === "followers" || lowerLabel === "following";

                return isRelationship ? (
                  <button
                    key={label}
                    type="button"
                    onClick={() => openRelationshipModal(lowerLabel)}
                    className="flex flex-col items-center rounded-2xl px-2 py-1 transition-all hover:bg-slate-50"
                  >
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                      {value}
                    </span>
                    <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1 sm:mt-1.5">
                      {label}
                    </span>
                  </button>
                ) : (
                  <div key={label} className="flex flex-col items-center">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                      {value}
                    </span>
                    <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1 sm:mt-1.5">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showLightbox && (
        <AvatarLightbox
          src={displayAvatar}
          alt={mergedProfile.name}
          onClose={() => setShowLightbox(false)}
        />
      )}

      {showModal && (
        <EditProfileModal
          initialData={{
            ...mergedProfile,
            avatarSrc: mergedProfile.avatarSrc || displayAvatar,
          }}
          onClose={() => setShowModal(false)}
          onSave={onProfileSave}
        />
      )}

      <ReportProfileModal
        open={showReportModal}
        onClose={handleCloseReportModal}
        onSubmit={handleSubmitReport}
        reason={selectedReason}
        setReason={setSelectedReason}
        detail={reportDetail}
        setDetail={setReportDetail}
        isSubmitting={isSubmittingReport}
        submitState={reportSubmitState}
        profileName={mergedProfile.name}
      />

      <RelationshipListModal
        open={relationshipModal.open}
        onClose={closeRelationshipModal}
        title={relationshipModal.title}
        users={relationshipModal.users}
        isLoading={relationshipModal.isLoading}
        error={relationshipModal.error}
        onOpenProfile={handleOpenProfile}
        onToggleFollow={handleToggleRelationshipFollow}
        pendingUserIds={pendingRelationshipUserIds}
        viewerUserId={viewerUserId}
      />
    </>
  );
}

export default ProfilePanel;
