const SIGNUP_FLOW_STAGE_KEY = "signupFlowStage";
const SIGNUP_VERIFIED_KEY = "signupVerified";
const SIGNUP_LAST_ROUTE_KEY = "signupLastRoute";
const SIGNUP_CAN_ACCESS_ALLERGENS_KEY = "signupCanAccessAllergens";

export const getSourceFlow = () => sessionStorage.getItem("sourceFlow");

export const getPendingEmail = () => sessionStorage.getItem("pendingEmail");

export const hasPendingFlow = () =>
  Boolean(getSourceFlow() && getPendingEmail());

export const isSignupVerified = () =>
  sessionStorage.getItem(SIGNUP_VERIFIED_KEY) === "true";

export const getSignupFlowStage = () =>
  sessionStorage.getItem(SIGNUP_FLOW_STAGE_KEY) || "verification";

export const canAccessAllergens = () =>
  sessionStorage.getItem(SIGNUP_CAN_ACCESS_ALLERGENS_KEY) === "true";

export const getSignupLastRoute = () =>
  sessionStorage.getItem(SIGNUP_LAST_ROUTE_KEY) || "/verification";

export const setSignupFlowStage = (stage) => {
  sessionStorage.setItem(SIGNUP_FLOW_STAGE_KEY, stage);
};

export const setSignupVerified = (verified) => {
  sessionStorage.setItem(SIGNUP_VERIFIED_KEY, verified ? "true" : "false");
};

export const setCanAccessAllergens = (allowed) => {
  sessionStorage.setItem(
    SIGNUP_CAN_ACCESS_ALLERGENS_KEY,
    allowed ? "true" : "false",
  );
};

export const setSignupLastRoute = (route) => {
  sessionStorage.setItem(SIGNUP_LAST_ROUTE_KEY, route);
};

export const getSignupRedirectRoute = () => {
  if (getSourceFlow() !== "signup") {
    return "/verification";
  }

  if (!isSignupVerified()) {
    return "/verification";
  }

  return getSignupLastRoute() || "/preferences";
};

export const clearSignupFlowState = () => {
  sessionStorage.removeItem("pendingEmail");
  sessionStorage.removeItem("sourceFlow");
  sessionStorage.removeItem("tempSignupData");
  sessionStorage.removeItem("tempPreferences");
  sessionStorage.removeItem("tempDislikes");
  sessionStorage.removeItem(SIGNUP_FLOW_STAGE_KEY);
  sessionStorage.removeItem(SIGNUP_VERIFIED_KEY);
  sessionStorage.removeItem(SIGNUP_LAST_ROUTE_KEY);
  sessionStorage.removeItem(SIGNUP_CAN_ACCESS_ALLERGENS_KEY);
};
