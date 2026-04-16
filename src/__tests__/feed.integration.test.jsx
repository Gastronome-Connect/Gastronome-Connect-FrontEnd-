import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Feed from "../Feed/Feed";
import { UserLibraryProvider } from "../Context/UserLibraryContext";

jest.mock("../Feed/SideBar", () => () => <div>Sidebar</div>);
jest.mock("../Feed/Searchbar", () => () => <div>Searchbar</div>);
jest.mock("../components/Feed Components/FeedHeroBanner", () => () => (
  <div>Hero Banner</div>
));
jest.mock("../components/Feed Components/RecommendationPanel", () => () => (
  <div>Recommendation</div>
));
jest.mock("../components/Feed Components/PopularRecipePanel", () => () => (
  <div>Popular Recipes</div>
));
jest.mock("../components/Feed Components/ChatbotWidget", () => () => (
  <div>Chatbot Widget</div>
));
jest.mock("../components/Toast/UploadProgressToast", () => () => null);
jest.mock(
  "../components/Modals/Create Post Components/UploadFailedModal",
  () => () => null,
);
jest.mock("../Hooks/UseUpload", () => () => ({
  uploadState: "idle",
  progress: 0,
  startUpload: jest.fn(),
  retryUpload: jest.fn(),
  cancelUpload: jest.fn(),
  resetUpload: jest.fn(),
}));
jest.mock("../components/Skeletons", () => ({
  SkeletonPostList: () => <div>Loading skeleton</div>,
}));
jest.mock("../Feed/Post Card/PostCard", () => ({ post }) => (
  <article data-testid="post-card">{post.caption || post.title}</article>
));

const createJsonResponse = (data) =>
  Promise.resolve({
    ok: true,
    json: async () => data,
  });

describe("feed integration", () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      createJsonResponse([
        { id: "post-1", caption: "First integration post" },
        { id: "post-2", caption: "Second integration post" },
      ]),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("loads posts from the API and renders them in the feed", async () => {
    render(
      <UserLibraryProvider>
        <MemoryRouter>
          <Feed />
        </MemoryRouter>
      </UserLibraryProvider>,
    );

    expect(
      await screen.findByText("First integration post"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Second integration post"),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId("post-card")).toHaveLength(2);
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/posts?page=1&limit=10",
    );
  });
});
