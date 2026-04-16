import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminLayout from "../Admin Panel/AdminLayout";
import AdminDashboard from "../Admin Panel/AdminDashboard";
import adminApi from "../utils/adminApi";

jest.mock("../utils/adminApi", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const makeToken = (payload) => {
  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}.sig`;
};

describe("admin page integration", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(
      "adminAccessToken",
      makeToken({ userId: "admin-1", role: "admin" }),
    );

    adminApi.get.mockImplementation((path) => {
      if (path === "/admin/dashboard/stats") {
        return Promise.resolve({
          data: {
            totalUsers: 12,
            activeUsers: 8,
            totalPosts: 32,
            totalLikes: 99,
            totalComments: 18,
            totalReposts: 4,
          },
        });
      }

      if (path === "/admin/timeout-users") {
        return Promise.resolve({ data: [{ id: 1 }, { id: 2 }] });
      }

      if (path === "/admin/deleted-accounts") {
        return Promise.resolve({ data: [{ id: 10 }] });
      }

      return Promise.reject(new Error(`Unhandled admin path: ${path}`));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("loads dashboard data and navigates to another admin page", async () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute Component={AdminLayout} requireAdmin={true} />
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="restore" element={<div>Restore Accounts Route</div>} />
            <Route path="timeout" element={<div>Timeout Users Route</div>} />
            <Route path="statistics" element={<div>Statistics Route</div>} />
          </Route>
          <Route path="/401" element={<div>401 page</div>} />
          <Route path="/403" element={<div>403 page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText(/dashboard overview/i)).toBeInTheDocument();
    expect(await screen.findByText("Total Users")).toBeInTheDocument();
    expect(await screen.findByText("12")).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /restore accounts/i }),
    );

    expect(
      await screen.findByText("Restore Accounts Route"),
    ).toBeInTheDocument();
    await waitFor(() => expect(adminApi.get).toHaveBeenCalledTimes(3));
  });

  test("logs out from the admin sidebar and routes to login", async () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute Component={AdminLayout} requireAdmin={true} />
            }
          >
            <Route index element={<AdminDashboard />} />
          </Route>
          <Route path="/login" element={<div>Login Route</div>} />
          <Route path="/401" element={<div>401 page</div>} />
          <Route path="/403" element={<div>403 page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText(/dashboard overview/i)).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText(/open admin logout modal/i));
    expect(
      await screen.findByText(/redirected to the login page/i),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /yes, log out/i }),
    );

    expect(await screen.findByText("Login Route")).toBeInTheDocument();
    expect(localStorage.getItem("adminAccessToken")).toBeNull();
    expect(localStorage.getItem("accessToken")).toBeNull();
  });
});
