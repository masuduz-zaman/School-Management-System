"use client";

import { motion } from "framer-motion";
import { cx } from "@/lib/format";

export type TabItem<T extends string> = { value: T; label: string; count?: number };

export function Tabs<T extends string>({ id, items, value, onChange, className }: { id: string; items: TabItem<T>[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div role="tablist" className={cx("scroll-thin flex gap-1 overflow-x-auto border-b border-border", className)}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cx(
              "relative flex shrink-0 items-center gap-2 px-3.5 py-2.5 text-sm font-medium transition-colors",
              active ? "text-fg" : "text-muted hover:text-fg",
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span className={cx("rounded-full px-1.5 text-xs font-semibold", active ? "bg-primary text-primary-fg" : "bg-surface-2 text-muted")}>{item.count}</span>
            )}
            {active && <motion.span layoutId={`${id}-underline`} className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
          </button>
        );
      })}
    </div>
  );
}

export function Segmented<T extends string>({ id, items, value, onChange, className }: { id: string; items: { value: T; label: string }[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div role="radiogroup" className={cx("inline-flex rounded-xl border border-border bg-surface-2 p-1", className)}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(item.value)}
            type="button"
            className={cx("relative flex-1 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors", active ? "text-primary-fg" : "text-muted hover:text-fg")}
          >
            {active && <motion.span layoutId={`${id}-pill`} className="absolute inset-0 rounded-lg bg-primary" transition={{ type: "spring", stiffness: 480, damping: 36 }} />}
            <span className="relative">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
