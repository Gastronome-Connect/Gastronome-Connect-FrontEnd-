import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { X, User, Lock, Heart, ShieldAlert, Trash2 } from "lucide-react";
import SaveToast from "../Toast/SaveToast";
import DiscardChangesModal from "./DiscardChangesModal";
import ProfileTab from "./Edit Profile Modal Components/ProfileTab";
import PasswordTab from "./Edit Profile Modal Components/PasswordTab";
import PreferencesTab from "./Edit Profile Modal Components/PreferencesTab";
import AllergensTab from "./Edit Profile Modal Components/AllergensTab";
import DeleteAccountPopup from "../Popups/DelPopup";
import AvatarEditorModal from "../Modals/Edit Profile Modal Components/AvatarEditorModal";

const EXISTING_NAMES = ["Juan Dela Cruz", "Gastronome01", "Tester_01"];
const MOCK_PASSWORD = "password123";

const EditProfileModal = ({ onClose, onSave, initialData }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  // ── Profile state ──
  const [name, setName] = useState(initialData.name ?? "");
  const [nameError, setNameError] = useState("");
  const [bio, setBio] = useState(initialData.bio ?? "");

  // ── Avatar state ──
  const [avatarSrc, setAvatarSrc] = useState(initialData.avatarSrc ?? null);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [avatarChanged, setAvatarChanged] = useState(false);

  // ── Password state ──
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Preferences / Allergens state ──
  const [flavors, setFlavors] = useState(initialData.flavors ?? []);
  const [cookingStyles, setCookingStyles] = useState(
    initialData.cookingStyles ?? [],
  );
  const [allergens, setAllergens] = useState(initialData.allergens ?? []);
  const [dislikes, setDislikes] = useState(initialData.dislikes ?? []);

  // ── Delete / popups ──
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [showDiscard, setShowDiscard] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");

  // ── Save toast ──
  // saveToastVisible drives SaveToast — set true to show, SaveToast resets it via onDone
  const [saveToastVisible, setSaveToastVisible] = useState(false);

  // ── Helpers ──
  const hasAnyChanges = () =>
    name !== (initialData.name ?? "") ||
    bio !== (initialData.bio ?? "") ||
    avatarChanged ||
    oldPassword !== "" ||
    newPassword !== "" ||
    confirmPassword !== "" ||
    JSON.stringify(flavors) !== JSON.stringify(initialData.flavors ?? []) ||
    JSON.stringify(cookingStyles) !==
      JSON.stringify(initialData.cookingStyles ?? []) ||
    JSON.stringify(allergens) !== JSON.stringify(initialData.allergens ?? []) ||
    JSON.stringify(dislikes) !== JSON.stringify(initialData.dislikes ?? []);

  const handleTabChange = (nextTabId) => {
    if (activeTab === "profile") {
      setName(initialData.name ?? "");
      setBio(initialData.bio ?? "");
    } else if (activeTab === "password") {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else if (activeTab === "preferences") {
      setFlavors(initialData.flavors ?? []);
      setCookingStyles(initialData.cookingStyles ?? []);
    } else if (activeTab === "allergens") {
      setAllergens(initialData.allergens ?? []);
      setDislikes(initialData.dislikes ?? []);
    }
    setActiveTab(nextTabId);
  };

  const handleAttemptClose = () => {
    if (hasAnyChanges()) setShowDiscard(true);
    else onClose();
  };

  const handleSave = async () => {
    if (nameError) return;

    const changed = hasAnyChanges();

    if (!changed) {
      onClose();
      return;
    }

    setSaveError("");
    setSaveLoading(true);

    try {
      await onSave({
        name,
        bio,
        avatarSrc,
        flavors,
        cookingStyles,
        allergens,
        dislikes,
      });
      setAvatarChanged(false);
      setSaveToastVisible(true);
    } catch (error) {
      setSaveError(error.message || "Failed to save profile changes.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteConfirm = (password) => {
    setDeleteError("");
    setDeleteLoading(true);
    setTimeout(() => {
      if (password !== MOCK_PASSWORD) {
        setDeleteLoading(false);
        setDeleteError("Incorrect password. Please try again.");
        return;
      }
      setDeleteLoading(false);
      setShowDeletePopup(false);
      navigate("/");
    }, 1200);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: <User size={14} /> },
    { id: "password", label: "Security", icon: <Lock size={14} /> },
    { id: "preferences", label: "Preferences", icon: <Heart size={14} /> },
    { id: "allergens", label: "Allergen", icon: <ShieldAlert size={14} /> },
  ];

  const modal = (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
      onClick={handleAttemptClose}
    >
      <div
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300"
        style={{ maxHeight: "calc(100dvh - 32px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0060A9] to-[#00B4FA] text-white px-5 sm:px-8 py-4 sm:py-7 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-xl font-black uppercase tracking-tighter">
              Edit Profile
            </h2>
            <p className="text-blue-100 text-[9px] sm:text-[10px] font-bold tracking-widest uppercase opacity-80">
              Settings & Security
            </p>
          </div>
          <button
            onClick={handleAttemptClose}
            className="p-2 rounded-full bg-black/10 hover:bg-white/20 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex px-2 sm:px-4 bg-gray-50/50 border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 sm:py-4 text-[9px] sm:text-[11px] font-black uppercase tracking-wider transition-all relative ${
                activeTab === tab.id
                  ? "text-[#0060A9]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="flex-shrink-0">{tab.icon}</span>
              <span className="hidden xs:block sm:block">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 sm:w-12 h-1 bg-[#F57600] rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div
          className="overflow-y-auto custom-scrollbar px-5 sm:px-8 py-5 sm:py-6"
          style={{ maxHeight: "calc(100dvh - 280px)", minHeight: "200px" }}
        >
          {activeTab === "profile" && (
            <ProfileTab
              avatarSrc={avatarSrc}
              onEditAvatar={() => setShowAvatarEditor(true)}
              name={name}
              setName={setName}
              bio={bio}
              setBio={setBio}
              nameError={nameError}
              validateName={(v) =>
                EXISTING_NAMES.includes(v)
                  ? setNameError("Taken")
                  : setNameError("")
              }
            />
          )}
          {activeTab === "password" && (
            <PasswordTab
              oldPassword={oldPassword}
              setOldPassword={setOldPassword}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              showOld={showOld}
              setShowOld={setShowOld}
              showNew={showNew}
              setShowNew={setShowNew}
              showConfirm={showConfirm}
              setShowConfirm={setShowConfirm}
              passwordError={passwordError}
            />
          )}
          {activeTab === "preferences" && (
            <PreferencesTab
              flavors={flavors}
              setFlavors={setFlavors}
              cookingStyles={cookingStyles}
              setCookingStyles={setCookingStyles}
            />
          )}
          {activeTab === "allergens" && (
            <AllergensTab
              allergens={allergens}
              setAllergens={setAllergens}
              dislikes={dislikes}
              setDislikes={setDislikes}
            />
          )}
        </div>

        {/* Footer */}
        <div
          className="px-5 sm:px-8 py-4 sm:py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between gap-2"
          style={{
            paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <button
            onClick={() => {
              setDeleteError("");
              setShowDeletePopup(true);
            }}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-[10px] sm:text-xs font-black uppercase border-2 transition-all
              ${
                activeTab === "profile"
                  ? "text-red-400 border-red-100 hover:bg-red-50 hover:border-red-300 hover:text-red-600 cursor-pointer"
                  : "text-transparent border-transparent pointer-events-none select-none"
              }`}
          >
            <Trash2
              size={12}
              className={activeTab === "profile" ? "" : "opacity-0"}
            />
            <span className="hidden sm:inline">Delete Account</span>
            <span className="sm:hidden">Delete</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleAttemptClose}
              disabled={saveLoading}
              className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl text-[10px] sm:text-xs font-black text-gray-500 uppercase hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saveLoading}
              className="px-5 sm:px-8 py-2 sm:py-2.5 rounded-2xl text-[10px] sm:text-xs font-black bg-[#0060A9] text-white hover:bg-[#00B4FA] shadow-lg shadow-blue-200 uppercase transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saveLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
        {saveError && (
          <div className="px-5 sm:px-8 pb-4 sm:pb-5 text-[11px] sm:text-xs font-semibold text-red-500">
            {saveError}
          </div>
        )}
      </div>

      {showDiscard && (
        <DiscardChangesModal
          onDiscard={() => {
            setSaveError("");
            setName(initialData.name ?? "");
            setBio(initialData.bio ?? "");
            setAvatarSrc(initialData.avatarSrc ?? null);
            setAvatarChanged(false);
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setFlavors(initialData.flavors ?? []);
            setCookingStyles(initialData.cookingStyles ?? []);
            setAllergens(initialData.allergens ?? []);
            setDislikes(initialData.dislikes ?? []);
            setShowDiscard(false);
            onClose();
          }}
          onKeepEditing={() => {
            setShowDiscard(false);
            setActiveTab("profile");
          }}
        />
      )}
    </div>
  );

  return createPortal(
    <>
      {modal}

      {showAvatarEditor && (
        <AvatarEditorModal
          currentSrc={avatarSrc}
          onClose={() => setShowAvatarEditor(false)}
          onSave={(dataUrl) => {
            setAvatarSrc(dataUrl);
            setAvatarChanged(true);
            setShowAvatarEditor(false);
          }}
        />
      )}

      <DeleteAccountPopup
        isOpen={showDeletePopup}
        onCancel={() => {
          setShowDeletePopup(false);
          setDeleteError("");
        }}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        error={deleteError}
      />

      {/* Save toast — visible prop is the only trigger needed */}
      <SaveToast
        visible={saveToastVisible}
        message="Changes saved"
        subLabel="Profile"
        onDone={() => {
          setSaveToastVisible(false);
          setSaveError("");
          onClose();
        }}
      />
    </>,
    document.body,
  );
};

export default EditProfileModal;
