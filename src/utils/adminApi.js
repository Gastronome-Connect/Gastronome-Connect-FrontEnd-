import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3000";

const adminApi = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

adminApi.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("adminAccessToken") ||
    localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default adminApi;
