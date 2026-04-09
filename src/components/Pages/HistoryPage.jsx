import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Sidebar from "../../Feed/SideBar";
import SearchBar from "../../Feed/SideBarSearchBar";
import RecipeCard from "../Cards/RecipeCard";
import { AnimatePresence } from "framer-motion";
import ClearAllPopup from "../Popups/CAPopup";
import UndoToast from "../Toast/UndoToast";
import GastroLogo from "../Assets/GastroLogo.png";
import { HiChevronDown, HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { Trash2 } from "lucide-react";
import UploadProgressToast from "../Toast/UploadProgressToast";
import UploadFailedModal   from "../Modals/Create Post Components/UploadFailedModal";
import useUpload           from "../../Hooks/UseUpload";

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "oldest", label: "Oldest First" },
  { value: "az",     label: "A → Z" },
  { value: "za",     label: "Z → A" },
];

const ITEMS_PER_PAGE = 10;

const HistoryPage = () => {
  const [isCollapsed, setIsCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );
  const [showClearPopup, setShowClearPopup] = useState(false);
  const [currentPage, setCurrentPage]       = useState(1);
  const [sortBy, setSortBy]                 = useState("recent");
  const [sortOpen, setSortOpen]             = useState(false);
  const sortRef = useRef(null);

  const {
    uploadState,
    progress,
    startUpload,
    retryUpload,
    cancelUpload,
    resetUpload,
  } = useUpload();

  const handleNewPost = (newPost) => {
    startUpload(newPost, () => {});
  };

  // ── Undo state ──────────────────────────────────────────────────────────────
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    snapshot: null,
  });

  const showUndo = useCallback((message, snapshot) => {
    setToast({ visible: false, message: "", snapshot: null });
    requestAnimationFrame(() =>
      setToast({ visible: true, message, snapshot })
    );
  }, []);

  const handleUndo = useCallback(() => {
    if (toast.snapshot !== null) setRecipes(toast.snapshot);
    setToast((t) => ({ ...t, visible: false }));
  }, [toast.snapshot]);

  const handleDismiss = useCallback(() => {
    setToast((t) => ({ ...t, visible: false }));
  }, []);
  // ────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const handler = () =>
      setIsCollapsed(localStorage.getItem("sidebar-collapsed") === "true");
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

  // ── Replace this with your real data source (API call, context, props, etc.) ──
  const [recipes, setRecipes] = useState([]);
  // ─────────────────────────────────────────────────────────────────────────────

  const isEmpty = recipes.length === 0;

  const sortedRecipes = useMemo(() => {
    const copy = [...recipes];
    switch (sortBy) {
      case "oldest": return copy.sort((a, b) => new Date(a.dateCreate) - new Date(b.dateCreate));
      case "az":     return copy.sort((a, b) => a.title.localeCompare(b.title));
      case "za":     return copy.sort((a, b) => b.title.localeCompare(a.title));
      default:       return copy.sort((a, b) => new Date(b.dateCreate) - new Date(a.dateCreate));
    }
  }, [recipes, sortBy]);

  // Derived: total pages based on sorted data length
  const totalPages = Math.ceil(sortedRecipes.length / ITEMS_PER_PAGE);

  // Slice sorted recipes for the current page
  const paginatedRecipes = sortedRecipes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Keep currentPage in bounds if recipes shrink (e.g. after delete / clear)
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleDelete = useCallback((id) => {
    const snapshot = recipes;
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    showUndo("Item removed from history", snapshot);
  }, [recipes, showUndo]);

  const handleClearAll = useCallback(() => {
    const snapshot = recipes;
    setRecipes([]);
    setShowClearPopup(false);
    setCurrentPage(1);
    showUndo("History cleared", snapshot);
  }, [recipes, showUndo]);

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] overflow-x-hidden">
      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden lg:block transition-all duration-300 ease-in-out bg-white shadow-xl
          ${isCollapsed ? "w-[80px]" : "w-[288px]"}`}
      >
        <Sidebar onNewPost={handleNewPost} />
      </aside>

      {/* Mobile sidebar (bottom nav) */}
      <div className="lg:hidden">
        <Sidebar onNewPost={handleNewPost} />
      </div>

      <main
        className={`flex-1 transition-all duration-300 ease-in-out
          p-4 sm:p-6 lg:p-8
          pb-24 lg:pb-8
          ${isCollapsed ? "lg:ml-[80px]" : "lg:ml-[288px]"}`}
      >
        <div
          className="max-w-[1400px] mx-auto flex flex-col"
          style={{ minHeight: "calc(100vh - 64px)" }}
        >
          {/* Header */}
          <header className="mb-4 shrink-0">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">
                History
              </h1>
              <div className="flex-1 h-[2px] bg-gradient-to-r from-orange-400/30 to-transparent rounded-full" />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="w-full sm:max-w-md">
                <SearchBar placeholder="Search your history..." />
              </div>

              <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto shrink-0">
                {/* Sort Dropdown */}
                <div className="relative" ref={sortRef}>
                  <button
                    onClick={() => setSortOpen((o) => !o)}
                    className={`flex items-center gap-2 bg-white border rounded-xl pl-3 sm:pl-4 pr-2 sm:pr-3 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-gray-700 shadow-sm transition-all w-32 sm:w-44 justify-between
                      ${sortOpen
                        ? "border-[#F57600] ring-2 sm:ring-4 ring-orange-100 text-[#F57600]"
                        : "border-gray-200 hover:border-orange-300"}`}
                  >
                    <span className="truncate">{SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Sort"}</span>
                    <HiChevronDown
                      size={14}
                      className={`flex-shrink-0 transition-transform duration-200 text-[#F57600] ${sortOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {sortOpen && (
                    <div className="absolute right-0 mt-1.5 w-36 sm:w-44 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setSortBy(opt.value); setSortOpen(false); setCurrentPage(1); }}
                          className={`w-full flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-colors
                            ${sortBy === opt.value
                              ? "bg-orange-50 text-[#F57600]"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                        >
                          <span>{opt.label}</span>
                          {sortBy === opt.value && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#F57600]" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Clear History button */}
                <button
                  onClick={() => setShowClearPopup(true)}
                  disabled={isEmpty}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-500 text-xs sm:text-sm font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-50 disabled:hover:text-red-500 disabled:hover:border-red-100"
                >
                  <Trash2 size={13} />
                  <span className="hidden sm:inline">Clear History</span>
                  <span className="sm:hidden">Clear</span>
                </button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 relative">
            {isEmpty ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
                <img
                  src={GastroLogo} alt="" aria-hidden="true"
                  className="w-40 sm:w-56 lg:w-64 h-40 sm:h-56 lg:h-64 object-contain opacity-90"
                />
                <div className="text-center mt-2">
                  <p className="text-lg sm:text-xl font-black text-gray-700 tracking-tight">
                    No History Yet
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-[200px] sm:max-w-[240px] mx-auto leading-relaxed">
                    Recipes you've viewed will appear here.
                  </p>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                  {paginatedRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      variant="history"
                      onDelete={() => handleDelete(recipe.id)}
                    />
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>

          {/* Pagination — only rendered when there is more than 1 page */}
          {totalPages > 1 && (
            <nav
              className="flex justify-center items-center mt-4 sm:mt-6 mb-2 gap-1 sm:gap-1.5 shrink-0"
              aria-label="Pagination"
            >
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 sm:w-9 h-8 sm:h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-[#F57600] hover:bg-orange-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <HiChevronLeft size={18} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`w-8 sm:w-9 h-8 sm:h-9 rounded-full font-bold text-xs sm:text-sm transition-all
                    ${num === currentPage
                      ? "bg-gradient-to-br from-[#F57600] to-[#F0AE35] text-white shadow-md shadow-orange-200"
                      : "text-gray-400 hover:bg-orange-50 hover:text-[#F57600]"}`}
                >
                  {num}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 sm:w-9 h-8 sm:h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-[#F57600] hover:bg-orange-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <HiChevronRight size={18} />
              </button>
            </nav>
          )}
        </div>
      </main>

      {/* Clear All confirmation popup */}
      {showClearPopup && (
        <ClearAllPopup
          message="Are you sure you want to clear all your recipe history?"
          onConfirm={handleClearAll}
          onCancel={() => setShowClearPopup(false)}
          onCloseAll={() => setShowClearPopup(false)}
        />
      )}

      {/* Undo toast */}
      <UndoToast
        visible={toast.visible}
        message={toast.message}
        onUndo={handleUndo}
        onDismiss={handleDismiss}
      />

      {/* Upload progress toast + failed modal */}
      <UploadProgressToast
        uploadState={uploadState === "failed" ? "idle" : uploadState}
        progress={progress}
        onDone={resetUpload}
      />
      <UploadFailedModal
        isOpen={uploadState === "failed"}
        onRetry={retryUpload}
        onCancel={cancelUpload}
      />
    </div>
  );
};

export default HistoryPage;