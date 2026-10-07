"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read from localStorage or class on <html>
    const stored = localStorage.getItem("msf_theme") as "dark" | "light" | null;
    if (stored) {
      setTheme(stored);
      if (stored === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      }
    } else {
      // Default to dark
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
    setMounted(false);
    setMounted(true);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("msf_theme", nextTheme);

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold uppercase tracking-widest text-zinc-300 glass-pill"
      >
        <Sun className="h-3.5 w-3.5 text-amber-400" />
        <span className="hidden sm:inline">Theme</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Switch to ${theme === "dark" ? "Light Mode" : "Dark Mode"}`}
      className="group inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold uppercase tracking-widest transition-all duration-300 glass-pill hover:scale-105 active:scale-95 cursor-pointer"
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-3.5 w-3.5 text-amber-400 transition-transform group-hover:rotate-45" />
          <span className="hidden sm:inline text-zinc-300 group-hover:text-white">
            Light
          </span>
        </>
      ) : (
        <>
          <Moon className="h-3.5 w-3.5 text-indigo-500 transition-transform group-hover:-rotate-12" />
          <span className="hidden sm:inline text-zinc-700 group-hover:text-black">
            Dark
          </span>
        </>
      )}
    </button>
  );
}
