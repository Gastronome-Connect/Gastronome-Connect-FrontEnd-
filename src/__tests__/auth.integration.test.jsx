import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AuthPage from "../userAuth/AuthPage";
import Signup from "../userAuth/Signup";
import ProtectedRoute from "../components/ProtectedRoute";

jest.mock("../components/Carousel Background/BackgroundCarousel", () => () => (
  <div data-testid="background-carousel" />
));
jest.mock("../components/Loading Pages/buffer", () => () => (
  <div data-testid="loading-buffer">Loading...</div>
));
jest.mock("../components/Popups/ResendPopup", () => ({ onContinue }) => (
  <button onClick={onContinue}>Continue</button>
));

const createJsonResponse = (data, { ok = true, status = 200 } = {}) =>
  Promise.resolve({
    ok,
    status,
    json: async () => data,
  });

const makeToken = (payload) => {
  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}.sig`;
};

const renderAuthRoutes = (initialEntry) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/feed"
          element={<ProtectedRoute Component={() => <div>Feed destination</div>} />}
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute
              Component={() => <div>Admin destination</div>}
              requireAdmin={true}
            />
          }
        />
        <Route path="/verification" element={<div>Verification destination</div>} />
        <Route path="/401" element={<div>401 page</div>} />
        <Route path="/403" element={<div>403 page</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe("frontend auth integration", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    global.fetch = jest.fn();
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1280,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("logs in a regular user and navigates to the protected feed", async () => {
    global.fetch.mockImplementation(() =>
      createJsonResponse({
        accessToken: makeToken({ userId: "user-1", role: "user" }),
        user: { _id: "user-1" },
      }),
    );

    renderAuthRoutes("/login?mode=login");

    await userEvent.type(
      screen.getByLabelText(/email address or admin username/i),
      "cook@example.com",
    );
    await userEvent.type(screen.getByLabelText(/^password$/i), "Passw0rd!");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText("Feed destination")).toBeInTheDocument();
    expect(localStorage.getItem("accessToken")).toContain("sig");
    expect(localStorage.getItem("userId")).toBe("user-1");
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/login",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      }),
    );
  });

  test("logs in an admin and reaches the protected admin route", async () => {
    global.fetch.mockImplementation(() =>
      createJsonResponse({
        accessToken: makeToken({ userId: "admin-1", role: "admin" }),
      }),
    );

    renderAuthRoutes("/login?mode=login");

    await userEvent.type(
      screen.getByLabelText(/email address or admin username/i),
      "admin",
    );
    await userEvent.type(screen.getByLabelText(/^password$/i), "Adm!nPass1");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText("Admin destination")).toBeInTheDocument();
    expect(localStorage.getItem("adminAccessToken")).toContain("sig");
  });

  test("validates signup email and advances to verification with stored session data", async () => {
    global.fetch.mockImplementation(() => createJsonResponse({ message: "ok" }));

    renderAuthRoutes("/signup");
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    fireEvent.change(emailInput, { target: { value: "new@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "StrongPass1!" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "StrongPass1!" },
    });

    await act(async () => {
      await userEvent.click(screen.getByRole("button", { name: /sign up/i }));
    });

    expect(await screen.findByText("Verification destination")).toBeInTheDocument();
    expect(sessionStorage.getItem("pendingEmail")).toBe("new@example.com");
    expect(sessionStorage.getItem("sourceFlow")).toBe("signup");

    const tempSignupData = JSON.parse(sessionStorage.getItem("tempSignupData"));
    expect(tempSignupData).toMatchObject({
      email: "new@example.com",
      password: "StrongPass1!",
      confirmPassword: "StrongPass1!",
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/validate",
        expect.objectContaining({
          method: "POST",
          credentials: "include",
        }),
      );
    });
  });
});