import { useState, useEffect, useCallback } from "react";
import { Trash2, CalendarDays, Flag, User } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const PRIORITY_COLORS = {
  HIGH: "text-red-500",
  MEDIUM: "text-amber-500",
  LOW: "text-blue-500",
};

const STATUS_CONFIG = {
  TODO: {
    label: "To Do",
    bg: "bg-slate-100 dark:bg-slate-800/50",
    text: "text-slate-600 dark:text-slate-300",
    dot: "bg-slate-400",
  },
  IN_PROGRESS: {
    label: "In Progress",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  DONE: {
    label: "Done",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
};

const SORT_OPTIONS = [
  { value: "priority", label: "Priority" },
  { value: "createdAt", label: "Date Created" },
  { value: "dueDate", label: "Due Date" },
  { value: "title", label: "Name" },
  { value: "status", label: "Status" },
];

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState("priority");
  const [sortDir, setSortDir] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/tasks", {
        params: { page, size, sortBy, sortDir },
      });
      setTasks(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch {
      // Interceptor handles error toast
    } finally {
      setLoading(false);
    }
  }, [page, size, sortBy, sortDir]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/tasks/${id}`);
      toast.success("Task deleted");
      setDeletingId(null);
      fetchTasks();
    } catch {
      setDeletingId(null);
    }
  };

  const handleSortChange = (field) => {
    if (field === sortBy) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir(field === "priority" ? "asc" : "desc");
    }
    setPage(0);
  };

  const formatDate = (d) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const filtered = statusFilter
    ? tasks.filter((t) => t.status === statusFilter)
    : tasks;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-td-text dark:text-td-dark-text">
            All Tasks
          </h1>
          <p className="text-base text-td-text-tertiary dark:text-td-dark-text-tertiary mt-1">
            {totalElements} total tasks
          </p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6 pb-5 border-b border-td-border dark:border-td-dark-border">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-td-text-tertiary dark:text-td-dark-text-tertiary">
            Filter
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-lg text-sm cursor-pointer border border-td-border-strong dark:border-td-dark-border
              bg-td-surface dark:bg-td-dark-surface text-td-text dark:text-td-dark-text
              focus:outline-none focus:ring-2 focus:ring-td-red/20 focus:border-td-red transition-all"
          >
            <option value="">All Status</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>
        <div className="w-px h-6 bg-td-border dark:bg-td-dark-border hidden sm:block" />
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-td-text-tertiary dark:text-td-dark-text-tertiary">
            Sort by
          </span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="h-10 px-3 rounded-lg text-sm cursor-pointer border border-td-border-strong dark:border-td-dark-border
              bg-td-surface dark:bg-td-dark-surface text-td-text dark:text-td-dark-text
              focus:outline-none focus:ring-2 focus:ring-td-red/20 focus:border-td-red transition-all"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
            className="h-10 px-3 rounded-lg text-xs font-bold cursor-pointer border border-td-border-strong dark:border-td-dark-border
              bg-td-surface dark:bg-td-dark-surface text-td-text-secondary dark:text-td-dark-text-secondary
              hover:bg-td-hover dark:hover:bg-td-dark-hover transition-colors"
          >
            {sortDir === "asc" ? "↑ ASC" : "↓ DESC"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-2 border-td-red border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-td-border dark:border-td-dark-border rounded-2xl">
          <p className="text-td-text-tertiary text-base">No tasks found</p>
        </div>
      ) : (
        <div className="rounded-xl border border-td-border dark:border-td-dark-border overflow-hidden">
          {filtered.map((task, i) => {
            const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
            return (
              <div
                key={task.id}
                className={`group flex items-start gap-4 px-5 py-4 transition-colors
                  bg-td-surface dark:bg-td-dark-surface
                  hover:bg-td-hover dark:hover:bg-td-dark-hover
                  ${i < filtered.length - 1 ? "border-b border-td-border dark:border-td-dark-border" : ""}`}
              >
                <div
                  className={`mt-1 w-5 h-5 rounded-full border-2 shrink-0
                  ${task.status === "DONE" ? "bg-emerald-500 border-emerald-500" : `border-current ${PRIORITY_COLORS[task.priority]}`}`}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <p
                      className={`text-base leading-relaxed ${
                        task.status === "DONE"
                          ? "line-through text-td-text-tertiary"
                          : "text-td-text dark:text-td-dark-text font-medium"
                      }`}
                    >
                      {task.title}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${status.bg} ${status.text}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                      />
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-xs text-td-text-tertiary dark:text-td-dark-text-tertiary">
                      <User size={13} /> {task.ownerName || task.ownerEmail}
                    </span>
                    {task.dueDate && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-td-text-tertiary dark:text-td-dark-text-tertiary">
                        <CalendarDays size={14} /> {formatDate(task.dueDate)}
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold ${PRIORITY_COLORS[task.priority]}`}
                    >
                      <Flag size={13} /> {task.priority}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                  {deletingId === task.id ? (
                    <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-1.5">
                      <span className="text-xs font-medium text-td-red mr-1">
                        Delete?
                      </span>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="px-3 py-1 rounded-md text-xs font-bold text-white bg-td-red hover:bg-td-red-hover cursor-pointer transition-colors"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="px-3 py-1 rounded-md text-xs font-bold text-td-text-secondary
                          bg-td-border dark:bg-td-dark-border hover:bg-td-border-strong cursor-pointer transition-colors"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingId(task.id)}
                      className="p-2.5 rounded-lg sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer
                        hover:bg-red-50 dark:hover:bg-red-900/15 text-td-text-tertiary hover:text-td-red transition-all shrink-0"
                      title="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalElements > 0 && (
        <div className="flex items-center justify-between mt-6 py-4 text-sm text-td-text-secondary dark:text-td-dark-text-secondary">
          <div className="flex items-center gap-2.5">
            <span className="text-td-text-tertiary dark:text-td-dark-text-tertiary">
              Rows per page:
            </span>
            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(0);
              }}
              className="h-9 px-2 rounded-lg border border-td-border dark:border-td-dark-border cursor-pointer
                bg-td-surface dark:bg-td-dark-surface text-td-text dark:text-td-dark-text text-sm
                focus:outline-none focus:ring-1 focus:ring-td-red/30"
            >
              {[5, 10, 20, 50].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-td-text-tertiary dark:text-td-dark-text-tertiary">
              Page {page + 1} of {Math.max(totalPages, 1)}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0}
                className="px-3.5 py-1.5 rounded-lg border border-td-border dark:border-td-dark-border cursor-pointer
                  hover:bg-td-hover dark:hover:bg-td-dark-hover disabled:opacity-30 disabled:cursor-not-allowed
                  transition-colors text-td-text dark:text-td-dark-text text-sm font-medium"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
                className="px-3.5 py-1.5 rounded-lg border border-td-border dark:border-td-dark-border cursor-pointer
                  hover:bg-td-hover dark:hover:bg-td-dark-hover disabled:opacity-30 disabled:cursor-not-allowed
                  transition-colors text-td-text dark:text-td-dark-text text-sm font-medium"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
