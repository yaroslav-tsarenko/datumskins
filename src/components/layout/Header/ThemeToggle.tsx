"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

/** Studio ⇄ Night Shift. A soft square switch, sized for the vellum strip. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "Night Shift (dark)" : "Studio (light)"} mode`}
      className="focus-amber inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] text-[color:var(--color-text-secondary)] transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
    >
      {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
    </button>
  );
}
