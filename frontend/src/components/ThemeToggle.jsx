import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="p-2.5 rounded-lg cursor-pointer text-td-text-tertiary dark:text-td-dark-text-tertiary
        hover:bg-td-hover dark:hover:bg-td-dark-hover transition-colors"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
