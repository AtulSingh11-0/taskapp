import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

const STATUSES = ["TODO", "IN_PROGRESS", "DONE"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

export default function TaskForm({ task, onClose, onSaved }) {
  const isEdit = !!task;
  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "TODO",
    priority: task?.priority || "MEDIUM",
    dueDate: task?.dueDate || "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.dueDate) delete payload.dueDate;
      if (!payload.description) delete payload.description;
      if (isEdit) {
        await api.put(`/tasks/${task.id}`, payload);
        toast.success("Task updated");
      } else {
        await api.post("/tasks", payload);
        toast.success("Task created");
      }
      onSaved();
      onClose();
    } catch {
      // Axios interceptor handles error toast
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `w-full h-12 px-4 rounded-xl border border-td-border-strong dark:border-td-dark-border
    bg-td-surface dark:bg-td-dark-surface text-td-text dark:text-td-dark-text text-base
    placeholder:text-td-text-tertiary focus:outline-none focus:border-td-red focus:ring-1 focus:ring-td-red/30`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-td-surface dark:bg-td-dark-surface rounded-2xl border border-td-border dark:border-td-dark-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-td-border dark:border-td-dark-border">
          <h2 className="text-lg font-bold text-td-text dark:text-td-dark-text">
            {isEdit ? "Edit task" : "Add task"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-td-hover dark:hover:bg-td-dark-hover cursor-pointer transition-colors"
          >
            <X size={20} className="text-td-text-tertiary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-td-text dark:text-td-dark-text mb-2">
              Task name
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              maxLength={200}
              className={inputCls}
              placeholder="What needs to be done?"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-td-text dark:text-td-dark-text mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              maxLength={5000}
              className={`${inputCls} h-auto py-3 resize-none`}
              placeholder="Add details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-td-text dark:text-td-dark-text mb-2">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={`${inputCls} cursor-pointer`}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-td-text dark:text-td-dark-text mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className={`${inputCls} cursor-pointer`}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-td-text dark:text-td-dark-text mb-2">
              Due date
            </label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              className={`${inputCls} cursor-pointer`}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-5 border-t border-td-border dark:border-td-dark-border">
          <button
            type="button"
            onClick={onClose}
            className="h-11 px-5 rounded-xl text-sm font-semibold cursor-pointer
              text-td-text-secondary dark:text-td-dark-text-secondary bg-td-bg dark:bg-td-dark-bg
              border border-td-border dark:border-td-dark-border hover:bg-td-hover dark:hover:bg-td-dark-hover transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !form.title}
            className="h-11 px-6 rounded-xl text-sm font-bold text-white cursor-pointer
              bg-td-red hover:bg-td-red-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Saving..." : isEdit ? "Save" : "Add task"}
          </button>
        </div>
      </div>
    </div>
  );
}
