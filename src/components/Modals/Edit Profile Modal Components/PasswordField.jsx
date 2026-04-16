import { Eye, EyeOff } from "lucide-react";

const PasswordField = ({ label, val, set, show, toggle }) => (
  <div>
    <label className="text-sm font-bold text-gray-700 mb-1.5 block">{label}</label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={val}
        onChange={(e) => set(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0060A9] transition-colors pr-10"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
      <button
        type="button"
        onClick={() => toggle(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  </div>
);

export default PasswordField;