import React, { useState, useEffect } from "react";
import Navbar from "../Landing/NavigationBar";
import { buildApiUrl } from "../utils/api";
import Footer from "../components/Footer/Footer";
import mail from "../components/Assets/MailContact.png";
import contact from "../components/Assets/PhoneContact.png";
import pencil from "../components/Assets/Pencil.png";

function ContactUs() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [concern, setConcern] = useState("");
  const [focusedField, setFocusedField] = useState("");
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const orangeFilter = {
    filter:
      "invert(52%) sepia(91%) saturate(2350%) hue-rotate(15deg) brightness(101%) contrast(101%)",
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setIsButtonEnabled(
      email.includes("@") && phone.length === 11 && concern.trim().length > 0,
    );
  }, [email, phone, concern]);

  const handlePhoneChange = (e) => {
    const onlyNums = e.target.value.replace(/\D/g, "");
    if (onlyNums.length <= 11) setPhone(onlyNums);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(buildApiUrl("/api/contact"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          contactNumber: phone,
          concern,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send inquiry");
      }

      setEmail("");
      setPhone("");
      setConcern("");
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  const getAppearClass = (delayClass) =>
    `transition-all duration-1000 transform ${delayClass} ${
      isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
    }`;

  const fields = [
    {
      id: "email",
      label: "Email Address",
      icon: mail,
      alt: "email",
      type: "email",
      value: email,
      onChange: (e) => setEmail(e.target.value),
      delay: "delay-[600ms]",
      isTextarea: false,
    },
    {
      id: "phone",
      label: "Contact Number",
      icon: contact,
      alt: "phone",
      type: "text",
      value: phone,
      onChange: handlePhoneChange,
      delay: "delay-[700ms]",
      isTextarea: false,
    },
    {
      id: "concern",
      label: "How can we help?",
      icon: pencil,
      alt: "edit",
      type: "text",
      value: concern,
      onChange: (e) => setConcern(e.target.value),
      delay: "delay-[800ms]",
      isTextarea: true,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF5E9] overflow-x-hidden">
      <Navbar />

      <main className="flex-grow flex flex-col items-center py-12 sm:py-16 px-5 sm:px-8 lg:px-20">
        {/* Page title */}
        <h1
          className={`${getAppearClass("delay-[100ms]")} text-4xl sm:text-5xl md:text-7xl font-bold text-[#F47920] mt-16 sm:mt-10 mb-10 sm:mb-20 tracking-tight`}
        >
          Contact Us
        </h1>

        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 lg:gap-24 items-start">
          {/* Left — heading + tagline */}
          <div
            className={`${getAppearClass("delay-[300ms]")} flex flex-col gap-4 sm:gap-6`}
          >
            <h2 className="text-5xl sm:text-7xl md:text-8xl font-black text-[#F47920] leading-none tracking-tighter">
              Get in <br /> touch
            </h2>
            <div className="flex items-center gap-4 sm:gap-6 mt-2 sm:mt-4">
              <div className="w-1.5 sm:w-2 h-20 sm:h-24 bg-[#F47920] rounded-full shrink-0 shadow-[2px_0_10px_rgba(244,121,32,0.3)]" />
              <p className="text-gray-700 text-base sm:text-xl leading-relaxed max-w-md font-medium italic">
                We're here to help! Whether you have a question about a recipe
                or just want to say hi, drop us a message.
              </p>
            </div>
          </div>

          {/* Right — form */}
          <div className="flex flex-col gap-2 w-full">
            {fields.map(
              ({
                id,
                label,
                icon,
                alt,
                type,
                value,
                onChange,
                delay,
                isTextarea,
              }) => (
                <div
                  key={id}
                  className={`${getAppearClass(delay)} relative mb-5 sm:mb-6 group`}
                >
                  {/* Icon */}
                  <div
                    className={`absolute left-4 ${isTextarea ? "top-5 sm:top-6" : "top-1/2 -translate-y-1/2"} w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center`}
                  >
                    <img
                      src={icon}
                      alt={alt}
                      style={orangeFilter}
                      className={`w-full h-full object-contain transition-all duration-300 ${focusedField === id ? "opacity-100 scale-110" : "opacity-40"}`}
                    />
                  </div>

                  {/* Floating label */}
                  <label
                    className={`absolute left-11 sm:left-12 transition-all duration-200 px-1.5 sm:px-2 bg-[#FFF5E9] pointer-events-none
                  ${
                    focusedField === id || value.length > 0
                      ? "-top-2.5 text-xs text-[#F47920] font-bold"
                      : isTextarea
                        ? "top-5 sm:top-6 text-sm sm:text-base text-gray-400"
                        : "top-1/2 -translate-y-1/2 text-sm sm:text-base text-gray-400"
                  }`}
                  >
                    {label}
                  </label>

                  {isTextarea ? (
                    <textarea
                      value={value}
                      onFocus={() => setFocusedField(id)}
                      onBlur={() => setFocusedField("")}
                      onChange={onChange}
                      className="w-full pl-11 sm:pl-12 pr-4 py-5 sm:py-6 bg-transparent border-2 border-[#0060A9] rounded-2xl h-36 sm:h-44 resize-none outline-none focus:ring-4 focus:ring-[#0060A9]/10 transition-all text-sm sm:text-base"
                    />
                  ) : (
                    <input
                      type={type}
                      value={value}
                      onFocus={() => setFocusedField(id)}
                      onBlur={() => setFocusedField("")}
                      onChange={onChange}
                      className="w-full pl-11 sm:pl-12 pr-4 py-3.5 sm:py-4 bg-transparent border-2 border-[#0060A9] rounded-2xl outline-none focus:ring-4 focus:ring-[#0060A9]/10 transition-all text-sm sm:text-base"
                    />
                  )}
                </div>
              ),
            )}

            {/* Submit */}
            <div className={getAppearClass("delay-[900ms]")}>
              <button
                disabled={!isButtonEnabled || loading}
                onClick={handleSubmit}
                className={`w-full py-4 sm:py-5 rounded-2xl text-white font-black text-lg sm:text-xl shadow-xl transition-all duration-300 transform active:scale-95
                  ${
                    isButtonEnabled
                      ? "bg-gradient-to-r from-[#F47920] to-[#FF8C38] hover:shadow-orange-200 hover:-translate-y-1 opacity-100"
                      : "bg-gray-300 cursor-not-allowed opacity-50 grayscale"
                  }`}
              >
                {loading ? "Sending..." : "Send Inquiry"}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ContactUs;
