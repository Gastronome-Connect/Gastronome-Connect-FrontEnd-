import React from "react";
import { Camera } from "lucide-react";
import UserImg from "../../Assets/Lince.jpg";

/**
 * ProfileTab
 * Props:
 *  - avatarSrc       : string — current avatar URL / dataURL
 *  - onEditAvatar    : () => void — opens the AvatarEditorModal
 *  - name / setName / nameError / validateName
 *  - bio  / setBio
 */
const ProfileTab = ({
  avatarSrc,
  onEditAvatar,
  name,
  setName,
  nameError,
  validateName,
  bio,
  setBio,
}) => {
  return (
    <div className="space-y-6">

      {/* ── Avatar picker ── */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Profile Photo
        </p>
        <div className="relative group">
          {/* Avatar ring */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-white shadow-xl">
            <img
              src={avatarSrc ?? UserImg}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Edit overlay button */}
          <button
            type="button"
            onClick={onEditAvatar}
            className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-orange-200"
            title="Edit profile photo"
          >
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-1">
              <Camera size={20} className="text-white" />
              <span className="text-white text-[9px] font-black uppercase tracking-wider">Edit</span>
            </div>
          </button>
        </div>

        <button
          type="button"
          onClick={onEditAvatar}
          className="text-[10px] font-black uppercase tracking-wider text-[#0060A9] hover:text-[#00B4FA] transition-colors px-4 py-1.5 rounded-full border-2 border-blue-100 hover:border-blue-200 hover:bg-blue-50"
        >
          Change Photo
        </button>
      </div>

      {/* ── Name field ── */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">
          Display Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            validateName(e.target.value);
          }}
          placeholder="Your name…"
          className={`w-full px-4 py-3 rounded-2xl border-2 text-sm font-semibold outline-none transition-all
            ${nameError
              ? "border-red-300 bg-red-50 focus:border-red-400"
              : "border-gray-100 bg-gray-50 focus:border-[#0060A9] focus:bg-white"
            }`}
        />
        {nameError && (
          <p className="text-[10px] font-black text-red-500 uppercase tracking-wider pl-1">
            ⚠ {nameError}
          </p>
        )}
      </div>

      {/* ── Bio field ── */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell people about yourself…"
          rows={3}
          className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 text-sm font-medium outline-none transition-all focus:border-[#0060A9] focus:bg-white resize-none"
        />
      </div>
    </div>
  );
};

export default ProfileTab;