import React from "react";
import { createBrowserRouter, Outlet } from "react-router-dom";
import { CarouselProvider } from "./components/Carousel Background/CarouselContext";
import { ChatProvider } from "./Context/ChatContext";
import { NotificationProvider } from "./Context/NotificationContext";

import ChatbotPage from "./components/Pages/Chatbot";
import NotificationsPage from "./components/Pages/NotificationPage";

// Landing Pages
import Home from "./Landing/Home";
import AboutUs from "./Landing/AboutUs";
import ContactUs from "./Landing/ContactUs";
import LogIn from "./userAuth/AuthPage";
import Feed from "./Feed/Feed";

// Protected Route
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import FlowRoute from "./components/FlowRoute";

// Create Account
import Verification from "./userAuth/Verification";
import Preferences from "./userAuth/Preferences";
import Allergens from "./userAuth/Allergens";
import Buffer from "./components/Loading Pages/buffer";
import Error from "./components/Loading Pages/error";

// User Account
import ForgotPassword from "./userAuth/Forgotpass";
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
import ReportedProfiles from "./Admin Panel/ReportedProfiles";
import AdminNotificationsPage from "./Admin Panel/AdminNotificationsPage";

// Error boundary
import ErrorBoundary from "./components/Error Pages/ErrorBoundary";
import SessionManager from "./components/SessionManager";

import { UserLibraryProvider } from "./Context/UserLibraryContext";

const RootLayout = () => (
  <ErrorBoundary>
    <ChatProvider>
      <CarouselProvider>
        <UserLibraryProvider>
          <NotificationProvider>
            <SessionManager />
            <Outlet />
          </NotificationProvider>
        </UserLibraryProvider>
      </CarouselProvider>
    </ChatProvider>
  </ErrorBoundary>
);

const AdminLayoutWithBoundary = () => (
  <ErrorBoundary fallbackTitle="Admin panel failed to load">
    <AdminLayout />
  </ErrorBoundary>
);

const ProtectedAdminLayout = () => (
  <ProtectedRoute Component={AdminLayoutWithBoundary} requireAdmin={true} />
);

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: "home", Component: Home },
      {
        path: "about-us",
        Component: () => <PublicRoute Component={AboutUs} />,
      },
      {
        path: "contact-us",
        Component: () => <PublicRoute Component={ContactUs} />,
      },

      { path: "login", Component: () => <PublicRoute Component={LogIn} /> },
      {
        path: "verification",
        Component: () => <FlowRoute Component={Verification} />,
      },
      {
        path: "preferences",
        Component: () => <FlowRoute Component={Preferences} />,
      },
      {
        path: "allergens",
        Component: () => <FlowRoute Component={Allergens} />,
      },
      {
        path: "forgot-password",
        Component: () => <PublicRoute Component={ForgotPassword} />,
      },
      {
        path: "profchangepass",
        Component: () => (
          <ProtectedRoute Component={ProfChangePassword} blockAdmin={true} />
        ),
      },

      {
        path: "feed",
        Component: () => <ProtectedRoute Component={Feed} blockAdmin={true} />,
      },
      { path: "sidebar", Component: SideBar },
      { path: "searchbar", Component: SearchBar },
      { path: "navigationbar", Component: NavigationBar },

      {
        path: "profile",
        Component: () => (
          <ProtectedRoute Component={GCProfile} blockAdmin={true} />
        ),
      },
      {
        path: "profile/:userId",
        Component: () => (
          <ProtectedRoute Component={GCProfile} blockAdmin={true} />
        ),
      },

      {
        path: "history",
        Component: () => (
          <ProtectedRoute Component={History} blockAdmin={true} />
        ),
      },
      {
        path: "favorites",
        Component: () => (
          <ProtectedRoute Component={Favorites} blockAdmin={true} />
        ),
      },
      {
        path: "archives",
        Component: () => (
          <ProtectedRoute Component={Archives} blockAdmin={true} />
        ),
      },
      {
        path: "chatbot",
        Component: () => (
          <ProtectedRoute Component={ChatbotPage} blockAdmin={true} />
        ),
      },
      {
        path: "notifications",
        Component: () => (
          <ProtectedRoute Component={NotificationsPage} blockAdmin={true} />
        ),
      },

      { path: "buffer", Component: Buffer },
      { path: "error", Component: Error },

      {
        path: "admin",
        Component: ProtectedAdminLayout,
        children: [
          { index: true, Component: AdminDashboard },
          { path: "timeout", Component: TimeoutUsers },
          { path: "restore", Component: RestoreAccounts },
          { path: "flagged", Component: FlaggedPosts },
          { path: "reported", Component: ReportedComments },
          { path: "reported-profiles", Component: ReportedProfiles },
          { path: "notifications", Component: AdminNotificationsPage },
          { path: "statistics", Component: Statistics },
        ],
      },

      { path: "401", Component: Error401 },
      { path: "403", Component: Error403 },
      { path: "500", Component: Error500 },
      { path: "*", Component: Error404 },
    ],
  },
]);
