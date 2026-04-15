import React from "react";
import { jwtDecode } from "jwt-decode";
import Error401 from "./Error Pages/Error401";
import Error403 from "./Error Pages/Error403";

/**
 * ProtectedRoute - Wraps components that require authentication
 * Shows Error401 if not authenticated
 * Shows Error403 if authenticated but lacks required role
 */
const ProtectedRoute = ({ Component, requireAdmin = false }) => {
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

  // Not authenticated - show Error401
  if (!isAuthenticated()) {
    return <Error401 />;
  }

  // Requires admin but user is not admin - show Error403
  if (requireAdmin && !isAdmin()) {
    return <Error403 />;
  }

  // User is authenticated and has required permissions - render component
  return <Component />;
};

export default ProtectedRoute;
