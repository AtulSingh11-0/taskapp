import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Circle,
  CheckCircle2,
  Pencil,
  Trash2,
  CalendarDays,
  Flag,
} from "lucide-react";
import api from "../../api/axios";
import TaskForm from "../../components/TaskForm";
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

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState("priority");
  const [sortDir, setSortDir] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchTasks = useCallback(
    async (preserveScroll = false) => {
      // step-1: capture current scroll position if preserve scroll is true
      const scrollTop = preserveScroll ? document.documentElement.scrollTop : 0;

      // step-2: set loading state to true
      setLoading(true);

      try {
        // step-3: fetch paginated tasks from api according to current state
        const { data } = await api.get("/tasks", {
          params: { page, size, sortBy, sortDir },
        });

        // step-4: update state with fetched paginated responses
        setTasks(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);

        // step-5: restore the scroll position on next animation frame
        if (preserveScroll) {
          requestAnimationFrame(() => {
            document.documentElement.scrollTop = scrollTop;
          });
        }
      } catch {
        // step-6: handle error implicitly via global axios interceptors
      } finally {
        // step-7: reset loading flag
        setLoading(false);
      }
    },
    [page, size, sortBy, sortDir],
  );

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDelete = async (id) => {
    try {
      // step-1: send delete request to backend and show success toast
      await api.delete(`/tasks/${id}`);
      toast.success("Task deleted");

      // step-2: clear deleting state and fetch fresh data
      setDeletingId(null);
      fetchTasks(true);
    } catch {
      // step-3: clear deleting state on failure
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (task) => {
    // step-1: determine new status toggle
    const newStatus = task.status === "DONE" ? "TODO" : "DONE";
    try {
      // step-2: put updated status to api and trigger data refresh
      await api.put(`/tasks/${task.id}`, { status: newStatus });
      fetchTasks(true);
    } catch {
      // step-3: handle error globally
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
      {/* step-1: render page header and add task action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-td-text dark:text-td-dark-text">
            My Tasks
          </h1>
          <p className="text-base text-td-text-tertiary dark:text-td-dark-text-tertiary mt-1">
            {totalElements} task{totalElements !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => {
            setEditTask(null);
            setShowForm(true);
          }}
          className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-base font-bold text-white cursor-pointer
            bg-td-red hover:bg-td-red-hover active:scale-[0.97] transition-all shadow-sm"
        >
          <Plus size={20} />
          Add task
        </button>
      </div>

      {/* step-2: render filters and sorting controls */}
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

      {/* step-3: conditionally render task list, empty state, or loading spinner */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-2 border-td-red border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-td-border dark:border-td-dark-border rounded-2xl">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-td-text-secondary dark:text-td-dark-text-secondary font-medium text-lg mb-2">
            {statusFilter ? "No tasks match this filter" : "No tasks yet"}
          </p>
          {!statusFilter && (
            <button
              onClick={() => {
                setEditTask(null);
                setShowForm(true);
              }}
              className="text-td-red text-base font-semibold hover:underline cursor-pointer mt-2"
            >
              + Create your first task
            </button>
          )}
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
                {/* step-4: render task status toggle checkbox */}
                <button
                  onClick={() => handleToggleStatus(task)}
                  className="mt-1 cursor-pointer shrink-0"
                  title="Toggle status"
                >
                  {task.status === "DONE" ? (
                    <CheckCircle2 size={24} className="text-emerald-500" />
                  ) : (
                    <Circle
                      size={24}
                      className={`${PRIORITY_COLORS[task.priority]} hover:opacity-60 transition-opacity`}
                    />
                  )}
                </button>

                {/* step-5: render task content layout */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <p
                      className={`text-base leading-relaxed ${
                        task.status === "DONE"
                          ? "line-through text-td-text-tertiary dark:text-td-dark-text-tertiary"
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
                  {task.description && (
                    <p className="text-sm text-td-text-tertiary dark:text-td-dark-text-tertiary mt-1 line-clamp-1">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
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

                {/* step-6: render task action items (edit/delete) */}
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
                        className="px-3 py-1 rounded-md text-xs font-bold text-td-text-secondary dark:text-td-dark-text-secondary
                          bg-td-border dark:bg-td-dark-border hover:bg-td-border-strong cursor-pointer transition-colors"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditTask(task);
                          setShowForm(true);
                        }}
                        className="p-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/15 cursor-pointer
                          text-td-text-tertiary hover:text-blue-500 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeletingId(task.id)}
                        className="p-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/15 cursor-pointer
                          text-td-text-tertiary hover:text-td-red transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* step-7: render pagination footer */}
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

      {showForm && (
        <TaskForm
          task={editTask}
          onClose={() => setShowForm(false)}
          onSaved={() => fetchTasks(true)}
        />
      )}
    </div>
  );
}
