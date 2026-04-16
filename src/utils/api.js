// Centralized fetch wrapper that attaches access token and handles refresh.
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3000";

function buildApiUrl(path) {
  return path.startsWith("http") ? path : `${API_BASE}${path}`;
}

function resolveUploadUrl(value) {
  if (!value) return "";
  if (value.startsWith("data:")) {
    return value;
  }
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  const filename = value.split("/").filter(Boolean).pop();
  return filename ? buildApiUrl(`/uploads/${filename}`) : "";
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
}

function clearAuth() {
  try {
    localStorage.removeItem("accessToken");
  } catch (e) {}
  // navigate to login should be done by caller
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

  let res;
  try {
    res = await fetch(url, opts);
  } catch (err) {
    // Handle network errors, including CORS
    if (err.message === 'Failed to fetch') {
      const corsError = new Error(
        'Unable to reach the server. This could be a network issue, CORS configuration problem, or the server may be temporarily unavailable.'
      );
      corsError.isCORSError = true;
      throw corsError;
    }
    throw err;
  }

  if (res.status !== 401) return res;

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
  buildApiUrl,
  apiFetch,
  getAccessToken,
  setAccessToken,
  resolveUploadUrl,
  clearAuth,
  refreshAccessToken,
  logout,
};
