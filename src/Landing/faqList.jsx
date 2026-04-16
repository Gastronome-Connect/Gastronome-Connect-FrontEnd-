import { useState } from "react";

const FAQList = ({ faqs }) => {
  const [openItems, setOpenItems] = useState([]);

  const toggleItem = (index) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  return (
    <div className="space-y-4">
      {faqs.length > 0 ? (
        faqs.map((faq, i) => {
          const isOpen = openItems.includes(i);

          return (
            <div
              key={i}
              className={`group transition-all duration-700 rounded-2xl border-2 ${
                isOpen
                  ? "border-orange-400 bg-white shadow-xl"
                  : "border-orange-200/50 bg-white/40 hover:bg-white/80"
              }`}
            >
              <button
                className="w-full flex justify-between items-center p-6 text-left"
                onClick={() => toggleItem(i)}
              >
                <span
                  className={`text-lg font-bold ${
                    isOpen ? "text-[#F57600]" : "text-slate-700"
                  }`}
                >
                  {faq.question}
                </span>

                <svg
                  className={`w-6 h-6 transition-transform duration-300 ${
                    isOpen ? "rotate-180 text-[#F57600]" : "text-orange-300"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div
                className={`overflow-hidden transition-all duration-500 ${
                  isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-6 text-orange-900/80 border-t border-orange-50 mt-1 pt-4">
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-center mt-5">No FAQs available.</p>
      )}
    </div>
  );
};

export default FAQList;
