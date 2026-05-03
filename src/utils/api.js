import DefaultAvatar from "../components/Assets/Silhouette ni ano.png";

// Centralized fetch wrapper that attaches access token and handles refresh.
const API_BASE = process.env.REACT_APP_API_BASE || "https://api.gastronomeconnect.online";
const AUTH_STATE_EVENT = "auth-state-changed";

function buildApiUrl(path) {
  return path.startsWith("http") ? path : `${API_BASE}${path}`;
}

function resolveUploadUrl(value) {
  if (!value) return "";
  if (value.startsWith("data:")) {
    return value;
  }
  if (value.startsWith("blob:")) {
    return value;
  }
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  if (value.startsWith("/")) {
    return buildApiUrl(value);
  }

  const filename = value.split("/").filter(Boolean).pop();
  return filename ? buildApiUrl(`/uploads/${filename}`) : "";
}

function resolveAvatarUrl(value) {
  return resolveUploadUrl(value) || DefaultAvatar;
}

function getAccessToken() {
  try {
    return localStorage.getItem("accessToken");
  } catch (e) {
    return null;
  }
}

function setAccessToken(token) {
  try {
    if (token) localStorage.setItem("accessToken", token);
    else localStorage.removeItem("accessToken");
  } catch (e) {}
  window.dispatchEvent(new Event(AUTH_STATE_EVENT));
}

function clearAuth() {
  try {
    localStorage.removeItem("accessToken");
  } catch (e) {}
  window.dispatchEvent(new Event(AUTH_STATE_EVENT));
  // navigate to login should be done by caller
}

function getAdminAccessToken() {
  try {
    return localStorage.getItem("adminAccessToken");
  } catch (e) {
    return null;
  }
}

function hasUserSession() {
  return !!getAccessToken();
}

function hasAdminSession() {
  return !!getAdminAccessToken();
}

function clearAllAuth() {
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("adminAccessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
  } catch (e) {}
  window.dispatchEvent(new Event(AUTH_STATE_EVENT));
}

async function refreshAccessToken() {
  // Call refresh endpoint; refresh token is sent via HttpOnly cookie (credentials included)
  const res = await fetch(`${API_BASE}/api/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Refresh failed");
  const data = await res.json();
  if (data?.accessToken) setAccessToken(data.accessToken);
  return data.accessToken;
}

async function logout() {
  try {
    await fetch(`${API_BASE}/api/logout`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    // ignore network errors
  }
  clearAuth();
}

async function apiFetch(input, init = {}) {
  const url = buildApiUrl(input);
  const opts = { credentials: "include", headers: {}, ...init };
  const isFormDataBody =
    typeof FormData !== "undefined" && opts.body instanceof FormData;

  // Attach JSON header by default when body present and no header set
  if (opts.body && !isFormDataBody && !opts.headers["Content-Type"]) {
    opts.headers["Content-Type"] = "application/json";
  }

  const token = getAccessToken();
  if (token) opts.headers["Authorization"] = `Bearer ${token}`;

  let res = await fetch(url, opts);
  const shouldAttemptRefresh = await (async () => {
    if (res.status === 401) {
      return true;
    }

    if (res.status !== 403) {
      return false;
    }

    try {
      const data = await res.clone().json();
      const message = String(data?.message || "").toLowerCase();
      return message.includes("invalid or expired token");
    } catch {
      return false;
    }
  })();

  if (!shouldAttemptRefresh) return res;

  // Try refresh once
  try {
    const newToken = await refreshAccessToken();
    if (newToken) {
      opts.headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(url, opts);
    }
    return res;
  } catch (err) {
    clearAuth();
    throw err;
  }
}

export {
  API_BASE,
  AUTH_STATE_EVENT,
  buildApiUrl,
  apiFetch,
  clearAllAuth,
  getAccessToken,
  getAdminAccessToken,
  hasAdminSession,
  hasUserSession,
  resolveAvatarUrl,
  setAccessToken,
  resolveUploadUrl,
  clearAuth,
  refreshAccessToken,
  logout,
};
