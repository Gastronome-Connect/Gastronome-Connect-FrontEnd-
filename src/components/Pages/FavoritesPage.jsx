import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../../Feed/SideBar";
import SearchBar from "../../Feed/SideBarSearchBar";
import RecipeCard from "../Cards/RecipeCard";
import { AnimatePresence } from "framer-motion";
import GastroLogo from "../Assets/GastroLogo.png";
import { HiChevronDown, HiChevronLeft, HiChevronRight } from "react-icons/hi";
import UploadProgressToast from "../Toast/UploadProgressToast";
import UploadFailedModal   from "../Modals/Create Post Components/UploadFailedModal";
import useUpload           from "../../Hooks/UseUpload";
import SkeletonRecipeGrid  from "../Skeletons/SkeletonRecipeGrid";

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "oldest", label: "Oldest First" },
  { value: "az",     label: "A → Z" },
  { value: "za",     label: "Z → A" },
];

const ITEMS_PER_PAGE = 10;

const FavoritesPage = () => {
  const [isCollapsed, setIsCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy]           = useState("recent");
  const [sortOpen, setSortOpen]       = useState(false);
  const [isLoading, setIsLoading]     = useState(true);
  const sortRef = useRef(null);

  const { uploadState, progress, startUpload, retryUpload, cancelUpload, resetUpload } = useUpload();
  const handleNewPost = (newPost) => startUpload(newPost, () => {});

  useEffect(() => {
    const handler = () => setIsCollapsed(localStorage.getItem("sidebar-collapsed") === "true");
    window.addEventListener("sidebarStateChange", handler);
    return () => window.removeEventListener("sidebarStateChange", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const [recipes, setRecipes] = useState([]);

  // Simulate / replace with real API call
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const isEmpty    = !isLoading && recipes.length === 0;
  const totalPages = Math.ceil(recipes.length / ITEMS_PER_PAGE);
  const paginatedRecipes = recipes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] overflow-x-hidden">
      <aside className={`fixed inset-y-0 left-0 z-40 hidden lg:block transition-all duration-300 ease-in-out bg-white shadow-xl ${isCollapsed ? "w-[80px]" : "w-[288px]"}`}>
        <Sidebar onNewPost={handleNewPost} />
      </aside>
      <div className="lg:hidden"><Sidebar onNewPost={handleNewPost} /></div>

      <main className={`flex-1 transition-all duration-300 ease-in-out p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 ${isCollapsed ? "lg:ml-[80px]" : "lg:ml-[288px]"}`}>
        <div className="max-w-[1400px] mx-auto flex flex-col" style={{ minHeight: "calc(100vh - 64px)" }}>

          {/* Header */}
          <header className="mb-4 shrink-0">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">Favorites</h1>
              <div className="flex-1 h-[2px] bg-gradient-to-r from-orange-400/30 to-transparent rounded-full" />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="w-full sm:max-w-md">
                <SearchBar placeholder="Search your favorites..." />
              </div>
              <div className="relative self-end sm:self-auto" ref={sortRef}>
                <button
                  onClick={() => setSortOpen((o) => !o)}
                  className={`flex items-center gap-2 bg-white border rounded-xl pl-3 sm:pl-4 pr-2 sm:pr-3 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-gray-700 shadow-sm transition-all w-36 sm:w-44 justify-between
                    ${sortOpen ? "border-[#F57600] ring-2 sm:ring-4 ring-orange-100 text-[#F57600]" : "border-gray-200 hover:border-orange-300"}`}
                >
                  <span>{SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Sort"}</span>
                  <HiChevronDown size={14} className={`transition-transform duration-200 text-[#F57600] ${sortOpen ? "rotate-180" : ""}`} />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 mt-1.5 w-36 sm:w-44 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setSortOpen(false); setCurrentPage(1); }}
                        className={`w-full flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-colors
                          ${sortBy === opt.value ? "bg-orange-50 text-[#F57600]" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                      >
                        <span>{opt.label}</span>
                        {sortBy === opt.value && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#F57600]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 relative">
            {/* ── Skeleton ── */}
            {isLoading && <SkeletonRecipeGrid count={10} />}

            {/* ── Empty state ── */}
            {isEmpty && (
              <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
                <img src={GastroLogo} alt="" aria-hidden="true" className="w-40 sm:w-56 lg:w-64 h-40 sm:h-56 lg:h-64 object-contain opacity-90" />
                <div className="text-center mt-2">
                  <p className="text-lg sm:text-xl font-black text-gray-700 tracking-tight">No Favorites Yet</p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-[200px] sm:max-w-[240px] mx-auto leading-relaxed">
                    Browse recipes and save the ones you love here.
                  </p>
                </div>
              </div>
            )}

            {/* ── Recipe grid ── */}
            {!isLoading && !isEmpty && (
              <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                  {paginatedRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      variant="favorite"
                      onDelete={() => setRecipes((prev) => prev.filter((r) => r.id !== recipe.id))}
                    />
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="flex justify-center items-center mt-4 sm:mt-6 mb-2 gap-1 sm:gap-1.5 shrink-0" aria-label="Pagination">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="w-8 sm:w-9 h-8 sm:h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-[#F57600] hover:bg-orange-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                <HiChevronLeft size={18} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button key={num} onClick={() => setCurrentPage(num)}
                  className={`w-8 sm:w-9 h-8 sm:h-9 rounded-full font-bold text-xs sm:text-sm transition-all
                    ${num === currentPage ? "bg-gradient-to-br from-[#F57600] to-[#F0AE35] text-white shadow-md shadow-orange-200" : "text-gray-400 hover:bg-orange-50 hover:text-[#F57600]"}`}>
                  {num}
                </button>
              ))}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="w-8 sm:w-9 h-8 sm:h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-[#F57600] hover:bg-orange-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                <HiChevronRight size={18} />
              </button>
            </nav>
          )}
        </div>
      </main>

      <UploadProgressToast uploadState={uploadState === "failed" ? "idle" : uploadState} progress={progress} onDone={resetUpload} />
      <UploadFailedModal isOpen={uploadState === "failed"} onRetry={retryUpload} onCancel={cancelUpload} />
    </div>
  );
};

export default FavoritesPage;