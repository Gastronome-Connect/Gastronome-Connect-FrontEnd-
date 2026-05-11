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
    const hasBoth = !!sourceFlow && !!pendingEmail;
    
    // Debug logging
    console.log("🔐 FlowRoute checking flow state at", location.pathname);
    console.log("  sourceFlow:", sourceFlow);
    console.log("  pendingEmail:", pendingEmail);
    console.log("  hasFlowState:", hasBoth);
    
    return hasBoth;
  };

  // Not in flow - redirect to login
  if (!hasFlowState()) {
    console.warn("❌ FlowRoute: No flow state found - redirecting to /login");
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
  console.log("✅ FlowRoute: Rendering component");
  return <Component />;
};

export default FlowRoute;
