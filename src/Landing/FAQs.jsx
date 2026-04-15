import { useState, useEffect, useRef } from "react";
import { buildApiUrl } from "../utils/api";

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [openItems, setOpenItems] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchFAQs = async () => {
      setLoading(true);
      try {
        const res = await fetch(buildApiUrl("/api/faqs"));
        if (!res.ok) throw new Error("Failed to fetch FAQs");
        const data = await res.json();
        setFaqs(data);
      } catch (err) {
        console.error("Error fetching FAQs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFAQs();
  }, []);

  const toggleItem = (index) => {
    setOpenItems((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index],
    );
  };

  return (
    <section
      id="faq-section"
      ref={sectionRef}
      className="bg-[#FDEEE0] py-16 sm:py-24 px-4 sm:px-6 md:px-16 min-h-screen"
    >
      <div
        className={`max-w-3xl mx-auto transition-all duration-1000 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="inline-block px-3 sm:px-4 py-1 mb-3 sm:mb-4 text-xs sm:text-sm font-bold tracking-widest uppercase bg-orange-200 text-[#F57600] rounded-full">
            Help Center
          </h2>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
            Frequently Asked{" "}
            <span className="text-[#F57600]">Questions</span>
          </h1>
        </div>

        {/* FAQ List */}
        {loading ? (
          <p className="text-center text-sm text-gray-500">Loading FAQs...</p>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, i) => {
              const isOpen = openItems.includes(i);
              return (
                <div
                  key={faq._id || i}
                  style={{ transitionDelay: isVisible ? `${i * 100}ms` : "0ms" }}
                  className={`transition-all duration-700 rounded-xl sm:rounded-2xl border-2 ${
                    isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                  } ${
                    isOpen
                      ? "border-orange-400 bg-white shadow-xl"
                      : "border-orange-200/50 bg-white/40 hover:bg-white/80"
                  }`}
                >
                  <button
                    className="w-full flex justify-between items-center gap-3 p-4 sm:p-6 text-left"
                    onClick={() => toggleItem(i)}
                  >
                    <span
                      className={`text-sm sm:text-lg font-bold leading-snug ${
                        isOpen ? "text-[#F57600]" : "text-slate-700"
                      }`}
                    >
                      {faq.question}
                    </span>

                    {/* Chevron — fixed size, never shrinks */}
                    <span className="shrink-0">
                      <svg
                        className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 ${
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
                    </span>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-500 ${
                      isOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-sm sm:text-base text-orange-900/80 border-t border-orange-50 mt-1 pt-3 sm:pt-4 leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}