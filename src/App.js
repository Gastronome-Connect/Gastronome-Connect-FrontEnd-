import React from "react";
import { createBrowserRouter, Outlet } from "react-router-dom";
import { CarouselProvider } from "./components/Carousel Background/CarouselContext";

import ChatbotPage from "./components/Pages/Chatbot";
import NotificationsPage from "./components/Pages/NotificationPage";

// Landing Pages
import Home from "./Landing/Home";
import AboutUs from "./Landing/AboutUs";
import ContactUs from "./Landing/ContactUs";
import LogIn from "./userAuth/AuthPage";
import SignUp from "./userAuth/Signup";
import Feed from "./Feed/Feed";

// Create Account
import Verification from "./userAuth/Verification";
import Preferences from "./userAuth/Preferences";
import Allergens from "./userAuth/Allergens";
import Buffer from "./components/Loading Pages/buffer";
import Error from "./components/Loading Pages/error";

// User Account
import ForgotPassword from "./userAuth/Forgotpass";
import ResetPassword from "./userAuth/ResetPassword";
import ProfChangePassword from "./userAuth/ProfChangePass";

// Components
import SideBar from "./Feed/SideBar";
import SearchBar from "./Feed/SideBarSearchBar";
import NavigationBar from "./Landing/NavigationBar";

// User Pages
import GCProfile from "./components/Pages/ProfilePage";
import History from "./components/Pages/HistoryPage";
import Favorites from "./components/Pages/FavoritesPage";
import Archives from "./components/Pages/ArchivesPage";

// Error Pages
import Error401 from "./components/Error Pages/Error401";
import Error403 from "./components/Error Pages/Error403";
import Error404 from "./components/Error Pages/Error404";
import Error500 from "./components/Error Pages/Error500";

// Admin Pages
import AdminLayout from "./Admin Panel/AdminLayout";
import AdminDashboard from "./Admin Panel/AdminDashboard";
import TimeoutUsers from "./Admin Panel/TimeoutUser";
import RestoreAccounts from "./Admin Panel/RestoreAccount";
import Statistics from "./Admin Panel/Statistic";
import FlaggedPosts from "./Admin Panel/FlaggedPosts";
import ReportedComments from "./Admin Panel/ReportedComments";

// 👇 Error boundary
import ErrorBoundary from "./components/Error Pages/ErrorBoundary";

// Root layout — CarouselProvider + ErrorBoundary wrap the whole app
const RootLayout = () => (
  <ErrorBoundary>
    <CarouselProvider>
      <Outlet />
    </CarouselProvider>
  </ErrorBoundary>
);

// Admin layout wrapper — separate boundary so admin crashes don't kill the whole app
const AdminLayoutWithBoundary = () => (
  <ErrorBoundary fallbackTitle="Admin panel failed to load">
    <AdminLayout />
  </ErrorBoundary>
);

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      // Landing
      { index: true, Component: Home },
      { path: "home", Component: Home },
      { path: "about-us", Component: AboutUs },
      { path: "contact-us", Component: ContactUs },

      // Auth
      { path: "login", Component: LogIn },
      { path: "signup", Component: SignUp },
      { path: "verification", Component: Verification },
      { path: "preferences", Component: Preferences },
      { path: "allergens", Component: Allergens },
      { path: "forgot-password", Component: ForgotPassword },
      { path: "reset-password", Component: ResetPassword },
      { path: "profchangepass", Component: ProfChangePassword },

      // Feed
      { path: "feed", Component: Feed },
      { path: "sidebar", Component: SideBar },
      { path: "searchbar", Component: SearchBar },
      { path: "navigationbar", Component: NavigationBar },

      // User Pages
      { path: "profile", Component: GCProfile },
      { path: "history", Component: History },
      { path: "favorites", Component: Favorites },
      { path: "archives", Component: Archives },
      { path: "chatbot", Component: ChatbotPage },
      { path: "notifications", Component: NotificationsPage },

      // Utility
      { path: "buffer", Component: Buffer },
      { path: "error", Component: Error },

      // Admin — own ErrorBoundary so it's isolated
      {
        path: "admin",
        Component: AdminLayoutWithBoundary,
        children: [
          { index: true, Component: AdminDashboard },
          { path: "timeout", Component: TimeoutUsers },
          { path: "restore", Component: RestoreAccounts },
          { path: "flagged", Component: FlaggedPosts },
          { path: "reported", Component: ReportedComments },
          { path: "statistics", Component: Statistics },
        ],
      },

      // Error Pages
      { path: "401", Component: Error401 },
      { path: "403", Component: Error403 },
      { path: "500", Component: Error500 },
      { path: "*", Component: Error404 },
    ],
  },
]);
