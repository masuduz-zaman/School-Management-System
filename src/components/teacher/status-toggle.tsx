"use client";

import { motion } from "framer-motion";
import { cx } from "@/lib/format";
import type { AttendanceStatus } from "@/lib/types";

const options: { value: AttendanceStatus; label: string; pill: string }[] = [
  { value: "PRESENT", label: "Present", pill: "bg-success text-white dark:text-[#0a0d14]" },
  { value: "ABSENT", label: "Absent", pill: "bg-danger text-white dark:text-[#0a0d14]" },
  { value: "LATE", label: "Late", pill: "bg-gold text-white dark:text-[#0a0d14]" },
];

export function StatusToggle({ id, value, onChange, name }: { id: string; value: AttendanceStatus | null; onChange: (v: AttendanceStatus) => void; name: string }) {
  return (
    <div role="radiogroup" aria-label={`Attendance for ${name}`} className="inline-flex rounded-lg border border-border bg-surface-2 p-0.5">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cx("relative rounded-md px-3 py-1.5 text-xs font-semibold transition-colors", active ? "text-white dark:text-[#0a0d14]" : "text-muted hover:text-fg")}
          >
            {active && <motion.span layoutId={`status-${id}`} className={cx("absolute inset-0 rounded-md", o.pill)} transition={{ type: "spring", stiffness: 520, damping: 38 }} />}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
