import { useState, useEffect } from "react";
import { Shield, Mail, Calendar } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const AVATAR_COLORS = [
  "from-red-400 to-orange-400",
  "from-blue-400 to-indigo-400",
  "from-emerald-400 to-teal-400",
  "from-violet-400 to-purple-400",
  "from-pink-400 to-rose-400",
  "from-amber-400 to-yellow-400",
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/users")
      .then(({ data }) => setUsers(data))
      .catch(() => {
        /* interceptor handles */
      })
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-td-text dark:text-td-dark-text">
          Users
        </h1>
        <p className="text-base text-td-text-tertiary dark:text-td-dark-text-tertiary mt-1">
          {users.length} registered user{users.length !== 1 ? "s" : ""}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-2 border-td-red border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="rounded-xl border border-td-border dark:border-td-dark-border overflow-hidden bg-td-surface dark:bg-td-dark-surface">
          {users.map((u, i) => (
            <div
              key={u.id}
              className={`flex items-center gap-4 px-5 py-4 transition-colors
                hover:bg-td-hover dark:hover:bg-td-dark-hover
                ${i < users.length - 1 ? "border-b border-td-border dark:border-td-dark-border" : ""}`}
            >
              {/* Avatar */}
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm
                bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
              >
                {u.name?.charAt(0)?.toUpperCase() || "?"}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <p className="text-base font-semibold text-td-text dark:text-td-dark-text truncate">
                    {u.name}
                  </p>
                  {u.role === "ADMIN" && (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase
                      bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400"
                    >
                      <Shield size={12} /> Admin
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="inline-flex items-center gap-1.5 text-sm text-td-text-tertiary dark:text-td-dark-text-tertiary truncate">
                    <Mail size={14} /> {u.email}
                  </span>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 text-xs text-td-text-tertiary dark:text-td-dark-text-tertiary shrink-0 hidden sm:flex">
                <Calendar size={13} /> Joined {formatDate(u.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
