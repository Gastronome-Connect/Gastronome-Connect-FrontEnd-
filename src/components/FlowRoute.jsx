import React from "react";
import { useLocation } from "react-router-dom";
import { Navigate } from "react-router-dom";
import {
  canAccessAllergens,
  getSignupRedirectRoute,
  getSourceFlow,
  hasPendingFlow,
  isSignupVerified,
} from "../utils/signupFlow";

/**
 * FlowRoute - Only allows access during signup/forgot-password flow
 * For pages like /verification, /likes, /dislikes
 * Requires sourceFlow and pendingEmail in sessionStorage (not manipulatable via localStorage)
 * Redirects to /login if accessed outside the flow
 */
const FlowRoute = ({ Component }) => {
  const location = useLocation();
  const sourceFlow = getSourceFlow();
  const path = location.pathname;

  // Not in flow - redirect to login
  if (!hasPendingFlow()) {
    return <Navigate to="/login" replace />;
  }

  if (sourceFlow === "forgotpassword") {
    return path === "/verification" ? (
      <Component />
    ) : (
      <Navigate to="/verification" replace />
    );
  }

  if (sourceFlow !== "signup") {
    return <Navigate to="/login" replace />;
  }

  if (!isSignupVerified()) {
    return path === "/verification" ? (
      <Component />
    ) : (
      <Navigate to="/verification" replace />
    );
  }

  if (path === "/verification") {
    return <Navigate to={getSignupRedirectRoute()} replace />;
  }

  if (path === "/allergens" && !canAccessAllergens()) {
    return <Navigate to="/preferences" replace />;
  }

  // User is in the signup/recovery flow - allow access
  return <Component />;
};

export default FlowRoute;
