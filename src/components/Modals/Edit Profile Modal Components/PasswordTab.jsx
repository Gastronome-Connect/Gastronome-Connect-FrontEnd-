import React from "react";
import { Eye, EyeOff, ShieldCheck, ShieldAlert } from "lucide-react";

// Added a fallback to an empty string to prevent the .length error
const getPasswordRules = (pw = "") => ({
  length: pw.length >= 8,
  uppercase: /[A-Z]/.test(pw),
  lowercase: /[a-z]/.test(pw),
  number: /[0-9]/.test(pw),
  special: /[^A-Za-z0-9]/.test(pw),
});

const PasswordField = ({
  label,
  val,
  set,
  show,
  toggle,
  placeholder,
  autoComplete = "off",
  fieldName,
}) => (
  <div className="group">
    <label className="text-[11px] font-black text-[#0060A9] uppercase tracking-widest mb-2 block group-focus-within:text-[#F57600] transition-colors">
      {label}
    </label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={fieldName}
        value={val || ""} // Fallback to empty string for the input value
        onChange={(e) => set(e.target.value)}
        autoComplete={autoComplete}
        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-3 text-sm font-medium focus:outline-none focus:border-[#0060A9] focus:bg-white transition-all pr-12"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => toggle(!show)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0060A9] transition-colors"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
);

const PasswordTab = ({
  oldPassword = "",
  setOldPassword,
  newPassword = "",
  setNewPassword,
  confirmPassword = "",
  setConfirmPassword,
  showOld,
  setShowOld,
  showNew,
  setShowNew,
  showConfirm,
  setShowConfirm,
  passwordError,
}) => {
  // Now safe from "undefined" errors
  const rules = getPasswordRules(newPassword);

  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4">
      <PasswordField
        label="Current Password"
        val={oldPassword}
        set={setOldPassword}
        show={showOld}
        toggle={setShowOld}
        placeholder="Verify current password"
        autoComplete="new-password"
        fieldName="profile-current-password"
      />

      <div className="h-px bg-gray-100 my-1" />

      <PasswordField
        label="New Password"
        val={newPassword}
        set={setNewPassword}
        show={showNew}
        toggle={setShowNew}
        placeholder="Min. 8 characters"
        autoComplete="new-password"
        fieldName="profile-new-password"
      />

      {newPassword && newPassword.length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-4 grid grid-cols-2 gap-3 border border-gray-100">
          <Rule met={rules.length} label="8+ Characters" />
          <Rule met={rules.uppercase} label="Uppercase" />
          <Rule met={rules.lowercase} label="Lowercase" />
          <Rule met={rules.number} label="Number" />
          <Rule met={rules.special} label="Special Char" />
        </div>
      )}

      <PasswordField
        label="Confirm New Password"
        val={confirmPassword}
        set={setConfirmPassword}
        show={showConfirm}
        toggle={setShowConfirm}
        placeholder="Repeat new password"
        autoComplete="new-password"
        fieldName="profile-confirm-password"
      />

      {passwordError && (
        <div className="bg-orange-50 border border-[#F57600]/20 rounded-xl p-3 flex items-center gap-2">
          <ShieldAlert size={14} className="text-[#F57600]" />
          <p className="text-[10px] font-black text-[#F57600] uppercase tracking-wide">
            {passwordError}
          </p>
        </div>
      )}
    </div>
  );
};

const Rule = ({ met, label }) => (
  <div
    className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-tight ${met ? "text-green-500" : "text-gray-400"}`}
  >
    {met ? (
      <ShieldCheck size={12} />
    ) : (
      <ShieldAlert size={12} className="opacity-50" />
    )}
    {label}
  </div>
);

export default PasswordTab;
