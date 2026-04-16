import axios from "axios";
import { API_BASE } from "./api";

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
