import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // step-1: send login credentials to backend api
      const { data } = await api.post("/auth/login", { email, password });

      // step-2: store non-sensitive user metadata in local storage
      localStorage.setItem("user", JSON.stringify(data));
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // step-3: update context state and return user data
      setUser(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      // step-1: submit registration request to backend
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      // step-2: store non-sensitive user metadata in local storage
      localStorage.setItem("user", JSON.stringify(data));
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // step-3: update context state and return user data
      setUser(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // step-1: call backend logout endpoint to clear httponly cookie
      await api.post("/auth/logout");
    } catch (error) {
      // step-2: log any backend errors during logout
      console.error("Logout failed on the backend:", error);
    } finally {
      // step-3: clear local state and local storage regardless of backend success
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, loading, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
