import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: {
    "Content-Type": "application/json",
    "X-API-Version": "1",
  },
  withCredentials: true,
  timeout: 15000, // 15s timeout
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("[Request Error]", error);
    return Promise.reject(error);
  },
);

// Response interceptor — centralized error handling for all status codes
api.interceptors.response.use(
  // 2xx — success
  (response) => response,

  // Non-2xx — errors
  (error) => {
    // Network error / timeout (no response from server)
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        toast.error("Request timed out. Please try again.");
      } else if (error.message?.includes("Network Error")) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      console.error("[Network Error]", error.message);
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const message = data?.message || data?.error || "";

    // 3xx — redirects (typically handled by browser/axios automatically)
    // If we somehow get here, just log and pass through
    if (status >= 300 && status < 400) {
      console.warn(`[Redirect ${status}]`, message);
      return Promise.reject(error);
    }

    // 4xx — client errors
    if (status >= 400 && status < 500) {
      switch (status) {
        case 400: {
          // Validation errors — extract field-level messages if available
          const validationErrors = data?.errors;
          if (validationErrors && typeof validationErrors === "object") {
            const msgs = Object.values(validationErrors).flat();
            toast.error(msgs.join(", ") || "Invalid request data.");
          } else {
            toast.error(message || "Bad request. Please check your input.");
          }
          break;
        }
        case 401:
          // Unauthorized — clear auth and redirect to login
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          // Only show toast if not already on login page
          if (!window.location.pathname.includes("/login")) {
            toast.error("Session expired. Please log in again.");
            window.location.href = "/login";
          }
          break;
        case 403:
          toast.error(
            message ||
              "Access denied. You don't have permission for this action.",
          );
          break;
        case 404:
          toast.error(message || "The requested resource was not found.");
          break;
        case 409:
          toast.error(message || "Conflict — this resource may already exist.");
          break;
        case 422:
          toast.error(message || "Validation failed. Please check your input.");
          break;
        case 429:
          toast.error("Too many requests. Please wait a moment and try again.");
          break;
        default:
          toast.error(message || `Client error (${status}).`);
      }
      console.warn(`[${status} Error]`, data);
    }

    // 5xx — server errors
    if (status >= 500) {
      switch (status) {
        case 500:
          toast.error("Internal server error. Please try again later.");
          break;
        case 502:
          toast.error("Bad gateway. The server may be restarting.");
          break;
        case 503:
          toast.error("Service unavailable. The server is temporarily down.");
          break;
        case 504:
          toast.error("Gateway timeout. The server took too long to respond.");
          break;
        default:
          toast.error(`Server error (${status}). Please try again later.`);
      }
      console.error(`[${status} Server Error]`, data);
    }

    return Promise.reject(error);
  },
);

export default api;
