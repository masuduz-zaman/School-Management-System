"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, mounted, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className={`btn btn-ghost !h-10 !w-10 !p-0 ${className}`}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={theme === "dark" ? "Light theme" : "Dark theme"}
    >
      <span className="relative grid size-5 place-items-center">
        {mounted && (
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={theme}
              initial={{ rotate: -70, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 70, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.18 }}
              className="absolute"
            >
              {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </motion.span>
          </AnimatePresence>
        )}
      </span>
    </button>
  );
}
