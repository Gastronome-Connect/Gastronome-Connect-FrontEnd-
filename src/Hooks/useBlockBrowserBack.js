import { useEffect } from "react";

const useBlockBrowserBack = (enabled = true) => {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const state = {
      gcFlowLock: true,
      path: window.location.pathname,
    };

    window.history.pushState(state, "", window.location.href);

    const handlePopState = () => {
      window.history.pushState(state, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [enabled]);
};

export default useBlockBrowserBack;
