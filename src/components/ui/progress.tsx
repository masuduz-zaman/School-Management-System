"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";
import { cx } from "@/lib/format";

export function CountUp({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => `${v.toFixed(decimals)}${suffix}`);
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.9, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [mv, value]);
  return <motion.span>{text}</motion.span>;
}

export function ProgressRing({ value, size = 120, stroke = 10, tone = "success", children }: { value: number; size?: number; stroke?: number; tone?: "success" | "gold" | "primary" | "danger"; children?: React.ReactNode }) {
  const r = 50 - stroke / 2;
  const color = `var(--${tone})`;
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: clamped / 100 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="relative text-center">{children}</div>
    </div>
  );
}

export function Bar({ value, tone = "primary", className }: { value: number; tone?: "success" | "gold" | "primary" | "danger"; className?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cx("h-2 w-full overflow-hidden rounded-full bg-surface-2 ring-1 ring-inset ring-border", className)}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: `var(--${tone})` }}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
