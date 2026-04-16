export const SIGNUP_FLOW = "signup";
export const FORGOT_PASSWORD_FLOW = "forgotpassword";

export const SIGNUP_STEPS = {
  VERIFICATION: "verification",
  PREFERENCES: "preferences",
  ALLERGENS: "allergens",
};

export const SIGNUP_STEP_PATHS = {
  [SIGNUP_STEPS.VERIFICATION]: "/verification",
  [SIGNUP_STEPS.PREFERENCES]: "/preferences",
  [SIGNUP_STEPS.ALLERGENS]: "/allergens",
};

const STEP_BY_PATH = Object.entries(SIGNUP_STEP_PATHS).reduce(
  (result, [step, path]) => ({
    ...result,
    [path]: step,
  }),
  {},
);

const SIGNUP_FLOW_STAGE_KEY = "signupFlowStage";
const SIGNUP_VERIFIED_KEY = "signupVerified";
const SIGNUP_LAST_ROUTE_KEY = "signupLastRoute";
const SIGNUP_CAN_ACCESS_ALLERGENS_KEY = "signupCanAccessAllergens";
const SIGNUP_ONBOARDING_STEP_KEY = "signupOnboardingStep";

export const getSourceFlow = () => sessionStorage.getItem("sourceFlow");

export const getPendingEmail = () => sessionStorage.getItem("pendingEmail");

export const hasPendingFlow = () =>
  Boolean(getSourceFlow() && getPendingEmail());

export const isSignupFlowActive = () =>
  getSourceFlow() === SIGNUP_FLOW && !!getPendingEmail();

export const isForgotPasswordFlowActive = () =>
  getSourceFlow() === FORGOT_PASSWORD_FLOW && !!getPendingEmail();

export const isSignupVerified = () =>
  sessionStorage.getItem(SIGNUP_VERIFIED_KEY) === "true";

export const setSignupVerified = (verified) => {
  sessionStorage.setItem(SIGNUP_VERIFIED_KEY, verified ? "true" : "false");
};

export const getSignupStep = () => {
  if (!isSignupFlowActive()) {
    return null;
  }

  const step = sessionStorage.getItem(SIGNUP_ONBOARDING_STEP_KEY);
  return step && SIGNUP_STEP_PATHS[step] ? step : SIGNUP_STEPS.VERIFICATION;
};

export const setSignupStep = (step) => {
  if (!SIGNUP_STEP_PATHS[step]) {
    return;
  }

  sessionStorage.setItem(SIGNUP_ONBOARDING_STEP_KEY, step);
  sessionStorage.setItem(SIGNUP_FLOW_STAGE_KEY, step);
  sessionStorage.setItem(SIGNUP_LAST_ROUTE_KEY, SIGNUP_STEP_PATHS[step]);
  sessionStorage.setItem(
    SIGNUP_CAN_ACCESS_ALLERGENS_KEY,
    step === SIGNUP_STEPS.ALLERGENS ? "true" : "false",
  );
};

export const clearSignupStep = () => {
  sessionStorage.removeItem(SIGNUP_ONBOARDING_STEP_KEY);
  sessionStorage.removeItem(SIGNUP_FLOW_STAGE_KEY);
  sessionStorage.removeItem(SIGNUP_LAST_ROUTE_KEY);
  sessionStorage.removeItem(SIGNUP_CAN_ACCESS_ALLERGENS_KEY);
};

export const getSignupRedirectPath = () => {
  const step = getSignupStep();
  return step ? SIGNUP_STEP_PATHS[step] : null;
};

export const getSignupStepForPath = (pathname) =>
  STEP_BY_PATH[pathname] || null;

export const getSignupFlowStage = () =>
  sessionStorage.getItem(SIGNUP_FLOW_STAGE_KEY) || SIGNUP_STEPS.VERIFICATION;

export const setSignupFlowStage = (stage) => {
  setSignupStep(stage);
};

export const canAccessAllergens = () =>
  sessionStorage.getItem(SIGNUP_CAN_ACCESS_ALLERGENS_KEY) === "true";

export const setCanAccessAllergens = (allowed) => {
  sessionStorage.setItem(
    SIGNUP_CAN_ACCESS_ALLERGENS_KEY,
    allowed ? "true" : "false",
  );
};

export const getSignupLastRoute = () =>
  sessionStorage.getItem(SIGNUP_LAST_ROUTE_KEY) || "/verification";

export const setSignupLastRoute = (route) => {
  sessionStorage.setItem(SIGNUP_LAST_ROUTE_KEY, route);
};

export const getSignupRedirectRoute = () => {
  if (!isSignupFlowActive()) {
    return "/verification";
  }

  return getSignupRedirectPath() || getSignupLastRoute() || "/verification";
};

export const clearSignupFlowState = () => {
  sessionStorage.removeItem("pendingEmail");
  sessionStorage.removeItem("sourceFlow");
  sessionStorage.removeItem("tempSignupData");
  sessionStorage.removeItem("tempPreferences");
  sessionStorage.removeItem("tempDislikes");
  sessionStorage.removeItem(SIGNUP_VERIFIED_KEY);
  clearSignupStep();
};
