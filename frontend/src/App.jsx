import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TasksPage from "./pages/dashboard/TasksPage";
import AdminTasksPage from "./pages/admin/AdminTasksPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";

function AppRoutes() {
  const { user, isAdmin } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to={isAdmin ? "/admin/tasks" : "/tasks"} replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/tasks" replace /> : <RegisterPage />}
      />

      {/* User routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/tasks/new" element={<TasksPage />} />
        <Route path="/tasks/:id" element={<TasksPage />} />
      </Route>

      {/* Admin routes */}
      <Route
        element={
          <ProtectedRoute adminOnly>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<Navigate to="/admin/tasks" replace />} />
        <Route path="/admin/tasks" element={<AdminTasksPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
      </Route>

      {/* Catch-all */}
      <Route
        path="*"
        element={
          <Navigate
            to={user ? (isAdmin ? "/admin/tasks" : "/tasks") : "/login"}
            replace
          />
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: "12px",
                fontSize: "14px",
              },
            }}
          />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
