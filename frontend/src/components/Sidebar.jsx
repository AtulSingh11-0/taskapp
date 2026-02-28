import { NavLink, useNavigate } from "react-router";
import {
  ListTodo,
  Users,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

const userLinks = [{ to: "/tasks", icon: ListTodo, label: "My Tasks" }];

const adminLinks = [
  { to: "/admin/tasks", icon: LayoutDashboard, label: "All Tasks" },
  { to: "/admin/users", icon: Users, label: "Users" },
];

function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#dc4c3e" />
      <path
        d="M6.5 12.5l3.5 3.5 7.5-7.5"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const links = isAdmin ? adminLinks : userLinks;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-40 bg-td-surface/95 dark:bg-td-dark-surface/95 backdrop-blur-sm border-b border-td-border dark:border-td-dark-border">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left */}
          <div className="flex items-center gap-6">
            <NavLink
              to={isAdmin ? "/admin/tasks" : "/tasks"}
              className="flex items-center gap-3 shrink-0"
            >
              <Logo size={32} />
              <span className="text-lg font-extrabold text-td-text dark:text-td-dark-text hidden sm:block">
                TaskApp
              </span>
            </NavLink>

            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150
                    ${
                      isActive
                        ? "bg-td-red/10 text-td-red dark:bg-td-red/15"
                        : "text-td-text-secondary dark:text-td-dark-text-secondary hover:bg-td-hover dark:hover:bg-td-dark-hover hover:text-td-text dark:hover:text-td-dark-text"
                    }`
                  }
                >
                  <link.icon size={18} />
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            <div className="hidden sm:flex items-center gap-2.5 ml-2 pl-4 border-l border-td-border dark:border-td-dark-border">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-td-red to-td-orange flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <span className="text-sm font-medium text-td-text dark:text-td-dark-text max-w-[120px] truncate">
                {user?.name}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-lg cursor-pointer text-td-text-tertiary dark:text-td-dark-text-tertiary
                hover:bg-td-hover dark:hover:bg-td-dark-hover hover:text-td-red transition-all"
              title="Log out"
            >
              <LogOut size={18} />
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2.5 rounded-lg md:hidden cursor-pointer text-td-text-secondary dark:text-td-dark-text-secondary
                hover:bg-td-hover dark:hover:bg-td-dark-hover transition-all"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-td-border dark:border-td-dark-border pt-3 space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-4 py-3 rounded-lg text-base font-medium transition-colors
                  ${isActive ? "bg-td-red/10 text-td-red" : "text-td-text-secondary dark:text-td-dark-text-secondary hover:bg-td-hover dark:hover:bg-td-dark-hover"}`
                }
              >
                <link.icon size={18} />
                {link.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
