"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

/** Drafting ⇄ Night Shift. A ruled square switch, sized for the vellum strip. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "Night Shift (dark)" : "Drafting (light)"} mode`}
      className="focus-amber inline-flex h-7 w-7 items-center justify-center border border-[color:var(--color-border)] text-[color:var(--color-text-secondary)] transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
    >
      {theme === "light" ? <Moon size={13} /> : <Sun size={13} />}
    </button>
  );
}
