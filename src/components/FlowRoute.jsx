import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  getSignupRedirectPath,
  getSignupStepForPath,
  isForgotPasswordFlowActive,
  isSignupFlowActive,
} from "../utils/signupFlow";

/**
 * FlowRoute - Only allows access during signup/forgot-password flow
 * For pages like /verification, /likes, /dislikes
 * Requires sourceFlow and pendingEmail in sessionStorage (not manipulatable via localStorage)
 * Redirects to /login if accessed outside the flow
 */
const FlowRoute = ({ Component }) => {
  const location = useLocation();

  const hasFlowState = () => {
    const sourceFlow = sessionStorage.getItem("sourceFlow");
    const pendingEmail = sessionStorage.getItem("pendingEmail");
    return !!sourceFlow && !!pendingEmail;
  };

  // Not in flow - redirect to login
  if (!hasFlowState()) {
    return <Navigate to="/login" replace />;
  }

  if (isForgotPasswordFlowActive() && location.pathname !== "/verification") {
    return <Navigate to="/verification" replace />;
  }

  if (isSignupFlowActive()) {
    const expectedPath = getSignupRedirectPath();
    const requestedStep = getSignupStepForPath(location.pathname);

    if (!requestedStep) {
      return <Navigate to={expectedPath || "/verification"} replace />;
    }

    if (expectedPath && location.pathname !== expectedPath) {
      return <Navigate to={expectedPath} replace />;
    }
  }

  // User is in the signup/recovery flow - allow access
  return <Component />;
};

export default FlowRoute;
