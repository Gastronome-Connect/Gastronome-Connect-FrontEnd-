import React, { useState, useEffect } from "react";
import { FaEnvelope } from "react-icons/fa";
import ChangePassword from "../userAuth/ProfChangePass";

const Account = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password123");
  const [showChangePass, setShowChangePass] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token && token.split(".").length === 3) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        setEmail(decodedToken.email);
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  }, []);

  const handlePasswordUpdate = (newPassword) => {
    if (newPassword) {
      setPassword(newPassword);
      setShowChangePass(false);
      setShowPopup(true);
    }
  };

  return (
    <div className="p-5 max-w-md mx-auto">
      {showChangePass ? (
        <ChangePassword
          onSuccess={handlePasswordUpdate}
          onCancel={() => setShowChangePass(false)}
        />
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Email
            </label>
            <div className="flex items-center border border-gray-300 rounded-md p-2 bg-white">
              <FaEnvelope className="text-[#3BA444] mr-2" />
              <input
                type="email"
                value={email}
                className="flex-grow focus:outline-none"
                readOnly
              />
            </div>
          </div>

          <div className="flex justify-center mb-4">
            <button
              className="bg-[#3BA444] text-white px-4 py-2 rounded-md hover:bg-[#2e8a36] focus:outline-none w-full max-w-md"
              onClick={() => setShowChangePass(true)}
            >
              Change Password
            </button>
          </div>
        </>
      )}

      {showPopup && <ChangePopup onContinue={() => setShowPopup(false)} />}
    </div>
  );
};

export default Account;
