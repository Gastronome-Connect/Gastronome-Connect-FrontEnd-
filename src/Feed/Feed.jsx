import { useState, useEffect, useRef, useCallback } from "react";

import Sidebar             from "../Feed/SideBar";
import Searchbar           from "./Searchbar";
import HeroBanner          from "../components/Feed Components/FeedHeroBanner";
import Recommendation      from "../components/Feed Components/RecommendationPanel";
import PopularRecipes      from "../components/Feed Components/PopularRecipePanel";
import AIChatbotWidget     from "../components/Feed Components/ChatbotWidget";
import PostCard            from "../Feed/Post Card/PostCard";
import UploadProgressToast from "../components/Toast/UploadProgressToast";
import UploadFailedModal   from "../components/Modals/Create Post Components/UploadFailedModal";
import useUpload           from "../Hooks/UseUpload";
import { SkeletonPostList } from "../components/Skeletons";
import { buildApiUrl } from "../utils/api";

const PAGE_SIZE = 10;

const LazyItem = ({ children, placeholderHeight = 320 }) => {
  const ref             = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setShow(true); observer.disconnect(); } },
      { rootMargin: "300px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={!show ? { minHeight: `${placeholderHeight}px` } : undefined}>
      {show ? children : null}
    </div>
  );
};

const InfiniteScrollTrigger = ({ onTrigger, hasMore, isLoading }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasMore || isLoading) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onTrigger(); },
      { rootMargin: "400px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onTrigger, hasMore, isLoading]);

  return (
    <div ref={ref} className="w-full flex justify-center py-6">
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="w-4 h-4 border-2 border-orange-300 border-t-transparent rounded-full animate-spin" />
          Loading more posts…
        </div>
      )}
    </div>
  );
};

export default function GCFeed() {
  const [posts, setPosts]               = useState([]);
  const [page, setPage]                 = useState(1);
  const [hasMore, setHasMore]           = useState(true);
  const [isFetching, setIsFetching]     = useState(false);
  // ── NEW: tracks whether the very first page has ever loaded ──
  const [initialLoading, setInitialLoading] = useState(true);
  const [chatExpanded, setChatExpanded] = useState(false);
  const mainRef                         = useRef(null);

  const { uploadState, progress, startUpload, retryUpload, cancelUpload, resetUpload } = useUpload();

  const handleNewPost = useCallback(
    (newPost) => { startUpload(newPost, (posted) => { setPosts((prev) => [posted, ...prev]); }); },
    [startUpload]
  );

  const fetchPage = useCallback(async (pageNum) => {
    if (isFetching) return;
    setIsFetching(true);
    try {
      const res  = await fetch(buildApiUrl(`/api/posts?page=${pageNum}&limit=${PAGE_SIZE}`));
      const data = await res.json();
      const incoming  = Array.isArray(data) ? data : (data.posts ?? []);
      const morePages = Array.isArray(data) ? incoming.length === PAGE_SIZE : (data.hasMore ?? false);
      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        return [...prev, ...incoming.filter((p) => !existingIds.has(p.id))];
      });
      setHasMore(morePages);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setIsFetching(false);
      // First page done — hide skeleton
      if (pageNum === 1) setInitialLoading(false);
    }
  }, [isFetching]);

  useEffect(() => { fetchPage(1); }, []); // eslint-disable-line

  const handleLoadMore = useCallback(() => {
    if (!hasMore || isFetching) return;
    const next = page + 1;
    setPage(next);
    fetchPage(next);
  }, [hasMore, isFetching, page, fetchPage]);

  return (
    <div className="flex h-screen w-full bg-gray-50">
      <Sidebar onNewPost={handleNewPost} />

      <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden" style={{ scrollbarGutter: "stable" }}>
        <div className="p-4 sm:p-6 xl:pr-[432px] max-w-[1600px] mx-auto pb-24 lg:pb-6">
          <div className="flex flex-col gap-5 min-w-0">

            <div className="sticky top-0 z-10 py-2 hidden sm:block">
              <Searchbar scrollContainer={mainRef} />
            </div>

            <HeroBanner />
            <Recommendation />

            {/* ── Skeleton shown only on first load ── */}
            {initialLoading && <SkeletonPostList count={3} />}

            {/* ── Empty state (after load, no posts) ── */}
            {!initialLoading && posts.length === 0 && (
              <p className="text-center text-gray-400 py-16">
                No posts yet. Share your first recipe!
              </p>
            )}

            {/* ── Post list ── */}
            {!initialLoading && posts.map((post) => (
              <LazyItem key={post.id} placeholderHeight={320}>
                <PostCard
                  post={post}
                  isOwner
                  onDelete={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
                  onUpdate={(updated) => setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))}
                />
              </LazyItem>
            ))}

            {posts.length > 0 && (
              <InfiniteScrollTrigger onTrigger={handleLoadMore} hasMore={hasMore} isLoading={isFetching} />
            )}

            {!hasMore && posts.length > 0 && (
              <p className="text-center text-xs text-gray-300 py-4 select-none">
                You've reached the end of your feed.
              </p>
            )}
          </div>
        </div>
      </main>

      <div
        className="hidden xl:flex flex-col gap-4 fixed top-6 bottom-6 right-6 w-[400px] z-30"
        style={{ height: "calc(100vh - 3rem)" }}
      >
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <PopularRecipes collapsed={chatExpanded} />
        </div>
        <div className="flex-shrink-0">
          <AIChatbotWidget onExpandChange={setChatExpanded} />
        </div>
      </div>

      <UploadProgressToast uploadState={uploadState === "failed" ? "idle" : uploadState} progress={progress} onDone={resetUpload} />
      <UploadFailedModal isOpen={uploadState === "failed"} onRetry={retryUpload} onCancel={cancelUpload} />
    </div>
  );
}