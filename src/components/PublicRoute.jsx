import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  getSignupRedirectPath,
  isForgotPasswordFlowActive,
  isForgotPasswordResetVerified,
  isSignupFlowActive,
} from "../utils/signupFlow";

/**
 * PublicRoute - Only allows unauthenticated users
 * For pages like /login, /signup, /home (landing)
 * Redirects to /feed or /admin if user is already authenticated
 */
const PublicRoute = ({ Component }) => {
  const location = useLocation();

  const getStoredToken = () => {
    return (
      localStorage.getItem("adminAccessToken") ||
      localStorage.getItem("accessToken")
    );
  };

  const isAuthenticated = () => {
    const token = getStoredToken();
    return !!token;
  };

  const isAdmin = () => {
    try {
      const token = getStoredToken();
      if (!token) return false;
      const decoded = jwtDecode(token);
      return decoded.role === "admin";
    } catch {
      return false;
    }
  };

  // User is already authenticated - redirect to appropriate page
  if (isAuthenticated()) {
    // Admin users go to admin dashboard
    if (isAdmin()) {
      return <Navigate to="/admin" replace />;
    }
    // Regular users go to feed
    return <Navigate to="/feed" replace />;
  }

  if (isSignupFlowActive()) {
    return <Navigate to={getSignupRedirectPath() || "/verification"} replace />;
  }

  if (isForgotPasswordFlowActive()) {
    if (
      location.pathname === "/reset-password" &&
      isForgotPasswordResetVerified()
    ) {
      return <Component />;
    }

    return <Navigate to="/verification" replace />;
  }

  // User is not authenticated, allow access to public page
  return <Component />;
};

export default PublicRoute;
