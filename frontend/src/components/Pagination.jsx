import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  size,
  onSizeChange,
}) {
  return (
    <div className="flex items-center justify-between mt-8 text-[13px] text-td-text-secondary dark:text-td-dark-text-secondary">
      <div className="flex items-center gap-2">
        <span>Show:</span>
        <select
          value={size}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className="h-7 px-1.5 rounded-md border border-td-border dark:border-td-dark-border cursor-pointer
            bg-td-surface dark:bg-td-dark-surface text-td-text dark:text-td-dark-text text-[13px]
            focus:outline-none focus:border-td-red"
        >
          {[5, 10, 20, 50].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="p-1 rounded-md hover:bg-td-hover dark:hover:bg-td-dark-hover disabled:opacity-30 cursor-pointer transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="px-2 font-medium text-td-text dark:text-td-dark-text">
          {page + 1} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="p-1 rounded-md hover:bg-td-hover dark:hover:bg-td-dark-hover disabled:opacity-30 cursor-pointer transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
