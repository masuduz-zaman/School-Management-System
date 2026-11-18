"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CircleAlert, CircleCheck, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastItem = { id: number; tone: "success" | "error"; message: string };
type ToastApi = { success: (m: string) => void; error: (m: string) => void };

const ToastContext = createContext<ToastApi | null>(null);
let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => setItems((list) => list.filter((t) => t.id !== id)), []);
  const push = useCallback(
    (tone: ToastItem["tone"], message: string) => {
      const id = ++counter;
      setItems((list) => [...list.slice(-3), { id, tone, message }]);
      setTimeout(() => dismiss(id), tone === "error" ? 6000 : 3500);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({ success: (m) => push("success", m), error: (m) => push("error", m) }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6" aria-live="polite">
        <AnimatePresence initial={false}>
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className="card pointer-events-auto flex w-full max-w-sm items-start gap-3 p-3.5 pr-2.5"
              role="status"
            >
              {t.tone === "success" ? (
                <CircleCheck className="mt-0.5 size-5 shrink-0 text-success" />
              ) : (
                <CircleAlert className="mt-0.5 size-5 shrink-0 text-danger" />
              )}
              <p className="flex-1 text-sm leading-snug">{t.message}</p>
              <button className="btn btn-ghost btn-sm !h-7 !w-7 !p-0" onClick={() => dismiss(t.id)} aria-label="Dismiss">
                <X className="size-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
